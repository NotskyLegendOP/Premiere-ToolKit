import React, { useEffect, useMemo, useState } from "react";
import { invoke, convertFileSrc } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { startDrag } from "@crabnebula/tauri-plugin-drag";
import { Film, AudioLines, Image as ImageIcon, File as FileIcon, Search, FolderPlus, Trash2, Plus, RefreshCw, X } from "lucide-react";
import { Ico3D } from "./Icons";
import AudioCard, { type Trim } from "./AudioCard";
import { QuickStyle } from "./QuickStyle";
import type { Theme } from "./Settings";

type Asset = { name: string; path: string; ext: string; kind: "video" | "audio" | "image" | "other"; size: number; modified?: number };
const SORTS = ["Newest", "Oldest", "Name", "Size"] as const;
const fmtDate = (s?: number) => (s ? new Date(s * 1000).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "2-digit" }) : "");
const fmt = (n: number) => (n > 1e6 ? (n / 1e6).toFixed(1) + " MB" : (n / 1e3).toFixed(0) + " KB");
const KIND: Record<string, React.ReactNode> = { video: <Ico3D hue={215} s={34}><Film size={17} /></Ico3D>, audio: <Ico3D hue={150} s={34}><AudioLines size={17} /></Ico3D>, image: <Ico3D hue={300} s={34}><ImageIcon size={17} /></Ico3D>, other: <Ico3D hue={40} s={34}><FileIcon size={17} /></Ico3D> };

// small drag preview. The old one was the full-size logo which stayed on screen over Premiere.
// We draw a 64px icon and save it as a png with the existing save_trim command, then pass its path.
const iconCache: Record<string, string> = {};
async function dragIcon(kind: string): Promise<string> {
  if (iconCache[kind]) return iconCache[kind];
  const S = 64, c = document.createElement("canvas"); c.width = c.height = S; const g = c.getContext("2d")!;
  g.fillStyle = "#1b2440"; g.beginPath(); g.roundRect(2, 2, S - 4, S - 4, 14); g.fill();
  g.strokeStyle = "rgba(255,255,255,.4)"; g.lineWidth = 2; g.stroke(); g.fillStyle = "#fff";
  if (kind === "audio") [14, 26, 38, 22, 32, 16].forEach((h, i) => g.fillRect(12 + i * 7.5, (S - h) / 2, 4, h));
  else { g.beginPath(); g.moveTo(24, 18); g.lineTo(24, 46); g.lineTo(46, 32); g.closePath(); g.fill(); }
  const blob = await new Promise<Blob | null>(r => c.toBlob(r, "image/png"));
  const bytes = Array.from(new Uint8Array(await blob!.arrayBuffer()));
  return (iconCache[kind] = await invoke<string>("save_trim", { key: "dragicon", name: `drag_${kind}.png`, bytes }));
}

export type Lib = { id: string; name: string; path: string };
export const DEFAULT_LIBS: Lib[] = ["Rec", "SoundEffects", "Minecraft Replay"].map(n => ({ id: n, name: n, path: "" }));

// Fast video thumbnails: 4 decodes at once, results cached in memory (instant when you come back to a tab).
const bmpCache = new Map<string, ImageBitmap>();
let thumbActive = 0; const thumbWait: (() => void)[] = [];
const thumbAcquire = () => new Promise<void>(res => { if (thumbActive < 4) { thumbActive++; res(); } else thumbWait.push(() => { thumbActive++; res(); }); });
const thumbRelease = () => { thumbActive--; thumbWait.shift()?.(); };
export function VThumb({ src, onAspect }: { src: string; onAspect: (r: number) => void }) {
  const box = React.useRef<HTMLDivElement>(null), cv = React.useRef<HTMLCanvasElement>(null);
  const [done, setDone] = useState(false), [play, setPlay] = useState(false);
  const paint = (bmp: ImageBitmap) => { const c = cv.current; if (!c) return; c.width = bmp.width; c.height = bmp.height; c.getContext("2d")!.drawImage(bmp, 0, 0); onAspect(bmp.width / (bmp.height || 1)); setDone(true); };
  useEffect(() => {
    let dead = false, obs: IntersectionObserver | undefined;
    const c0 = bmpCache.get(src); if (c0) { paint(c0); return; }
    obs = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return; obs!.disconnect();
      thumbAcquire().then(() => {
        if (dead) { thumbRelease(); return; }
        const v = document.createElement("video"); v.muted = true; v.preload = "auto";
        let fin = false; const end = () => { if (fin) return; fin = true; clearTimeout(t); v.removeAttribute("src"); v.load(); thumbRelease(); };
        const t = setTimeout(end, 7000);
        v.onloadedmetadata = () => { v.currentTime = Math.min(0.3, (v.duration || 1) / 2); };
        v.onseeked = async () => {
          try { if (v.videoWidth && !dead) { const bmp = await createImageBitmap(v, { resizeWidth: 320, resizeQuality: "low" }); bmpCache.set(src, bmp); if (bmpCache.size > 400) { const k = bmpCache.keys().next().value as string; bmpCache.get(k)?.close(); bmpCache.delete(k); } paint(bmp); } } catch { /* thumbnail is optional */ }
          end();
        };
        v.onerror = end; v.src = src;
      });
    }, { rootMargin: "500px" });
    obs.observe(box.current!);
    return () => { dead = true; obs?.disconnect(); };
  }, [src]);
  return (
    <div ref={box} className="vt" onMouseEnter={() => setPlay(true)} onMouseLeave={() => setPlay(false)}>
      <canvas ref={cv} style={{ width: "100%", height: "100%", objectFit: "cover", display: done ? "block" : "none" }} />
      {!done && <span className="ic">{KIND.video}</span>}
      {play && done && <video src={src} muted loop autoPlay preload="auto" draggable={false} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
    </div>
  );
}

export function Assets({ bare, theme, setTheme, lib, libs, saveLibs, removeLib, go, addLib, renameLib }: { bare?: boolean; theme?: Theme; setTheme?: (t: Theme) => void; lib: Lib; libs: Lib[]; saveLibs: (n: Lib[]) => void; removeLib: (l: Lib) => void; go: (id: string) => void; addLib: () => void; renameLib: (l: Lib) => void }) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [sw, setSw] = useState(() => Math.min(400, Math.max(140, +(localStorage.getItem("sideW") || 170))));
  const [rz, setRz] = useState(false);
  const startResize = (e: React.MouseEvent) => {
    e.preventDefault(); setRz(true); const x0 = e.clientX, w0 = sw; let w = sw;
    const mv = (m: MouseEvent) => { w = Math.min(400, Math.max(140, w0 + m.clientX - x0)); setSw(w); };
    const up = () => { setRz(false); localStorage.setItem("sideW", String(w)); window.removeEventListener("mousemove", mv); window.removeEventListener("mouseup", up); };
    window.addEventListener("mousemove", mv); window.addEventListener("mouseup", up);
  };
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Asset | null>(null);
  const [sort, setSort] = useState<(typeof SORTS)[number]>(() => (localStorage.getItem("sort") as any) || "Newest");
  const [cats, setCats] = useState<string[]>(() => JSON.parse(localStorage.getItem("cats") || "[]"));
  const [tags, setTags] = useState<Record<string, string>>(() => JSON.parse(localStorage.getItem("tags") || "{}"));
  const [cat, setCat] = useState("All");
  const [newCat, setNewCat] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [trims, setTrims] = useState<Record<string, Trim>>(() => { try { return JSON.parse(localStorage.getItem("trims") || "{}"); } catch { return {}; } });
  const setTrim = (p: string, t: Trim | null) => setTrims(o => { const n = { ...o }; if (t) n[p] = t; else delete n[p]; localStorage.setItem("trims", JSON.stringify(n)); return n; });
  const saveCats = (n: string[]) => { setCats(n); localStorage.setItem("cats", JSON.stringify(n)); };
  const saveTags = (n: Record<string, string>) => { setTags(n); localStorage.setItem("tags", JSON.stringify(n)); };
  const addCat = () => { const n = newCat.trim(); if (!n || n === "All" || cats.includes(n)) return; saveCats([...cats, n]); setCat(n); setNewCat(""); };
  const delCat = () => { if (cat === "All" || !confirm(`Delete category "${cat}"? (Files are not deleted)`)) return; saveCats(cats.filter(c => c !== cat)); saveTags(Object.fromEntries(Object.entries(tags).filter(([, v]) => v !== cat))); setCat("All"); };
  const assign = (c: string) => { if (!c) return; const t = { ...tags }; picked.forEach(p => { if (c === "__none") delete t[p]; else t[p] = c; }); saveTags(t); setPicked([]); };
  const [err, setErr] = useState("");
  const [portrait, setPortrait] = useState<Record<string, boolean>>({});
  const setAsp = (p: string, r: number) => setPortrait(o => (o[p] === (r < 0.9) ? o : { ...o, [p]: r < 0.9 }));

  const scan = async (f: string) => {
    if (!f) { setAssets([]); return; }
    try { setErr(""); let r: Asset[]; try { r = await invoke<Asset[]>("scan_folder_v2", { path: f }); } catch (e2) { if (!/not found/i.test(String(e2))) throw e2; r = await invoke<Asset[]>("scan_folder", { path: f }); } setAssets(r); }
    catch (e) { setErr(String(e)); setAssets([]); }
  };
  useEffect(() => { setSel(null); setPicked([]); setCat("All"); setQ(""); scan(lib.path); }, [lib.id, lib.path]);
  const pick = async () => {
    const f = await open({ directory: true });
    if (typeof f === "string") saveLibs(libs.map(l => (l.id === lib.id ? { ...l, path: f } : l)));
  };

  const shown = useMemo(() => {
    const t = q.toLowerCase();
    const r = assets.filter(a => a.name.toLowerCase().includes(t) && (cat === "All" || tags[a.path] === cat));
    const d = (a: Asset) => a.modified ?? 0;
    return sort === "Newest" ? r.sort((x, y) => d(y) - d(x)) : sort === "Oldest" ? r.sort((x, y) => d(x) - d(y)) : sort === "Name" ? r.sort((x, y) => x.name.localeCompare(y.name)) : r.sort((x, y) => y.size - x.size);
  }, [assets, q, sort, cat, tags]);

  const onDown = (a: Asset, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) { setPicked(p => (p.includes(a.path) ? p.filter(x => x !== a.path) : [...p, a.path])); return; }
    setSel(a); const x0 = e.clientX, y0 = e.clientY;
    const move = async (m: MouseEvent) => {
      if (Math.hypot(m.clientX - x0, m.clientY - y0) < 6) return; cleanup();
      try {
        const item = (picked.length > 1 && picked.includes(a.path) ? picked : [a.path]).map(p => trims[p]?.out || p);
        try { await startDrag({ item, icon: await dragIcon(a.kind) }); }
        catch { const icon = await invoke<string>("drag_icon"); await startDrag({ item, icon }); }
      }
      catch (er) { setErr("Drag failed: " + String(er)); }
    };
    const cleanup = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", cleanup); };
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", cleanup);
  };

  return (
    <div className="alay">
      {!bare && <><div className={"side" + (sw < 76 ? " nar" : "")} style={{ width: sw }}>
        {libs.map(l => <button key={l.id} className={l.id === lib.id ? "on" : ""} onClick={() => go(l.id)} onDoubleClick={() => renameLib(l)} title={l.name + " (double-click to rename)"}>{l.name}</button>)}
        <button className="ib" onClick={addLib} title="New section"><Plus size={13} /></button>
      </div>
      <div className={"rz" + (rz ? " on" : "")} onMouseDown={startResize} onDoubleClick={() => { setSw(170); localStorage.setItem("sideW", "170"); }} title="Drag to resize the folders column (double-click to reset)" /></>}
      <div className="amain">
      <div className="bar big">
        <div className="search"><Search size={16} /><input placeholder={`Search ${lib.name}…`} value={q} onChange={e => setQ(e.target.value)} />{q && <button className="sx" title="Clear search" onClick={() => setQ("")}><X size={14} /></button>}</div>
        <select value={sort} title="Sort by" onChange={e => { setSort(e.target.value as any); localStorage.setItem("sort", e.target.value); }}>{SORTS.map(s => <option key={s}>{s}</option>)}</select>
        <button className="ib" onClick={pick} title={lib.path ? `Change folder (${lib.path})` : "Choose folder"}><FolderPlus size={15} /></button>
        <button className="ib" onClick={() => scan(lib.path)} title="Refresh"><RefreshCw size={15} /></button>
        {theme && setTheme && <QuickStyle theme={theme} setTheme={setTheme} mode="assets" />}
        {libs.length > 1 && <button className="ib" onClick={() => removeLib(lib)} title="Remove this section (files are not deleted)"><Trash2 size={15} /></button>}
      </div>
      <div className="pills">
        <button onClick={() => setPicked(shown.map(a => a.path))} title="Select every item shown">Select all</button>
        <button disabled={!picked.length} onClick={() => setPicked([])}>Clear{picked.length ? ` (${picked.length})` : ""}</button>
        <span className="grow" /><span className="meta">{shown.length} items · Ctrl+click to multi-select</span>
      </div>
      {err && <div className="err">{err}</div>}
      <div className="split">
        <div className="grid">
          <div className="mas">
            {shown.map((a, idx) => (
              <div key={a.path} style={{ "--i": Math.min(idx, 14) } as React.CSSProperties} className={"card" + (sel?.path === a.path ? " sel" : "") + (picked.includes(a.path) ? " pick" : "")} onMouseDown={e => onDown(a, e)}>
                {a.kind === "audio" ? <AudioCard path={a.path} name={a.name} size={a.size} trim={trims[a.path]} onChange={t => setTrim(a.path, t)} /> : <div className={"thumb" + (portrait[a.path] ? " pt" : "") + (a.kind === "audio" || a.kind === "other" ? " au" : "")}>
                  {a.kind === "image" ? <img loading="lazy" decoding="async" draggable={false} src={convertFileSrc(a.path)} onLoad={e => setAsp(a.path, e.currentTarget.naturalWidth / (e.currentTarget.naturalHeight || 1))} />
                    : a.kind === "video" ? <VThumb src={convertFileSrc(a.path)} onAspect={r => setAsp(a.path, r)} />
                    : <span className="ic">{KIND[a.kind]}</span>}
                </div>}
                <div className="name" title={a.name}>{a.name}</div>
                <div className="meta">{a.ext.toUpperCase()} · {fmt(a.size)}{a.modified ? " · " + fmtDate(a.modified) : ""}</div>
              </div>
            ))}
          </div>
          {!lib.path && <div className="empty"><b>{lib.name}</b>: choose a folder<br /><br /><button className="acc" onClick={pick}><FolderPlus size={13} />Select folder</button></div>}
        </div>
        {sel && sel.kind !== "audio" && <aside>
          {sel.kind === "video" && <video key={sel.path} src={convertFileSrc(sel.path)} controls loop preload="metadata" />}
          {sel.kind === "image" && <img src={convertFileSrc(sel.path)} />}
          <div className="info"><b>{sel.name}</b><span className="meta">{sel.ext.toUpperCase()} · {fmt(sel.size)}</span></div>
        </aside>}
      </div>
      </div>
    </div>
  );
}


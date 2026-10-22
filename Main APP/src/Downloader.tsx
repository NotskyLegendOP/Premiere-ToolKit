import React, { useEffect, useRef, useState } from "react";
import { invoke, convertFileSrc } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { listen } from "@tauri-apps/api/event";
import { startDrag } from "@crabnebula/tauri-plugin-drag";
import { Download, FolderOpen, ClipboardPaste, Video, Music, Loader2, Film, AudioLines, Send, Copy, X, RefreshCw, ClipboardCheck } from "lucide-react";
import { Assets, VThumb, type Lib } from "./Assets";

type Got = { name: string; path: string; ext: string; kind: string; size: number };
const fmt = (n: number) => (n > 1e6 ? (n / 1e6).toFixed(1) + " MB" : (n / 1e3).toFixed(0) + " KB");
const FIX_CMD = "winget install yt-dlp.yt-dlp; winget install Gyan.FFmpeg";
const fmtEta = (s: number) => (s < 0 ? "" : Math.floor(s / 60) + ":" + String(Math.round(s % 60)).padStart(2, "0"));
const norm = (p: string) => p.replace(/\\/g, "/").toLowerCase();
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export default function Downloader({ onBusy }: { onBusy?: (b: boolean) => void }) {
  const [sub, setSub] = useState<"new" | "list">("new");
  const [urls, setUrls] = useState("");
  const [mode, setMode] = useState<"video" | "audio">("video");
  const [quality, setQuality] = useState("best");
  const [dir, setDir] = useState(() => localStorage.getItem("dlDir") || "");
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState("");
  const [missing, setMissing] = useState(false);
  const [got, setGot] = useState<Got[]>([]);
  const [impMsg, setImpMsg] = useState("");
  const [auto, setAuto] = useState(() => localStorage.getItem("dlAuto") === "1");
  const [prog, setProg] = useState({ done: 0, total: 0, speed: 0, eta: -1, i: 0, n: 0, file: "" });
  const [recent, setRecent] = useState<(Got & { modified?: number })[]>([]);
  const beforeRef = useRef<Set<string>>(new Set());
  const lastRef = useRef({ t: 0, peak: 0 });
  const inflight = useRef(false);
  const evtRef = useRef(false);                       // true once real progress events arrive from yt-dlp
  const streamRef = useRef({ file: "", base: 0, lastEnd: 0 });
  const retRef = useRef<string[]>([]);                // file paths printed by yt-dlp
  useEffect(() => { onBusy?.(busy); }, [busy]);
  const saveDir = (d: string) => { setDir(d); localStorage.setItem("dlDir", d); };
  const pickDir = async () => { const f = await open({ directory: true }); if (typeof f === "string") saveDir(f); };
  const paste = async () => { try { const t = await navigator.clipboard.readText(); if (t) setUrls(u => (u ? u + "\n" : "") + t.trim()); } catch { setLog("Clipboard blocked. Paste with Ctrl+V."); } };
  const toggleAuto = (v: boolean) => { setAuto(v); localStorage.setItem("dlAuto", v ? "1" : "0"); };

  const scanDir = async (): Promise<Got[]> => {
    try { return await invoke<Got[]>("scan_folder_v2", { path: dir }); }
    catch (e) { if (!/not found/i.test(String(e))) throw e; return await invoke<Got[]>("scan_folder", { path: dir }); }
  };

  // Real progress from yt-dlp (sent by the Rust side). Falls back to folder-size polling below if events don't arrive.
  useEffect(() => {
    const subs: Promise<() => void>[] = [];
    try {
      subs.push(listen<{ done: number; total: number; speed: number; eta: number; file: string }>("dl-progress", e => {
        evtRef.current = true;
        const q = e.payload, st = streamRef.current;
        if (q.file !== st.file) { if (st.file) st.base += st.lastEnd; st.file = q.file; }   // video + audio are separate streams: add them up
        st.lastEnd = q.total > 0 ? q.total : q.done;
        setProg(p => ({ ...p, done: st.base + q.done, total: q.total > 0 ? st.base + q.total : 0, speed: q.speed, eta: q.eta, file: q.file.replace(/\.(part|ytdl|temp)$/i, "") }));
      }));
      subs.push(listen<string>("dl-status", e => setLog(l => l + e.payload + "\n")));
    } catch { /* events unavailable: polling fallback is used */ }
    return () => { subs.forEach(u => u.then(f => f()).catch(() => {})); };
  }, []);

  // Fallback progress: measure the new files (incl. .part) that yt-dlp is writing into the save folder.
  useEffect(() => {
    if (!busy) return;
    let stop = false;
    const tick = async () => {
      if (inflight.current || evtRef.current) return; inflight.current = true;
      try {
        const now = await scanDir();
        const nw = now.filter(a => !beforeRef.current.has(a.path));
        const sum = nw.reduce((s, a) => s + a.size, 0);
        const L = lastRef.current, t = Date.now(), peak = Math.max(L.peak, sum);
        const inst = L.t ? Math.max(0, (peak - L.peak) / ((t - L.t) / 1000)) : 0;
        lastRef.current = { t, peak };
        const big = [...nw].sort((x, y) => y.size - x.size)[0];
        if (!stop && !evtRef.current) setProg(p => ({ ...p, done: peak, speed: p.speed * 0.5 + inst * 0.5, file: big ? big.name.replace(/\.(part|ytdl|temp)$/i, "") : p.file }));
      } catch { /* ignore */ }
      inflight.current = false;
    };
    const id = setInterval(tick, 1200); tick();
    return () => { stop = true; clearInterval(id); };
  }, [busy, dir]);

  // Send files to the Premiere panel; it imports them into the open project.
  const sendImport = async (paths: string[]) => {
    if (!paths.length) return;
    setImpMsg("Sending to Premiere…");
    try {
      const st = await invoke<{ connected: boolean }>("bridge_status");
      if (!st.connected) { setImpMsg("Premiere panel not connected. Open Window > Extensions > Premiere Toolbox"); return; }
      const id = String(Date.now());
      await invoke("send_curve", { json: JSON.stringify({ type: "ptb-import", id, paths }) });
      for (let n = 0; n < 50; n++) {
        await sleep(400);
        const s = await invoke<{ result: string | null }>("bridge_status");
        if (!s.result) continue;
        try { const r = JSON.parse(s.result); if (r.id !== id) continue; setImpMsg((r.ok ? "OK: " : "Error: ") + r.msg); return; } catch { continue; }
      }
      setImpMsg("No response from Premiere (is the panel updated? copy the new premiere-panel folder)");
    } catch (e) { setImpMsg("Failed: " + String(e)); }
  };

  const go = async (override?: string) => {
    const list = (typeof override === "string" ? override : urls).split(/\s+/).filter(x => /^https?:\/\//i.test(x));
    if (!list.length) { setLog("Paste at least one link that starts with http."); return; }
    if (!dir) { setLog("Choose a save folder first."); return; }
    setLog(""); setMissing(false); setImpMsg("");
    let before = new Set<string>();
    try { before = new Set((await scanDir()).map(a => a.path)); } catch { /* folder may be empty */ }
    beforeRef.current = before; lastRef.current = { t: 0, peak: 0 };
    evtRef.current = false; retRef.current = [];
    setProg({ done: 0, total: 0, speed: 0, eta: -1, i: 0, n: list.length, file: "" });
    setBusy(true);
    for (let i = 0; i < list.length; i++) {
      streamRef.current = { file: "", base: 0, lastEnd: 0 };
      setProg(p => ({ ...p, i: i + 1 }));
      setLog(l => l + `[${i + 1}/${list.length}] Downloading ${list[i]}\n`);
      try { const r = await invoke<string>("dl_run", { url: list[i], mode, quality, dir }); if (r) retRef.current.push(norm(r)); setLog(l => l + "Done. " + (r || "") + "\n"); }
      catch (e) { const m = String(e); if (/(yt-dlp|ffmpeg).*not found|not found.*(yt-dlp|ffmpeg)/i.test(m)) setMissing(true); setLog(l => l + "Failed: " + m + "\n"); }
    }
    // Whatever appeared in the folder during this run is the new download.
    try {
      const fresh = (await scanDir()).filter(a => (!before.has(a.path) || retRef.current.includes(norm(a.path))) && (a.kind === "video" || a.kind === "audio") && !/\.(part|ytdl|temp)$/i.test(a.name));
      if (fresh.length) {
        setGot(g => [...fresh, ...g.filter(x => !fresh.some(f => f.path === x.path))]);
        if (auto) await sendImport(fresh.map(f => f.path));
      }
    } catch { /* ignore */ }
    setBusy(false);
  };

  const dragStart = (a: Got, e: React.MouseEvent) => {
    const x0 = e.clientX, y0 = e.clientY;
    const move = async (m: MouseEvent) => {
      if (Math.hypot(m.clientX - x0, m.clientY - y0) < 6) return; cleanup();
      try { const icon = await invoke<string>("drag_icon"); await startDrag({ item: [a.path], icon }); }
      catch (er) { setImpMsg("Drag failed: " + String(er)); }
    };
    const cleanup = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", cleanup); };
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", cleanup);
  };
  const copyFix = async () => { try { await navigator.clipboard.writeText(FIX_CMD); setLog(l => l + "Command copied.\n"); } catch { /* ignore */ } };

  const loadRecent = async () => { if (!dir) { setRecent([]); return; } try { const r = (await scanDir()) as (Got & { modified?: number })[]; setRecent(r.filter(a => (a.kind === "video" || a.kind === "audio") && !/\.(part|ytdl|temp)$/i.test(a.name)).sort((x, y) => (y.modified ?? 0) - (x.modified ?? 0)).slice(0, 12)); } catch { setRecent([]); } };
  useEffect(() => { if (sub === "new" && !busy) loadRecent(); }, [dir, busy, sub]);
  const pasteGo = async () => { try { const t = (await navigator.clipboard.readText()).trim(); if (!/^https?:\/\//i.test(t)) { setLog("Clipboard has no link. Copy a video link first."); return; } setUrls(t); go(t); } catch { setLog("Clipboard blocked. Paste with Ctrl+V."); } };
  const dlLib: Lib = { id: "downloads", name: "Downloads", path: dir };
  return (
    <>
      <div className="secs cen">
        <button className={sub === "new" ? "on" : ""} onClick={() => setSub("new")}><Download size={12} />New download</button>
        <button className={sub === "list" ? "on" : ""} onClick={() => setSub("list")} title="Everything in your download folder, newest first"><FolderOpen size={12} />Downloads</button>
      </div>
      {sub === "list" ? (
        <Assets key={dir} bare lib={dlLib} libs={[dlLib]} saveLibs={n => saveDir(n[0].path)} removeLib={() => {}} go={() => {}} addLib={() => {}} renameLib={() => {}} />
      ) : (
        <div className="dlwrap"><div className="settings dl cen dlx">
          <div className="csec"><i>1</i><span>Paste links</span></div>
          <textarea rows={3} placeholder="Paste video links here (one per line)" value={urls} onChange={e => setUrls(e.target.value)} />
          <div className="csub">
            <button className="ghost" onClick={paste}><ClipboardPaste size={12} />Paste</button>
            <button className="ghost" disabled={busy} onClick={pasteGo} title="Take the link from the clipboard and start downloading right away"><ClipboardCheck size={12} />Paste &amp; go</button>
            {urls && <button className="ghost" onClick={() => setUrls("")} title="Clear the link box"><X size={12} />Clear</button>}
          </div>
          <div className="csec"><i>2</i><span>Format</span></div>
          <div className="fmtrow">
            <div className="seg">
              <button className={mode === "video" ? "on" : ""} onClick={() => { setMode("video"); setQuality("best"); }}><Video size={13} />Video</button>
              <button className={mode === "audio" ? "on" : ""} onClick={() => { setMode("audio"); setQuality("mp3"); }}><Music size={13} />Audio</button>
            </div>
            {mode === "video"
              ? <select value={quality} onChange={e => setQuality(e.target.value)}><option value="best">Best quality</option><option value="1080">1080p</option><option value="720">720p</option><option value="480">480p</option></select>
              : <select value={quality} onChange={e => setQuality(e.target.value)}><option value="mp3">MP3</option><option value="m4a">M4A</option><option value="wav">WAV</option></select>}
          </div>
          <div className="csec"><i>3</i><span>Save to</span></div>
          <div className="cpick"><span className="cpl">Folder</span><span className={"cpp" + (dir ? "" : " empty")} title={dir}>{dir || "No save folder chosen"}</span><button onClick={pickDir}><FolderOpen size={13} />Browse</button></div>
          <label className="tgl" title="After each download, import the file into the open Premiere project"><input type="checkbox" checked={auto} onChange={e => toggleAuto(e.target.checked)} /><i /><span>Auto-import into Premiere project</span></label>
          <div className="cgo" style={{ width: "100%" }}><button className="acc big" disabled={busy} onClick={() => go()}>{busy ? <Loader2 size={15} className="spin" /> : <Download size={15} />}{busy ? "Downloading…" : mode === "video" ? "Download video" : "Download audio"}</button></div>
          {(busy || prog.done > 0) && (() => {
            const det = busy && prog.total > 0, pct = det ? Math.min(100, Math.round((prog.done / prog.total) * 100)) : 0;
            return <div className="prog">
              <div className={"pgb" + (!busy ? " full" : det ? " det" : " ind")}><i style={det ? { width: pct + "%" } : undefined} /></div>
              <div className="pgt">
                <span>{busy ? `Downloading ${prog.i}/${prog.n}${det ? " · " + pct + "%" : ""}` : "Finished"}</span>
                <span>{prog.done > 0 ? fmt(prog.done) + (det ? " / " + fmt(prog.total) : " downloaded") : "starting…"}</span>
                {busy && prog.speed > 0 && <span>{fmt(prog.speed)}/s{det && prog.eta >= 0 ? " · ETA " + fmtEta(prog.eta) : ""}</span>}
              </div>
              {busy && prog.file && <div className="meta" title={prog.file}>{prog.file}</div>}
            </div>;
          })()}
          {log && <pre className="dlog">{log}</pre>}
          {missing && <div className="fixbox">
            <b>yt-dlp / ffmpeg is not installed (or not on PATH)</b>
            <span className="meta">1) Open a new PowerShell and run the command below. 2) Close every PowerShell window and this app. 3) Open a new PowerShell and run <code style={{ display: "inline", padding: "0 4px" }}>npm run tauri dev</code></span>
            <code>{FIX_CMD}</code>
            <div className="row" style={{ justifyContent: "flex-start" }}><button onClick={copyFix}><Copy size={12} />Copy command</button></div>
          </div>}
          {got.length > 0 && <div className="got">
            <h4>Just downloaded<span className="grow" /><button className="ib" title="Clear list" onClick={() => setGot([])}><X size={12} /></button></h4>
            {got.map(a => (
              <div key={a.path} className="gotrow" onMouseDown={e => dragStart(a, e)} title="Drag this into Premiere (project panel or timeline)">
                <div className="gt">{a.kind === "video" ? <VThumb src={convertFileSrc(a.path)} onAspect={() => {}} /> : <AudioLines size={18} />}</div>
                <div className="info"><b title={a.name}>{a.name}</b><span className="meta">{a.ext.toUpperCase()} · {fmt(a.size)} · drag into Premiere</span></div>
                <button title="Import into the open Premiere project" onMouseDown={e => e.stopPropagation()} onClick={() => sendImport([a.path])}><Send size={12} />Import</button>
              </div>
            ))}
            {got.length > 1 && <div className="row" style={{ justifyContent: "flex-start" }}><button onClick={() => sendImport(got.map(g => g.path))}><Film size={12} />Import all ({got.length})</button></div>}
          </div>}
          {impMsg && <pre className="dlog">{impMsg}</pre>}
        </div>
        {recent.length > 0 && <div className="recent">
          <h4>Recent downloads<span className="grow" /><button className="ib" title="Refresh" onClick={loadRecent}><RefreshCw size={12} /></button></h4>
          <div className="rgrid">{recent.map(a => (
            <div key={a.path} className="rcard" onMouseDown={e => dragStart(a, e)} title="Drag into Premiere">
              <div className="rt">{a.kind === "video" ? <VThumb src={convertFileSrc(a.path)} onAspect={() => {}} /> : <AudioLines size={22} />}</div>
              <b title={a.name}>{a.name}</b>
              <span className="meta">{a.ext.toUpperCase()} · {fmt(a.size)}</span>
              <button onMouseDown={e => e.stopPropagation()} onClick={() => sendImport([a.path])}><Send size={11} />Import</button>
            </div>))}</div>
        </div>}
        </div>
      )}
    </>
  );
}

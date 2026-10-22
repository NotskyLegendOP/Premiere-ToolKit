import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Search, X, Plus, RefreshCw, FolderPlus, Trash2, LayoutGrid, List, Eye, EyeOff,
  Star, Play, Scissors, Scaling, GripVertical, Film, AudioLines, Image as ImageIcon,
  File as FileIcon, FolderOpen, Check, TriangleAlert, MoveRight,
} from "lucide-react";
import { useLibs } from "../libs";
import { useAzy, pushUndo, useStars, type Sort } from "../state";
import { useTheme } from "../theme";
import { QuickStyle } from "../../QuickStyle";
import AudioCard, { type Trim } from "../../AudioCard";
import { VThumb } from "../../Assets";
import {
  dragOut, fileUrl, pickFolder, placeMedia, scanFolder, IS_TAURI, type Asset, type Status,
} from "../api";
import { Btn, Ib, Chip, Empty, toast, cx, fmtSize, fmtDate, useKey, useEscape, Busy } from "../ui";

/* ------------------------------------------------------------------------------------------------
 * Files — pinned folders, search in place, sort/view, drag-out, preview dock and Apply.
 * The look is the v1.5.0 compact card, kept conservative on purpose.
 * ---------------------------------------------------------------------------------------------- */

const SORTS: { id: Sort; label: string }[] = [
  { id: "newest", label: "Newest" },
  { id: "oldest", label: "Oldest" },
  { id: "name", label: "Name A–Z" },
  { id: "za", label: "Name Z–A" },
  { id: "type", label: "Type" },
];

const KIND_ICON: Record<Asset["kind"], React.ReactNode> = {
  video: <Film size={18} />,
  audio: <AudioLines size={18} />,
  image: <ImageIcon size={18} />,
  other: <FileIcon size={18} />,
};

export default function Files({ active, onContext, status }: { active: boolean; onContext: (s: string) => void; status: Status }) {
  const [azy, set] = useAzy();
  const [theme, setTheme] = useTheme();
  const [libs, L] = useLibs();
  const [stars, setStars] = useStars();

  const lib = libs.find(l => l.id === L.active) ?? libs[0];
  const hasFolder = !IS_TAURI || !!lib?.path;

  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [starredOnly, setStarredOnly] = useState(false);
  const [sel, setSel] = useState<Asset | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [applying, setApplying] = useState<string[]>([]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [portrait, setPortrait] = useState<Record<string, boolean>>({});
  const [trims, setTrims] = useState<Record<string, Trim>>(() => {
    try { return JSON.parse(localStorage.getItem("trims") || "{}"); } catch { return {}; }
  });

  const setTrim = (p: string, t: Trim | null) => setTrims(o => {
    const n = { ...o };
    if (t) n[p] = t; else delete n[p];
    localStorage.setItem("trims", JSON.stringify(n));
    return n;
  });

  /* scan the pinned folder */
  const scan = async (path: string) => {
    if (!path && IS_TAURI) { setAssets([]); return; }
    setLoading(true); setErr("");
    try { setAssets(await scanFolder(path)); }
    catch (e) { setErr(String(e)); setAssets([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    setSel(null); setPicked([]); setQ("");
    scan(lib?.path ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lib?.id, lib?.path]);

  useEffect(() => { onContext(lib ? (lib.path || lib.name) : ""); }, [lib?.id, lib?.path]);

  /* sort + filter (non-matching cards are filtered, not destroyed — the folder never blanks mid-word) */
  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    const r = assets.filter(a =>
      (!t || a.name.toLowerCase().includes(t)) &&
      (!starredOnly || stars.includes(a.path))
    );
    const d = (a: Asset) => a.modified ?? 0;
    const s = azy.sort;
    return [...r].sort((x, y) =>
      s === "newest" ? d(y) - d(x)
        : s === "oldest" ? d(x) - d(y)
          : s === "name" ? x.name.localeCompare(y.name)
            : s === "za" ? y.name.localeCompare(x.name)
              : (x.ext || "").localeCompare(y.ext || "") || x.name.localeCompare(y.name)
    );
  }, [assets, q, azy.sort, starredOnly, stars]);

  const setSort = (v: Sort) => {
    const prev = azy.sort;
    set({ sort: v });
    pushUndo(`sorted by ${SORTS.find(s => s.id === v)?.label}`, () => set({ sort: prev }));
  };
  const setView = (v: "grid" | "list") => {
    const prev = azy.view;
    set({ view: v });
    pushUndo(`switched to ${v} view`, () => set({ view: prev }));
  };

  /* ── pins ─────────────────────────────────────────────────────────────────────────────────── */
  const addPin = async () => {
    const path = await pickFolder();
    if (path === null) return;
    const name = path.split(/[\\/]/).filter(Boolean).pop() || "Pinned folder";
    const l = L.add(name, path || "");
    pushUndo(`pinned “${l.name}”`, () => L.remove(l.id));
    toast("Folder pinned", name, "ok", 1800);
  };
  const unpin = (id: string, name: string, index: number) => {
    L.remove(id);
    pushUndo(`removed pin “${name}”`, () => {
      const cur = [...libs];
      cur.splice(index, 0, libs[index]);
      L.set(cur);
    });
    toast("Pin removed", `${name} — Ctrl+Z puts it back`, "info", 2400);
  };
  const renamePin = (id: string, name: string) => {
    const next = window.prompt("Rename pinned folder", name)?.trim();
    if (!next || next === name) return;
    const prev = name;
    L.rename(id, next);
    pushUndo(`renamed “${prev}”`, () => L.rename(id, prev));
  };
  const movePin = (from: number, to: number) => {
    if (to < 0 || to >= libs.length || from === to) return;
    const before = libs.map(l => l.id);
    L.move(from, to);
    pushUndo("reordered pins", () => {
      const m = new Map(libs.map(l => [l.id, l]));
      L.set(before.map(id => m.get(id)!).filter(Boolean));
    });
  };

  /* Alt+Arrow reorders the active pin without a mouse */
  useKey(e => {
    if (!active) return;
    const i = libs.findIndex(l => l.id === L.active);
    if (e.altKey && (e.key === "ArrowLeft" || e.key === "ArrowRight") && !e.ctrlKey && i >= 0) {
      e.preventDefault();
      movePin(i, i + (e.key === "ArrowRight" ? 1 : -1));
    }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "p") {
      e.preventDefault();
      set({ dock: !azy.dock });
    }
  }, [active, libs, L.active, azy.dock]);

  /* Esc clears the selection first; only an empty selection lets the shell hide the window */
  useEscape(() => {
    if (!active) return false;
    if (sel || picked.length) { setSel(null); setPicked([]); return true; }
    return false;
  }, [active, sel, picked.length]);

  /* ── selection + drag-out ───────────────────────────────────────────────────────────────── */
  const onDown = (a: Asset, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      setPicked(p => (p.includes(a.path) ? p.filter(x => x !== a.path) : [...p, a.path]));
      return;
    }
    setPicked([a.path]);
    setSel(a);
    const x0 = e.clientX, y0 = e.clientY;
    const move = async (m: MouseEvent) => {
      if (Math.hypot(m.clientX - x0, m.clientY - y0) < 7) return;
      cleanup();
      const paths = (picked.length > 1 && picked.includes(a.path) ? picked : [a.path])
        .map(p => trims[p]?.out || p)
        .filter(Boolean);
      const r = await dragOut(paths, a.kind);
      if (!r.ok) toast("Drag failed", r.msg, "err");
    };
    const cleanup = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", cleanup);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", cleanup);
  };

  const openInDock = (a: Asset) => { setSel(a); setPicked([a.path]); if (!azy.dock) set({ dock: true }); };

  const apply = async (a: Asset) => {
    if (applying.includes(a.path)) return;
    setApplying(v => [...v, a.path]);
    const r = await placeMedia(a, { autoCut: azy.autoCut, autoScale: azy.autoScale });
    setApplying(v => v.filter(p => p !== a.path));
    if (r.ok) toast(`Placed “${a.name}”`, r.msg || "On the lowest free track at the playhead — nothing else was touched.", "ok");
    else toast(`“${a.name}” was not placed`, r.msg, "err");
  };

  const star = (path: string) => {
    const on = stars.includes(path);
    setStars(on ? stars.filter(p => p !== path) : [...stars, path]);
  };

  /* ── render ──────────────────────────────────────────────────────────────────────────────── */
  return (
    <>
      {/* pin strip */}
      <div className="az-pins" role="tablist" aria-label="Pinned folders">
        {libs.map((l, i) => (
          <Chip
            key={l.id}
            on={l.id === lib?.id}
            role="tab"
            aria-selected={l.id === lib?.id}
            draggable
            className={cx("az-pin", dragIdx === i && "drag", overIdx === i && dragIdx !== null && dragIdx !== i && "over")}
            title={`${l.name}${l.path ? " — " + l.path : " — no folder yet"}  (drag or Alt+←/→ to reorder, double-click to rename)`}
            onClick={() => L.select(l.id)}
            onDoubleClick={() => renamePin(l.id, l.name)}
            onDragStart={e => { setDragIdx(i); e.dataTransfer.effectAllowed = "move"; }}
            onDragOver={e => { e.preventDefault(); setOverIdx(i); }}
            onDragLeave={() => setOverIdx(o => (o === i ? null : o))}
            onDrop={e => {
              e.preventDefault();
              if (dragIdx !== null) movePin(dragIdx, i);
              setDragIdx(null); setOverIdx(null);
            }}
            onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
          >
            <Star size={10} style={{ opacity: l.path ? 1 : .35 }} />
            {l.name}
            {libs.length > 1 && l.id === lib?.id && (
              <span
                className="x"
                role="button"
                aria-label={`Remove pin ${l.name}`}
                title="Remove this pin (files are not deleted)"
                onClick={e => { e.stopPropagation(); unpin(l.id, l.name, i); }}
                style={{ display: "inline-flex", opacity: .7 }}
              >
                <X size={10} />
              </span>
            )}
          </Chip>
        ))}
        <Chip className="dash" onClick={addPin} title="Pin another folder"><Plus size={11} />Pin folder</Chip>
      </div>

      {/* breadcrumb + count */}
      <div className="az-pathrow">
        <FolderOpen size={12} style={{ opacity: .6 }} />
        <span>Pinned</span>
        <span style={{ opacity: .4 }}>/</span>
        <b>{lib?.name ?? "Files"}</b>
        <span className="grow" />
        <span className="az-count">{shown.length} item{shown.length === 1 ? "" : "s"}</span>
        <span className="az-grow" />
        <span className="az-hint" title={lib?.path || "No folder yet"}>{lib?.path ? lib.path.split(/[\\/]/).slice(-2).join("/") : "no folder"}</span>
        <Ib label="Refresh the folder" onClick={() => scan(lib?.path ?? "")} style={{ width: 20, height: 20 }}><RefreshCw size={12} /></Ib>
        <Ib label="Choose the folder for this pin" style={{ width: 20, height: 20 }} onClick={async () => {
          const p = await pickFolder();
          if (p !== null && lib) L.setPath(lib.id, p);
        }}><FolderPlus size={12} /></Ib>
      </div>

      {/* toolbar */}
      <div className="az-bar">
        <div className="az-search">
          <Search />
          <input value={q} placeholder={`Search ${lib?.name ?? "files"}…`} onChange={e => setQ(e.target.value)} />
          {q && <Ib label="Clear search" onClick={() => setQ("")} style={{ width: 20, height: 20 }}><X size={11} /></Ib>}
        </div>
        <select className="az-select" value={azy.sort} onChange={e => setSort(e.target.value as Sort)} title="Sort by">
          {SORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <Ib label="Grid view" on={azy.view === "grid"} onClick={() => setView("grid")}><LayoutGrid /></Ib>
        <Ib label="List view" on={azy.view === "list"} onClick={() => setView("list")}><List /></Ib>
        <Ib label={azy.dock ? "Hide preview dock (Ctrl+Shift+P)" : "Show preview dock (Ctrl+Shift+P)"} on={azy.dock} onClick={() => set({ dock: !azy.dock })}>
          {azy.dock ? <Eye /> : <EyeOff />}
        </Ib>
        <QuickStyle theme={theme} setTheme={setTheme} mode="assets" />
      </div>

      {/* sub toolbar: Apply options */}
      <div className="az-subbar">
        <Chip on={starredOnly} onClick={() => setStarredOnly(v => !v)} title="Show starred files only"><Star size={10} />Starred</Chip>
        <Chip on={azy.autoCut} onClick={() => set({ autoCut: !azy.autoCut })} title="Keep the first 2 s of the placed clip"><Scissors size={10} />Auto-Cut</Chip>
        <Chip on={azy.autoScale} onClick={() => set({ autoScale: !azy.autoScale })} title="Set Motion › Scale 180 on the newly placed video only"><Scaling size={10} />Auto-Scale</Chip>
        <span className="az-grow" />
        {loading ? <Busy text="Scanning…" /> : (
          <span className="az-hint">
            {picked.length > 1 ? `${picked.length} selected` : status.demo ? "demo media" : "Ctrl+click to multi-select"}
          </span>
        )}
      </div>

      {err && <div className="az-err">{err}</div>}

      {/* content */}
      {!hasFolder ? (
        <Empty
          icon={<FolderOpen />}
          title={`${lib?.name ?? "This pin"} has no folder yet`}
          hint="Pick a folder once and it stays pinned."
          action={<Btn variant="accent" onClick={async () => { const p = await pickFolder(); if (p !== null && lib) L.setPath(lib.id, p); }} icon={<FolderPlus size={12} />}>Select folder</Btn>}
        />
      ) : shown.length === 0 && !loading ? (
        <Empty icon={<Search />} title={q ? `No match for “${q}”` : "Nothing here yet"} hint={q ? "Clear the search to see the folder again." : "Drop media into the folder, then press refresh."} />
      ) : (
        <div className="az-scroll">
          <div className={azy.view === "grid" ? "az-grid" : "az-list"}>
            {shown.map((a, idx) => {
              const isAudio = a.kind === "audio";
              const isSel = sel?.path === a.path;
              const isPicked = picked.includes(a.path);
              return (
                <article
                  key={a.path}
                  className={cx("az-card", (isSel || isPicked) && "sel")}
                  style={{ ["--i" as string]: Math.min(idx, 14) } as React.CSSProperties}
                  onMouseDown={e => onDown(a, e)}
                  onDoubleClick={() => openInDock(a)}
                  title={`${a.name}\nDrag into Premiere · double-click to preview`}
                >
                  {isAudio && !a.demo && IS_TAURI ? (
                    <AudioCard path={a.path} name={a.name} size={a.size} trim={trims[a.path]} onChange={t => setTrim(a.path, t)} />
                  ) : (
                    <div className={cx("az-thumb", portrait[a.path] && "pt", (isAudio || a.kind === "other") && "au")}>
                      {a.kind === "video" && !a.demo ? (
                        <VThumb src={fileUrl(a.path)} onAspect={r => setPortrait(o => (o[a.path] === (r < .9) ? o : { ...o, [a.path]: r < .9 }))} />
                      ) : a.kind === "image" && !a.demo ? (
                        <img loading="lazy" decoding="async" draggable={false} src={fileUrl(a.path)}
                          onLoad={e => { const im = e.currentTarget; setPortrait(o => ({ ...o, [a.path]: im.naturalWidth / (im.naturalHeight || 1) < .9 })); }} />
                      ) : (
                        <span className="demo">{a.demo ? "demo" : a.ext}</span>
                      )}
                      {!a.demo && <span className="az-kindtag">{a.ext.toUpperCase()}</span>}
                      {a.demo && <span className="az-kindtag">{KIND_ICON[a.kind] && a.kind.toUpperCase()}</span>}
                    </div>
                  )}

                  <button
                    className={cx("az-star", stars.includes(a.path) && "on")}
                    title={stars.includes(a.path) ? "Remove from starred" : "Star this file"}
                    onClick={e => { e.stopPropagation(); star(a.path); }}
                  ><Star size={12} /></button>

                  <div className="az-txt">
                    <div className="az-name" title={a.name}>{a.name}</div>
                    <div className="az-meta">
                      {a.ext.toUpperCase()} · {fmtSize(a.size)}{a.modified ? " · " + fmtDate(a.modified) : ""}
                      {isAudio && trims[a.path] ? " · trimmed" : ""}
                    </div>
                  </div>

                  <div className="az-acts">
                    <Btn small onClick={e => { e.stopPropagation(); openInDock(a); }} title="Preview in the dock" icon={<Play size={10} />}>Preview</Btn>
                    <Btn small variant="accent" onClick={e => { e.stopPropagation(); apply(a); }} disabled={applying.includes(a.path)}
                      title="Place at the playhead on the lowest free track">
                      {applying.includes(a.path) ? "…" : "Apply"}
                    </Btn>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* preview dock — borrowed height below the panel, the grid never reflows */}
      {azy.dock && sel && (
        <div className="az-dock">
          <div className="az-dock-media">
            {sel.kind === "video" && !sel.demo ? <video key={sel.path} src={fileUrl(sel.path)} controls loop preload="metadata" />
              : sel.kind === "image" && !sel.demo ? <img src={fileUrl(sel.path)} />
                : sel.kind === "audio" && !sel.demo ? <audio key={sel.path} src={fileUrl(sel.path)} controls style={{ width: "100%" }} />
                  : <span style={{ display: "grid", placeItems: "center", gap: 4 }}>{KIND_ICON[sel.kind]}<em style={{ fontStyle: "normal", fontSize: 9, opacity: .6 }}>{sel.ext.toUpperCase()}</em></span>}
          </div>
          <div className="az-dock-info">
            <b title={sel.name}>{sel.name}</b>
            <span>{fmtSize(sel.size)} · {sel.demo ? "demo item" : "ready to place"} · drops on the lowest free track</span>
            <div className="az-row" style={{ gap: 3, marginTop: 2 }}>
              <Btn small onClick={() => { dragOut([trims[sel.path]?.out || sel.path], sel.kind).then(r => { if (!r.ok) toast("Drag failed", r.msg, "err"); }); }} icon={<GripVertical size={10} />}>Drag</Btn>
              <Btn small onClick={() => toast("Selection", `${picked.length} item${picked.length === 1 ? "" : "s"} selected`, "info", 1500)} icon={<Check size={10} />}>{picked.length}</Btn>
            </div>
          </div>
          <div className="az-dock-acts">
            <Btn small variant="accent" onClick={() => apply(sel)} icon={<MoveRight size={11} />}>Apply</Btn>
            <Ib label="Close preview" onClick={() => { setSel(null); setPicked([]); }} style={{ alignSelf: "flex-end" }}><X /></Ib>
          </div>
        </div>
      )}
    </>
  );
}

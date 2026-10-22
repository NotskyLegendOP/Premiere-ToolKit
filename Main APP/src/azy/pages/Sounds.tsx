import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Search, X, Plus, Play, Pause, Star, FolderPlus, Trash2, Volume2, Check,
  AudioLines, GripVertical, CornerUpLeft,
} from "lucide-react";
import { useAzy, pushUndo, useStars, holdDown, type SoundFolder } from "../state";
import { dragOut, fileUrl, listSounds, placeAudio, pickFolder, IS_TAURI, type Asset } from "../api";
import { Btn, Ib, Chip, Empty, toast, cx, fmtSize, useKey, useEscape, Busy, SliderCard } from "../ui";

/* ------------------------------------------------------------------------------------------------
 * SFX / Sounds — your own sound folders, favourites, per-card play with a waveform, Apply at the
 * playhead with a remembered gain. The sound-level card only opens on the hold modifier.
 * ---------------------------------------------------------------------------------------------- */

const FAV = "__fav";

export default function Sounds({ active, onContext }: { active: boolean; onContext: (s: string) => void }) {
  const [azy, set] = useAzy();
  const [stars, setStars] = useStars();
  const folders = azy.soundFolders;
  const [folderId, setFolderId] = useState<string>(() => folders[0]?.id ?? "");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [playing, setPlaying] = useState<string | null>(null);
  const [gainOpen, setGainOpen] = useState(false);
  const [gainTarget, setGainTarget] = useState<Asset | null>(null);
  const [draftGain, setDraftGain] = useState(azy.gain);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);

  const folder = folders.find(f => f.id === folderId) ?? folders[0];
  const isFav = folderId === FAV;

  useEffect(() => { onContext(isFav ? "Favourites" : folder?.path || folder?.name || ""); }, [folderId, folder?.id]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    listSounds({ id: folder?.id ?? "", name: folder?.name ?? "", path: folder?.path ?? "" })
      .then(r => { if (alive) setAssets(r.filter(a => a.kind === "audio" || a.kind === "other")); })
      .catch(e => { if (alive) { setAssets([]); toast("Could not read the folder", String(e), "err"); } })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder?.id, folder?.path]);

  useEffect(() => () => { audio.current?.pause(); }, []);

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    const base = isFav ? assets.filter(a => stars.includes(a.path)) : assets;
    return base.filter(a => !t || a.name.toLowerCase().includes(t));
  }, [assets, q, isFav, stars]);

  /* ── preview (one sound at a time) ─────────────────────────────────────────────────────────── */
  const toggle = (a: Asset) => {
    if (playing === a.path) {
      audio.current?.pause();
      setPlaying(null);
      return;
    }
    audio.current?.pause();
    if (!IS_TAURI || a.demo) {
      setPlaying(a.path);
      window.setTimeout(() => setPlaying(p => (p === a.path ? null : p)), 2400);
      return;
    }
    const el = new Audio(fileUrl(a.path));
    el.volume = Math.min(1, Math.max(0, (azy.gain + 24) / 36 * .6 + .4));
    el.onended = () => setPlaying(null);
    el.play().then(() => { audio.current = el; setPlaying(a.path); }).catch(e => toast("Cannot play this sound", String(e), "err"));
  };

  /* ── apply ────────────────────────────────────────────────────────────────────────────────── */
  const apply = async (a: Asset, gain = azy.gain) => {
    const r = await placeAudio(a, gain);
    if (r.ok) toast(`Placed “${a.name}”`, r.msg || `${gain > 0 ? "+" : ""}${gain} dB at the playhead.`, "ok");
    else toast(`“${a.name}” was not placed`, r.msg, "err");
  };

  const applyWithHold = (a: Asset, e: React.MouseEvent) => {
    if (holdDown(e, azy.holdMod)) {
      setDraftGain(azy.gain);
      setGainTarget(a);
      setGainOpen(true);
      return;
    }
    apply(a);
  };

  /* ── folders ──────────────────────────────────────────────────────────────────────────────── */
  const addFolder = async () => {
    const path = await pickFolder();
    if (path === null) return;
    const name = path.split(/[\\/]/).filter(Boolean).pop() || "Sound folder";
    const f: SoundFolder = { id: "sfx-" + Date.now(), name, path };
    const prev = folders;
    set({ soundFolders: [...folders, f] });
    setFolderId(f.id);
    pushUndo(`added sound folder “${name}”`, () => set({ soundFolders: prev }));
  };
  const removeFolder = (f: SoundFolder) => {
    if (folders.length < 2) { toast("Keep one folder", "The Sounds section needs at least one folder.", "info"); return; }
    const prev = folders;
    set({ soundFolders: folders.filter(x => x.id !== f.id) });
    if (folderId === f.id) setFolderId(prev.find(x => x.id !== f.id)!.id);
    pushUndo(`removed sound folder “${f.name}”`, () => set({ soundFolders: prev }));
  };
  const renameFolder = (f: SoundFolder) => {
    const n = window.prompt("Rename sound folder", f.name)?.trim();
    if (!n || n === f.name) return;
    const prev = folders;
    set({ soundFolders: folders.map(x => (x.id === f.id ? { ...x, name: n } : x)) });
    pushUndo(`renamed “${f.name}”`, () => set({ soundFolders: prev }));
  };
  const moveFolder = (from: number, to: number) => {
    if (from === to || to < 0 || to >= folders.length) return;
    const prev = folders;
    const n = [...folders];
    const [it] = n.splice(from, 1);
    n.splice(to, 0, it);
    set({ soundFolders: n });
    pushUndo("reordered sound folders", () => set({ soundFolders: prev }));
  };

  useKey(e => {
    if (!active) return;
    const i = folders.findIndex(f => f.id === folderId);
    if (e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown") && i >= 0) {
      e.preventDefault();
      moveFolder(i, i + (e.key === "ArrowDown" ? 1 : -1));
    }
  }, [active, folders, folderId]);

  useEscape(() => {
    if (!active) return false;
    if (gainOpen) { setGainOpen(false); return true; }
    if (playing) { audio.current?.pause(); setPlaying(null); return true; }
    return false;
  }, [active, gainOpen, playing]);

  return (
    <>
      <div className="az-split">
        {/* folder rail */}
        <div className={cx("az-rail", dragIdx !== null && "drag")} role="tablist" aria-label="Sound folders">
          {folders.map((f, i) => (
            <button
              key={f.id}
              role="tab"
              aria-selected={folderId === f.id}
              className={folderId === f.id ? "on" : ""}
              draggable
              title={`${f.name}${f.path ? " — " + f.path : ""}\nDrag or Alt+↑/↓ to reorder · double-click to rename`}
              onClick={() => setFolderId(f.id)}
              onDoubleClick={() => renameFolder(f)}
              onDragStart={() => setDragIdx(i)}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); if (dragIdx !== null) moveFolder(dragIdx, i); setDragIdx(null); }}
              onDragEnd={() => setDragIdx(null)}
            >
              <AudioLines size={11} style={{ flex: "none", opacity: .7 }} />
              <span>{f.name}</span>
            </button>
          ))}
          <button className={cx(folderId === FAV ? "on" : "")} onClick={() => setFolderId(FAV)} title="Starred sounds from every folder">
            <Star size={11} style={{ flex: "none" }} /><span>Favourites</span>
          </button>
          <button className="az-rail-add" onClick={addFolder} title="Add a sound folder"><Plus size={11} /><span>Add SFX</span></button>
          {folder && folderId !== FAV && folders.length > 1 && (
            <button className="az-rail-add" onClick={() => removeFolder(folder)} title="Remove this folder (files are not deleted)">
              <Trash2 size={11} /><span>Remove</span>
            </button>
          )}
        </div>

        <div className="az-col">
          <div className="az-bar">
            <div className="az-search">
              <Search />
              <input value={q} placeholder={`Search ${isFav ? "favourites" : folder?.name ?? "sounds"}…`} onChange={e => setQ(e.target.value)} />
              {q && <Ib label="Clear search" onClick={() => setQ("")} style={{ width: 20, height: 20 }}><X size={11} /></Ib>}
            </div>
            <Chip on title={`Sound level ${azy.gain > 0 ? "+" : ""}${azy.gain} dB — hold ${azy.holdMod === "alt" ? "Alt" : "Shift"} while applying to change it`}
              onClick={() => { setDraftGain(azy.gain); setGainTarget(null); setGainOpen(true); }}>
              <Volume2 size={11} />{azy.gain > 0 ? "+" : ""}{azy.gain} dB
            </Chip>
          </div>

          <div className="az-subbar">
            <span className="az-hint">{shown.length} sound{shown.length === 1 ? "" : "s"}</span>
            <span className="az-grow" />
            {loading ? <Busy text="Reading folder…" /> : <span className="az-hint">Hold {azy.holdMod === "alt" ? "Alt" : "Shift"} + Apply for the level card</span>}
          </div>

          {shown.length === 0 && !loading ? (
            <Empty
              icon={isFav ? <Star /> : <AudioLines />}
              title={isFav ? "No favourites yet" : q ? `No match for “${q}”` : "No sounds in this folder"}
              hint={isFav ? "Star a sound and it shows up here." : q ? "Clear the search." : "Point a folder at your SFX library, or add one."}
              action={!isFav && !q ? <Btn onClick={addFolder} icon={<FolderPlus size={12} />}>Add SFX folder</Btn> : undefined}
            />
          ) : (
            <div className="az-scroll">
              <div className="az-sounds">
                {shown.map(a => (
                  <div key={a.path} className={cx("az-sound", playing === a.path && "playing")}
                    onMouseDown={e => {
                      if ((e.target as HTMLElement).closest("button")) return;
                      const x0 = e.clientX, y0 = e.clientY;
                      const move = async (m: MouseEvent) => {
                        if (Math.hypot(m.clientX - x0, m.clientY - y0) < 7) return;
                        cleanup();
                        const r = await dragOut([a.path], "audio");
                        if (!r.ok) toast("Drag failed", r.msg, "err");
                      };
                      const cleanup = () => {
                        window.removeEventListener("mousemove", move);
                        window.removeEventListener("mouseup", cleanup);
                      };
                      window.addEventListener("mousemove", move);
                      window.addEventListener("mouseup", cleanup);
                    }}>

                    <button className="play" onClick={() => toggle(a)} title={playing === a.path ? "Stop" : "Audition"}>
                      {playing === a.path ? <Pause size={11} /> : <Play size={11} />}
                    </button>
                    <Wave name={a.name} path={a.path} active={playing === a.path} />
                    <div className="az-sound-info">
                      <b title={a.name}>{a.name}</b>
                      <span>{a.ext.toUpperCase()} · {fmtSize(a.size)}</span>
                    </div>
                    <span className="az-gainbadge">{azy.gain > 0 ? "+" : ""}{azy.gain} dB</span>
                    <Ib label={stars.includes(a.path) ? "Remove from favourites" : "Add to favourites"} on={stars.includes(a.path)}
                      onClick={() => setStars(stars.includes(a.path) ? stars.filter(p => p !== a.path) : [...stars, a.path])}>
                      <Star size={12} />
                    </Ib>
                    <Btn small onClick={e => applyWithHold(a, e as unknown as React.MouseEvent)} title={`Apply at the playhead (hold ${azy.holdMod === "alt" ? "Alt" : "Shift"} for the level card)`}>
                      <Check size={10} />Apply
                    </Btn>
                    <span title="Drag this row into Premiere" style={{ display: "inline-flex", color: "var(--az-text-4)", cursor: "grab" }}><GripVertical size={12} /></span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* level card — only on a hold, and the level is remembered only on Confirm */}
      {gainOpen && (
        <div className="az-popup" role="dialog" aria-label="Sound level">
          <div className="az-mhead">
            <span className="tile"><Volume2 size={14} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <b>Sound level</b>
              <small>{isFav ? "Favourites" : folder?.name} · confirm to remember</small>
            </div>
            <Ib label="Cancel" onClick={() => setGainOpen(false)}><X size={13} /></Ib>
          </div>
          <SliderCard value={draftGain} min={-24} max={12} step={1} unit=" dB" onChange={setDraftGain} />
          <div className="az-mfoot">
            <Btn onClick={() => setGainOpen(false)}>Cancel</Btn>
            <Btn variant="accent" onClick={() => {
              set({ gain: draftGain });
              setGainOpen(false);
              const target = gainTarget;
              if (target) apply(target, draftGain);
              toast("Level remembered", `${draftGain > 0 ? "+" : ""}${draftGain} dB for the next sounds.`, "ok", 2000);
            }}>Confirm</Btn>
          </div>
        </div>
      )}
    </>
  );
}

/* ── waveform ─────────────────────────────────────────────────────────────────────────────────
 * Demo items get a stable synthetic shape; real files are decoded once and cached. Never blocks
 * the list: the peaks are painted when they are ready and the row stays usable meanwhile. */
const peakCache = new Map<string, number[]>();
const synth = (name: string) => {
  let h = 7;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const out: number[] = [];
  for (let i = 0; i < 64; i++) {
    h = (h * 1664525 + 1013904223) >>> 0;
    const env = Math.sin((i / 64) * Math.PI) * .7 + .3;
    out.push(Math.max(.06, ((h >>> 8) % 100) / 100 * env));
  }
  return out;
};

function Wave({ name, path, active }: { name: string; path: string; active: boolean }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const [peaks, setPeaks] = useState<number[] | null>(() => (peakCache.get(path) ?? (IS_TAURI ? null : synth(name))));

  useEffect(() => {
    if (peaks) return;
    let dead = false;
    (async () => {
      try {
        const r = await fetch(fileUrl(path));
        if (+(r.headers.get("content-length") || 0) > 40e6) throw new Error("too big");
        const ctx = new AudioContext();
        const buf = await ctx.decodeAudioData(await r.arrayBuffer());
        ctx.close();
        const N = 64, d = buf.getChannelData(0), step = Math.max(1, Math.floor(d.length / N));
        const out: number[] = [];
        for (let i = 0; i < N; i++) {
          let m = 0;
          for (let j = i * step; j < Math.min(d.length, (i + 1) * step); j += 12) m = Math.max(m, Math.abs(d[j]));
          out.push(m);
        }
        const mx = Math.max(...out, .001);
        const norm = out.map(v => Math.max(.05, v / mx));
        peakCache.set(path, norm);
        if (!dead) setPeaks(norm);
      } catch { if (!dead) setPeaks(synth(name)); }
    })();
    return () => { dead = true; };
  }, [path]);

  useEffect(() => {
    const c = cv.current;
    if (!c || !peaks) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = c.clientWidth || 120, h = 24;
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    const g = c.getContext("2d")!;
    g.scale(dpr, dpr);
    g.clearRect(0, 0, w, h);
    const style = getComputedStyle(document.documentElement);
    const accent = style.getPropertyValue("--a").trim() || "#fff";
    const dim = style.getPropertyValue("--dim").trim() || "rgba(255,255,255,.4)";
    g.fillStyle = active ? accent : dim;
    g.globalAlpha = active ? .95 : .62;
    const bw = w / peaks.length;
    peaks.forEach((p, i) => {
      const bh = Math.max(1.5, p * (h - 3));
      g.fillRect(i * bw + .5, (h - bh) / 2, Math.max(1, bw - 1.1), bh);
    });
  }, [peaks, active]);

  return <div className="az-wave"><canvas ref={cv} /><span className="ph" /></div>;
}

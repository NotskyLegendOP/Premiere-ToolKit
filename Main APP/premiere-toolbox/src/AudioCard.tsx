import React, { useEffect, useRef, useState } from "react";
import { invoke, convertFileSrc } from "@tauri-apps/api/core";
import { Play, Pause, Check, RotateCcw, Scissors, GripVertical } from "lucide-react";

export type Trim = { s: number; e: number; out?: string };

// one shared audio engine, only one sound plays at a time
let ctx: AudioContext | null = null;
const ac = () => { if (!ctx) ctx = new AudioContext(); return ctx; };
let stopCur: (() => void) | null = null;

const t2 = (s: number) => s.toFixed(2) + "s";
const hash = (p: string) => [...p].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7).toString(16);

function toWav(b: AudioBuffer, s: number, e: number): Uint8Array {
  const sr = b.sampleRate, ch = Math.min(2, b.numberOfChannels);
  const i0 = Math.max(0, Math.floor(s * sr)), i1 = Math.min(b.length, Math.ceil(e * sr)), n = Math.max(0, i1 - i0);
  const out = new Uint8Array(44 + n * ch * 2), dv = new DataView(out.buffer);
  const w = (o: number, t: string) => { for (let i = 0; i < t.length; i++) dv.setUint8(o + i, t.charCodeAt(i)); };
  w(0, "RIFF"); dv.setUint32(4, 36 + n * ch * 2, true); w(8, "WAVE"); w(12, "fmt "); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true);
  dv.setUint16(22, ch, true); dv.setUint32(24, sr, true); dv.setUint32(28, sr * ch * 2, true); dv.setUint16(32, ch * 2, true); dv.setUint16(34, 16, true);
  w(36, "data"); dv.setUint32(40, n * ch * 2, true);
  const chans: Float32Array[] = []; for (let c = 0; c < ch; c++) chans.push(b.getChannelData(c));
  const fade = Math.min(Math.floor(sr * 0.003), Math.floor(n / 2));   // 3 ms fade so the cut never clicks
  let o = 44;
  for (let i = 0; i < n; i++) {
    const g = i < fade ? i / fade : i > n - fade ? (n - i) / fade : 1;
    for (let c = 0; c < ch; c++) { const v = Math.max(-1, Math.min(1, chans[c][i0 + i] * g)); dv.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7fff, true); o += 2; }
  }
  return out;
}

export default function AudioCard({ path, name, size, trim, onChange }: { path: string; name: string; size: number; trim?: Trim; onChange: (t: Trim | null) => void }) {
  const box = useRef<HTMLDivElement>(null), cv = useRef<HTMLCanvasElement>(null), wrap = useRef<HTMLDivElement>(null);
  const stopRef = useRef<(() => void) | null>(null), dragging = useRef<"s" | "e" | null>(null);
  const [vis, setVis] = useState(false), [buf, setBuf] = useState<AudioBuffer | null>(null), [peaks, setPeaks] = useState<number[]>([]);
  const [draft, setDraft] = useState<{ s: number; e: number } | null>(null);
  const [playing, setPlaying] = useState(false), [pos, setPos] = useState(-1), [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  const big = size > 40e6;
  const dur = buf ? buf.duration : 0;

  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { rootMargin: "200px" });
    o.observe(box.current!); return () => o.disconnect();
  }, []);

  useEffect(() => {
    if (!vis || buf || big) return;
    let dead = false;
    (async () => {
      try {
        const r = await fetch(convertFileSrc(path));
        const b = await ac().decodeAudioData(await r.arrayBuffer());
        if (dead) return;
        const N = 200, a = b.getChannelData(0), z = b.numberOfChannels > 1 ? b.getChannelData(1) : a;
        const step = Math.max(1, Math.floor(a.length / N)), sub = Math.max(1, Math.floor(step / 40));
        const pk: number[] = [];
        for (let i = 0; i < N; i++) { let m = 0; for (let j = i * step; j < Math.min(a.length, (i + 1) * step); j += sub) m = Math.max(m, Math.abs(a[j]), Math.abs(z[j])); pk.push(m); }
        const mx = Math.max(...pk, 0.0001);
        setPeaks(pk.map(v => v / mx)); setBuf(b);
        setDraft(trim ? { s: Math.min(trim.s, b.duration), e: Math.min(trim.e, b.duration) } : { s: 0, e: b.duration });
      } catch (e) { if (!dead) setErr("Cannot preview this file"); }
    })();
    return () => { dead = true; };
  }, [vis]);

  useEffect(() => () => { stopRef.current?.(); }, []);

  // waveform: bright inside the cut, dim outside, white playhead
  useEffect(() => {
    const c = cv.current, w = wrap.current; if (!c || !w || !peaks.length || !draft || !dur) return;
    const W = w.clientWidth, H = w.clientHeight, dpr = window.devicePixelRatio || 1;
    c.width = W * dpr; c.height = H * dpr;
    const g = c.getContext("2d")!; g.scale(dpr, dpr); g.clearRect(0, 0, W, H);
    // Premiere-style backdrop: grid + centre line
    g.lineWidth = 1; g.strokeStyle = "rgba(255,255,255,.05)";
    for (let i = 1; i < 10; i++) { const x = Math.round((W * i) / 10) + 0.5; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
    for (const f of [0.25, 0.75]) { const y = Math.round(H * f) + 0.5; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    g.strokeStyle = "rgba(255,255,255,.16)"; g.beginPath(); g.moveTo(0, Math.round(H / 2) + 0.5); g.lineTo(W, Math.round(H / 2) + 0.5); g.stroke();
    const bw = W / peaks.length;
    peaks.forEach((p, i) => {
      const t = ((i + 0.5) / peaks.length) * dur, inside = t >= draft.s && t <= draft.e;
      const h = Math.max(2, Math.sqrt(p) * (H - 8));
      g.fillStyle = inside ? "rgba(255,255,255,.92)" : "rgba(255,255,255,.2)";
      g.fillRect(i * bw + 0.5, (H - h) / 2, Math.max(1, bw - 1.5), h);
    });
    if (pos >= 0) { g.fillStyle = "#fff"; g.shadowColor = "#fff"; g.shadowBlur = 6; g.fillRect((pos / dur) * W - 1, 0, 2, H); }
  }, [peaks, draft, pos, dur]);

  const play = () => {
    if (!buf || !draft) return;
    stopCur?.();
    const c = ac(); c.resume();
    const src = c.createBufferSource(); src.buffer = buf; src.connect(c.destination);
    const t0 = c.currentTime, from = draft.s, to = draft.e; let raf = 0;
    const end = () => { cancelAnimationFrame(raf); src.onended = null; try { src.stop(); } catch { /* already stopped */ } setPlaying(false); setPos(-1); if (stopCur === end) stopCur = null; stopRef.current = null; };
    src.onended = end; stopCur = end; stopRef.current = end;
    src.start(0, from, Math.max(0.01, to - from)); setPlaying(true);
    const tick = () => { const p = from + (c.currentTime - t0); if (p >= to) { end(); return; } setPos(p); raf = requestAnimationFrame(tick); };
    tick();
  };
  const toggle = () => { if (playing) stopRef.current?.(); else play(); };

  const timeAt = (x: number) => { const r = wrap.current!.getBoundingClientRect(); return Math.max(0, Math.min(dur, ((x - r.left) / r.width) * dur)); };
  const hDown = (which: "s" | "e") => (e: React.PointerEvent) => { e.preventDefault(); e.stopPropagation(); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); dragging.current = which; stopRef.current?.(); };
  const hMove = (e: React.PointerEvent) => {
    if (!dragging.current) return; const t = timeAt(e.clientX), w = dragging.current;
    setDraft(d => d && (w === "s" ? { s: Math.min(t, d.e - 0.03), e: d.e } : { s: d.s, e: Math.max(t, d.s + 0.03) }));
  };
  const hUp = () => { dragging.current = null; };

  const saved = trim ?? { s: 0, e: dur };
  const dirty = !!draft && !!buf && (Math.abs(draft.s - saved.s) > 0.005 || Math.abs(draft.e - saved.e) > 0.005);
  const full = !!draft && draft.s < 0.005 && draft.e > dur - 0.005;

  const save = async () => {
    if (!buf || !draft) return; setBusy(true); setErr("");
    try {
      if (full) { onChange(null); }
      else {
        const base = name.replace(/\.[^.]+$/, "");
        const out = await invoke<string>("save_trim", { key: hash(path), name: base + "_trim.wav", bytes: Array.from(toWav(buf, draft.s, draft.e)) });
        onChange({ s: draft.s, e: draft.e, out });
      }
    } catch (e) { setErr("Save failed: " + String(e)); }
    setBusy(false);
  };
  const undo = () => { if (buf) setDraft(trim ? { s: trim.s, e: trim.e } : { s: 0, e: buf.duration }); };
  const removeCut = () => { onChange(null); if (buf) setDraft({ s: 0, e: buf.duration }); };

  if (big) return <div className="ap" ref={box}><audio src={convertFileSrc(path)} controls preload="none" style={{ width: "100%", height: 30 }} /><span className="meta">Long file: use the player above (cut tool is for short sound effects)</span></div>;

  return (
    <div className="ap" ref={box} onMouseDown={e => { if ((e.target as HTMLElement).closest(".apb,.sm,audio")) e.stopPropagation(); }}>
      <div className="apw" ref={wrap} onClick={e => { if ((e.target as HTMLElement).tagName === "CANVAS") toggle(); }}>
        <canvas ref={cv} />
        {!buf && !err && <span className="apl">loading…</span>}
        {err && <span className="apl">{err}</span>}
        {buf && draft && <>
          <div className="th" style={{ left: (draft.s / dur) * 100 + "%" }} onPointerDown={hDown("s")} onPointerMove={hMove} onPointerUp={hUp} title="Drag to cut the start" />
          <div className="th" style={{ left: (draft.e / dur) * 100 + "%" }} onPointerDown={hDown("e")} onPointerMove={hMove} onPointerUp={hUp} title="Drag to cut the end" />
        </>}
      </div>
      <div className="apr">
        <button className="apb" disabled={!buf} onClick={toggle} title={playing ? "Stop" : "Play the selected part"}>{playing ? <Pause size={14} /> : <Play size={14} />}</button>
        <div className="apt">
          {draft ? <>{t2(draft.s)} – {t2(draft.e)} · <b>{t2(draft.e - draft.s)}</b>{trim && !dirty && <span className="cut"> <Scissors size={10} /> cut saved</span>}</> : "—"}
        </div>
        {dirty && <><button className="sm" onClick={undo}><RotateCcw size={11} />Undo</button><button className="sm acc" disabled={busy} onClick={save}><Check size={11} />{busy ? "Saving…" : "Save cut"}</button></>}
        {!dirty && trim && <button className="sm" onClick={removeCut} title="Go back to the full sound">Remove cut</button>}
        <span className="grip" title="Drag this sound into the Premiere timeline"><GripVertical size={14} /></span>
      </div>
    </div>
  );
}

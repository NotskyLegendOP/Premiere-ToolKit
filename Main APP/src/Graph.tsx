import React, { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Undo2, Redo2, ZoomIn, ZoomOut, Maximize, Magnet, Plus, Trash2, Copy, ClipboardPaste, RotateCcw, Play, Square, ArrowLeftRight, Settings as Cog, ChevronLeft, ChevronRight, Search, Layers } from "lucide-react";

type P = { x: number; y: number };
type K = { t: number; v: number; i: P; o: P; p?: string | null; bz?: number[]; n?: number; s?: number; ov?: number };
type Doc = { keys: K[]; dur: number; base: number; rev: boolean };
const cl = (k: K[]): K[] => k.map(a => ({ ...a, i: { ...a.i }, o: { ...a.o } }));
const snapDoc = (d: Doc): Doc => ({ keys: cl(d.keys), dur: d.dur, base: d.base, rev: d.rev });
const c01 = (x: number) => Math.min(1, Math.max(0, x));
const HANDLE = "#d9a441";

// ---------- presets ----------
const BZ: Record<string, number[]> = {
  Linear: [0, 0, 1, 1], "Ease In": [0.42, 0, 1, 1], "Ease Out": [0, 0, 0.58, 1], "Ease In Out": [0.42, 0, 0.58, 1],
  Smooth: [0.65, 0, 0.35, 1], Fast: [0.2, 0, 0, 1], Slow: [0.8, 0, 0.2, 1], Sharp: [0.9, 0, 0.1, 1], Soft: [0.25, 0.1, 0.25, 1],
  Back: [0.68, -0.6, 0.32, 1.6], Overshoot: [0.34, 1.56, 0.64, 1],
};
const GEN = ["Bounce", "Elastic"];
const NAMES = [...Object.keys(BZ), ...GEN];
const bounce = (x: number) => { const n = 7.5625, d = 2.75;
  if (x < 1 / d) return n * x * x; if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75;
  if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375; return n * (x -= 2.625 / d) * x + 0.984375; };
const elastic = (u: number, damp = 4) => (u >= 1 ? 1 : 1 - Math.exp(-damp * u) * Math.cos(u * 18));
function bzFn(z: number[]) {
  return (u: number) => { let lo = 0, hi = 1;
    for (let n = 0; n < 24; n++) { const s = (lo + hi) / 2, w = 1 - s, x = 3 * w * w * s * z[0] + 3 * w * s * s * z[2] + s * s * s; if (x < u) lo = s; else hi = s; }
    const s = (lo + hi) / 2, w = 1 - s; return 3 * w * w * s * z[1] + 3 * w * s * s * z[3] + s * s * s; };
}
const presetFn = (name: string, z?: number[]) => (z ? bzFn(z) : BZ[name] ? bzFn(BZ[name]) : name === "Bounce" ? bounce : (u: number) => elastic(u));
function Mini({ name, z, w = 26, h = 14 }: { name: string; z?: number[]; w?: number; h?: number }) {
  const f = presetFn(name, z), ys: number[] = []; let lo = 0, hi = 1;
  for (let i = 0; i <= 40; i++) { const y = f(i / 40); ys.push(y); lo = Math.min(lo, y); hi = Math.max(hi, y); }
  const d = ys.map((y, i) => `${i ? "L" : "M"}${(1 + (i / 40) * (w - 2)).toFixed(1)},${(h - 1 - ((y - lo) / (hi - lo)) * (h - 2)).toFixed(1)}`).join("");
  return <svg width={w} height={h}><path d={d} fill="none" stroke="currentColor" strokeWidth="1.2" /></svg>;
}

// ---------- curve math (normalized time 0..1) ----------
const zk = (t: number, v: number, p: string | null = null): K => ({ t, v, i: { x: 0, y: 0 }, o: { x: 0, y: 0 }, p, bz: [0, 0, 1, 1], n: 1, s: 1, ov: 0 });
function derive(ks: K[], i: number) {
  const a = ks[i], b = ks[i + 1]; if (!a || !b) return;
  const dt = b.t - a.t, dv = b.v - a.v, z = a.bz || [0, 0, 1, 1], n = a.n ?? 1, sm = a.s ?? 1, ov = a.ov ?? 0;
  const x1 = c01(z[0] * sm), y1 = z[1] * n, x2 = 1 - c01((1 - z[2]) * sm), y2 = 1 - (1 - z[3]) * n + ov;
  a.o = { x: x1 * dt, y: y1 * dv }; b.i = { x: -(1 - x2) * dt, y: -(1 - y2) * dv };
}
function measure(ks: K[], i: number) {
  const a = ks[i], b = ks[i + 1]; if (!a || !b) return;
  const dt = b.t - a.t || 1e-6, dv = b.v - a.v;
  a.o.x = Math.min(dt, Math.max(0, a.o.x)); b.i.x = -Math.min(dt, Math.max(0, -b.i.x));
  a.bz = [a.o.x / dt, dv ? a.o.y / dv : 0, 1 + b.i.x / dt, dv ? 1 + b.i.y / dv : 1]; a.n = 1; a.s = 1; a.ov = 0;
}
function gen(name: string, s: number, en: number, damp: number): K[] {
  const ks: K[] = [];
  for (let j = 0; j <= 32; j++) { const u = j / 32, e = j === 32 ? 1 : name === "Bounce" ? bounce(u) : elastic(u, damp); ks.push(zk(u, s + (en - s) * e, name)); }
  ks.forEach((k, n) => { const p = ks[n - 1] ?? k, q = ks[n + 1] ?? k, m = (q.v - p.v) / ((q.t - p.t) || 1); const ot = (q.t - k.t) / 3, it = (k.t - p.t) / 3;
    k.o = { x: ot, y: m * ot }; k.i = { x: -it, y: -m * it }; });
  for (let j = 0; j < ks.length - 1; j++) measure(ks, j);
  return ks;
}
function poly(ks: K[]) {
  const out: P[] = [];
  for (let n = 0; n < ks.length - 1; n++) { const a = ks[n], b = ks[n + 1];
    const p0 = { x: a.t, y: a.v }, p1 = { x: a.t + a.o.x, y: a.v + a.o.y }, p2 = { x: b.t + b.i.x, y: b.v + b.i.y }, p3 = { x: b.t, y: b.v };
    for (let s = 0; s <= 60; s++) { const u = s / 60, w = 1 - u;
      out.push({ x: w*w*w*p0.x + 3*w*w*u*p1.x + 3*w*u*u*p2.x + u*u*u*p3.x, y: w*w*w*p0.y + 3*w*w*u*p1.y + 3*w*u*u*p2.y + u*u*u*p3.y }); } }
  return out;
}
function valueAt(pl: P[], t: number) {
  if (!pl.length) return 0; if (t <= pl[0].x) return pl[0].y;
  for (let n = 1; n < pl.length; n++) if (pl[n].x >= t) { const a = pl[n - 1], b = pl[n]; return a.y + (b.y - a.y) * ((t - a.x) / ((b.x - a.x) || 1)); }
  return pl[pl.length - 1].y;
}

export default function Graph() {
  const wrap = useRef<HTMLDivElement>(null), cv = useRef<HTMLCanvasElement>(null);
  const [doc, setDoc] = useState<Doc>(() => { const k = [zk(0, 0, "Linear"), zk(1, 100)]; derive(k, 0); return { keys: k, dur: 1, base: 1, rev: false }; });
  const docRef = useRef(doc); docRef.current = doc;
  const undo = useRef<Doc[]>([]), redo = useRef<Doc[]>([]);
  const [sel, setSel] = useState(0);
  const [snap, setSnap] = useState(true);
  const [showSpeed, setShowSpeed] = useState(true), [showInd, setShowInd] = useState(true), [panelOpen, setPanelOpen] = useState(true), [showCtl, setShowCtl] = useState(false), [showLg, setShowLg] = useState(false), [pq, setPq] = useState("");
  const [view, setView] = useState({ ox: 56, oy: 30, sx: 300, sy: 2.4 });
  const [size, setSize] = useState({ w: 700, h: 320 });
  const [mine, setMine] = useState<Record<string, number[]>>(() => { try { const m = JSON.parse(localStorage.getItem("myPresets2") || "{}"); return m; } catch { return {}; } });
  const [msg, setMsg] = useState("");
  const [damp, setDamp] = useState(4);
  const [conn, setConn] = useState(false);
  const [retime, setRetime] = useState(true);
  const [target, setTarget] = useState(localStorage.getItem("target") || "Scale");
  const [playT, setPlayT] = useState<number | null>(null);
  const [tick, setTick] = useState(0);
  const drag = useRef<any>(null), clip = useRef<K[] | null>(null);

  const { keys, dur, base, rev } = doc;
  const speed = base / dur;
  const seg = Math.min(sel, keys.length - 2);
  const flash = (s: string) => { setMsg(s); setTimeout(() => setMsg(""), 3500); };
  const pushHist = () => { undo.current.push(snapDoc(docRef.current)); if (undo.current.length > 100) undo.current.shift(); redo.current = []; };
  const upd = (fn: (d: Doc) => void, push = true) => { if (push) pushHist(); setDoc(d => { const n = snapDoc(d); fn(n); return n; }); };
  const doUndo = () => { const u = undo.current.pop(); if (u) { redo.current.push(snapDoc(docRef.current)); setDoc(u); } };
  const doRedo = () => { const r = redo.current.pop(); if (r) { undo.current.push(snapDoc(docRef.current)); setDoc(r); } };

  useEffect(() => { const f = () => setTick(n => n + 1); window.addEventListener("ptb-theme", f); return () => window.removeEventListener("ptb-theme", f); }, []);
  useEffect(() => { const ro = new ResizeObserver(() => { const r = wrap.current!.getBoundingClientRect(); setSize({ w: r.width, h: r.height }); }); ro.observe(wrap.current!); return () => ro.disconnect(); }, []);
  useEffect(() => { const id = setInterval(async () => { try { setConn((await invoke<{ connected: boolean }>("bridge_status")).connected); } catch { setConn(false); } }, 1500); return () => clearInterval(id); }, []);

  const X = (u: number) => view.ox + u * dur * view.sx, Y = (v: number) => size.h - view.oy - v * view.sy;
  const iU = (x: number) => (x - view.ox) / (view.sx * dur), iV = (y: number) => (size.h - view.oy - y) / view.sy;

  const fit = () => {
    const s0 = keys[0].v, s1 = keys[keys.length - 1].v, flat = Math.abs(s1 - s0) < 1e-9;
    const vlo = Math.min(s0, s1) - (flat ? 50 : 0), vhi = Math.max(s0, s1) + (flat ? 50 : 0);
    const side = Math.max(120, Math.min(size.w - (panelOpen ? 120 : 130), size.h - 90)), sy = side / (vhi - vlo);
    setView({ ox: (size.w - side - 50) / 2, sx: side / dur, sy, oy: (size.h - side) / 2 - vlo * sy });
  };
  useEffect(() => { if (size.w > 100 && size.h > 100) fit(); }, [dur, size.w, size.h]);
  const zoom = (f: number) => setView(v => ({ ...v, sx: v.sx * f, sy: v.sy * f }));

  // ---------- draw ----------
  useEffect(() => {
    const c = cv.current!, dpr = devicePixelRatio || 1; c.width = size.w * dpr; c.height = size.h * dpr;
    const g = c.getContext("2d")!; g.scale(dpr, dpr);
    g.fillStyle = "#141416"; g.fillRect(0, 0, size.w, size.h);
    const s0 = keys[0].v, s1 = keys[keys.length - 1].v, flat = Math.abs(s1 - s0) < 1e-9;
    const top = Y(Math.max(s0, s1) + (flat ? 50 : 0)), bot = Y(Math.min(s0, s1) - (flat ? 50 : 0)), x0 = X(0), x1 = X(1), bw = x1 - x0, bh = bot - top;
    const BLUE = "#4c9aff", PINK = "rgba(226,67,106,.55)", GOLD = "#f5c518";
    // 4x4 box grid
    g.lineWidth = 1; g.strokeStyle = "rgba(255,255,255,.3)";
    for (let i = 0; i <= 4; i++) {
      const x = Math.round(x0 + (bw * i) / 4) + 0.5, y = Math.round(top + (bh * i) / 4) + 0.5;
      g.beginPath(); g.moveTo(x, top); g.lineTo(x, bot); g.stroke(); g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke();
    }
    const pl = poly(keys);
    const sp = pl.slice(1).map((p, n) => Math.abs((p.y - pl[n].y) / Math.max(p.x - pl[n].x, 1e-6))), mx = Math.max(...sp, 1e-9);
    // speed graph (behind the value curve)
    if (showSpeed) {
      g.strokeStyle = PINK; g.lineWidth = 1.5; g.lineJoin = "round"; g.beginPath();
      sp.forEach((s, n) => { const x = X(pl[n + 1].x), y = bot - (s / mx) * bh * 0.95; n ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke();
    }
    // speed indicator: vertical rail + yellow dot
    if (showInd) {
      const xi = x1 + 26, t = playT !== null ? playT / dur : null;
      let s = mx; if (t !== null) { const k = pl.findIndex(p => p.x >= t); s = sp[Math.max(0, Math.min(sp.length - 1, k - 1))] ?? 0; }
      g.strokeStyle = "rgba(255,255,255,.22)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(xi, top); g.lineTo(xi, bot); g.stroke();
      g.fillStyle = GOLD; g.shadowColor = GOLD; g.shadowBlur = 8; g.beginPath(); g.arc(xi, bot - (s / mx) * bh * 0.95 - bh * 0.05 * 0, 7, 0, 7); g.fill(); g.shadowBlur = 0;
    }
    // value curve
    g.strokeStyle = BLUE; g.lineWidth = 3; g.lineJoin = "round"; g.lineCap = "round"; g.beginPath();
    pl.forEach((p, n) => (n ? g.lineTo(X(p.x), Y(p.y)) : g.moveTo(X(p.x), Y(p.y)))); g.stroke();
    // handles + keyframes (only around the selected key, keeps it clean)
    keys.forEach((k, n) => {
      const near = Math.abs(n - sel) <= 1;
      g.lineWidth = 1; g.strokeStyle = "rgba(255,255,255,.55)"; g.fillStyle = "#fff";
      ([[k.i, n > 0 && near], [k.o, n < keys.length - 1 && near]] as [P, boolean][]).forEach(([h, show]) => { if (!show) return;
        g.beginPath(); g.moveTo(X(k.t), Y(k.v)); g.lineTo(X(k.t + h.x), Y(k.v + h.y)); g.stroke(); g.beginPath(); g.arc(X(k.t + h.x), Y(k.v + h.y), 3.5, 0, 7); g.fill(); });
      if (keys.length <= 40 || n === sel) { g.fillStyle = n === sel ? BLUE : "#fff"; g.strokeStyle = "#fff"; g.beginPath(); g.arc(X(k.t), Y(k.v), 4.5, 0, 7); g.fill(); g.stroke(); }
    });
    if (playT !== null) { const v = valueAt(pl, playT / dur); g.strokeStyle = "rgba(255,255,255,.25)"; g.beginPath(); g.moveTo(X(playT / dur), top); g.lineTo(X(playT / dur), bot); g.stroke();
      g.fillStyle = "#fff"; g.beginPath(); g.arc(X(playT / dur), Y(v), 5, 0, 7); g.fill(); }
  }, [doc, sel, view, size, playT, tick, showSpeed, showInd]);

  // ---------- mouse ----------
  const pos = (e: React.MouseEvent | React.WheelEvent) => { const r = cv.current!.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const down = (e: React.MouseEvent) => {
    const m = pos(e), near = (px: number, py: number) => Math.hypot(px - m.x, py - m.y) < 8, ks = docRef.current.keys;
    for (let n = 0; n < ks.length; n++) { const k = ks[n];
      if (n < ks.length - 1 && near(X(k.t + k.o.x), Y(k.v + k.o.y))) { pushHist(); drag.current = { kind: "o", n }; setSel(n); return; }
      if (n > 0 && near(X(k.t + k.i.x), Y(k.v + k.i.y))) { pushHist(); drag.current = { kind: "i", n }; setSel(n); return; }
      if (near(X(k.t), Y(k.v))) { pushHist(); drag.current = { kind: "k", n }; setSel(n); return; } }
    drag.current = { kind: "pan", m, view };
  };
  const move = (e: React.MouseEvent) => {
    const d = drag.current; if (!d) return; const m = pos(e);
    if (d.kind === "pan") { setView({ ...d.view, ox: d.view.ox + m.x - d.m.x, oy: d.view.oy - (m.y - d.m.y) }); return; }
    let u = iU(m.x), v = iV(m.y);
    upd(dd => { const a = dd.keys, k = a[d.n];
      if (d.kind === "k") {
        if (snap) { v = Math.round(v / 5) * 5; u = Math.round((u * dd.dur) / 0.05) * 0.05 / dd.dur; }
        if (d.n === 0) u = 0; else if (d.n === a.length - 1) u = 1; else u = Math.min(a[d.n + 1].t - 1e-3, Math.max(a[d.n - 1].t + 1e-3, u));
        k.t = u; k.v = v; if (d.n > 0) derive(a, d.n - 1); if (d.n < a.length - 1) derive(a, d.n);
      } else if (d.kind === "o") { k.o = { x: Math.min(a[d.n + 1].t - k.t, Math.max(0, u - k.t)), y: v - k.v }; measure(a, d.n); k.p = null; }
      else { k.i = { x: -Math.min(k.t - a[d.n - 1].t, Math.max(0, k.t - u)), y: v - k.v }; measure(a, d.n - 1); a[d.n - 1].p = null; }
    }, false);
  };
  const up = () => (drag.current = null);
  const dbl = (e: React.MouseEvent) => { const m = pos(e), u = iU(m.x); if (u <= 0.01 || u >= 0.99) return;
    upd(d => { const a = d.keys, idx = a.findIndex(k => k.t > u); if (idx < 1) return; const v = valueAt(poly(a), u), nk = zk(u, v);
      nk.i = { x: -(u - a[idx - 1].t) / 3, y: 0 }; nk.o = { x: (a[idx].t - u) / 3, y: 0 }; a.splice(idx, 0, nk); a[idx - 1].p = null; measure(a, idx - 1); measure(a, idx); setSel(idx); }); };
  const wheel = (e: React.WheelEvent) => { const m = pos(e), f = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    setView(vw => e.shiftKey ? { ...vw, sy: vw.sy * f, oy: (size.h - m.y) - (size.h - m.y - vw.oy) * f } : { ...vw, sx: vw.sx * f, ox: m.x - (m.x - vw.ox) * f }); };
  const delKey = () => { if (keys.length <= 2 || sel <= 0 || sel >= keys.length - 1) { flash("First and last keyframes cannot be deleted"); return; }
    upd(d => { d.keys.splice(sel, 1); d.keys[sel - 1].p = null; measure(d.keys, sel - 1); }); setSel(sel - 1); };
  const addKey = () => upd(d => { const a = d.keys, i = Math.min(seg, a.length - 2), u = (a[i].t + a[i + 1].t) / 2, v = valueAt(poly(a), u), nk = zk(u, v);
    nk.i = { x: -(u - a[i].t) / 3, y: 0 }; nk.o = { x: (a[i + 1].t - u) / 3, y: 0 }; a.splice(i + 1, 0, nk); a[i].p = null; measure(a, i); measure(a, i + 1); setSel(i + 1); });

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.target as HTMLElement).tagName === "INPUT") return; const k = e.key.toLowerCase();
      if (e.ctrlKey && k === "z" && !e.shiftKey) { e.preventDefault(); doUndo(); } else if (e.ctrlKey && (k === "y" || (k === "z" && e.shiftKey))) { e.preventDefault(); doRedo(); }
      else if (e.key === "Delete" || e.key === "Backspace") delKey(); else if (e.ctrlKey && k === "c") copyKeys(); else if (e.ctrlKey && k === "v") pasteKeys(); };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  });

  // ---------- actions ----------
  const preset = (name: string, all = false, z?: number[]) => upd(d => {
    if (GEN.includes(name)) { d.keys = gen(name, d.keys[0].v, d.keys[d.keys.length - 1].v, damp); return; }
    const zz = z ?? BZ[name], idx = all ? d.keys.slice(0, -1).map((_, i) => i) : [Math.min(sel, d.keys.length - 2)];
    idx.forEach(i => { const a = d.keys[i]; a.bz = [...zz]; a.n = 1; a.s = 1; a.ov = 0; a.p = name; derive(d.keys, i); });
  });
  const setSeg = (f: (a: K) => void, push = false) => upd(d => { const a = d.keys[Math.min(sel, d.keys.length - 2)]; f(a); a.p = null; derive(d.keys, Math.min(sel, d.keys.length - 2)); }, push);
  const setDur = (v: number) => v > 0.01 && upd(d => { d.dur = Math.min(60, v); }, false);
  const setSpeed = (x: number) => x > 0.01 && upd(d => { d.dur = Math.min(60, d.base / x); }, false);
  const reverse = () => upd(d => { const a = d.keys.slice().reverse(); d.keys = a.map(k => ({ ...k, t: 1 - k.t, i: { x: -k.o.x, y: k.o.y }, o: { x: -k.i.x, y: k.i.y }, p: null })); d.rev = !d.rev;
    for (let j = 0; j < d.keys.length - 1; j++) measure(d.keys, j); });
  const reset = () => upd(d => { const s = d.keys[0].v, e = d.keys[d.keys.length - 1].v; const k = [zk(0, s, "Linear"), zk(1, e)]; derive(k, 0); d.keys = k; d.rev = false; }); 
  const copyKeys = async () => { clip.current = cl(docRef.current.keys); try { await navigator.clipboard.writeText(JSON.stringify({ type: "ptb-keys2", keys: docRef.current.keys, dur: docRef.current.dur })); } catch {} flash("Keyframes copied"); };
  const pasteKeys = async () => { let ks: K[] | null = null; try { const j = JSON.parse(await navigator.clipboard.readText()); if (j.type === "ptb-keys2") ks = j.keys; } catch {} ks = ks ?? clip.current;
    if (!ks) { flash("Nothing to paste"); return; } upd(d => { d.keys = cl(ks!); }); setSel(0); flash("Pasted"); };
  const play = () => { const t0 = performance.now(), D = dur * 1000; const f = (now: number) => { const p = (now - t0) / D; if (p >= 1) { setPlayT(null); return; } setPlayT(p * dur); requestAnimationFrame(f); }; requestAnimationFrame(f); };
  const savePreset = () => { const a = keys[seg]; if (!a?.bz) return; const name = prompt("Preset name?"); if (!name) return; measure(cl(keys), seg);
    const z = [a.bz[0], a.bz[1], a.bz[2], a.bz[3]]; const m = { ...mine, [name]: z }; setMine(m); localStorage.setItem("myPresets2", JSON.stringify(m));
    try { navigator.clipboard.writeText(JSON.stringify({ name, z })); flash("Preset saved (also copied, share it with Import preset)"); } catch { flash("Preset saved"); } };
  const importPreset = async () => { try { const j = JSON.parse(await navigator.clipboard.readText());
    if (typeof j.name === "string" && Array.isArray(j.z) && j.z.length === 4 && j.z.every((x: any) => typeof x === "number")) { const m = { ...mine, [j.name]: j.z }; setMine(m); localStorage.setItem("myPresets2", JSON.stringify(m)); flash("Imported " + j.name); } else flash("Clipboard has no preset"); } catch { flash("Clipboard has no preset"); } };
  const apply = async () => {
    const s = keys[0].v, en = keys[keys.length - 1].v; if (Math.abs(en - s) < 1e-9) { flash("Start and end values must differ"); return; }
    if (!conn) { flash("Premiere panel not connected. Open Window > Extensions > Premiere Toolbox"); return; }
    const pl = poly(keys), N = 240, shape: number[] = []; for (let j = 0; j <= N; j++) shape.push(+((valueAt(pl, j / N) - s) / (en - s)).toFixed(6));
    await invoke("send_curve", { json: JSON.stringify({ type: "ptb-shape", target, shape, duration: +dur.toFixed(6), swap: rev, retime }) });
    flash("Sent");
    for (let n = 0; n < 15; n++) { await new Promise(r => setTimeout(r, 400)); const st = await invoke<{ result: string | null }>("bridge_status");
      if (st.result) { try { const r = JSON.parse(st.result); flash((r.ok ? "OK: " : "Error: ") + r.msg); } catch { flash(st.result); } return; } }
    flash("No response from Premiere");
  };

  const presetRef = useRef(preset); presetRef.current = preset;
  useEffect(() => {
    const run = () => { const n = localStorage.getItem("wheelPreset"); if (!n) return; localStorage.removeItem("wheelPreset"); presetRef.current(n, false, undefined); };
    run(); window.addEventListener("ptb-preset", run); return () => window.removeEventListener("ptb-preset", run);
  }, []);
  const active = keys[seg]?.p ?? null, a0 = keys[seg];
  const IB = ({ t, on, children, act }: { t: string; on: () => void; children: React.ReactNode; act?: boolean }) => <button className={"ib" + (act ? " on" : "")} title={t} onClick={on}>{children}</button>;
  const Sld = (p: { label: string; v: number; min: number; max: number; step: number; unit?: string; on: (n: number) => void; disabled?: boolean }) => (
    <div className="cr"><span>{p.label}</span>
      <input type="range" min={p.min} max={p.max} step={p.step} value={Math.min(p.max, Math.max(p.min, p.v))} disabled={p.disabled} onPointerDown={pushHist} onChange={e => p.on(+e.target.value)} />
      <input className="nm" type="number" step="any" value={+p.v.toFixed(3)} onFocus={pushHist} onChange={e => e.target.value !== "" && !isNaN(+e.target.value) && p.on(+e.target.value)} /><em>{p.unit}</em></div>);

  const ALL = [...NAMES, ...Object.keys(mine)];
  const cyc = (d: number) => { const i = ALL.indexOf(active ?? ""), n = ALL[i < 0 ? (d > 0 ? 0 : ALL.length - 1) : (i + d + ALL.length) % ALL.length]; preset(n, false, mine[n]); };
  const list = ALL.filter(n => n.toLowerCase().includes(pq.toLowerCase()));

  return (
    <div className="gr">
      <div className="gmain">
        {panelOpen && <div className="pl2">
          <div className="ps"><Search size={14} /><input placeholder="Search for a preset" value={pq} onChange={e => setPq(e.target.value)} /></div>
          <div className="pg">
            {list.map(n => (
              <button key={n} className={"pc" + (active === n ? " on" : "")} title="Click: apply to selected segment. Shift+click: all segments" onClick={e => preset(n, e.shiftKey, mine[n])}>
                <div className="pt"><Mini name={n} z={mine[n]} w={62} h={40} /></div><span>{n}</span>
              </button>))}
          </div>
          <div className="pbtns"><button onClick={savePreset}>Save as preset</button><button onClick={importPreset}>Import preset</button></div>
        </div>}
        <div className="cw" ref={wrap}>
          <canvas ref={cv} style={{ width: size.w, height: size.h }} onMouseDown={down} onMouseMove={move} onMouseUp={up} onMouseLeave={up} onDoubleClick={dbl} onWheel={wheel} />
          <button className="fold" onClick={() => setPanelOpen(!panelOpen)} title={panelOpen ? "Hide presets" : "Show presets"}>{panelOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}</button>
          <div className="pnav"><button onClick={() => cyc(-1)}><ChevronLeft size={16} /></button><b>{active ?? "Custom"}</b><button onClick={() => cyc(1)}><ChevronRight size={16} /></button></div>
          <button className={"lgb" + (showLg ? " on" : "")} onClick={() => setShowLg(!showLg)} title="Show / hide graph layers (Value, Speed, Speed indicator)"><Layers size={14} /></button>
          {showLg && <div className="lg">
            <div className="lgr"><i className="ln" style={{ background: "#4c9aff" }} />Value</div>
            <label className="lgr"><input type="checkbox" className="cb pk" checked={showSpeed} onChange={e => setShowSpeed(e.target.checked)} /><i className="ln" style={{ background: "#e2436a" }} />Speed</label>
            <label className="lgr"><input type="checkbox" className="cb yl" checked={showInd} onChange={e => setShowInd(e.target.checked)} /><i className="dt" />Speed indicator</label>
          </div>}
        </div>
      </div>
      {showCtl && <div className="ctl">
        <Sld label="Duration" v={dur} min={0.05} max={5} step={0.01} unit="s" on={setDur} />
        <Sld label="Intensity" v={(a0?.n ?? 1) * 100} min={0} max={150} step={1} on={n => setSeg(a => { a.n = n / 100; })} />
        <Sld label="Smoothness" v={(a0?.s ?? 1) * 100} min={10} max={150} step={1} on={n => setSeg(a => { a.s = n / 100; })} />
        <Sld label="Overshoot" v={(a0?.ov ?? 0) * 100} min={0} max={60} step={1} on={n => setSeg(a => { a.ov = n / 100; })} />
        <Sld label="Damping" v={damp} min={1} max={10} step={0.5} on={n => { setDamp(n); if (keys[0].p === "Elastic") upd(d => { d.keys = gen("Elastic", d.keys[0].v, d.keys[d.keys.length - 1].v, n); }, false); }} />
        <Sld label="Start" v={keys[0].v} min={-500} max={500} step={1} on={n => upd(d => { d.keys[0].v = n; for (let j = 0; j < d.keys.length - 1; j++) derive(d.keys, j); }, false)} />
        <Sld label="End" v={keys[keys.length - 1].v} min={-500} max={500} step={1} on={n => upd(d => { d.keys[d.keys.length - 1].v = n; for (let j = 0; j < d.keys.length - 1; j++) derive(d.keys, j); }, false)} />
        <label className="chk" title="Move the end keyframe so the segment length equals Duration"><input type="checkbox" checked={retime} onChange={e => setRetime(e.target.checked)} />Set length</label>
      </div>}
      <div className="bb">
        <label className="pill"><i className={"dot" + (conn ? " on" : "")} title={conn ? "Premiere panel connected" : "Premiere panel offline"} />
          <select value={target} onChange={e => { setTarget(e.target.value); localStorage.setItem("target", e.target.value); }}><option>Scale</option><option>Rotation</option><option>Opacity</option></select></label>
        <div className="spd">
          <Sld label="Speed" v={speed} min={0.1} max={4} step={0.01} unit="x" on={setSpeed} />
          <div className="qs">{[0.5, 1, 1.5, 2, 3].map(x => <button key={x} className={Math.abs(speed - x) < 0.005 ? "on" : ""} title={`${x}x speed`} onClick={() => upd(d => { d.dur = d.base / x; })}>{x}x</button>)}</div>
        </div>
        <span className="msg">{msg}</span>
        <IB t="Undo (Ctrl+Z)" on={doUndo}><Undo2 size={15} /></IB><IB t="Redo (Ctrl+Y)" on={doRedo}><Redo2 size={15} /></IB><i className="sp" />
        <IB t="Zoom in" on={() => zoom(1.25)}><ZoomIn size={15} /></IB><IB t="Zoom out" on={() => zoom(0.8)}><ZoomOut size={15} /></IB><IB t="Fit" on={fit}><Maximize size={15} /></IB>
        <IB t="Snap" on={() => setSnap(!snap)} act={snap}><Magnet size={15} /></IB><i className="sp" />
        <IB t="Add keyframe" on={addKey}><Plus size={15} /></IB><IB t="Copy keyframes" on={copyKeys}><Copy size={15} /></IB><IB t="Paste keyframes" on={pasteKeys}><ClipboardPaste size={15} /></IB>
        <IB t="Reverse" on={reverse} act={rev}><ArrowLeftRight size={15} /></IB>
        <IB t={playT === null ? "Preview" : "Stop"} on={() => (playT === null ? play() : setPlayT(null))}>{playT === null ? <Play size={15} /> : <Square size={15} />}</IB><i className="sp" />
        <IB t="Delete keyframe" on={delKey}><Trash2 size={15} /></IB><IB t="Reset graph" on={reset}><RotateCcw size={15} /></IB>
        <IB t="Settings (duration, speed, intensity…)" on={() => setShowCtl(!showCtl)} act={showCtl}><Cog size={15} /></IB>
        <button className="ap2" onClick={apply}>Apply</button>
      </div>
    </div>
  );
}

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// ---------- keybind storage ----------
export type WKey = { code: string; alt: boolean; ctrl: boolean; shift: boolean };
export const WHEEL_DEFAULT: WKey = { code: "Digit2", alt: true, ctrl: false, shift: false };
export const getWheelKey = (): WKey => { try { return { ...WHEEL_DEFAULT, ...JSON.parse(localStorage.getItem("wheelKey") || "{}") }; } catch { return WHEEL_DEFAULT; } };
export const setWheelKey = (k: WKey) => { localStorage.setItem("wheelKey", JSON.stringify(k)); window.dispatchEvent(new Event("ptb-wheelkey")); };
// accelerator string for the OS-level (global) shortcut, e.g. "Alt+Digit2"
export const wheelAccel = (k: WKey) => [k.ctrl && "Control", k.alt && "Alt", k.shift && "Shift", k.code].filter(Boolean).join("+");
export const fmtKey = (k: WKey) => [k.ctrl && "Ctrl", k.alt && "Alt", k.shift && "Shift", k.code.replace(/^Key|^Digit/, "").replace("Backquote", "`")].filter(Boolean).join(" + ");

export type WItem = { id: string; label: string; icon?: React.ReactNode; run?: () => void; subs?: { id: string; label: string; run: () => void }[] };

// ---------- geometry ----------
const R_IN = 64, R_OUT = 170, R_SUB = 222, VB = 540, H = VB / 2;
const rad = (d: number) => (d * Math.PI) / 180;
const pt = (r: number, d: number): [number, number] => [r * Math.cos(rad(d)), r * Math.sin(rad(d))];
const sector = (s: number, e: number) => {
  const [x1, y1] = pt(R_OUT, s), [x2, y2] = pt(R_OUT, e), [x3, y3] = pt(R_IN, e), [x4, y4] = pt(R_IN, s);
  return `M${x1},${y1}A${R_OUT},${R_OUT} 0 0 1 ${x2},${y2}L${x3},${y3}A${R_IN},${R_IN} 0 0 0 ${x4},${y4}Z`;
};

const arcPath = (r: number, s: number, e: number) => { const [x1, y1] = pt(r, s), [x2, y2] = pt(r, e); return `M${x1},${y1}A${r},${r} 0 0 1 ${x2},${y2}`; };
const TICKS = Array.from({ length: 72 }, (_, i) => { const [x1, y1] = pt(R_OUT + 17, i * 5), [x2, y2] = pt(R_OUT + (i % 6 === 0 ? 26 : 21), i * 5); return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />; });

export default function Wheel({ items, current, onClose }: { items: WItem[]; current: string; onClose?: () => void }) {
  const [open, setOpen] = useState(false), [closing, setClosing] = useState(false), [seg, setSeg] = useState(-1), [sub, setSub] = useState(-1);
  const box = useRef<HTMLDivElement>(null);
  const openRef = useRef(false), t0 = useRef(0), sticky = useRef(false), st = useRef({ seg: -1, sub: -1 }), it = useRef(items), oc = useRef(onClose), tm = useRef<any>(0), needle = useRef(0);
  it.current = items; oc.current = onClose;
  const N = items.length, step = 360 / N;
  const setBoth = (a: number, b: number) => { st.current = { seg: a, sub: b }; setSeg(a); setSub(b); };
  const openIt = (stick: boolean) => { clearTimeout(tm.current); t0.current = performance.now(); sticky.current = stick; setBoth(-1, -1); setClosing(false); openRef.current = true; setOpen(true); };
  const close = () => { openRef.current = false; sticky.current = false; clearTimeout(tm.current); setClosing(true); tm.current = setTimeout(() => { setOpen(false); setClosing(false); oc.current?.(); }, 150); };
  const fire = () => {
    const { seg: s, sub: b } = st.current, m = it.current[s]; close();
    if (!m) return; const sb = b >= 0 ? m.subs?.[b] : null; if (sb) sb.run(); else m.run?.();
  };
  const subAngles = (s: number, m: number) => { const mid = -90 + (s + 0.5) * step, sp = Math.min(20, 170 / Math.max(m, 1)); return Array.from({ length: m }, (_, k) => mid + (k - (m - 1) / 2) * sp); };

  // keyboard: hold to show, release to choose. A quick tap keeps it open. 1-9 pick a slice directly.
  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      const k = getWheelKey(), tg = e.target as HTMLElement;
      if (e.code === k.code && e.altKey === k.alt && e.ctrlKey === k.ctrl && e.shiftKey === k.shift) {
        if (/INPUT|TEXTAREA|SELECT/.test(tg.tagName) && !k.alt && !k.ctrl) return;
        e.preventDefault(); if (e.repeat) return;
        if (openRef.current) { if (sticky.current) close(); return; }
        openIt(false);
      } else if (e.key === "Escape" && openRef.current) close();
      else if (openRef.current && !e.altKey && !e.ctrlKey && !e.metaKey && /^(Digit|Numpad)[1-9]$/.test(e.code)) {
        const n = +e.code.slice(-1) - 1; if (n < it.current.length) { e.preventDefault(); st.current = { seg: n, sub: -1 }; fire(); }
      }
    };
    const ku = (e: KeyboardEvent) => {
      if (!openRef.current || e.code !== getWheelKey().code) return;
      if (performance.now() - t0.current < 220) { sticky.current = true; return; }
      fire();
    };
    const bl = () => { if (openRef.current && performance.now() - t0.current > 500) close(); };
    const op = () => openIt(true), cl = () => close();
    window.addEventListener("keydown", kd, true); window.addEventListener("keyup", ku, true); window.addEventListener("blur", bl);
    window.addEventListener("ptb-wheel", op); window.addEventListener("ptb-wheel-close", cl);
    return () => { window.removeEventListener("keydown", kd, true); window.removeEventListener("keyup", ku, true); window.removeEventListener("blur", bl); window.removeEventListener("ptb-wheel", op); window.removeEventListener("ptb-wheel-close", cl); };
  }, []);

  // pointer: which slice / bubble is under the mouse
  useEffect(() => {
    if (!open) return;
    const mv = (e: MouseEvent) => {
      const el = box.current; if (!el) return;
      const r = el.getBoundingClientRect(), k = VB / r.width, x = (e.clientX - r.left - r.width / 2) * k, y = (e.clientY - r.top - r.height / 2) * k, d = Math.hypot(x, y);
      let { seg: s, sub: b } = st.current;
      if (d < R_IN - 4) { s = -1; b = -1; }
      else if (d <= R_OUT + 10) { const a = (Math.atan2(y, x) * 180 / Math.PI + 90 + 360) % 360; s = Math.min(N - 1, Math.floor(a / step)); b = -1; }
      else {
        b = -1; const m = it.current[s]?.subs;
        if (m && m.length) { let best = 34; subAngles(s, m.length).forEach((aa, i) => { const [bx, by] = pt(R_SUB, aa), dd = Math.hypot(x - bx, y - by); if (dd < best) { best = dd; b = i; } }); }
      }
      if (s !== st.current.seg || b !== st.current.sub) setBoth(s, b);
    };
    window.addEventListener("mousemove", mv); return () => window.removeEventListener("mousemove", mv);
  }, [open, N]);

  if (!open) return null;
  const cur = items[seg], sb = cur && sub >= 0 ? cur.subs?.[sub] : null;
  const title = sb ? sb.label : cur ? cur.label : current;
  const subtitle = sb ? cur.label : cur ? (cur.subs?.length ? "Release to open · or pick" : "Release to open") : "Press 1-" + N + " or click";
  if (seg >= 0) { const d = ((((seg + 0.5) * step - needle.current) % 360) + 540) % 360 - 180; needle.current += d; }
  return createPortal(
    <div className={"wh" + (closing ? " out" : "")} onClick={() => (st.current.seg >= 0 ? fire() : close())} onContextMenu={e => { e.preventDefault(); close(); }}>
      <div className="wc" ref={box} style={{ ["--ws" as any]: "calc(min(96vmin,540px) * var(--wszp, 1))" }}>
        <svg viewBox={`${-H} ${-H} ${VB} ${VB}`}>
          <defs>
            <linearGradient id="wsheen" gradientUnits="userSpaceOnUse" x1="-190" y1="-250" x2="120" y2="220"><stop offset="0" stopColor="#fff" stopOpacity=".6" /><stop offset=".45" stopColor="#fff" stopOpacity=".09" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
            <linearGradient id="wrim" gradientUnits="userSpaceOnUse" x1="-180" y1="-180" x2="180" y2="180"><stop offset="0" stopColor="#fff" stopOpacity=".9" /><stop offset=".5" stopColor="#fff" stopOpacity=".14" /><stop offset="1" stopColor="#fff" stopOpacity=".6" /></linearGradient>
            <radialGradient id="wdisc"><stop offset=".6" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#fff" stopOpacity=".08" /></radialGradient>
          </defs>
          <g className="ticks">{TICKS}</g>
          <circle r={R_OUT + 9} className="disc" />
          <circle r={R_OUT + 9} className="disc2" />
          {items.map((m, i) => { const [dx, dy] = pt(7, -90 + (i + 0.5) * step), d = sector(-90 + i * step + 1.4, -90 + (i + 1) * step - 1.4);
            return <g key={m.id} className={"sg" + (seg === i ? " on" : "")} style={{ ["--i" as any]: i, transform: seg === i ? `translate(${dx}px,${dy}px)` : undefined }}><path className="seg" d={d} /><path className="sheen" d={d} /></g>; })}
          <circle r={R_OUT + 9} className="ring" transform="rotate(-90)" />
          <circle r={R_OUT + 32} className="dash" />
          {seg >= 0 && <path key={"hl" + seg} className="hl" d={arcPath(R_OUT + 9, -90 + seg * step + 2, -90 + (seg + 1) * step - 2)} />}
          <g className="needle" style={{ transform: `rotate(${needle.current}deg)`, opacity: seg >= 0 ? 1 : 0 }}><path d={`M0,${-(R_IN + 18)}L-7,${-(R_IN + 6)}L7,${-(R_IN + 6)}Z`} /></g>
          {cur?.subs?.map((s, k) => { const a = subAngles(seg, cur.subs!.length)[k], [x1, y1] = pt(R_OUT + 12, a), [x2, y2] = pt(R_SUB - 30, a);
            return <line key={s.id} className="spoke" x1={x1} y1={y1} x2={x2} y2={y2} />; })}
        </svg>
        {items.map((m, i) => { const a = -90 + (i + 0.5) * step, [x, y] = pt(seg === i ? 128 : 118, a), [nx, ny] = pt(R_OUT - 14, a);
          return (<React.Fragment key={m.id}>
            <div className={"lb" + (seg === i ? " on" : "")} style={{ ["--i" as any]: i, left: `${50 + (x / VB) * 100}%`, top: `${50 + (y / VB) * 100}%` }}>{m.icon}<span>{m.label}</span></div>
            <div className="nb" style={{ left: `${50 + (nx / VB) * 100}%`, top: `${50 + (ny / VB) * 100}%` }}>{i + 1}</div>
          </React.Fragment>); })}
        {cur?.subs?.map((s, k) => { const [x, y] = pt(R_SUB, subAngles(seg, cur.subs!.length)[k]);
          return <div key={s.id} className={"wsub" + (sub === k ? " on" : "")} style={{ ["--k" as any]: k, left: `${50 + (x / VB) * 100}%`, top: `${50 + (y / VB) * 100}%` }}>{s.label}</div>; })}
        <div className="ctr"><b key={title}>{title}</b><small key={subtitle}>{subtitle}</small></div>
      </div>
    </div>,
    document.body
  );
}

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, AlertTriangle, Info, X } from "lucide-react";

/* ------------------------------------------------------------------------------------------------
 * Small primitives shared by every Azy page.
 * They exist so pages stay declarative and so behaviour (Esc, exit fades, honest toasts) is
 * implemented once.
 * ---------------------------------------------------------------------------------------------- */

export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(" ");

/* ── buttons ───────────────────────────────────────────────────────────────────────────────── */
type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "plain" | "accent" | "ghost";
  on?: boolean;
  small?: boolean;
  icon?: React.ReactNode;
};
export function Btn({ variant = "plain", on, small, icon, className, children, ...rest }: BtnProps) {
  return (
    <button
      {...rest}
      className={cx("az-btn", variant === "accent" && "acc", variant === "ghost" && "ghost", on && "on", small && "sm", className)}
    >
      {icon}
      {children}
    </button>
  );
}

type IbProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { on?: boolean; label: string };
export function Ib({ on, label, className, children, ...rest }: IbProps) {
  return (
    <button {...rest} title={rest.title ?? label} aria-label={label} className={cx("az-ib", on && "on", className)}>
      {children}
    </button>
  );
}

export function Chip({ on, className, children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { on?: boolean }) {
  return <button {...rest} className={cx("az-chip", on && "on", className)}>{children}</button>;
}

export function Seg<T extends string>({ value, items, onChange }: { value: T; items: { id: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="az-seg" role="tablist">
      {items.map(i => (
        <button key={i.id} role="tab" aria-selected={value === i.id} className={value === i.id ? "on" : ""} onClick={() => onChange(i.id)}>
          {i.label}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ checked, onChange, label, sub }: { checked: boolean; onChange: (v: boolean) => void; label: string; sub?: string }) {
  return (
    <div className="az-togglerow">
      <span>{label}{sub && <small>{sub}</small>}</span>
      <button role="switch" aria-checked={checked} aria-label={label} className={cx("az-switch", checked && "on")} onClick={() => onChange(!checked)} />
    </div>
  );
}

export function Field({ label, value, min, max, step = 1, unit = "", onChange, format }: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string;
  onChange: (v: number) => void; format?: (v: number) => string;
}) {
  return (
    <div className="az-field">
      <label>{label}<b>{format ? format(value) : value}{unit}</b></label>
      <input className="az-range" type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)} aria-label={label} />
    </div>
  );
}

/* ── toasts ────────────────────────────────────────────────────────────────────────────────── */
export type ToastKind = "ok" | "err" | "info";
export type Toast = { id: number; title: string; detail?: string; kind: ToastKind };

let seq = 1;
let list: Toast[] = [];
const toastSubs = new Set<(t: Toast[]) => void>();
const emitToasts = () => toastSubs.forEach(f => f(list));

export function dismissToast(id: number) {
  list = list.filter(t => t.id !== id);
  emitToasts();
}

export function toast(title: string, detail?: string, kind: ToastKind = "info", ms?: number) {
  const t: Toast = { id: seq++, title, detail, kind };
  list = [...list, t].slice(-4);
  emitToasts();
  const life = ms ?? (kind === "err" ? 7000 : kind === "ok" ? 2600 : 4200);
  setTimeout(() => dismissToast(t.id), life);
  return t.id;
}

export function Toaster() {
  const [items, setItems] = useState<Toast[]>(list);
  useEffect(() => {
    toastSubs.add(setItems);
    return () => { toastSubs.delete(setItems); };
  }, []);
  if (!items.length) return null;
  return createPortal(
    <div className="az-toasts" role="status" aria-live="polite">
      {items.map(t => (
        <div key={t.id} className={cx("az-toast", t.kind)}>
          <span className="tile">
            {t.kind === "ok" ? <Check size={12} /> : t.kind === "err" ? <AlertTriangle size={12} /> : <Info size={12} />}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <b>{t.title}</b>
            {t.detail && <small>{t.detail}</small>}
          </div>
          <Ib label="Dismiss" onClick={() => dismissToast(t.id)} style={{ width: 18, height: 18 }}><X size={11} /></Ib>
        </div>
      ))}
    </div>,
    document.body
  );
}

/* ── modal ────────────────────────────────────────────────────────────────────────────────── */
export function Modal({ title, subtitle, icon, onClose, children, footer, wide }: {
  title: string; subtitle?: string; icon?: React.ReactNode; onClose: () => void;
  children: React.ReactNode; footer?: React.ReactNode; wide?: boolean;
}) {
  const [out, setOut] = useState(false);
  const close = () => { setOut(true); setTimeout(onClose, 150); };
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.stopPropagation(); e.preventDefault(); close(); }
    };
    window.addEventListener("keydown", h, true);
    const first = box.current?.querySelector<HTMLElement>("input,button.acc,textarea");
    first?.focus();
    return () => window.removeEventListener("keydown", h, true);
  }, []);

  return createPortal(
    <div className={cx("az-veil", out && "out")} onMouseDown={e => { if (e.target === e.currentTarget) close(); }}>
      <div ref={box} className="az-modal" role="dialog" aria-modal="true" aria-label={title} style={wide ? { width: "min(100%, 460px)" } : undefined}>
        <div className="az-mhead">
          {icon && <span className="tile">{icon}</span>}
          <div style={{ flex: 1, minWidth: 0 }}>
            <b>{title}</b>
            {subtitle && <small>{subtitle}</small>}
          </div>
          <Ib label="Close" onClick={close}><X size={14} /></Ib>
        </div>
        <div className="az-mbody">{children}</div>
        {footer && <div className="az-mfoot">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

export function Confirm({ title, body, confirmLabel, danger, onConfirm, onClose }: {
  title: string; body: string; confirmLabel: string; danger?: boolean;
  onConfirm: () => void; onClose: () => void;
}) {
  return (
    <Modal
      title={title}
      icon={<AlertTriangle size={15} />}
      onClose={onClose}
      footer={
        <>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn variant="accent" onClick={() => { onConfirm(); onClose(); }} style={danger ? { background: "#b91c1c", borderColor: "#dc2626", color: "#fff" } : undefined}>
            {confirmLabel}
          </Btn>
        </>
      }
    >
      <p style={{ margin: 0, color: "var(--az-text-2)", fontSize: "var(--az-fs-sm)", lineHeight: 1.5 }}>{body}</p>
    </Modal>
  );
}

/* ── level / speed popup content shared by Files, Sounds and Presets ───────────────────────── */
export function SliderCard({ value, min, max, step = 1, unit, onChange, quick }: {
  value: number; min: number; max: number; step?: number; unit: string; onChange: (v: number) => void; quick?: number;
}) {
  const q = quick ?? 5;
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v * 10) / 10));
  return (
    <div className="az-slidercard">
      <div className="az-sliderrow">
        <Btn small onClick={() => onChange(clamp(value - q))} title={`−${q}`}>−{q}</Btn>
        <input className="az-range" type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)} aria-label="Value" />
        <Btn small onClick={() => onChange(clamp(value + q))} title={`+${q}`}>+{q}</Btn>
        <output>{value > 0 ? "+" : ""}{value}{unit}</output>
      </div>
    </div>
  );
}

/* ── easing preview curve ─────────────────────────────────────────────────────────────────── */
const BEZIER: Record<string, [number, number, number, number]> = {
  Linear: [0, 0, 1, 1],
  "Ease In": [.42, 0, 1, 1],
  "Ease Out": [0, 0, .58, 1],
  "Ease In Out": [.42, 0, .58, 1],
  Smooth: [.4, 0, .2, 1],
  Fast: [.2, .9, .3, 1],
  Slow: [.6, .05, .5, .95],
  Snappy: [.7, 0, .2, 1],
  Bounce: [.34, 1.56, .64, 1],
  Elastic: [.5, 1.7, .6, 1],
  Expo: [.9, 0, .1, 1],
  Back: [.5, -0.6, .5, 1.6],
};

export function EaseCurve({ name, size = 22 }: { name: string; size?: number }) {
  const [x1, y1, x2, y2] = BEZIER[name] ?? BEZIER.Smooth;
  const W = 100, H = size;
  const pad = 4;
  const sx = (t: number) => pad + t * (W - pad * 2);
  const sy = (t: number) => H - pad - t * (H - pad * 2);
  // y is 0..1 from bottom; overshoot curves go beyond — clamp the path but keep the character
  const d = `M${sx(0)},${sy(0)} C${sx(x1)},${sy(Math.min(1.25, y1))} ${sx(x2)},${sy(Math.min(1.25, y2))} ${sx(1)},${sy(1)}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
      <path d={`M${pad},${H - pad} L${W - pad},${H - pad}`} stroke="currentColor" strokeWidth=".7" opacity=".25" fill="none" />
      <path d={d} stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/* ── misc ─────────────────────────────────────────────────────────────────────────────────── */
export function Empty({ icon, title, hint, action }: { icon?: React.ReactNode; title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="az-empty">
      {icon}
      <b>{title}</b>
      {hint && <span>{hint}</span>}
      {action}
    </div>
  );
}

export function Busy({ text }: { text: string }) {
  return <div className="az-busy"><i />{text}</div>;
}

export const fmtSize = (n: number) => (n > 1e9 ? (n / 1e9).toFixed(2) + " GB" : n > 1e6 ? (n / 1e6).toFixed(1) + " MB" : (n / 1e3).toFixed(0) + " KB");
export const fmtDate = (s?: number) => (s ? new Date(s * 1000).toLocaleDateString(undefined, { day: "2-digit", month: "short" }) : "");

export function useKey(handler: (e: KeyboardEvent) => void, deps: unknown[] = [], capture = false) {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    const h = (e: KeyboardEvent) => ref.current(e);
    window.addEventListener("keydown", h, capture);
    return () => window.removeEventListener("keydown", h, capture);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Esc handling. The shell asks "does a page want this Esc?" with a cancellable event, so a page
 * can clear a selection or close its own popup without also hiding the window.
 */
export function useEscape(fn: () => boolean, deps: unknown[] = []) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    const h = (e: Event) => { if (ref.current()) e.preventDefault(); };
    window.addEventListener("azy-escape-request", h);
    return () => window.removeEventListener("azy-escape-request", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function useInterval(fn: () => void, ms: number | null) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    if (ms === null) return;
    const id = setInterval(() => ref.current(), ms);
    return () => clearInterval(id);
  }, [ms]);
}

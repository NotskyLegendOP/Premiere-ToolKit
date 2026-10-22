import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Palette, X } from "lucide-react";
import type { Theme } from "./Settings";

// Same controls are used in Settings, in the Assets tab and in the General tab.
// They all change the same saved theme, so a change made in one place shows up in the others.
type P = { theme: Theme; setTheme: (t: Theme) => void };
type NK = "sbh" | "sbfs" | "sbw" | "thumb" | "gw" | "gbh" | "gfs" | "gwl";
export const PB_DEFAULT = "#2f7bff";
const SWATCH = ["#2f7bff", "#22c55e", "#a855f7", "#ef4444", "#f59e0b", "#ec4899", "#14b8a6", "#e5e7eb"];

function Rng({ theme, setTheme, k, label, min, max, unit = "px" }: P & { k: NK; label: string; min: number; max: number; unit?: string }) {
  return <label>{label}: {theme[k]}{unit}<input type="range" min={min} max={max} value={theme[k]} onChange={e => setTheme({ ...theme, [k]: +e.target.value })} /></label>;
}

export function ButtonColor({ theme, setTheme }: P) {
  const cur = (theme.pb || PB_DEFAULT).toLowerCase();
  return <>
    <h3>Main button color</h3>
    <div className="row">
      <label>Buttons<input type="color" value={theme.pb || PB_DEFAULT} onChange={e => setTheme({ ...theme, pb: e.target.value })} /></label>
      {SWATCH.map(c => <button key={c} title={c} onClick={() => setTheme({ ...theme, pb: c })} style={{ width: 26, height: 26, padding: 0, borderRadius: "50%", background: c, border: cur === c ? "2px solid #fff" : "1px solid rgba(255,255,255,.25)" }} />)}
      <button onClick={() => setTheme({ ...theme, pb: PB_DEFAULT })}>Default blue</button>
    </div>
    <span className="meta">Changes Generate SRT, Import, Download and every other main button.</span>
  </>;
}

export function TextColors({ theme, setTheme }: P) {
  return <>
    <h3>Text colors</h3>
    <div className="row">
      <label>Text<input type="color" value={theme.tc || "#eceaf0"} onChange={e => setTheme({ ...theme, tc: e.target.value })} /></label>
      <label>Small / hint text<input type="color" value={theme.tdim || "#8a8a92"} onChange={e => setTheme({ ...theme, tdim: e.target.value })} /></label>
      <button onClick={() => setTheme({ ...theme, tc: "#eceaf0", tdim: "", sbc: "" })}>Reset text colors</button>
    </div>
  </>;
}

export function FolderBoxes({ theme, setTheme }: P) {
  return <>
    <h3>Folder boxes (Assets)</h3>
    <div className="col">
      <Rng theme={theme} setTheme={setTheme} k="sbh" label="Box height" min={24} max={90} />
      <Rng theme={theme} setTheme={setTheme} k="sbfs" label="Text size" min={8} max={24} />
      <Rng theme={theme} setTheme={setTheme} k="sbw" label="Box width (0 = drag the edge instead)" min={0} max={400} />
    </div>
    <div className="row"><label>Folder text<input type="color" value={theme.sbc || theme.tc || "#eceaf0"} onChange={e => setTheme({ ...theme, sbc: e.target.value })} /></label></div>
  </>;
}

export function AssetOptions({ theme, setTheme }: P) {
  return <>
    <h3>Asset cards</h3>
    <div className="col"><Rng theme={theme} setTheme={setTheme} k="thumb" label="Thumbnail size" min={80} max={200} /></div>
    <div className="row">
      {(["auto", "wide", "square"] as const).map(v => <button key={v} className={theme.shape === v ? "on" : ""} onClick={() => setTheme({ ...theme, shape: v })} title={v === "auto" ? "9:16 videos stay tall, others 16:9" : v === "wide" ? "All thumbnails 16:9" : "All thumbnails 1:1"}>{v === "auto" ? "Auto 9:16 / 16:9" : v === "wide" ? "Always 16:9" : "Square"}</button>)}
    </div>
    <div className="row">
      <label className="chk"><input type="checkbox" checked={theme.info} onChange={e => setTheme({ ...theme, info: e.target.checked })} />Show file info on cards</label>
      <label className="chk"><input type="checkbox" checked={theme.cozy} onChange={e => setTheme({ ...theme, cozy: e.target.checked })} />Roomier cards</label>
    </div>
  </>;
}

export function GeneralOptions({ theme, setTheme }: P) {
  return <>
    <h3>General (captions) layout</h3>
    <div className="col">
      <Rng theme={theme} setTheme={setTheme} k="gw" label="Card width" min={320} max={900} />
      <Rng theme={theme} setTheme={setTheme} k="gbh" label="Main button height" min={30} max={72} />
      <Rng theme={theme} setTheme={setTheme} k="gfs" label="Text size" min={10} max={18} />
      <Rng theme={theme} setTheme={setTheme} k="gwl" label="Word list height" min={120} max={600} />
    </div>
  </>;
}

const RESET_A: Partial<Theme> = { pb: PB_DEFAULT, tc: "#eceaf0", tdim: "", sbc: "", sbh: 30, sbfs: 10, sbw: 0, thumb: 104, shape: "auto", info: true, cozy: false };
const RESET_G: Partial<Theme> = { pb: PB_DEFAULT, tc: "#eceaf0", tdim: "", gw: 430, gbh: 40, gfs: 12, gwl: 220 };

// Gear button + floating panel. Sits inside the Assets top bar and the General card.
export function QuickStyle({ theme, setTheme, mode }: P & { mode: "assets" | "general" }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [open]);
  const p = { theme, setTheme };
  return <>
    <button className={"ib qbtn" + (open ? " on" : "")} title="Customize colors and sizes" onClick={() => setOpen(!open)}><Palette size={15} /></button>
    {open && createPortal(
      <div className="qp" onMouseDown={e => e.stopPropagation()}>
        <div className="qph"><b>{mode === "assets" ? "Customize Assets" : "Customize General"}</b><button className="ib" title="Close" onClick={() => setOpen(false)}><X size={14} /></button></div>
        <ButtonColor {...p} />
        <TextColors {...p} />
        {mode === "assets" ? <><FolderBoxes {...p} /><AssetOptions {...p} /></> : <GeneralOptions {...p} />}
        <div className="row"><button onClick={() => setTheme({ ...theme, ...(mode === "assets" ? RESET_A : RESET_G) })}>Reset these</button></div>
      </div>, document.body)}
  </>;
}

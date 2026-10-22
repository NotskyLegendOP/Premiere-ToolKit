import React from "react";
export type WS = { preset: string; glass: number; shine: number; size: number; fs: number; spd: number; own: boolean; color: string; ticks: boolean; rings: boolean; needle: boolean; nums: boolean; pulse: boolean };
export const WS_DEFAULT: WS = { preset: "Glass", glass: 38, shine: 60, size: 100, fs: 12, spd: 1, own: false, color: "#4da3ff", ticks: true, rings: true, needle: true, nums: true, pulse: true };
export const WS_PRESETS: Record<string, Partial<WS>> = {
  Glass: { glass: 38, shine: 60, size: 100, spd: 1 },
  Frosted: { glass: 62, shine: 35, size: 100, spd: 1 },
  Solid: { glass: 92, shine: 12, size: 100, spd: 1 },
  Minimal: { glass: 30, shine: 0, size: 86, spd: 1.25, ticks: false, rings: false, pulse: false, nums: false },
};
export const loadWS = (): WS => { try { return { ...WS_DEFAULT, ...JSON.parse(localStorage.getItem("wheelStyle") || "{}") }; } catch { return WS_DEFAULT; } };
export function paintWS(w: WS) {
  const r = document.documentElement, s = r.style, d = r.dataset;
  s.setProperty("--wgn", String(w.glass)); s.setProperty("--wshine", String(w.shine / 100)); s.setProperty("--wszp", String(w.size / 100));
  s.setProperty("--wfs", w.fs + "px"); s.setProperty("--wspd", String(w.spd));
  if (w.own) s.setProperty("--wa", w.color); else s.removeProperty("--wa");
  d.wticks = w.ticks ? "on" : "off"; d.wrings = w.rings ? "on" : "off"; d.wneedle = w.needle ? "on" : "off"; d.wnums = w.nums ? "on" : "off"; d.wpulse = w.pulse ? "on" : "off";
}
export function applyWS(w: WS) { localStorage.setItem("wheelStyle", JSON.stringify(w)); paintWS(w); }

export function WheelSettings() {
  const [w, setW] = React.useState(loadWS);
  const set = (p: Partial<WS>) => { const n = { ...w, ...p }; setW(n); applyWS(n); };
  const sl = (k: "glass" | "shine" | "size" | "fs" | "spd", label: string, min: number, max: number, step = 1, unit = "") =>
    <label>{label}: {w[k]}{unit}<input type="range" min={min} max={max} step={step} value={w[k]} onChange={e => set({ [k]: +e.target.value, preset: "Custom" } as Partial<WS>)} /></label>;
  const ck = (k: "own" | "ticks" | "rings" | "needle" | "nums" | "pulse", label: string) =>
    <label className="chk"><input type="checkbox" checked={w[k]} onChange={e => set({ [k]: e.target.checked, preset: k === "own" ? w.preset : "Custom" } as Partial<WS>)} />{label}</label>;
  return (
    <>
      <h3>Wheel style</h3>
      <div className="row">
        {Object.keys(WS_PRESETS).map(n => <button key={n} className={w.preset === n ? "on" : ""} onClick={() => set({ ...WS_DEFAULT, own: w.own, color: w.color, fs: w.fs, ...WS_PRESETS[n], preset: n })}>{n}</button>)}
        <button onClick={() => window.dispatchEvent(new Event("ptb-wheel"))} title="Open the wheel here to see changes live">Preview</button>
        <button onClick={() => set({ ...WS_DEFAULT })}>Reset</button>
      </div>
      <div className="col">{sl("glass", "Glass opacity", 15, 95, 1, "%")}{sl("shine", "Shine", 0, 100, 1, "%")}{sl("size", "Size", 60, 100, 1, "%")}{sl("fs", "Label size", 10, 16, 1, "px")}{sl("spd", "Animation speed", 0.5, 2, 0.05, "x")}</div>
      <div className="row">{ck("own", "Own accent color")}<input type="color" value={w.color} onChange={e => set({ color: e.target.value, own: true })} /></div>
      <div className="row">{ck("ticks", "Outer ticks")}{ck("rings", "Dotted rings")}{ck("needle", "Needle")}{ck("nums", "Number badges")}{ck("pulse", "Hub pulse")}</div>
    </>
  );
}

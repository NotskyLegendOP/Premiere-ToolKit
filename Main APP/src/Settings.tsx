import React from "react";
import { getWheelKey, setWheelKey, fmtKey, WHEEL_DEFAULT } from "./Wheel";
import { WheelSettings } from "./WheelStyle";
import { ButtonColor, TextColors, FolderBoxes, AssetOptions, GeneralOptions } from "./QuickStyle";
import { convertFileSrc } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { LogicalSize } from "@tauri-apps/api/dpi";
export type Theme = { preset: string; a: string; b: string; bg: string; panel: string; radius: number; fs: number; thumb: number; glass: number; blur: number; nav: number; amb: number; border: number; anim: boolean; info: boolean; glow: boolean; cozy: boolean; shape: "auto" | "wide" | "square"; dlw: number; dlh: number; dll: number; dlgap: number; dlfill: boolean; bgimg: string; bgdim: number; bgblur: number; bgmerge: boolean; fx: "none" | "ripple" | "ring" | "burst"; fxsize: number; press: boolean; bounce: boolean; winw: number; winh: number; winapply: boolean; pb: string; sbh: number; sbfs: number; sbw: number; sbc: string; tc: string; tdim: string; gw: number; gbh: number; gfs: number; gwl: number };
export const PRESETS: Record<string, Partial<Theme>> = {
  Editor: { a: "#2d8ceb", b: "#8a8f98", bg: "#1e1e1e", panel: "#2b2b2b", radius: 4, glass: 0, blur: 0, amb: 0, border: 10 },
  Midnight: { a: "#3d7bff", b: "#ff8a3d", bg: "#070b16", panel: "#131a2b" },
  Rose: { a: "#e5647f", b: "#9b7bf0", bg: "#160f18", panel: "#2a2230" },
  Ocean: { a: "#4b9bff", b: "#6fe0d0", bg: "#0d1319", panel: "#1f2a36" },
  Ember: { a: "#f0673f", b: "#f2b45c", bg: "#150f0d", panel: "#2e2320" },
  Aurora: { a: "#2dd4bf", b: "#8b5cf6", bg: "#050f0f", panel: "#10201f" },
  Sunset: { a: "#ff7a59", b: "#ff4fa3", bg: "#140a10", panel: "#2a1520" },
  Mono: { a: "#e6e6e6", b: "#9a9a9a", bg: "#0a0a0a", panel: "#1a1a1a" },
  // the Azy look, offered as a preset so it never overrides a theme you already picked
  Azy: { a: "#ececf0", b: "#9d9da6", bg: "#060606", panel: "#0e0e0e", radius: 8, glass: 30, blur: 14, amb: 16, border: 9 },
  Tsushima: { a: "#d6304a", b: "#c9b28a", bg: "#0a0d0d", panel: "#151a1a", radius: 6, glass: 0, blur: 0, amb: 10, border: 12 },
  Graphite: { a: "#b8bdc7", b: "#7f8797", bg: "#101113", panel: "#26282c" },
};
export const DEFAULT: Theme = { preset: "Editor", ...(PRESETS.Editor as Theme), radius: 4, fs: 12, thumb: 104, glass: 0, blur: 0, nav: 12, amb: 0, border: 10, anim: true, info: true, glow: true, cozy: false, shape: "auto", dlw: 560, dlh: 72, dll: 160, dlgap: 8, dlfill: false, bgimg: "", bgdim: 45, bgblur: 0, bgmerge: true, fx: "ripple", fxsize: 70, press: true, bounce: true, winw: 680, winh: 450, winapply: false, pb: "#2f7bff", sbh: 30, sbfs: 10, sbw: 0, sbc: "", tc: "#eceaf0", tdim: "", gw: 430, gbh: 40, gfs: 12, gwl: 220 };
const hex = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mix = (x: string, y: string, t: number) => "#" + hex(x).map((v, i) => Math.round(v + (hex(y)[i] - v) * t).toString(16).padStart(2, "0")).join("");
export function loadTheme(): Theme { try { return { ...DEFAULT, ...JSON.parse(localStorage.getItem("theme8") || "{}") }; } catch { return DEFAULT; } }
export function applyTheme(t: Theme) {
  const s = document.documentElement.style;
  const g = t.glass / 100, al = (0.92 - 0.8 * g).toFixed(3), p = hex(t.panel).join(",");
  const set: Record<string, string> = {
    "--a": t.a, "--b": t.b, "--bg": t.bg, "--panel": `rgba(${p},${al})`, "--bg2": `rgba(0,0,0,${(0.22 + 0.3 * (1 - g)).toFixed(3)})`,
    "--line": `rgba(255,255,255,${t.border / 100})`, "--line2": `rgba(255,255,255,${Math.min(0.6, t.border / 100 + 0.1)})`, "--amb": t.amb + "%",
    "--pb": t.pb || "#2f7bff", "--txt": t.tc || "#eceaf0", "--dim": t.tdim || "rgba(236,234,240,0.55)", "--sbh": (t.sbh || 30) + "px", "--sbfs": (t.sbfs || 10) + "px", "--sbw": (t.sbw || 0) + "px", "--sbc": t.sbc || "var(--txt)", "--gw": (t.gw || 430) + "px", "--gbh": (t.gbh || 40) + "px", "--gfs": (t.gfs || 12) + "px", "--gwl": (t.gwl || 220) + "px", "--radius": t.radius + "px", "--rs": Math.max(4, t.radius - 4) + "px", "--fs": t.fs + "px", "--thumb": t.thumb + "px", "--blur": t.blur + "px", "--bf": t.blur > 0 ? `blur(${t.blur}px)` : "none", "--nfs": t.nav + "px", "--dlw": t.dlw + "px", "--dlh": t.dlh + "px", "--dll": t.dll + "px", "--dlgap": t.dlgap + "px",
  };
  const d = document.documentElement.dataset;
  d.sbw = t.sbw > 0 ? "on" : "off"; d.preset = t.preset; d.anim = t.anim ? "on" : "off"; d.info = t.info ? "on" : "off"; d.glow = t.glow ? "on" : "off"; d.density = t.cozy ? "cozy" : "tight"; d.shape = t.shape; d.dlfill = t.dlfill ? "on" : "off";
  set["--bgimg"] = t.bgimg ? `url("${convertFileSrc(t.bgimg)}")` : "none"; set["--bgdim"] = String(t.bgdim / 100); set["--bgblur"] = t.bgblur + "px"; set["--fxs"] = t.fxsize + "px";
  d.bg = t.bgimg ? "on" : "off"; d.merge = t.bgmerge ? "on" : "off"; d.fx = t.fx; d.press = t.press ? "on" : "off"; d.bounce = t.bounce ? "on" : "off";
  Object.entries(set).forEach(([k, v]) => s.setProperty(k, v));
  localStorage.setItem("theme8", JSON.stringify(t));
  window.dispatchEvent(new Event("ptb-theme"));
}
export async function applyWin(w: number, h: number): Promise<string> {
  try { await getCurrentWebviewWindow().setSize(new LogicalSize(w, h)); return ""; } catch (e) { return String(e); }
}
export default function Settings({ theme, setTheme }: { theme: Theme; setTheme: (t: Theme) => void }) {
  const [cap, setCap] = React.useState(false), [kb, setKb] = React.useState(getWheelKey());
  React.useEffect(() => {
    if (!cap) return;
    const h = (e: KeyboardEvent) => {
      e.preventDefault(); e.stopImmediatePropagation();
      if (e.key === "Escape") { setCap(false); return; }
      if (/^(Shift|Control|Alt|Meta)/.test(e.code)) return;
      const k = { code: e.code, alt: e.altKey, ctrl: e.ctrlKey, shift: e.shiftKey }; setWheelKey(k); setKb(k); setCap(false);
    };
    window.addEventListener("keydown", h, true); return () => window.removeEventListener("keydown", h, true);
  }, [cap]);
  const [wmsg, setWmsg] = React.useState("");
  const setWin = async (w: number, h: number) => { w = Math.max(420, Math.min(2400, Math.round(w))); h = Math.max(300, Math.min(1600, Math.round(h))); setTheme({ ...theme, winw: w, winh: h, winapply: true }); const e = await applyWin(w, h); setWmsg(e ? "Could not resize: " + e : `Window is now ${w} x ${h}.`); };
  const pickBg = async () => {
    const f = await open({ multiple: false, filters: [{ name: "Image", extensions: ["png", "jpg", "jpeg", "webp", "gif", "bmp"] }] });
    if (typeof f !== "string") return;
    setTheme({ ...theme, bgimg: f });
    const im = new Image(); im.onload = () => { if (im.naturalWidth && confirm(`Make the window the same shape as this image (${im.naturalWidth} x ${im.naturalHeight})?`)) { const w = theme.winw || 680; setWin(w, w * im.naturalHeight / im.naturalWidth); } }; im.src = convertFileSrc(f);
  };
  const up = (p: Partial<Theme>) => setTheme({ ...theme, preset: "Custom", ...p });
  const col = (k: "a" | "b" | "bg" | "panel", label: string) => <label>{label}<input type="color" value={theme[k]} onChange={e => up({ [k]: e.target.value })} /></label>;
  const rng = (k: "bgdim" | "bgblur" | "fxsize" | "radius" | "fs" | "thumb" | "blur" | "nav" | "amb" | "border" | "dlw" | "dlh" | "dll" | "dlgap" | "sbh" | "sbfs" | "sbw", label: string, min: number, max: number, unit = "px") =>
    <label>{label}: {theme[k]}{unit}<input type="range" min={min} max={max} value={theme[k]} onChange={e => setTheme({ ...theme, [k]: +e.target.value })} /></label>;
  const chk = (k: "bgmerge" | "press" | "bounce" | "anim" | "info" | "glow" | "cozy" | "dlfill", label: string) => <label className="chk"><input type="checkbox" checked={theme[k]} onChange={e => setTheme({ ...theme, [k]: e.target.checked })} />{label}</label>;
  const SECS = [
    ["look", "Look", "Pick a theme, add a background picture, make panels see-through."],
    ["colors", "Colors", "Change the colors of the app, the main buttons and the text."],
    ["click", "Click & motion", "What happens when you click, and whether things animate."],
    ["window", "Window", "Window size, corner roundness and font size."],
    ["tabs", "Tabs", "Sizes and options for Assets, Downloader and General."],
    ["wheel", "Wheel menu", "The shortcut that opens the wheel over Premiere."],
  ] as const;
  const [sec, setSecRaw] = React.useState(() => localStorage.getItem("set.sec") || "look");
  const setSec = (x: string) => { setSecRaw(x); localStorage.setItem("set.sec", x); };
  const cur = SECS.find(x => x[0] === sec) ?? SECS[0];
  const p = { theme, setTheme };
  return (
    <div className="settings">
      <div className="stabs">{SECS.map(([id, n]) => <button key={id} className={cur[0] === id ? "on" : ""} onClick={() => setSec(id)}>{n}</button>)}</div>
      <span className="meta shint">{cur[2]}</span>
      {cur[0] === "look" && <>
        <h3>Theme</h3>
        <div className="row">{Object.keys(PRESETS).map(n => <button key={n} className={theme.preset === n ? "on" : ""} onClick={() => setTheme({ ...theme, ...(PRESETS[n] as Theme), preset: n })}>{n}</button>)}</div>
        <h3>Background image</h3>
        <div className="row"><button onClick={pickBg}>{theme.bgimg ? "Change image" : "Choose image"}</button>{theme.bgimg && <button onClick={() => setTheme({ ...theme, bgimg: "" })}>Remove</button>}{theme.bgimg && <button onClick={() => { const im = new Image(); im.onload = () => setWin(theme.winw || 680, (theme.winw || 680) * im.naturalHeight / im.naturalWidth); im.src = convertFileSrc(theme.bgimg); }}>Match window to image</button>}</div>
        {theme.bgimg && <><div className="col">{rng("bgdim", "Darken image", 0, 90, "%")}{rng("bgblur", "Blur image", 0, 30)}</div>
        <div className="row">{chk("bgmerge", "Merge panels into the image (see-through panels)")}</div></>}
        <span className="meta" style={{ userSelect: "text", wordBreak: "break-all" }}>{theme.bgimg}</span>
        <h3>Glass</h3>
        <div className="col">
          <label>Glass effect: {theme.glass}%<input type="range" min={0} max={100} value={theme.glass} onChange={e => setTheme({ ...theme, glass: +e.target.value })} /></label>
          {rng("blur", "Blur (0 = off, fastest)", 0, 40)}
          {rng("amb", "Background glow", 0, 80, "%")}
          {rng("border", "Border strength", 0, 30, "%")}
        </div>
      </>}
      {cur[0] === "colors" && <>
        <h3>App colors</h3>
        <div className="row">{col("a", "Accent")}{col("b", "Accent 2")}{col("bg", "Background")}{col("panel", "Panels")}</div>
        <ButtonColor {...p} />
        <TextColors {...p} />
      </>}
      {cur[0] === "click" && <>
        <h3>Click effect</h3>
        <div className="row">{([["none", "None"], ["ripple", "Ripple"], ["ring", "Ring"], ["burst", "Burst"]] as const).map(([v, n]) => <button key={v} className={theme.fx === v ? "on" : ""} onClick={() => setTheme({ ...theme, fx: v })}>{n}</button>)}</div>
        <div className="col">{rng("fxsize", "Effect size", 30, 200)}</div>
        <div className="row">{chk("press", "Buttons shrink when pressed")}{chk("bounce", "Bounce whatever I click")}</div>
        <h3>Motion</h3>
        <div className="row">{chk("anim", "Animations")}{chk("glow", "Active glow")}</div>
      </>}
      {cur[0] === "window" && <>
        <h3>Window size</h3>
        <div className="row">
          <label>Width<input type="number" className="nm" style={{ width: 80 }} value={theme.winw} onChange={e => setTheme({ ...theme, winw: +e.target.value })} /></label>
          <label>Height<input type="number" className="nm" style={{ width: 80 }} value={theme.winh} onChange={e => setTheme({ ...theme, winh: +e.target.value })} /></label>
          <button onClick={() => setWin(theme.winw, theme.winh)}>Apply size</button>
          <button onClick={() => setWin(680, 450)}>680 x 450</button>
          {theme.winapply && <button onClick={() => setTheme({ ...theme, winapply: false })} title="Stop forcing this size on start">Stop forcing</button>}
        </div>
        {wmsg && <span className="meta" style={{ userSelect: "text" }}>{wmsg}</span>}
        <h3>Layout</h3>
        <div className="col">{rng("nav", "Sidebar size (Assets, Graph, Settings)", 10, 20)}{rng("radius", "Corner radius", 0, 16)}{rng("fs", "Font size", 11, 16)}</div>
      </>}
      {cur[0] === "tabs" && <>
        <FolderBoxes {...p} />
        <AssetOptions {...p} />
        <h3>Downloader</h3>
        <div className="col">{rng("dlw", "Box width", 320, 1000)}{rng("dlh", "Link box height", 40, 260)}{rng("dll", "Log height", 60, 500)}{rng("dlgap", "Spacing", 2, 28)}</div>
        <div className="row">{chk("dlfill", "Stretch to fill window height")}</div>
        <GeneralOptions {...p} />
      </>}
      {cur[0] === "wheel" && <>
        <h3>Wheel menu</h3>
        <div className="row">
          <button className={cap ? "on" : ""} onClick={() => setCap(true)} title="Click, then press the keys you want">{cap ? "Press keys… (Esc cancels)" : "Keybind: " + fmtKey(kb)}</button>
          <button onClick={() => { setWheelKey(WHEEL_DEFAULT); setKb(WHEEL_DEFAULT); }}>Default</button>
        </div>
        <span className="meta">Works while Premiere is focused. Tap the key, then click a slice or press 1-4. Esc closes it.</span>
        <WheelSettings />
      </>}
      <div className="row sfoot"><button onClick={() => { if (confirm("Reset every setting to its default?")) setTheme(DEFAULT); }}>Reset all settings</button></div>
    </div>
  );
}

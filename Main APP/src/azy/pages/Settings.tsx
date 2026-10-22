import React, { useEffect, useState } from "react";
import {
  Palette, SlidersHorizontal, FolderCog, Keyboard, Command, Layers, Info,
  RotateCcw, Volume2, MonitorUp, Check, TriangleAlert,
} from "lucide-react";
import { useAzy, useStars, resetAzy, type HoldMod, type Perf, type Motion } from "../state";
import { useTheme } from "../theme";
import { PRESETS, applyWin, DEFAULT as DEFAULT_THEME } from "../../Settings";
import { ButtonColor, TextColors, FolderBoxes, AssetOptions, GeneralOptions } from "../../QuickStyle";
import { WheelSettings, loadWS } from "../../WheelStyle";
import { getWheelKey, setWheelKey, fmtKey, WHEEL_DEFAULT } from "../../Wheel";
import { pickFile, IS_TAURI, type Status } from "../api";
import { Btn, Chip, Field, Seg, Toggle, toast, useKey, cx } from "../ui";

/* ------------------------------------------------------------------------------------------------
 * Settings — the Toolbox theme plus the Azy dials, in one place. Themes change colours, never
 * structure, and no dial is allowed to make the UI unreadable (all values are clamped in state).
 * ---------------------------------------------------------------------------------------------- */

const TABS = [
  { id: "look", label: "Look", icon: <Palette size={11} /> },
  { id: "interface", label: "Interface", icon: <SlidersHorizontal size={11} /> },
  { id: "files", label: "Files & SFX", icon: <FolderCog size={11} /> },
  { id: "tabs", label: "Panels", icon: <Layers size={11} /> },
  { id: "keys", label: "Shortcuts", icon: <Keyboard size={11} /> },
  { id: "snap", label: "Snap", icon: <Command size={11} /> },
  { id: "about", label: "About", icon: <Info size={11} /> },
] as const;

type Tab = (typeof TABS)[number]["id"];

export default function SettingsPage({ onContext, status }: { active?: boolean; onContext: (s: string) => void; status: Status }) {
  const [azy, set] = useAzy();
  const [theme, setTheme] = useTheme();
  const [tab, setTab] = useState<Tab>(() => (localStorage.getItem("azy.set.tab") as Tab) || "look");
  const [cap, setCap] = useState(false);
  const [kb, setKb] = useState(getWheelKey());
  const [wmsg, setWmsg] = useState("");
  const [starred] = useStars();

  useEffect(() => { localStorage.setItem("azy.set.tab", tab); onContext(""); }, [tab]);

  useEffect(() => {
    if (!cap) return;
    const h = (e: KeyboardEvent) => {
      e.preventDefault(); e.stopImmediatePropagation();
      if (e.key === "Escape") { setCap(false); return; }
      if (/^(Shift|Control|Alt|Meta)/.test(e.code)) return;
      const k = { code: e.code, alt: e.altKey, ctrl: e.ctrlKey, shift: e.shiftKey };
      setWheelKey(k); setKb(k); setCap(false);
      toast("Wheel shortcut saved", fmtKey(k), "ok", 1800);
    };
    window.addEventListener("keydown", h, true);
    return () => window.removeEventListener("keydown", h, true);
  }, [cap]);

  const applySize = async (w: number, h: number) => {
    const W = Math.max(420, Math.min(2400, Math.round(w)));
    const H = Math.max(300, Math.min(1600, Math.round(h)));
    setTheme({ ...theme, winw: W, winh: H, winapply: true });
    const err = await applyWin(W, H);
    setWmsg(err ? "Could not resize: " + err : `Window is now ${W} × ${H}.`);
  };

  const chooseBg = async () => {
    const f = await pickFile(["png", "jpg", "jpeg", "webp", "gif", "bmp"]);
    if (f) { setTheme({ ...theme, bgimg: f }); toast("Background image set", "", "ok", 1600); }
  };

  return (
    <div className="az-settings">
      <div className="az-stabs" role="tablist">
        {TABS.map(t => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className={cx(tab === t.id && "on")} onClick={() => setTab(t.id)}>
            <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>{t.icon}{t.label}</span>
          </button>
        ))}
      </div>

      <div className="az-sbody">
        {/* ── LOOK ───────────────────────────────────────────────────────────────────────────── */}
        {tab === "look" && <>
          <div className="az-group">
            <h3>Theme</h3>
            <div className="az-themes">
              {Object.entries(PRESETS).map(([name, p]) => (
                <button key={name} className={cx("az-theme", theme.preset === name && "on")} onClick={() => setTheme({ ...theme, ...(p as never), preset: name })}>
                  <i>
                    <span style={{ background: (p as { bg?: string }).bg ?? theme.bg }} />
                    <span style={{ background: (p as { a?: string }).a ?? theme.a }} />
                    <span style={{ background: (p as { b?: string }).b ?? theme.b }} />
                  </i>
                  {name}
                </button>
              ))}
            </div>
            <span className="az-note">Themes change colours, never structure. Your custom colours are never reset.</span>
          </div>

          <div className="az-group">
            <h3>Colours</h3>
            <div className="az-row">
              {([["a", "Accent"], ["b", "Accent 2"], ["bg", "Background"], ["panel", "Panels"]] as const).map(([k, label]) => (
                <label key={k} style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: "var(--az-fs-xs)", color: "var(--az-text-3)" }}>
                  {label}
                  <input type="color" value={theme[k]} onChange={e => setTheme({ ...theme, preset: "Custom", [k]: e.target.value })} />
                </label>
              ))}
            </div>
            <ButtonColor theme={theme} setTheme={setTheme} />
            <TextColors theme={theme} setTheme={setTheme} />
          </div>

          <div className="az-group">
            <h3>Glass & light</h3>
            <Field label="Glass effect" value={theme.glass} min={0} max={100} unit="%" onChange={v => setTheme({ ...theme, glass: v })} />
            <Field label="Blur (0 = off, fastest)" value={theme.blur} min={0} max={40} unit="px" onChange={v => setTheme({ ...theme, blur: v })} />
            <Field label="Background glow" value={theme.amb} min={0} max={80} unit="%" onChange={v => setTheme({ ...theme, amb: v })} />
            <Field label="Border strength" value={theme.border} min={0} max={30} unit="%" onChange={v => setTheme({ ...theme, border: v })} />
            <Field label="Corner radius" value={theme.radius} min={0} max={16} unit="px" onChange={v => setTheme({ ...theme, radius: v })} />
            <Toggle label="Active glow" sub="Off removes every glow, not the function" checked={theme.glow} onChange={v => setTheme({ ...theme, glow: v })} />
          </div>

          <div className="az-group">
            <h3>Background image</h3>
            <div className="az-row">
              <Btn onClick={chooseBg} disabled={!IS_TAURI}>{theme.bgimg ? "Change image" : "Choose image"}</Btn>
              {theme.bgimg && <Btn onClick={() => setTheme({ ...theme, bgimg: "" })}>Remove</Btn>}
            </div>
            {theme.bgimg && <>
              <Field label="Darken image" value={theme.bgdim} min={0} max={90} unit="%" onChange={v => setTheme({ ...theme, bgdim: v })} />
              <Field label="Blur image" value={theme.bgblur} min={0} max={30} unit="px" onChange={v => setTheme({ ...theme, bgblur: v })} />
              <Toggle label="Merge panels into the image" checked={theme.bgmerge} onChange={v => setTheme({ ...theme, bgmerge: v })} />
            </>}
          </div>

          <div className="az-group">
            <h3>Click effect</h3>
            <div className="az-row">
              {([["none", "None"], ["ripple", "Ripple"], ["ring", "Ring"], ["burst", "Burst"]] as const).map(([v, n]) => (
                <Chip key={v} on={theme.fx === v} onClick={() => setTheme({ ...theme, fx: v })}>{n}</Chip>
              ))}
            </div>
            <Field label="Effect size" value={theme.fxsize} min={30} max={200} unit="px" onChange={v => setTheme({ ...theme, fxsize: v })} />
            <Toggle label="Buttons shrink when pressed" checked={theme.press} onChange={v => setTheme({ ...theme, press: v })} />
            <Toggle label="Bounce whatever I click" checked={theme.bounce} onChange={v => setTheme({ ...theme, bounce: v })} />
            <Toggle label="Animations" checked={theme.anim} onChange={v => setTheme({ ...theme, anim: v })} />
          </div>
        </>}

        {/* ── INTERFACE ─────────────────────────────────────────────────────────────────────── */}
        {tab === "interface" && <>
          <div className="az-group">
            <h3>Motion</h3>
            <Field label="Animation speed" value={azy.animSpeed} min={.5} max={2} step={.05} unit="×" format={v => v.toFixed(2)} onChange={v => set({ animSpeed: v })} />
            <span className="az-note">Navigation timing is exempt — switching sectors never waits.</span>
            <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "var(--az-fs-xs)", color: "var(--az-text-2)" }}>
              Performance
              <Seg value={azy.perf} onChange={(v: Perf) => set({ perf: v })} items={[{ id: "full", label: "Full" }, { id: "balanced", label: "Balanced" }, { id: "performance", label: "Performance" }]} />
            </label>
            <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "var(--az-fs-xs)", color: "var(--az-text-2)" }}>
              Motion
              <Seg value={azy.motion} onChange={(v: Motion) => set({ motion: v })} items={[{ id: "system", label: "System" }, { id: "reduced", label: "Reduced" }, { id: "full", label: "Full" }]} />
            </label>
            <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "var(--az-fs-xs)", color: "var(--az-text-2)" }}>
              Frame target
              <Seg value={String(azy.fps)} onChange={(v: string) => set({ fps: Number(v) as 60 | 90 | 120 })} items={[{ id: "60", label: "60" }, { id: "90", label: "90" }, { id: "120", label: "120" }]} />
            </label>
            <span className="az-note">Performance and reduced motion tone the look down. They never remove a feature.</span>
          </div>

          <div className="az-group">
            <h3>Ambient layer</h3>
            <Field label="Web opacity" value={azy.webOpacity} min={0} max={2} step={.05} unit="×" format={v => v.toFixed(2)} onChange={v => set({ webOpacity: v })} />
            <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "var(--az-fs-xs)", color: "var(--az-text-2)" }}>
              Web density
              <Seg value={azy.webDensity} onChange={v => set({ webDensity: v })} items={[{ id: "light", label: "Light" }, { id: "normal", label: "Normal" }, { id: "dense", label: "Dense" }]} />
            </label>
            <span className="az-note">The ambient layer holds still while you scroll, click or type.</span>
          </div>

          <div className="az-group">
            <h3>Window</h3>
            <div className="az-row">
              <label style={{ width: 78, fontSize: "var(--az-fs-xs)", color: "var(--az-text-3)" }}>Width
                <input className="az-input" type="number" value={theme.winw} onChange={e => setTheme({ ...theme, winw: +e.target.value })} style={{ width: "100%" }} />
              </label>
              <label style={{ width: 78, fontSize: "var(--az-fs-xs)", color: "var(--az-text-3)" }}>Height
                <input className="az-input" type="number" value={theme.winh} onChange={e => setTheme({ ...theme, winh: +e.target.value })} style={{ width: "100%" }} />
              </label>
              <Btn onClick={() => applySize(theme.winw, theme.winh)}>Apply size</Btn>
              <Btn onClick={() => applySize(470, 800)}>470 × 800</Btn>
            </div>
            {wmsg && <span className="az-note">{wmsg}</span>}
            <Toggle label="Always on top" sub="Keeps the window above Premiere" checked={azy.keepOnTop} onChange={v => set({ keepOnTop: v })} />
            <Field label="Font size" value={theme.fs} min={11} max={16} unit="px" onChange={v => setTheme({ ...theme, fs: v })} />
            <Field label="Thumbnail width" value={theme.thumb} min={80} max={200} unit="px" onChange={v => setTheme({ ...theme, thumb: v })} />
          </div>
        </>}

        {/* ── FILES & SFX ───────────────────────────────────────────────────────────────────── */}
        {tab === "files" && <>
          <div className="az-group">
            <h3>Place media</h3>
            <Toggle label="Auto-Cut" sub="Keep the first 2 s of the placed clip (images too)" checked={azy.autoCut} onChange={v => set({ autoCut: v })} />
            <Toggle label="Auto-Scale" sub="Motion › Scale 180 on the new video only" checked={azy.autoScale} onChange={v => set({ autoScale: v })} />
            <span className="az-note">Apply uses the lowest video track that is free for the clip’s full length. Nothing already on the timeline is moved.</span>
          </div>
          <div className="az-group">
            <h3>Preview</h3>
            <Toggle label="Preview dock" sub="Borrows height below the panel so the grid never reflows (Ctrl+Shift+P)" checked={azy.dock} onChange={v => set({ dock: v })} />
            <Toggle label="Load video thumbnails" sub="Off is faster on big folders" checked={azy.thumbs} onChange={v => set({ thumbs: v })} />
          </div>
          <div className="az-group">
            <h3>Sounds</h3>
            <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "var(--az-fs-xs)", color: "var(--az-text-2)" }}>
              Hold modifier
              <Seg value={azy.holdMod} onChange={(v: HoldMod) => set({ holdMod: v })} items={[{ id: "shift", label: "Shift" }, { id: "alt", label: "Alt" }, { id: "off", label: "Off" }]} />
            </label>
            <Field label="Remembered gain" value={azy.gain} min={-24} max={12} unit=" dB" onChange={v => set({ gain: v })} />
            <span className="az-note">The level card opens only while the hold modifier is down. Confirm remembers it; Cancel changes nothing.</span>
            <div className="az-row">
              <Btn onClick={() => set({ gain: 0 })} icon={<Volume2 size={11} />}>Reset to 0 dB</Btn>
            </div>
          </div>
          <div className="az-group">
            <h3>Folders</h3>
            <span className="az-note">
              {azy.soundFolders.length} sound folder{azy.soundFolders.length === 1 ? "" : "s"} · {starred.length} starred item{starred.length === 1 ? "" : "s"}.
              Pins are reordered by dragging a chip, or Alt+←/→ in Files and Alt+↑/↓ in SFX.
            </span>
          </div>
        </>}

        {/* ── PANELS ────────────────────────────────────────────────────────────────────────── */}
        {tab === "tabs" && <>
          <div className="settings">
            <FolderBoxes theme={theme} setTheme={setTheme} />
            <AssetOptions theme={theme} setTheme={setTheme} />
            <GeneralOptions theme={theme} setTheme={setTheme} />
            <h3>Downloader</h3>
            <div className="col">
              <Field label="Box width" value={theme.dlw} min={320} max={1000} unit="px" onChange={v => setTheme({ ...theme, dlw: v })} />
              <Field label="Link box height" value={theme.dlh} min={40} max={260} unit="px" onChange={v => setTheme({ ...theme, dlh: v })} />
              <Field label="Log height" value={theme.dll} min={60} max={500} unit="px" onChange={v => setTheme({ ...theme, dll: v })} />
              <Field label="Spacing" value={theme.dlgap} min={2} max={28} unit="px" onChange={v => setTheme({ ...theme, dlgap: v })} />
            </div>
            <Toggle label="Stretch to fill window height" checked={theme.dlfill} onChange={v => setTheme({ ...theme, dlfill: v })} />
          </div>
        </>}

        {/* ── SHORTCUTS ─────────────────────────────────────────────────────────────────────── */}
        {tab === "keys" && <>
          <div className="az-group">
            <h3>Wheel menu</h3>
            <div className="az-row">
              <Btn on={cap} onClick={() => setCap(true)} title="Click, then press the keys you want">
                {cap ? "Press keys… (Esc cancels)" : "Keybind: " + fmtKey(kb)}
              </Btn>
              <Btn onClick={() => { setWheelKey(WHEEL_DEFAULT); setKb(WHEEL_DEFAULT); }}>Default</Btn>
            </div>
            <span className="az-note">Works while Premiere is focused. Tap the key, then click a slice or press 1–9.</span>
            <WheelSettings />
          </div>
          <div className="az-group">
            <h3>In-app keys</h3>
            <div className="az-kv">
              <b>Ctrl+1…9</b><span>Jump to a sector</span>
              <b>Shift+Space</b><span>Snap Action</span>
              <b>Ctrl+Z</b><span>Undo a window action (never Premiere)</span>
              <b>Ctrl+Shift+P</b><span>Preview dock</span>
              <b>Alt+← / →</b><span>Reorder pinned folders</span>
              <b>Alt+↑ / ↓</b><span>Reorder sound folders</span>
              <b>Esc</b><span>Clear the selection, then hide the window</span>
            </div>
          </div>
          <div className="az-group">
            <h3>Premiere-side keys</h3>
            <div className="az-kv">
              <b>Shift+Space</b><span>Snap Action (global)</span>
              <b>Shift+Alt+S</b><span>Speed window (global)</span>
              <b>Ctrl+Alt+P</b><span>Move keys to the playhead</span>
              <b>Shift+Alt+A</b><span>Show / hide the app</span>
            </div>
            <span className="az-note">Premiere’s own keys are never captured globally.</span>
          </div>
        </>}

        {/* ── SNAP ─────────────────────────────────────────────────────────────────────────── */}
        {tab === "snap" && <>
          <div className="az-group">
            <h3>Snap Action</h3>
            <Toggle label="Only apply when a clip is selected" sub="Nothing happens on an empty selection" checked={azy.snapNeedsSelection} onChange={v => set({ snapNeedsSelection: v })} />
            <Toggle label="Hide after applying" sub="Snap closes instantly, the toast carries the result" checked={azy.snapHideAfter} onChange={v => set({ snapHideAfter: v })} />
            <Toggle label="Starred results only" checked={azy.snapStarredOnly} onChange={v => set({ snapStarredOnly: v })} />
          </div>
          <div className="az-group">
            <h3>Dagger wheels</h3>
            <div className="az-kv">
              <b>Ctrl + right mouse</b><span>Azy (up to 7 items)</span>
              <b>Alt + right mouse</b><span>SFX (8)</span>
              <b>Shift + right mouse</b><span>Presets (8)</span>
              <b>Ctrl+Shift + right mouse</b><span>Flow (8)</span>
            </div>
            <span className="az-note">The wheel, its pins and its style presets are the existing Toolbox wheel — unchanged. Releasing in the hub cancels.</span>
            <div className="az-row">
              <Btn onClick={() => window.dispatchEvent(new Event("ptb-wheel"))}>Preview the wheel</Btn>
              <Btn onClick={() => toast("Wheel style", `Preset: ${loadWS().preset} · open Settings › Shortcuts to change it.`, "info")}>Current style</Btn>
            </div>
          </div>
        </>}

        {/* ── ABOUT ─────────────────────────────────────────────────────────────────────────── */}
        {tab === "about" && <>
          <div className="az-group">
            <h3>This build</h3>
            <div className="az-kv">
              <b>App</b><span>Premiere Toolbox v0.4 · Azy layout</span>
              <b>Premiere</b><span>{status.demo ? "demo (browser preview)" : status.connected ? `connected${status.project ? " · " + status.project : ""}` : "not connected"}</span>
              <b>Bridge</b><span>{IS_TAURI ? "Tauri running" : "browser preview"}</span>
              <b>Theme</b><span>{theme.preset}</span>
            </div>
          </div>
          <div className="az-group">
            <h3>Status of the port</h3>
            <span className="az-note">
              The layout, the shell, Files, SFX, Presets, Flow, Speed, Snap and Settings are in. Two things still
              need the Rust side: the preset index that feeds the Presets grid, and the media/SFX place commands.
              They are listed part by part in <b>docs/AZY-PORT-STATUS.md</b>.
            </span>
            <div className="az-row">
              <Btn icon={<Info size={11} />} onClick={() => toast("Where to look", "docs/AZY-PORT-STATUS.md in the repository root.", "info", 4000)}>Port notes</Btn>
            </div>
          </div>
          <div className="az-group">
            <h3>Reset</h3>
            <div className="az-row">
              <Btn icon={<RotateCcw size={11} />} onClick={() => {
                if (window.confirm("Reset the Azy dials (density, motion, files, SFX, Snap)? The colour theme is kept.")) {
                  resetAzy();
                  toast("Azy dials reset", "Colours and themes were kept.", "ok");
                }
              }}>Reset Azy dials</Btn>
              <Btn icon={<Palette size={11} />} onClick={() => {
                if (window.confirm("Reset every colour and size setting to the default theme?")) {
                  setTheme(DEFAULT_THEME);
                  toast("Theme reset", "Custom theme colours were cleared.", "ok");
                }
              }}>Reset theme</Btn>
            </div>
            <span className="az-note" style={{ display: "flex", gap: 5, alignItems: "center" }}>
              <Check size={11} /> Reset never deletes media, pins or files.
            </span>
          </div>
          <div className="az-group">
            <h3>Honest results</h3>
            <span className="az-note" style={{ display: "flex", gap: 5 }}>
              <TriangleAlert size={11} style={{ flex: "none", marginTop: 2 }} />
              If a message says nothing was applied, nothing was applied. If Premiere refuses, the refusal is shown exactly as it came back.
            </span>
          </div>
        </>}
      </div>
    </div>
  );
}

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import Graph from "./Graph";
import General from "./General";
import Downloader from "./Downloader";
import { Assets, DEFAULT_LIBS, type Lib } from "./Assets";
import { Ico3D } from "./Icons";
import Settings, { applyTheme, applyWin, loadTheme, PRESETS, type Theme } from "./Settings";
import { initClickFx, initBounce } from "./clickfx";
import { loadWS, paintWS } from "./WheelStyle";
import Wheel, { type WItem, getWheelKey, wheelAccel } from "./Wheel";
import { emit, listen } from "@tauri-apps/api/event";
import { getCurrentWebviewWindow, WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { register, unregisterAll } from "@tauri-apps/plugin-global-shortcut";
import { Folder, Plus, Spline, Settings as SettingsIcon, SlidersHorizontal, Download } from "lucide-react";
import "./style.css";

// Separate transparent window shown by the global shortcut (over Premiere).
function WheelWindow() {
  const [, setTick] = useState(0);
  useEffect(() => {
    let a: (() => void) | undefined, b: (() => void) | undefined;
    listen("wheel-open", () => { applyTheme(loadTheme()); paintWS(loadWS()); setTick(n => n + 1); setTimeout(() => window.dispatchEvent(new Event("ptb-wheel")), 0); }).then(f => (a = f));
    listen("wheel-close", () => window.dispatchEvent(new Event("ptb-wheel-close"))).then(f => (b = f));
    return () => { a?.(); b?.(); };
  }, []);
  const libs: Lib[] = JSON.parse(localStorage.getItem("libs") || "null") ?? DEFAULT_LIBS;
  const send = (p: any) => () => { emit("wheel-run", p); };
  const items: WItem[] = [
    { id: "general", label: "General", icon: <SlidersHorizontal size={22} />, run: send({ k: "view", v: "general" }) },
    { id: "download", label: "Downloader", icon: <Download size={22} />, run: send({ k: "view", v: "download" }) },
    { id: "assets", label: "Assets", icon: <Folder size={22} />, run: send({ k: "view", v: "assets" }), subs: libs.map(l => ({ id: l.id, label: l.name, run: send({ k: "lib", id: l.id }) })) },
    { id: "graph", label: "Graph", icon: <Spline size={22} />, run: send({ k: "view", v: "graph" }), subs: ["Linear", "Ease In Out", "Smooth", "Fast", "Bounce", "Elastic"].map(n => ({ id: n, label: n, run: send({ k: "preset", n }) })) },
  ];
  return <Wheel items={items} current="Toolbox" onClose={() => { getCurrentWebviewWindow().hide().catch(() => {}); }} />;
}

function App() {
  const [theme, setTheme] = useState(loadTheme);
  useEffect(() => applyTheme(theme), [theme]);
  useEffect(() => { initClickFx(); initBounce(); if (loadTheme().winapply) { const t = loadTheme(); applyWin(t.winw, t.winh); } }, []);
  const [libs, setLibs] = useState<Lib[]>(() => JSON.parse(localStorage.getItem("libs") || "null") ?? DEFAULT_LIBS);
  const saveLibs = (n: Lib[]) => { setLibs(n); localStorage.setItem("libs", JSON.stringify(n)); };
  type View = "general" | "download" | "assets" | "graph" | "settings";
  const [dlBusy, setDlBusy] = useState(false);
  const [view, setViewRaw] = useState<View>(() => (["general", "download", "assets", "graph", "settings"].includes(localStorage.getItem("view") || "") ? localStorage.getItem("view") : "assets") as View);
  const ORDER = ["general", "download", "assets", "graph", "settings"];
  const [dir, setDir] = useState<"r" | "l">("r");
  const setView = (v: View) => { setDir(ORDER.indexOf(v) >= ORDER.indexOf(view) ? "r" : "l"); setViewRaw(v); localStorage.setItem("view", v); };
  const [active, setActive] = useState<string>(() => { const a = localStorage.getItem("activeLib"); return a && libs.some(l => l.id === a) ? a : libs[0].id; });
  const go = (id: string) => { setActive(id); setView("assets"); localStorage.setItem("activeLib", id); };
  const lib = libs.find(l => l.id === active) ?? libs[0];
  const addLib = () => { const n = prompt("New section name?")?.trim(); if (!n) return; const l = { id: n + Date.now(), name: n, path: "" }; saveLibs([...libs, l]); go(l.id); };
  const renameLib = (l: Lib) => { const n = prompt("Rename section", l.name)?.trim(); if (n) saveLibs(libs.map(x => (x.id === l.id ? { ...x, name: n } : x))); };
  const removeLib = (l: Lib) => { if (libs.length < 2 || !confirm(`Remove section "${l.name}"? (Files are not deleted)`)) return; const n = libs.filter(x => x.id !== l.id); saveLibs(n); go(n[0].id); };
  const LABEL: Record<View, string> = { general: "General", download: "Downloader", assets: "Assets", graph: "Graph", settings: "Settings" };
  const gp = (n: string) => { localStorage.setItem("wheelPreset", n); setView("graph"); window.dispatchEvent(new Event("ptb-preset")); };
  const actRef = useRef<(p: any) => void>(() => {});
  actRef.current = (p: any) => {
    if (p.k === "view") setView(p.v); else if (p.k === "lib") go(p.id); else if (p.k === "preset") gp(p.n);
    else if (p.k === "theme") setTheme({ ...theme, ...(PRESETS[p.n] as Theme), preset: p.n });
    const w = getCurrentWebviewWindow(); w.unminimize().then(() => w.show()).then(() => w.setFocus()).catch(() => {});
  };
  const [gerr, setGerr] = useState("");
  useEffect(() => {
    let un: (() => void) | undefined; listen("wheel-run", e => actRef.current(e.payload)).then(f => (un = f));
    const bind = async () => {
      try {
        await unregisterAll();
        await register(wheelAccel(getWheelKey()), async e => {
          if (e.state !== "Pressed") return;
          const w = await WebviewWindow.getByLabel("wheel"); if (!w) return;
          if (await w.isVisible()) { await w.emit("wheel-close"); return; }
          await w.center(); await w.show(); await w.setFocus(); await w.emit("wheel-open");
        });
        setGerr("");
      } catch (er) { setGerr(String(er)); }
    };
    bind(); window.addEventListener("ptb-wheelkey", bind);
    const cw = getCurrentWebviewWindow(); let uc: (() => void) | undefined;
    cw.onCloseRequested(async () => { try { (await WebviewWindow.getByLabel("wheel"))?.destroy(); } catch {} }).then(f => (uc = f));
    return () => { un?.(); uc?.(); window.removeEventListener("ptb-wheelkey", bind); };
  }, []);
  const wheelItems: WItem[] = [
    { id: "general", label: "General", icon: <SlidersHorizontal size={22} />, run: () => setView("general") },
    { id: "download", label: "Downloader", icon: <Download size={22} />, run: () => setView("download") },
    { id: "assets", label: "Assets", icon: <Folder size={22} />, run: () => setView("assets"), subs: libs.map(l => ({ id: l.id, label: l.name, run: () => go(l.id) })) },
    { id: "graph", label: "Graph", icon: <Spline size={22} />, run: () => setView("graph"), subs: ["Linear", "Ease In Out", "Smooth", "Fast", "Bounce", "Elastic"].map(n => ({ id: n, label: n, run: () => gp(n) })) },
  ];
  return (
    <div className="shell">
      <Wheel items={wheelItems} current={LABEL[view]} />
      <div className="fx" aria-hidden><i className="o1" /><i className="o2" /><i className="o3" /><b className="grain" /></div>
      <header><div className="logo" title="Wheel menu" style={{ cursor: "pointer" }} onClick={() => window.dispatchEvent(new Event("ptb-wheel"))}>G</div><b>PREMIERE TOOLBOX</b><span className="grow" />{gerr && <small style={{ color: "#ff6b6b" }} title={gerr}>Global shortcut unavailable</small>}<small>v0.4</small></header>
      <div className="body" data-dir={dir}>
        <nav className="tabbar">
          {([["general", "General", 250, <SlidersHorizontal />], ["download", "Downloader", 200, <Download />], ["assets", "Assets", 35, <Folder />], ["graph", "Graph", 150, <Spline />], ["settings", "Settings", 220, <SettingsIcon />]] as [View, string, number, React.ReactNode][]).map(([id, label, hue, icon]) =>
            <button key={id} className={view === id ? "on" : ""} onClick={() => setView(id)} title={label}><Ico3D hue={hue} s={Math.round(theme.nav * 2.2 + 4)}>{icon}</Ico3D><span>{label}</span>{id === "download" && dlBusy && <i className="bdot" title="Download in progress" />}</button>)}
        </nav>
        <section key="dl" className={"pane" + (view === "download" ? " on" : "")}><Downloader onBusy={setDlBusy} /></section>
        <section key="as" className={"pane" + (view === "assets" ? " on" : "")}><Assets theme={theme} setTheme={setTheme} lib={lib} libs={libs} saveLibs={saveLibs} removeLib={removeLib} go={go} addLib={addLib} renameLib={renameLib} /></section>
        <section key="gen" className={"pane" + (view === "general" ? " on" : "")}><General theme={theme} setTheme={setTheme} /></section>
        {view !== "download" && view !== "assets" && view !== "general" && <section key={view} className="pane on">{view === "graph" ? <Graph /> : <Settings theme={theme} setTheme={setTheme} />}</section>}
      </div>
    </div>
  );
}
applyTheme(loadTheme()); paintWS(loadWS());
if (location.hash === "#wheel") document.documentElement.classList.add("wheelwin");
createRoot(document.getElementById("root")!).render(location.hash === "#wheel" ? <WheelWindow /> : <App />);

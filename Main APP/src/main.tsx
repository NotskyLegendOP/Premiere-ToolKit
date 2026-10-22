import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Folder, AudioLines, Boxes, Spline, Gauge, Settings as SettingsIcon, Download, Captions as CapIcon, Command } from "lucide-react";
import { emit, listen } from "@tauri-apps/api/event";
import { getCurrentWebviewWindow, WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { register, unregisterAll } from "@tauri-apps/plugin-global-shortcut";

import Shell, { goto, type SectorId } from "./azy/Shell";
import Wheel, { type WItem, getWheelKey, wheelAccel } from "./Wheel";
import { paintWS, loadWS } from "./WheelStyle";
import { applyTheme, applyWin, loadTheme } from "./Settings";
import { initBounce, initClickFx } from "./clickfx";
import { loadLibs, saveActive } from "./azy/libs";
import { toast } from "./azy/ui";
import "./style.css";
import "./azy/tokens.css";
import "./azy/azy.css";
import "./azy/motion.css";

/* ------------------------------------------------------------------------------------------------
 * Two windows share this entry point:
 *   · the main workspace (Azy shell)          → #/
 *   · the transparent wheel over Premiere     → #wheel
 * The wheel only sends intents; the workspace owns every sector and every Premiere call.
 * ---------------------------------------------------------------------------------------------- */

type Intent =
  | { k: "sector"; id: SectorId }
  | { k: "lib"; id: string }
  | { k: "snap" }
  | { k: "theme"; n: string };

/** Handles one wheel intent in the workspace window. */
function runIntent(p: Intent) {
  if (p.k === "sector") {
    if (p.id === "speed") { goto("speed"); return; }
    goto(p.id);
  } else if (p.k === "lib") {
    saveActive(p.id);
    goto("files");
    window.dispatchEvent(new Event("azy-lib"));
  } else if (p.k === "snap") {
    window.dispatchEvent(new Event("azy-snap"));
  } else if (p.k === "theme") {
    const t = loadTheme();
    applyTheme({ ...t, preset: p.n });
  }
  const w = getCurrentWebviewWindow();
  w.unminimize().then(() => w.show()).then(() => w.setFocus()).catch(() => {});
}

/* ── wheel window (transparent, above Premiere) ─────────────────────────────────────────────── */
function WheelWindow() {
  const [, setTick] = useState(0);
  useEffect(() => {
    let a: (() => void) | undefined, b: (() => void) | undefined;
    listen("wheel-open", () => {
      applyTheme(loadTheme());
      paintWS(loadWS());
      setTick(n => n + 1);
      setTimeout(() => window.dispatchEvent(new Event("ptb-wheel")), 0);
    }).then(f => (a = f));
    listen("wheel-close", () => window.dispatchEvent(new Event("ptb-wheel-close"))).then(f => (b = f));
    return () => { a?.(); b?.(); };
  }, []);

  const libs = loadLibs();
  const send = (p: Intent) => () => { emit("wheel-run", p); };

  const items: WItem[] = [
    {
      id: "files", label: "Files", icon: <Folder size={22} />, run: send({ k: "sector", id: "files" }),
      subs: libs.map(l => ({ id: l.id, label: l.name, run: send({ k: "lib", id: l.id }) })),
    },
    { id: "sfx", label: "SFX", icon: <AudioLines size={22} />, run: send({ k: "sector", id: "sfx" }) },
    { id: "presets", label: "Presets", icon: <Boxes size={22} />, run: send({ k: "sector", id: "presets" }) },
    { id: "flow", label: "Flow", icon: <Spline size={22} />, run: send({ k: "sector", id: "flow" }) },
    { id: "speed", label: "Speed", icon: <Gauge size={22} />, run: send({ k: "sector", id: "speed" }) },
    { id: "snap", label: "Snap", icon: <Command size={22} />, run: send({ k: "snap" }) },
    { id: "captions", label: "Captions", icon: <CapIcon size={22} />, run: send({ k: "sector", id: "captions" }) },
    { id: "download", label: "Downloader", icon: <Download size={22} />, run: send({ k: "sector", id: "download" }) },
    { id: "settings", label: "Settings", icon: <SettingsIcon size={22} />, run: send({ k: "sector", id: "settings" }) },
  ];

  return <Wheel items={items} current="Toolbox" onClose={() => { getCurrentWebviewWindow().hide().catch(() => {}); }} />;
}

/* ── workspace ─────────────────────────────────────────────────────────────────────────────── */
function Workspace() {
  const [, setThemeTick] = useState(0);

  /* boot the theme once, before the first paint matters */
  useEffect(() => {
    const t = loadTheme();
    applyTheme(t);
    paintWS(loadWS());
    if (t.winapply) applyWin(t.winw, t.winh);   // bring back the size you saved
    initClickFx();      // the theme's click effect, unchanged
    initBounce();
    setThemeTick(1);
  }, []);

  /* wheel intents + global wheel shortcut (works while Premiere is focused) */
  const [gerr, setGerr] = useState("");
  useEffect(() => {
    let un: (() => void) | undefined;
    listen<Intent>("wheel-run", e => runIntent(e.payload)).then(f => (un = f));

    const bind = async () => {
      try {
        await unregisterAll();
        await register(wheelAccel(getWheelKey()), async e => {
          if (e.state !== "Pressed") return;
          const w = await WebviewWindow.getByLabel("wheel");
          if (!w) return;
          if (await w.isVisible()) { await w.emit("wheel-close"); return; }
          await w.center(); await w.show(); await w.setFocus(); await w.emit("wheel-open");
        });
        setGerr("");
      } catch (er) {
        setGerr(String(er));
      }
    };
    bind();
    window.addEventListener("ptb-wheelkey", bind);


    const cw = getCurrentWebviewWindow();
    let uc: (() => void) | undefined;
    cw.onCloseRequested(async () => {
      try { (await WebviewWindow.getByLabel("wheel"))?.destroy(); } catch { /* already gone */ }
    }).then(f => (uc = f));

    return () => {
      un?.(); uc?.();
      window.removeEventListener("ptb-wheelkey", bind);
    };
  }, []);

  useEffect(() => {
    if (gerr) toast("Global shortcut unavailable", gerr + " — pick another key in Settings › Shortcuts.", "err");
  }, [gerr]);

  return <Shell />;
}

applyTheme(loadTheme());
paintWS(loadWS());
if (location.hash === "#wheel") document.documentElement.classList.add("wheelwin");
if (location.hash !== "#wheel") document.documentElement.dataset.az = "on";

createRoot(document.getElementById("root")!).render(location.hash === "#wheel" ? <WheelWindow /> : <Workspace />);

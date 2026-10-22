import React, { useEffect, useRef, useState } from "react";
import {
  Folder, AudioLines, Boxes, Spline, Gauge, Settings2, Captions as CapIcon,
  Download, Activity, Command, Check, Undo2, X,
} from "lucide-react";
import { useAzy, getAzy, setAzy, undo, useUndoLabel } from "./state";
import { IS_TAURI, premiereStatus, type Status } from "./api";
import { Toaster, toast, Ib, cx, Busy } from "./ui";
import Files from "./pages/Files";
import Sounds from "./pages/Sounds";
import Presets from "./pages/Presets";
import Flow from "./pages/Flow";
import SettingsPage from "./pages/Settings";
import Tools from "./pages/Tools";
import SpeedWindow from "./SpeedWindow";
import SnapPalette from "./SnapPalette";

/* ------------------------------------------------------------------------------------------------
 * The Azy shell: header (sigil · sector crumb · Premiere link), one tab row with a gliding accent
 * pill, the pane stack, and the status bar. Sector switching never waits for an animation.
 * ---------------------------------------------------------------------------------------------- */

export type SectorId = "files" | "sfx" | "presets" | "flow" | "speed" | "captions" | "download" | "graph" | "settings";

type Sector = { id: SectorId; title: string; icon: React.ReactNode; kind?: "pane" | "launch" };

export const SECTORS: Sector[] = [
  { id: "files", title: "Files", icon: <Folder /> },
  { id: "sfx", title: "SFX", icon: <AudioLines /> },
  { id: "presets", title: "Presets", icon: <Boxes /> },
  { id: "flow", title: "Flow", icon: <Spline /> },
  { id: "speed", title: "Speed", icon: <Gauge />, kind: "launch" },
  { id: "captions", title: "Captions", icon: <CapIcon /> },
  { id: "download", title: "Downloader", icon: <Download /> },
  { id: "graph", title: "Graph", icon: <Activity /> },
  { id: "settings", title: "Settings", icon: <Settings2 /> },
];

export const goto = (id: SectorId) => window.dispatchEvent(new CustomEvent<SectorId>("azy-goto", { detail: id }));

const storeKey = "azy.sector";
const loadSector = (): SectorId => {
  const v = localStorage.getItem(storeKey) as SectorId | null;
  return v && SECTORS.some(s => s.id === v) ? v : "files";
};

export default function Shell() {
  const [azy] = useAzy();
  const [sector, setSectorRaw] = useState<SectorId>(loadSector);
  const [dir, setDir] = useState<"r" | "l" | "x">("x");
  const [ctx, setCtx] = useState("");
  const [speedOpen, setSpeedOpen] = useState(false);
  const [snapOpen, setSnapOpen] = useState(false);
  const [status, setStatus] = useState<Status>({ connected: false });
  const [netErr, setNetErr] = useState("");
  const undoing = useUndoLabel();

  const order = SECTORS.map(s => s.id);
  const setSector = (id: SectorId, keepCtx = false) => {
    const target = SECTORS.find(s => s.id === id);
    if (!target) return;
    if (!keepCtx) setCtx("");
    if (target.kind === "launch") {
      // A launch sector never replaces the pane you are on.
      if (id === "speed") setSpeedOpen(true);
      return;
    }
    if (id === sector) return;
    setDir(order.indexOf(id) > order.indexOf(sector) ? "r" : "l");
    setSectorRaw(id);
    localStorage.setItem(storeKey, id);
    const pillTab = document.querySelector<HTMLElement>(`.az-tab[data-id="${id}"]`);
    if (pillTab) pillTab.focus({ preventScroll: true });
  };

  /* external navigation (wheel menu, palette) */
  useEffect(() => {
    const h = (e: Event) => {
      const id = (e as CustomEvent<SectorId>).detail;
      if (id === "speed") setSpeedOpen(true);
      else setSector(id);
    };
    const snap = () => setSnapOpen(true);
    window.addEventListener("azy-goto", h as EventListener);
    window.addEventListener("azy-snap", snap);
    return () => {
      window.removeEventListener("azy-goto", h as EventListener);
      window.removeEventListener("azy-snap", snap);
    };
  }, [sector]);

  /* premiere link status */
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const s = await premiereStatus();
        if (alive) setStatus(s);
        if (alive) setNetErr("");
      } catch (e) {
        if (alive) setNetErr(String(e));
      }
    };
    tick();
    const id = setInterval(tick, 6000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  /* keyboard: Ctrl+1…9 sectors · Esc clears/closes · Ctrl+Z window-local undo · Shift+Space Snap */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = /INPUT|TEXTAREA|SELECT/.test(tag) || (e.target as HTMLElement)?.isContentEditable;
      const modal = !!document.querySelector(".az-veil");

      if (e.shiftKey && e.code === "Space" && !typing) {
        e.preventDefault();
        setSnapOpen(o => !o);
        return;
      }
      if (e.ctrlKey && !e.altKey && !e.shiftKey && /^Digit[1-9]$/.test(e.code)) {
        const i = +e.code.slice(-1) - 1;
        if (SECTORS[i]) { e.preventDefault(); setSector(SECTORS[i].id); }
        return;
      }
      if (e.key === "Escape" && !modal && !typing) {
        const asked = window.dispatchEvent(new CustomEvent("azy-escape-request", { cancelable: true }));
        if (asked) closeWindow();          // nobody wanted it → hide the workspace
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !typing && !modal) {
        const label = undo();
        if (label) toast("Undone", label, "ok", 1800);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ambient layer holds still while you work (scroll · click · type) */
  useEffect(() => {
    let t: number | undefined;
    const busy = () => {
      document.documentElement.setAttribute("data-busy", "1");
      clearTimeout(t);
      t = window.setTimeout(() => document.documentElement.removeAttribute("data-busy"), 1200);
    };
    ["pointerdown", "wheel", "keydown", "scroll"].forEach(ev => window.addEventListener(ev, busy, { passive: true }));
    return () => {
      clearTimeout(t);
      ["pointerdown", "wheel", "keydown", "scroll"].forEach(ev => window.removeEventListener(ev, busy));
    };
  }, []);

  /* always on top (needs the window permission in the Tauri capability file — see the port doc) */
  useEffect(() => {
    if (!IS_TAURI) return;
    (async () => {
      try {
        const { getCurrentWebviewWindow } = await import("@tauri-apps/api/webviewWindow");
        await getCurrentWebviewWindow().setAlwaysOnTop(getAzy().keepOnTop);
      } catch { /* keep the app usable; the status bar toggle reports the failure */ }
    })();
  }, []);

  const toggleTop = async () => {
    const next = !azy.keepOnTop;
    setAzy({ keepOnTop: next });
    if (!IS_TAURI) { toast(next ? "Always on top: on" : "Always on top: off", "The demo build cannot change a real window.", "ok"); return; }
    try {
      const { getCurrentWebviewWindow } = await import("@tauri-apps/api/webviewWindow");
      await getCurrentWebviewWindow().setAlwaysOnTop(next);
      toast(next ? "Always on top: on" : "Always on top: off", "", "ok", 1600);
    } catch (e) {
      toast("Window setting refused", String(e) + " — add core:window:allow-set-always-on-top to capabilities/default.json.", "err");
    }
  };

  /* gliding pill */
  const pill = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const paint = () => {
      const el = document.querySelector<HTMLElement>(`.az-tab[data-id="${sector}"]`);
      const row = el?.parentElement;
      if (!el || !row || !pill.current) return;
      pill.current.style.transform = `translateX(${el.offsetLeft - 3}px)`;
      pill.current.style.width = `${el.offsetWidth}px`;
      pill.current.classList.add("ready");
    };
    paint();
    window.addEventListener("resize", paint);
    const ro = new ResizeObserver(paint);
    const row = document.querySelector(".az-tabs");
    if (row) ro.observe(row);
    return () => { window.removeEventListener("resize", paint); ro.disconnect(); };
  }, [sector]);

  const cur = SECTORS.find(s => s.id === sector)!;

  return (
    <div className="az-app" data-az="on">
      {/* ambient art, painted from theme tokens only */}
      <div className="az-web" aria-hidden>
        <i /><i /><i />
        <svg viewBox="0 0 400 260" preserveAspectRatio="xMaxYMin slice">
          <g>
            <path d="M400 0 L120 260 M400 0 L210 260 M400 0 L300 260 M400 0 L380 250" />
            <path d="M400 20 Q300 70 180 240 M400 60 Q320 110 240 250 M400 110 Q350 160 330 250" />
            <path d="M400 40 Q280 60 150 200" />
          </g>
        </svg>
      </div>

      {/* header */}
      <header className="az-head">
        <div className="az-sigil" title="Wheel menu (Ctrl/Cmd + 2 by default)" onClick={() => window.dispatchEvent(new Event("ptb-wheel"))}>G</div>
        <div className="az-crumb">
          <b>{cur.title}</b>
          {ctx && <><i /><span title={ctx}>{ctx}</span></>}
        </div>
        <span className="az-grow" />
        <button
          className={cx("az-link", status.connected && !status.demo && "on", status.demo && "demo")}
          title={status.demo ? "Demo build — no Premiere is attached" : status.connected ? `Connected${status.project ? " · " + status.project : ""}` : "Premiere is not connected"}
          onClick={() => toast(
            status.demo ? "Demo build" : status.connected ? "Premiere is connected" : "Premiere is not connected",
            status.demo ? "The layout runs with demo media. Build the desktop app to reach Premiere."
              : status.connected ? (status.project || "The panel is attached to the open project.")
                : "Open Window › Extensions › Premiere Toolbox inside Premiere.",
            status.connected ? "ok" : "err"
          )}
        >
          <i />{status.demo ? "Demo" : status.connected ? "Premiere" : "Offline"}
        </button>
      </header>

      {/* sectors */}
      <nav className="az-tabs" role="tablist" aria-label="Sectors">
        <div className="az-tabs-pill" ref={pill} aria-hidden />
        {SECTORS.map(s => (
          <button
            key={s.id}
            data-id={s.id}
            role="tab"
            aria-selected={sector === s.id}
            className={cx("az-tab", (sector === s.id || (s.id === "speed" && speedOpen)) && "on")}
            title={`${s.title}  ·  Ctrl+${SECTORS.indexOf(s) + 1}`}
            onClick={() => setSector(s.id)}
          >
            {s.icon}
            <span className="az-tab-label">{s.title}</span>
          </button>
        ))}
      </nav>

      {/* workspace */}
      <div className="az-main">
        <section className={cx("az-pane", sector === "files" && "on")} data-dir={sector === "files" ? dir : undefined} aria-hidden={sector !== "files"}>
          <Files active={sector === "files"} onContext={setCtx} status={status} />
        </section>
        <section className={cx("az-pane", sector === "sfx" && "on")} data-dir={sector === "sfx" ? dir : undefined} aria-hidden={sector !== "sfx"}>
          <Sounds active={sector === "sfx"} onContext={setCtx} />
        </section>
        <section className={cx("az-pane", sector === "presets" && "on")} data-dir={sector === "presets" ? dir : undefined} aria-hidden={sector !== "presets"}>
          <Presets active={sector === "presets"} onContext={setCtx} status={status} />
        </section>
        <section className={cx("az-pane", sector === "flow" && "on")} data-dir={sector === "flow" ? dir : undefined} aria-hidden={sector !== "flow"}>
          <Flow active={sector === "flow"} onContext={setCtx} onOpenSpeed={() => setSpeedOpen(true)} />
        </section>
        <section className={cx("az-pane", sector === "captions" && "on")} data-dir={sector === "captions" ? dir : undefined} aria-hidden={sector !== "captions"}>
          <Tools which="captions" onContext={setCtx} />
        </section>
        <section className={cx("az-pane", sector === "download" && "on")} data-dir={sector === "download" ? dir : undefined} aria-hidden={sector !== "download"}>
          <Tools which="download" onContext={setCtx} />
        </section>
        <section className={cx("az-pane", sector === "graph" && "on")} data-dir={sector === "graph" ? dir : undefined} aria-hidden={sector !== "graph"}>
          <Tools which="graph" onContext={setCtx} />
        </section>
        <section className={cx("az-pane", sector === "settings" && "on")} data-dir={sector === "settings" ? dir : undefined} aria-hidden={sector !== "settings"}>
          <SettingsPage onContext={setCtx} status={status} />
        </section>
      </div>

      {/* status bar */}
      <footer className="az-foot">
        <div className="stat" title={netErr || undefined}>
          <i className={cx("dot", status.demo ? "demo" : status.connected && "on")} />
          <span>
            {status.demo ? "Demo build · no Premiere attached"
              : status.connected ? (status.clip ? `Connected · ${status.clip} selected` : "Connected · click a preset to apply")
                : "Premiere not detected · select clips here, then click a preset"}
          </span>
        </div>
        <span className="az-grow" />
        {undoing && <button className="az-chip" title="Undo the last window action (Ctrl+Z)" onClick={() => { const l = undo(); if (l) toast("Undone", l, "ok", 1600); }} style={{ height: 19 }}><Undo2 size={10} />Undo</button>}
        <Ib label="Snap Action (Shift+Space)" onClick={() => setSnapOpen(true)}><Command /></Ib>
        <button className={cx("az-chip", azy.keepOnTop && "on")} onClick={toggleTop} title="Keep this window above Premiere" style={{ height: 19 }}>
          <Check size={10} />On top
        </button>
        <Ib label="Close window (Esc)" onClick={closeWindow}><X /></Ib>
      </footer>

      {speedOpen && <SpeedWindow onClose={() => setSpeedOpen(false)} />}
      {snapOpen && <SnapPalette status={status} onClose={() => setSnapOpen(false)} />}
      <Toaster />
    </div>
  );
}

/* Esc closes the workspace window (the shell is hidden, never destroyed, so state survives) */
export async function closeWindow() {
  if (!IS_TAURI) { toast("Demo build", "The browser preview cannot close a desktop window.", "info", 2200); return; }
  try {
    const { getCurrentWebviewWindow } = await import("@tauri-apps/api/webviewWindow");
    await getCurrentWebviewWindow().hide();
  } catch (e) {
    toast("Could not hide the window", String(e), "err");
  }
}

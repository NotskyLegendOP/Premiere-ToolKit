import { useEffect, useState } from "react";

/* ------------------------------------------------------------------------------------------------
 * Azy state — the dials, modes and preferences that the Azy layout adds on top of the existing
 * Toolbox theme (colour/size theme kept in Settings.tsx `theme8`). Nothing here replaces the theme:
 * the theme still owns every colour, radius and glass value.
 * ---------------------------------------------------------------------------------------------- */

export type Sort = "newest" | "oldest" | "name" | "za" | "type";
export type View = "grid" | "list";
export type HoldMod = "shift" | "alt" | "off";
export type Perf = "full" | "balanced" | "performance";
export type Motion = "system" | "reduced" | "full";

export type Azy = {
  /* interface */
  webOpacity: number;        // 0 – 2   (ambient web strength)
  webDensity: "light" | "normal" | "dense";
  animSpeed: number;         // 0.5 – 2 (2 = twice as fast; nav timing is exempt)
  perf: Perf;
  motion: Motion;
  fps: 60 | 90 | 120;
  keepOnTop: boolean;

  /* files */
  dock: boolean;             // preview dock under the panel
  autoCut: boolean;
  autoScale: boolean;
  view: View;
  sort: Sort;
  thumbs: boolean;

  /* sfx / presets */
  gain: number;              // −24 … +12 dB, remembered on Confirm
  holdMod: HoldMod;          // the hold modifier for "apply with speed" / "sound level"
  soundFolders: SoundFolder[];

  /* flow */
  flowScope: "clip" | "playhead" | "selected";
  moveKeysMode: "start" | "end";

  /* snap */
  snapStarredOnly: boolean;
  snapNeedsSelection: boolean;
  snapHideAfter: boolean;
};

export type SoundFolder = { id: string; name: string; path: string };

export const AZY_DEFAULT: Azy = {
  webOpacity: 1,
  webDensity: "normal",
  animSpeed: 1,
  perf: "full",
  motion: "system",
  fps: 60,
  keepOnTop: true,

  dock: true,
  autoCut: false,
  autoScale: false,
  view: "grid",
  sort: "newest",
  thumbs: true,

  gain: 0,
  holdMod: "shift",
  soundFolders: [{ id: "sfx", name: "SFX", path: "" }],

  flowScope: "clip",
  moveKeysMode: "start",

  snapStarredOnly: false,
  snapNeedsSelection: true,
  snapHideAfter: true,
};

const KEY = "azy.settings.v1";

export const loadAzy = (): Azy => {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "{}");
    return {
      ...AZY_DEFAULT,
      ...raw,
      soundFolders: Array.isArray(raw.soundFolders) && raw.soundFolders.length ? raw.soundFolders : AZY_DEFAULT.soundFolders,
    };
  } catch {
    return AZY_DEFAULT;
  }
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** Apply the dials to <html> so CSS can react without React re-rendering the whole tree. */
export function paintAzy(s: Azy) {
  const r = document.documentElement, st = r.style;
  const speed = clamp(s.animSpeed, 0.5, 2);
  st.setProperty("--az-speed-k", String(1 / speed));      // >1 = slower, <1 = faster
  st.setProperty("--az-web-o", String(clamp(s.webOpacity, 0, 2)));
  st.setProperty("--az-web-n", s.webDensity === "light" ? "0.55" : s.webDensity === "dense" ? "1.5" : "1");
  st.setProperty("--az-fps", String(s.fps));
  r.dataset.perf = s.perf;
  r.dataset.motion = s.motion === "system" ? (matchMedia("(prefers-reduced-motion: reduce)").matches ? "reduced" : "full") : s.motion;
  r.dataset.azView = s.view;
  r.dataset.azDock = s.dock ? "on" : "off";
  r.dataset.azThumbs = s.thumbs ? "on" : "off";
  r.dataset.azDensity = s.webDensity;
  localStorage.setItem(KEY, JSON.stringify(s));
}

/* tiny external store so any page can read/write the same settings */
let current = loadAzy();
const subs = new Set<(s: Azy) => void>();
export const getAzy = () => current;
export function setAzy(patch: Partial<Azy> | ((s: Azy) => Partial<Azy>)) {
  const p = typeof patch === "function" ? patch(current) : patch;
  current = { ...current, ...p };
  paintAzy(current);
  subs.forEach(f => f(current));
}
export function resetAzy() {
  setAzy({ ...AZY_DEFAULT });
}
export function useAzy(): [Azy, (p: Partial<Azy> | ((s: Azy) => Partial<Azy>)) => void] {
  const [, setTick] = useState(0);
  useEffect(() => {
    const f = () => setTick(n => n + 1);
    subs.add(f);
    return () => { subs.delete(f); };
  }, []);
  return [current, setAzy];
}
paintAzy(current);

/* ── window-local undo (files pins, sound folders, view/sort only — never Premiere edits) ────── */
type Undo = { label: string; run: () => void };
const undoStack: Undo[] = [];
export function pushUndo(label: string, run: () => void) {
  undoStack.push({ label, run });
  if (undoStack.length > 30) undoStack.shift();
  window.dispatchEvent(new Event("azy-undo"));
}
export function undo() {
  const u = undoStack.pop();
  if (u) { u.run(); window.dispatchEvent(new Event("azy-undo")); }
  return u?.label ?? "";
}
export function useUndoLabel() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const f = () => setTick(n => n + 1);
    window.addEventListener("azy-undo", f);
    return () => window.removeEventListener("azy-undo", f);
  }, []);
  return undoStack.length ? undoStack[undoStack.length - 1].label : "";
}

/* ── starred / favourite references (path or preset id) ─────────────────────────────────────── */
const STAR = "azy.starred.v1";
export const loadStars = (): string[] => { try { return JSON.parse(localStorage.getItem(STAR) || "[]"); } catch { return []; } };
export const saveStars = (n: string[]) => { localStorage.setItem(STAR, JSON.stringify(n)); window.dispatchEvent(new Event("azy-stars")); };
export function useStars(): [string[], (n: string[]) => void] {
  const [v, setV] = useState<string[]>(loadStars);
  useEffect(() => {
    const f = () => setV(loadStars());
    window.addEventListener("azy-stars", f);
    return () => window.removeEventListener("azy-stars", f);
  }, []);
  const set = (n: string[]) => { saveStars(n); setV(n); };
  return [v, set];
}

/* ── persisted pins (folders pinned in Files) ───────────────────────────────────────────────── */
const PIN = "azy.pins.v1";
export const loadPins = (): string[] => { try { return JSON.parse(localStorage.getItem(PIN) || "[]"); } catch { return []; } };
export const savePins = (n: string[]) => { localStorage.setItem(PIN, JSON.stringify(n)); window.dispatchEvent(new Event("azy-pins")); };

/* ── hold modifier helper ───────────────────────────────────────────────────────────────────── */
export const holdDown = (e: { shiftKey: boolean; altKey: boolean }, mod: HoldMod) =>
  mod === "shift" ? e.shiftKey : mod === "alt" ? e.altKey : false;

export const perfIsLow = (s: Azy) => s.perf === "performance";

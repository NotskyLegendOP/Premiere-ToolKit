import { convertFileSrc, invoke } from "@tauri-apps/api/core";

/* ------------------------------------------------------------------------------------------------
 * One place where the UI talks to Premiere / the machine.
 *
 * In the packaged Tauri app everything goes through the existing `send_curve` / `bridge_status`
 * bridge and the existing Rust commands, exactly like Downloader, Captions and Basic do.
 * In a plain browser (`npm run dev` without Tauri) the same calls resolve against a small demo
 * dataset so the layout can be reviewed without Premiere, without ffmpeg and without a media
 * folder. Nothing in the demo path can ever reach a real project.
 * ---------------------------------------------------------------------------------------------- */

export const IS_TAURI = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export type Asset = {
  name: string;
  path: string;
  ext: string;
  kind: "video" | "audio" | "image" | "other";
  size: number;
  modified?: number;
  demo?: boolean;
};

export type Result = { ok: boolean; msg: string };

export type PresetItem = {
  id: string;
  name: string;
  bin: string;
  kind: "effect" | "preset" | "transition";
  starred?: boolean;
  demo?: boolean;
};

export type SnapItem = PresetItem & { group: string };

export type Status = { connected: boolean; clip?: string; project?: string; demo?: boolean };

/* ── demo data (browser preview only) ───────────────────────────────────────────────────────── */

const KIND_OF: Record<string, Asset["kind"]> = {
  mp4: "video", mov: "video", mkv: "video", webm: "video", m4v: "video",
  mp3: "audio", wav: "audio", flac: "audio", aiff: "audio", m4a: "audio", ogg: "audio",
  png: "image", jpg: "image", jpeg: "image", webp: "image", gif: "image",
};

const demo = (name: string, kind?: Asset["kind"], i = 0): Asset => {
  const ext = name.split(".").pop()!.toLowerCase();
  return {
    name,
    path: "demo://" + encodeURIComponent(name),
    ext,
    kind: kind ?? KIND_OF[ext] ?? "other",
    size: 420_000 + ((name.length * 917_331) % 48_000_000),
    modified: 1_760_000_000 - i * 86_400 * 3,
    demo: true,
  };
};

const FILES_DEMO: Asset[] = [
  demo("A_roll_interview_take3.mp4", "video", 0),
  demo("B_roll_city_night.mov", "video", 1),
  demo("Sunset_drone_4k.mp4", "video", 2),
  demo("Hands_typing_closeup.mp4", "video", 3),
  demo("Logo_sting_alpha.mov", "video", 4),
  demo("Podcast_mic_room.mp3", "audio", 5),
  demo("Room_tone_quiet.wav", "audio", 6),
  demo("Whoosh_transition_01.wav", "audio", 7),
  demo("Title_card_frame.png", "image", 8),
  demo("Grain_texture_overlay.jpg", "image", 9),
  demo("Colour_chart_reference.png", "image", 10),
  demo("Product_turntable_loop.mp4", "video", 11),
  demo("Crowd_applause_wide.wav", "audio", 12),
  demo("Interview_room_wide.png", "image", 13),
];

const SOUNDS_DEMO: Asset[] = [
  demo("Riser_short_01.wav", "audio", 0),
  demo("Impact_deep_hit.wav", "audio", 1),
  demo("Whoosh_fast_02.wav", "audio", 2),
  demo("Click_ui_soft.wav", "audio", 3),
  demo("Sub_drop_boom.wav", "audio", 4),
  demo("Vinyl_crackle_loop.wav", "audio", 5),
  demo("Camera_shutter.wav", "audio", 6),
  demo("Metal_clang_reverb.wav", "audio", 7),
  demo("Swoosh_transition.wav", "audio", 8),
  demo("Keyboard_typing_fast.wav", "audio", 9),
];

const PRESETS_DEMO: PresetItem[] = [
  { id: "p1", name: "Warm Look", bin: "Premiere", kind: "preset", starred: true },
  { id: "p2", name: "Blur In (Scale)", bin: "Transitions", kind: "transition", starred: true },
  { id: "p3", name: "Teal & Orange", bin: "Premiere", kind: "preset", starred: true },
  { id: "p4", name: "Film Grain 16mm", bin: "Premiere", kind: "preset" },
  { id: "p5", name: "Zoom Punch 8%", bin: "Transitions", kind: "transition" },
  { id: "p6", name: "Whip Pan Blur", bin: "Transitions", kind: "transition" },
  { id: "p7", name: "Lumetri Contrast+", bin: "Effects", kind: "effect" },
  { id: "p8", name: "Gaussian Blur", bin: "Effects", kind: "effect" },
  { id: "p9", name: "Motion · Scale 180", bin: "Effects", kind: "effect" },
  { id: "p10", name: "Vignette Soft", bin: "Premiere", kind: "preset" },
  { id: "p11", name: "Halation Glow", bin: "Premiere", kind: "preset" },
  { id: "p12", name: "Slide Up 12%", bin: "Transitions", kind: "transition" },
];

const EASINGS = ["Linear", "Ease In", "Ease Out", "Ease In Out", "Smooth", "Fast", "Slow", "Snappy", "Bounce", "Elastic", "Expo", "Back"];

/* ── generic bridge ─────────────────────────────────────────────────────────────────────────── */

type BridgeReply = { connected?: boolean; result?: string | null; taken?: boolean; replied?: number };

/**
 * Sends one message to the Premiere panel and waits for its reply — same protocol as Basic.tsx.
 * Returns a plain result so every caller can show an honest message instead of a fake success.
 */
async function bridge(payload: Record<string, unknown>, waitMs = 12_000): Promise<Result> {
  if (!IS_TAURI) {
    await sleep(240 + Math.random() * 260);
    return { ok: true, msg: "Demo build — the panel would act on the selected clip." };
  }
  let st: BridgeReply;
  try { st = await invoke<BridgeReply>("bridge_status"); }
  catch (e) { return { ok: false, msg: "The app bridge is not available: " + String(e) }; }
  if (!st?.connected) {
    return { ok: false, msg: "Premiere panel not connected. In Premiere open Window › Extensions › Premiere Toolbox." };
  }
  const id = String(Date.now());
  try { await invoke("send_curve", { json: JSON.stringify({ ...payload, id }) }); }
  catch (e) { return { ok: false, msg: "Could not reach Premiere: " + String(e) }; }

  const until = Date.now() + waitMs;
  while (Date.now() < until) {
    await sleep(300);
    let s: BridgeReply;
    try { s = await invoke<BridgeReply>("bridge_status"); } catch { continue; }
    if (!s?.result) continue;
    try {
      const r = JSON.parse(s.result);
      if (String(r.id) === id) return { ok: !!r.ok, msg: String(r.msg ?? "") };
    } catch { /* keep waiting — a stale reply is not an answer */ }
  }
  return { ok: false, msg: "No response from Premiere. Check the panel is open and up to date." };
}

/* ── machine / files ───────────────────────────────────────────────────────────────────────── */

export async function scanFolder(path: string): Promise<Asset[]> {
  if (!IS_TAURI) {
    await sleep(120);
    // the preview always has something to show, whatever pin is selected
    return path.startsWith("demo://sounds") ? SOUNDS_DEMO : FILES_DEMO;
  }
  if (!path) return [];
  try { return await invoke<Asset[]>("scan_folder_v2", { path }); }
  catch (e) {
    if (!/not found/i.test(String(e))) throw e;
    return await invoke<Asset[]>("scan_folder", { path });
  }
}

export async function pickFolder(): Promise<string | null> {
  if (!IS_TAURI) return "demo://media";
  const { open } = await import("@tauri-apps/plugin-dialog");
  const f = await open({ directory: true });
  return typeof f === "string" ? f : null;
}

export async function pickFile(exts: string[]): Promise<string | null> {
  if (!IS_TAURI) return "";
  const { open } = await import("@tauri-apps/plugin-dialog");
  const f = await open({ multiple: false, filters: [{ name: "File", extensions: exts }] });
  return typeof f === "string" ? f : null;
}

export function fileUrl(path: string): string {
  if (!path || !IS_TAURI) return "";
  try { return convertFileSrc(path); } catch { return ""; }
}

export async function dragOut(paths: string[], kind: Asset["kind"] = "video"): Promise<Result> {
  if (!paths.length) return { ok: false, msg: "Nothing to drag." };
  if (!IS_TAURI) return { ok: true, msg: "Demo build — a real drag needs the desktop app." };
  try {
    const { startDrag } = await import("@crabnebula/tauri-plugin-drag");
    let icon = "";
    try { icon = await invoke<string>("drag_icon"); } catch { /* optional */ }
    void kind;
    await startDrag({ item: paths, icon } as never);
    return { ok: true, msg: "" };
  } catch (e) {
    return { ok: false, msg: "Drag failed: " + String(e) };
  }
}

/* ── Premiere ──────────────────────────────────────────────────────────────────────────────── */

export async function premiereStatus(): Promise<Status> {
  if (!IS_TAURI) return { connected: true, clip: "A_roll_interview_take3.mp4", project: "Demo project", demo: true };
  try {
    const s = await invoke<{ connected?: boolean; selected?: string; project?: string }>("bridge_status");
    return { connected: !!s?.connected, clip: s?.selected, project: s?.project };
  } catch {
    return { connected: false };
  }
}

export async function applyPreset(p: PresetItem, speed?: number): Promise<Result> {
  return bridge({ type: "ptb-preset", name: p.name, bin: p.bin, expectName: p.name, expectBin: p.bin, speed: speed ?? null });
}

export async function placeMedia(a: Asset, opts: { autoCut: boolean; autoScale: boolean }): Promise<Result> {
  return bridge({ type: "ptb-place-media", path: a.path, name: a.name, autoCut: opts.autoCut, autoScale: opts.autoScale });
}

export async function placeAudio(a: Asset, gainDb: number): Promise<Result> {
  return bridge({ type: "ptb-place-audio", path: a.path, name: a.name, gainDb });
}

export async function applyFlow(scope: string, easing: string): Promise<Result> {
  return bridge({ type: "ptb-flow", scope, easing });
}

export async function moveKeys(mode: "start" | "end"): Promise<Result> {
  return bridge({ type: "ptb-move-keys", mode });
}

export async function applySpeed(pct: number, scope: string): Promise<Result> {
  return bridge({ type: "ptb-speed", percent: pct, scope });
}

export async function importToProject(paths: string[]): Promise<Result> {
  return bridge({ type: "ptb-import", paths });
}

/* ── library data ──────────────────────────────────────────────────────────────────────────── */

export async function listPresets(extra: string[] = []): Promise<PresetItem[]> {
  if (!IS_TAURI) { await sleep(180); return PRESETS_DEMO; }
  try {
    const r = await invoke<string | null>("preset_list", { extra });
    if (!r) return [];
    const arr = JSON.parse(r) as PresetItem[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    // The preset index lives in the Rust side; until it answers, the panel's own list is used.
    return [];
  }
}

export async function listSounds(folder: SoundFolderLike): Promise<Asset[]> {
  if (!IS_TAURI) { await sleep(140); return folder.path ? SOUNDS_DEMO : SOUNDS_DEMO; }
  try { return await scanFolder(folder.path); } catch { return []; }
}
type SoundFolderLike = { id: string; name: string; path: string };

export const EASING_LIST = EASINGS;

export const SNAP_GROUPS = ["Effects", "Presets", "Transitions"];

export async function snapSearch(q: string, items: SnapItem[]): Promise<SnapItem[]> {
  if (!IS_TAURI) {
    await sleep(90);
    const t = q.trim().toLowerCase();
    return items.filter(i => !t || i.name.toLowerCase().includes(t) || i.bin.toLowerCase().includes(t) || i.group.toLowerCase().includes(t));
  }
  return snapSearchLocal(q, items);
}

const snapSearchLocal = (q: string, items: SnapItem[]) => {
  const t = q.trim().toLowerCase();
  return items.filter(i => !t || i.name.toLowerCase().includes(t) || i.bin.toLowerCase().includes(t));
};

export async function snapApply(i: SnapItem): Promise<Result> {
  return bridge({ type: "ptb-snap", name: i.name, bin: i.bin, kind: i.kind, expectName: i.name, expectBin: i.bin });
}

export const demoSounds = () => SOUNDS_DEMO;
export const demoPresets = () => PRESETS_DEMO;

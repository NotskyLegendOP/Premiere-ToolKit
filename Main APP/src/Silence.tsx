import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { Scissors, Search as ScanIco, FolderOpen } from "lucide-react";

type ScanRes = { duration: number; silences: [number, number][]; width: number; height: number; fps: number; has_video: boolean; sample_rate: number; channels: number };
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const tm = (s: number) => { const m = Math.floor(s / 60); return m + ":" + String(Math.round(s % 60)).padStart(2, "0"); };
const baseName = (p: string) => p.split(/[\\/]/).pop() || p;

// Cut list: silences shrunk by `pad` on each side, then the parts in between are the ones we keep.
function keepRanges(sc: ScanRes, pad: number): [number, number][] {
  const cuts = [...sc.silences].sort((a, b) => a[0] - b[0]).map(([s, e]) => [s + pad, e - pad] as [number, number]).filter(([s, e]) => e - s > 0.02);
  const keeps: [number, number][] = []; let cur = 0;
  for (const [s, e] of cuts) { if (s - cur > 0.01) keeps.push([cur, s]); cur = Math.max(cur, e); }
  if (sc.duration - cur > 0.01) keeps.push([cur, sc.duration]);
  return keeps;
}

// Final Cut Pro 7 "xmeml" file: Premiere imports it as a new sequence made of the kept parts.
function buildXml(path: string, sc: ScanRes, keeps: [number, number][], fps: number): string {
  const name = baseName(path), hasV = sc.has_video, ch = Math.min(sc.channels || 2, 2);
  const rate = `<rate><timebase>${fps}</timebase><ntsc>FALSE</ntsc></rate>`;
  const totalF = Math.round(sc.duration * fps);
  const url = "file:///" + encodeURI(path.replace(/\\/g, "/")).replace(/#/g, "%23").replace(/\?/g, "%3F");
  const vChar = `<samplecharacteristics>${rate}<width>${sc.width || 1920}</width><height>${sc.height || 1080}</height><anamorphic>FALSE</anamorphic><pixelaspectratio>square</pixelaspectratio><fielddominance>none</fielddominance></samplecharacteristics>`;
  const fileFull = `<file id="file-1"><name>${esc(name)}</name><pathurl>${esc(url)}</pathurl>${rate}<duration>${totalF}</duration><media>${hasV ? `<video>${vChar}</video>` : ""}<audio><samplecharacteristics><depth>16</depth><samplerate>${sc.sample_rate}</samplerate></samplecharacteristics><channelcount>${ch}</channelcount></audio></media></file>`;
  let fileDone = false;
  const segs: { ts: number; d: number; i: number }[] = []; let ts = 0;
  for (const [s, e] of keeps) { const i = Math.round(s * fps), d = Math.round(e * fps) - i; if (d > 0) { segs.push({ ts, d, i }); ts += d; } }

  const group = (k: number) => [...(hasV ? [{ id: `v-${k}`, t: "video", ti: 1 }] : []), ...Array.from({ length: ch }, (_, c) => ({ id: `a${c + 1}-${k}`, t: "audio", ti: c + 1 }))];
  const item = (id: string, type: "video" | "audio", ti: number, k: number, g: { ts: number; d: number; i: number }) => {
    const f = fileDone ? `<file id="file-1"/>` : fileFull; fileDone = true;
    const links = group(k).map(m => `<link><linkclipref>${m.id}</linkclipref><mediatype>${m.t}</mediatype><trackindex>${m.ti}</trackindex><clipindex>${k}</clipindex></link>`).join("");
    return `<clipitem id="${id}"><masterclipid>masterclip-1</masterclipid><name>${esc(name)}</name><enabled>TRUE</enabled><duration>${totalF}</duration>${rate}<start>${g.ts}</start><end>${g.ts + g.d}</end><in>${g.i}</in><out>${g.i + g.d}</out>${f}<sourcetrack><mediatype>${type}</mediatype><trackindex>${ti}</trackindex></sourcetrack>${links}</clipitem>`;
  };
  const video = hasV ? `<video><format>${vChar}</format><track>${segs.map((g, n) => item(`v-${n + 1}`, "video", 1, n + 1, g)).join("")}</track></video>` : "";
  const audioTracks = Array.from({ length: ch }, (_, c) => `<track>${segs.map((g, n) => item(`a${c + 1}-${n + 1}`, "audio", c + 1, n + 1, g)).join("")}</track>`).join("");
  const audio = `<audio><numOutputChannels>${ch}</numOutputChannels><format><samplecharacteristics><depth>16</depth><samplerate>${sc.sample_rate}</samplerate></samplecharacteristics></format>${audioTracks}</audio>`;
  return `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE xmeml>\n<xmeml version="4"><sequence id="sequence-1"><name>${esc(name.replace(/\.[^.]+$/, ""))} (silence removed)</name><duration>${ts}</duration>${rate}<media>${video}${audio}</media></sequence></xmeml>\n`;
}

export default function Silence() {
  const [file, setFile] = useState(() => localStorage.getItem("sil.file") || "");
  const [thr, setThr] = useState(() => +(localStorage.getItem("sil.thr") || -35));
  const [minS, setMinS] = useState(() => +(localStorage.getItem("sil.min") || 0.4));
  const [pad, setPad] = useState(() => +(localStorage.getItem("sil.pad") || 0.05));
  const [busy, setBusy] = useState(false), [msg, setMsg] = useState(""), [xmlPath, setXmlPath] = useState("");
  const save = (k: string, v: number, set: (n: number) => void) => { set(v); localStorage.setItem(k, String(v)); };

  const pick = async () => {
    const f = await open({ multiple: false, filters: [{ name: "Video / audio", extensions: ["mp4", "mov", "mkv", "avi", "webm", "m4v", "mxf", "mp3", "wav", "m4a", "aac", "flac", "ogg"] }] });
    if (typeof f === "string") { setFile(f); localStorage.setItem("sil.file", f); setMsg(""); setXmlPath(""); }
  };

  const analyze = async (): Promise<{ sc: ScanRes; keeps: [number, number][] } | null> => {
    if (!file) { setMsg("Choose a video or audio file first."); return null; }
    setMsg("Analyzing audio…");
    try {
      const sc = await invoke<ScanRes>("silence_scan", { path: file, thr, minS });
      const keeps = keepRanges(sc, pad);
      const kept = keeps.reduce((s, [a, b]) => s + (b - a), 0);
      setMsg(`${sc.silences.length} silent parts found · ${tm(sc.duration - kept)} removed · ${tm(sc.duration)} → ${tm(kept)}` + (sc.has_video ? ` · ${sc.width}x${sc.height} @ ${sc.fps || "?"} fps` : " · audio only"));
      return { sc, keeps };
    } catch (e) { setMsg("Failed: " + String(e)); return null; }
  };

  const sendImport = async (p: string): Promise<string> => {
    const st = await invoke<{ connected: boolean }>("bridge_status");
    if (!st.connected) return "Premiere panel not connected.";
    const id = String(Date.now());
    await invoke("send_curve", { json: JSON.stringify({ type: "ptb-import", id, paths: [p] }) });
    for (let n = 0; n < 50; n++) {
      await sleep(400);
      const s = await invoke<{ result: string | null }>("bridge_status");
      if (!s.result) continue;
      try { const r = JSON.parse(s.result); if (r.id !== id) continue; return (r.ok ? "" : "Premiere said: ") + r.msg; } catch { continue; }
    }
    return "No response from Premiere.";
  };

  const create = async () => {
    setBusy(true); setXmlPath("");
    const a = await analyze();
    if (a) {
      if (!a.keeps.length) { setMsg("Everything is silent with these settings. Lower the threshold."); setBusy(false); return; }
      try {
        const fps = a.sc.has_video && a.sc.fps > 0 ? Math.round(a.sc.fps) : 30;
        const out = file.replace(/\.[^.\\/]+$/, "") + "_silence-removed.xml";
        await invoke("write_text", { path: out, content: buildXml(file, a.sc, a.keeps, fps) });
        setXmlPath(out);
        const r = await sendImport(out);
        setMsg(m => m + "\n" + (r.startsWith("Premiere panel not") || r.startsWith("No response") || r.startsWith("Premiere said") ? r + " In Premiere use File > Import and pick the XML below." : "Imported into Premiere: " + r + ". Look for the new sequence in the Project panel."));
      } catch (e) { setMsg(m => m + "\nFailed: " + String(e)); }
    }
    setBusy(false);
  };

  const sl = (label: string, v: number, set: (n: number) => void, min: number, max: number, step: number, unit: string) =>
    <div className="cr"><span>{label}</span><input type="range" min={min} max={max} step={step} value={v} onChange={e => set(+e.target.value)} /><input className="nm" type="number" step="any" value={v} onChange={e => e.target.value !== "" && set(+e.target.value)} /><em>{unit}</em></div>;

  return (
    <div className="settings">
      <h3 style={{ marginTop: 0 }}>Silence remover</h3>
      <div className="meta" style={{ marginBottom: 8 }}>Pick a video or audio file. The quiet parts are cut out and Premiere gets a new sequence made of the rest. Your current timeline is not changed. Needs ffmpeg.</div>
      <div className="pathrow"><FolderOpen size={13} /><span className="path" title={file}>{file || "No file chosen"}</span><button onClick={pick}><FolderOpen size={13} />Choose file</button></div>
      {sl("Threshold", thr, n => save("sil.thr", n, setThr), -70, -10, 1, "dB")}
      {sl("Min silence", minS, n => save("sil.min", n, setMinS), 0.1, 3, 0.05, "s")}
      {sl("Padding", pad, n => save("sil.pad", n, setPad), 0, 0.5, 0.01, "s")}
      <div className="row" style={{ marginTop: 10 }}>
        <button disabled={busy} onClick={async () => { setBusy(true); await analyze(); setBusy(false); }}><ScanIco size={13} />Analyze</button>
        <button className="acc" disabled={busy} onClick={create}><Scissors size={13} />Create sequence</button>
      </div>
      {msg && <pre className="dlog">{msg}</pre>}
      {xmlPath && <div className="meta" style={{ userSelect: "text", wordBreak: "break-all" }}>XML: {xmlPath}</div>}
    </div>
  );
}

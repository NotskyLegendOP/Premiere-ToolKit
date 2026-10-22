import React, { useCallback, useRef, useState } from "react";
import { invoke, convertFileSrc } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { startDrag } from "@crabnebula/tauri-plugin-drag";
import { Captions as CapIcon, FolderOpen, Send, Copy, GripVertical, RefreshCw, Wrench, Plus, Trash2, ChevronDown, Loader2 } from "lucide-react";

type Cue = { s: number; e: number; t: string };
type WCue = Cue & { id: number };
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const L = (k: string, d: string) => localStorage.getItem(k) ?? d;
const base = (p: string) => p.split(/[\\/]/).pop() || p;

// ---- SRT parsing / building (times in milliseconds) ----
function parseSrt(txt: string): Cue[] {
  const out: Cue[] = [];
  for (const blk of txt.replace(/\r/g, "").split(/\n\n+/)) {
    const lines = blk.split("\n").filter(x => x.trim() !== "");
    const i = lines.findIndex(l => l.includes("-->")); if (i < 0) continue;
    const m = lines[i].match(/(\d+):(\d+):(\d+)[,.](\d+)\s*-->\s*(\d+):(\d+):(\d+)[,.](\d+)/); if (!m) continue;
    const f = (h: string, mi: string, s: string, ms: string) => ((+h * 60 + +mi) * 60 + +s) * 1000 + +ms.padEnd(3, "0").slice(0, 3);
    out.push({ s: f(m[1], m[2], m[3], m[4]), e: f(m[5], m[6], m[7], m[8]), t: lines.slice(i + 1).join(" ") });
  }
  return out;
}
// remove every dot/comma/other punctuation, keep letters, digits, inner apostrophes and hyphens
const clean = (t: string) => t.replace(/[\u2018\u2019]/g, "'").replace(/[^\p{L}\p{M}\p{N}'\-]/gu, "").replace(/^[-']+|[-']+$/g, "");
const cap = (w: string) => w.replace(/^(['-]*)(\p{L})/u, (_, a, b) => a + b.toUpperCase());

// ---- Audio analysis: find where speech really is, so words are placed on real sound instead of guessed ----
type Env = { voiced: Uint8Array; hop: number };
async function analyse(url: string): Promise<Env> {
  const r = await fetch(url); if (!r.ok) throw new Error("cannot read the file (" + r.status + ")");
  if (+(r.headers.get("content-length") || 0) > 400e6) throw new Error("file is too big to analyse, use an audio file");
  const buf = await r.arrayBuffer(), ctx = new AudioContext(); let ab: AudioBuffer;
  try { ab = await ctx.decodeAudioData(buf); } finally { ctx.close(); }
  const hop = 10, step = Math.max(1, Math.round(ab.sampleRate * hop / 1000)), n = Math.floor(ab.length / step), db = new Float32Array(n);
  for (let c = 0; c < ab.numberOfChannels; c++) { const d = ab.getChannelData(c); for (let i = 0; i < n; i++) { let s = 0; for (let j = i * step, e = j + step; j < e; j++) s += d[j] * d[j]; db[i] += s; } }
  for (let i = 0; i < n; i++) db[i] = 10 * Math.log10(db[i] / (step * ab.numberOfChannels) + 1e-10);
  const so = Float32Array.from(db).sort(), p10 = so[Math.floor(n * 0.1)] ?? -80, p95 = so[Math.floor(n * 0.95)] ?? -20;
  const thr = Math.max(p10 + 0.3 * (p95 - p10), p95 - 30), v = new Uint8Array(n);
  for (let i = 0; i < n; i++) v[i] = db[i] > thr ? 1 : 0;
  const runs = (val: number, maxLen: number) => { for (let i = 0; i < n;) { let j = i; while (j < n && v[j] === v[i]) j++; if (v[i] === val && j - i < maxLen && i > 0 && j < n) v.fill(1 - val, i, j); i = j; } };
  runs(0, 6);   // bridge gaps shorter than 60 ms (inside a word)
  runs(1, 3);   // drop clicks shorter than 30 ms
  return { voiced: v, hop };
}
const syl = (x: string) => /^[\p{Script=Latin}'\-\d]+$/u.test(x) ? Math.max(1, (x.toLowerCase().match(/[aeiouy]+/g) || []).length) : Math.max(1, Math.ceil(x.length / 2));

function buildWords(cues: Cue[], offMs: number, nudge: number, holdMs: number, env?: Env): Cue[] {
  const w: Cue[] = [], cs = cues.filter(c => { const r = c.t.trim(); return r && !/^[\[(].*[\])]$/.test(r); });   // drop [BLANK_AUDIO], (music) ...
  const fr = (ms: number) => Math.max(0, Math.min(env ? env.voiced.length : 0, Math.round(ms / (env?.hop || 10))));
  const spansIn = (a: number, b: number) => {
    const out: [number, number][] = [], h = env!.hop; let st = -1;
    for (let i = fr(a), z = fr(b); i <= z; i++) { const v = i < z && env!.voiced[i] === 1; if (v && st < 0) st = i; else if (!v && st >= 0) { out.push([st * h, i * h]); st = -1; } }
    return out;
  };
  cs.forEach((c, ci) => {
    const parts = c.t.trim().split(/\s+/), words = parts.map(clean);
    let spans: [number, number][] | null = null;
    if (env) {
      const pv = cs[ci - 1], nx = cs[ci + 1];
      const lo = Math.min(c.s, Math.max(c.s - 250, pv ? (pv.e + c.s) / 2 : 0)), hi = Math.max(c.e, Math.min(c.e + 250, nx ? (c.e + nx.s) / 2 : c.e + 250));
      const sp = spansIn(lo, hi); if (sp.length && sp.reduce((a, [x, y]) => a + y - x, 0) >= 100) spans = sp;
    }
    if (!spans) {                                                                     // no audio info: spread by letters across the line
      const wt = words.map(x => Math.max(1, x.length)), tot = wt.reduce((a, b) => a + b, 0); let t0 = c.s;
      words.forEach((x, k) => { const d = ((c.e - c.s) * wt[k]) / tot; if (x) w.push({ s: t0, e: t0 + d, t: cap(x) }); t0 += d; });
      return;
    }
    const wt = words.map(x => (x ? syl(x) * 2 + x.length * 0.5 : 0.5)), tot = wt.reduce((a, b) => a + b, 0), V = spans.reduce((a, [x, y]) => a + y - x, 0);
    const at = (v: number, end: boolean) => { let acc = 0; for (const [a, b] of spans!) { const L = b - a; if (v < acc + L || (end && v <= acc + L + 1e-6)) return a + Math.min(L, Math.max(0, v - acc)); acc += L; } return spans![spans!.length - 1][1]; };
    const edges: number[] = []; { let acc = 0; spans.forEach(([a, b], i) => { acc += b - a; if (i < spans!.length - 1) edges.push(acc); }); }
    const bd: number[] = [0], used = new Set<number>(); { let cum = 0; wt.forEach((q, k) => { cum += q; let v = (cum / tot) * V; if (k < wt.length - 1) { let best = 150, bi = -1; edges.forEach((e, i) => { if (!used.has(i) && Math.abs(e - v) < best) { best = Math.abs(e - v); bi = i; } }); if (bi >= 0) { used.add(bi); v = edges[bi]; } } bd.push(v); }); }
    for (let k = 1; k < bd.length; k++) bd[k] = Math.max(bd[k], bd[k - 1]);          // snapping to a pause must never reorder words
    words.forEach((x, k) => { if (x) w.push({ s: at(bd[k], false), e: at(bd[k + 1], true), t: cap(x) }); });
  });
  w.sort((a, b) => a.s - b.s);
  for (let i = 0; i < w.length; i++) {
    const nx = w[i + 1];
    if (nx && nx.s - w[i].e <= holdMs) w[i].e = nx.s;                               // no flicker between words spoken back to back
    if (nx && w[i].e > nx.s) w[i].e = nx.s;                                          // never overlap
    if (w[i].e - w[i].s < 30) w[i].e = nx ? Math.max(w[i].s + 1, Math.min(w[i].s + 30, nx.s)) : w[i].s + 30;
  }
  return w.map(x => ({ ...x, s: Math.max(0, Math.round(x.s + offMs + nudge)), e: Math.max(1, Math.round(x.e + offMs + nudge)) }));
}
const p2 = (n: number) => String(n).padStart(2, "0");
const ts = (ms: number) => { ms = Math.max(0, Math.round(ms)); return `${p2(Math.floor(ms / 3600000))}:${p2(Math.floor(ms / 60000) % 60)}:${p2(Math.floor(ms / 1000) % 60)},${String(ms % 1000).padStart(3, "0")}`; };
const toSrt = (c: Cue[]) => c.map((x, i) => `${i + 1}\r\n${ts(x.s)} --> ${ts(x.e)}\r\n${x.t}\r\n`).join("\r\n");


// One editable word. memo + uncontrolled input = typing never re-renders the whole list.
const Row = React.memo(function Row({ i, c, onSet, onDel, onAdd }: { i: number; c: WCue; onSet: (id: number, t: string) => void; onDel: (id: number) => void; onAdd: (id: number) => void }) {
  return (
    <div className="wrow">
      <span className="wn">{i + 1}</span>
      <span className="wtm">{ts(c.s).slice(3)}</span>
      <input defaultValue={c.t} spellCheck={false} onBlur={e => onSet(c.id, e.target.value)} onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }} />
      <button className="wb" title="Add a word after this one" onClick={() => onAdd(c.id)}><Plus size={12} /></button>
      <button className="wb" title="Delete this word" onClick={() => onDel(c.id)}><Trash2 size={12} /></button>
    </div>
  );
});

export default function Captions() {
  const [media, setMedia] = useState(() => L("cap.media", ""));
  const [ffmpeg, setFfmpeg] = useState(() => L("cap.ffmpeg", "ffmpeg"));
  const [whisper, setWhisper] = useState(() => L("cap.whisper", ""));
  const [model, setModel] = useState(() => L("cap.model", ""));
  const [lang, setLang] = useState(() => L("cap.lang", "auto"));
  const [tl, setTl] = useState(() => +L("cap.tl", "0"));
  const [nudge, setNudge] = useState(() => +L("cap.nudge", "0"));
  const [hold, setHold] = useState(() => +L("cap.hold", "300"));
  const [snap, setSnap] = useState(() => L("cap.snap", "1") === "1"), envRef = useRef<Env | null>(null);
  const [setup, setSetup] = useState(false), [adv, setAdv] = useState(false);
  const [busy, setBusy] = useState(false), [msg, setMsg] = useState("");
  const [raw, setRaw] = useState("");
  const [res, setRes] = useState<{ srt: string; txt: string } | null>(null);
  const [cues, setCues] = useState<WCue[]>([]);
  const [dirty, setDirty] = useState(false);
  const [limit, setLimit] = useState(300);
  const cuesRef = useRef<WCue[]>([]), pathsRef = useRef<{ srt: string; txt: string } | null>(null);
  const uid = useRef(1), timer = useRef<number | undefined>(undefined);
  const put = (k: string, v: string, set: (s: string) => void) => { set(v); localStorage.setItem(k, v); };
  const putN = (k: string, v: number, set: (n: number) => void) => { set(v); localStorage.setItem(k, String(v)); };
  const pick = async (k: string, set: (s: string) => void, name: string, ext: string[]) => { const f = await open({ multiple: false, filters: [{ name, extensions: ext }] }); if (typeof f === "string") put(k, f, set); };

  // ---- editing: every change is saved to the .srt/.txt after a short pause ----
  const persist = (list: WCue[]) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(async () => {
      const p = pathsRef.current; if (!p) return;
      const srt = toSrt(list);
      try { await invoke("save_text_file", { path: p.srt, content: srt }); await invoke("save_text_file", { path: p.txt, content: srt }); setMsg(`Saved. ${list.length} words.`); }
      catch (e) { setMsg("Save failed: " + String(e)); }
    }, 400);
  };
  const apply = (n: WCue[]) => { cuesRef.current = n; setCues(n); setDirty(true); persist(n); };
  const onSet = useCallback((id: number, t: string) => {
    const l = cuesRef.current, k = l.findIndex(x => x.id === id); if (k < 0) return;
    const v = t.trim(); if (v === l[k].t) return;
    if (!v) { apply(l.filter(x => x.id !== id)); return; }               // emptied word = delete it
    const n = l.slice(); n[k] = { ...l[k], t: v }; apply(n);
  }, []);
  const onDel = useCallback((id: number) => apply(cuesRef.current.filter(x => x.id !== id)), []);
  const onAdd = useCallback((id: number) => {
    const l = cuesRef.current, k = l.findIndex(x => x.id === id); if (k < 0) return;
    const c = l[k], nx = l[k + 1], e = nx ? Math.max(c.e + 1, Math.min(c.e + 250, nx.s)) : c.e + 250;
    const n = l.slice(); n.splice(k + 1, 0, { id: uid.current++, s: c.e, e, t: "Word" }); apply(n);
  }, []);

  const finish = async (srtRaw: string, note = "") => {
    const built = buildWords(parseSrt(srtRaw), Math.round(tl * 1000), nudge, hold, snap ? envRef.current ?? undefined : undefined);
    if (!built.length) { setMsg("No speech was found in this file."); return; }
    const list: WCue[] = built.map(x => ({ ...x, id: uid.current++ }));
    const srt = toSrt(list), out = media.replace(/\.[^.\\/]+$/, "") + "_words";
    await invoke("save_text_file", { path: out + ".srt", content: srt });
    await invoke("save_text_file", { path: out + ".txt", content: srt });
    pathsRef.current = { srt: out + ".srt", txt: out + ".txt" };
    cuesRef.current = list; setCues(list); setDirty(false); setLimit(300);
    setRes({ srt: out + ".srt", txt: out + ".txt" });
    setMsg(`Done. ${list.length} words. First word appears at ${ts(list[0].s)}, last one leaves at ${ts(list[list.length - 1].e)}. Click any word below to fix it.${note}`);
  };
  const generate = async () => {
    if (!media) { setMsg("Choose the voice-over file first."); return; }
    if (!whisper || !model) { setMsg("Set the whisper.cpp program and the model in Setup first."); setSetup(true); return; }
    setBusy(true); setRes(null); setCues([]); cuesRef.current = []; setMsg("Extracting the audio and transcribing. A long voice-over can take a few minutes...");
    try { const r = await invoke<string>("words_srt", { req: { media, start: 0, dur: 0, ffmpeg, whisper, model, lang, threads: 0 } }); setRaw(r); let note = ""; envRef.current = null;
      if (snap) { setMsg("Transcribed. Now matching the words to the real sound..."); try { envRef.current = await analyse(convertFileSrc(media)); } catch (e) { note = "\nAudio sync was skipped (" + String(e instanceof Error ? e.message : e) + "), so word times are estimated."; } }
      await finish(r, note); }
    catch (e) { setMsg("Failed: " + String(e)); }
    setBusy(false);
  };
  const rebuild = async () => {
    if (!raw) return;
    if (dirty && !confirm("Rebuild will throw away your word edits. Continue?")) return;
    setBusy(true); try { await finish(raw); } catch (e) { setMsg("Failed: " + String(e)); } setBusy(false);
  };

  const sendImport = async () => {
    if (!res) return; window.clearTimeout(timer.current);
    try { const srt = toSrt(cuesRef.current); await invoke("save_text_file", { path: res.srt, content: srt }); await invoke("save_text_file", { path: res.txt, content: srt }); } catch (e) { setMsg("Save failed: " + String(e)); return; }
    const st = await invoke<{ connected: boolean }>("bridge_status");
    if (!st.connected) { setMsg("Premiere panel not connected. In Premiere use File > Import and pick the .srt, or drag it in."); return; }
    const id = String(Date.now()); await invoke("send_curve", { json: JSON.stringify({ type: "ptb-import", id, paths: [res.srt] }) });
    for (let n = 0; n < 50; n++) { await sleep(400); const s = await invoke<{ result: string | null }>("bridge_status"); if (!s.result) continue;
      try { const r = JSON.parse(s.result); if (r.id !== id) continue; setMsg((r.ok ? "Imported into Premiere: " : "Premiere said: ") + r.msg); return; } catch { continue; } }
    setMsg("No response from Premiere.");
  };
  const dragStart = (e: React.MouseEvent) => {
    if (!res) return; const x0 = e.clientX, y0 = e.clientY;
    const mv = async (m: MouseEvent) => { if (Math.hypot(m.clientX - x0, m.clientY - y0) < 6) return; cl();
      try { const icon = await invoke<string>("drag_icon"); await startDrag({ item: [res.srt], icon }); } catch (er) { setMsg("Drag failed: " + String(er)); } };
    const cl = () => { window.removeEventListener("mousemove", mv); window.removeEventListener("mouseup", cl); };
    window.addEventListener("mousemove", mv); window.addEventListener("mouseup", cl);
  };
  const row = (label: string, v: string, btn: () => void, ph: string) => (
    <div className="cpick">
      <span className="cpl">{label}</span>
      <span className={"cpp" + (v ? "" : " empty")} title={v}>{v ? base(v) : ph}</span>
      <button onClick={btn}><FolderOpen size={13} />Browse</button>
    </div>
  );
  const num = (label: string, unit: string, hint: string, v: number, k: string, set: (n: number) => void, step: string) => (
    <label className="cnum" title={hint}>
      <span>{label}</span>
      <div><input type="number" step={step} value={v} onChange={e => e.target.value !== "" && putN(k, +e.target.value, set)} /><em>{unit}</em></div>
      <small>{hint}</small>
    </label>
  );

  return (
    <div className="cap">
      <div className="caph">
        <span className="capi"><CapIcon size={16} /></span>
        <div><b>Word captions</b><small>Turn a voice-over into a word-by-word SRT</small></div>
      </div>

      <div className="csec"><i>1</i><span>Voice-over file</span></div>
      {row("File", media, () => pick("cap.media", setMedia, "Audio / video", ["wav", "mp3", "m4a", "aac", "flac", "ogg", "mp4", "mov", "mkv", "webm"]), "No file chosen")}

      <div className="csec"><i>2</i><span>Language</span></div>
      <select className="clang" value={lang} onChange={e => put("cap.lang", e.target.value, setLang)}>{[["auto", "Auto detect"], ["en", "English"], ["hi", "Hindi"], ["es", "Spanish"], ["fr", "French"], ["de", "German"], ["pt", "Portuguese"], ["ar", "Arabic"], ["ja", "Japanese"]].map(([v, n]) => <option key={v} value={v}>{n}</option>)}</select>

      <button className="cadv" onClick={() => setAdv(!adv)}><ChevronDown size={13} style={{ transform: adv ? "rotate(180deg)" : "none", transition: "transform .2s" }} />{adv ? "Hide" : "Show"} timing options</button>
      {adv && <div className="cnums">
        {num("Timeline start", "s", "Where the voice-over starts on the timeline (0 = at the start)", tl, "cap.tl", setTl, "any")}
        {num("Nudge", "ms", "Shift every word earlier (-) or later (+)", nudge, "cap.nudge", setNudge, "10")}
        {num("Hold", "ms", "Gaps shorter than this keep the word on screen until the next one", hold, "cap.hold", setHold, "50")}
      </div>}

      <label className="tgl" title="Places every word on the real speech in your audio instead of guessing from letter counts"><input type="checkbox" checked={snap} onChange={e => { setSnap(e.target.checked); localStorage.setItem("cap.snap", e.target.checked ? "1" : "0"); }} /><i /><span>Sync words to the audio (more accurate)</span></label>

      <div className="cgo">
        <button className="acc big" disabled={busy} onClick={generate}>{busy ? <Loader2 size={15} className="spin" /> : <CapIcon size={15} />}{busy ? "Working..." : "Generate SRT"}</button>
        <div className="csub">
          <button className="ghost" disabled={busy || !raw} onClick={rebuild} title="Apply Nudge / Hold / Timeline start again without transcribing"><RefreshCw size={12} />Rebuild</button>
          <button className="ghost" onClick={() => setSetup(!setup)}><Wrench size={12} />Setup</button>
        </div>
      </div>

      {setup && <div className="csetup">
        {row("whisper", whisper, () => pick("cap.whisper", setWhisper, "whisper-cli.exe", ["exe"]), "Choose whisper-cli.exe")}
        {row("Model", model, () => pick("cap.model", setModel, "Whisper model", ["bin"]), "Choose a ggml-*.bin model")}
        {row("ffmpeg", ffmpeg, () => pick("cap.ffmpeg", setFfmpeg, "ffmpeg.exe", ["exe"]), "ffmpeg (leave as is if it is on PATH)")}
        <div className="meta">Needs the free whisper.cpp program (whisper-cli.exe) and one model file such as ggml-large-v3-turbo.bin. Bigger models are slower but time the words better. For Hindi or mixed languages use a model without .en.</div>
      </div>}

      {msg && <pre className="dlog">{msg}</pre>}
      {res && <>
        <div className="csec"><i>3</i><span>Words ({cues.length}) - click one to fix it</span></div>
        <div className="wl">
          {cues.slice(0, limit).map((c, i) => <Row key={c.id} i={i} c={c} onSet={onSet} onDel={onDel} onAdd={onAdd} />)}
          {cues.length > limit && <button style={{ margin: 6 }} onClick={() => setLimit(limit + 300)}>Show more ({cues.length - limit} left)</button>}
        </div>
        <div className="cgo">
          <button className="acc big" onClick={sendImport}><Send size={15} />Import to Premiere</button>
          <div className="csub">
            <button className="ghost" onMouseDown={dragStart} style={{ cursor: "grab" }} title="Drag this into Premiere"><GripVertical size={12} />Drag SRT</button>
            <button className="ghost" onClick={() => navigator.clipboard.writeText(res.srt)}><Copy size={12} />Copy path</button>
          </div>
        </div>
        <div className="meta" style={{ userSelect: "text", wordBreak: "break-all", textAlign: "center" }}>{res.srt}</div>
      </>}
    </div>
  );
}

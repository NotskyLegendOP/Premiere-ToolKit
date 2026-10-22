import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Layers, Eraser, Copy, RefreshCw, Package, ImagePlus, Type, SlidersHorizontal, Square, Zap, Loader2 } from "lucide-react";

// Every button here sends one message to the Premiere panel through the same bridge the
// Downloader and Captions already use, then waits for the panel's answer.
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function ask(payload: Record<string, unknown>): Promise<{ ok: boolean; msg: string }> {
  const st = await invoke<{ connected: boolean }>("bridge_status");
  if (!st.connected) return { ok: false, msg: "Premiere panel not connected. In Premiere open Window > Extensions > Premiere Toolbox." };
  const id = String(Date.now());
  await invoke("send_curve", { json: JSON.stringify({ ...payload, id }) });
  // Only one message is in flight at a time and the app clears the old reply when it sends,
  // so a reply whose id looks different is still the answer to this message (it is used after ~2 s).
  let fb: { ok?: boolean; msg?: unknown } | null = null, odd = 0, raw = "";
  for (let n = 0; n < 30; n++) {
    await sleep(400);
    const s = await invoke<{ result: string | null }>("bridge_status");
    if (!s.result) continue;
    raw = s.result;
    try { const r = JSON.parse(s.result); if (String(r.id) === id) return { ok: !!r.ok, msg: String(r.msg ?? "") }; fb = r; } catch { fb = null; }
    if (++odd >= 5) break;
  }
  if (fb) return { ok: !!fb.ok, msg: String(fb.msg ?? "") };
  if (raw) return { ok: false, msg: "Premiere's reply could not be read. It was: " + raw.slice(0, 300) };
  // Say exactly where the message got stuck.
  let why = "";
  try {
    const s = await invoke<{ taken?: boolean; replied?: number }>("bridge_status");
    if (s.taken === false) why = "The panel never picked the message up. Check that the panel in Premiere shows \"connected\" and that only one Premiere Toolbox app is running.";
    else if (s.taken && s.replied === -1) why = "The panel picked it up but never answered (it may have crashed on this action).";
    else if (s.taken && s.replied === 0) why = "The panel answered with an empty reply.";
    else if (s.taken) why = "The panel answered, but the app could not match the reply.";
  } catch { /* old app build without these fields */ }
  return { ok: false, msg: "No response from Premiere. " + (why || "Replace src-tauri/src/main.rs with the new one and restart the app.") };
}

type Act = { id: string; label: string; hint: string; icon: React.ReactNode };
const GRID: Act[] = [
  { id: "nestsep", label: "Nest sep", hint: "Nest each selected clip on its own", icon: <Layers size={13} /> },
  { id: "purge", label: "Purge", hint: "Remove unused items from the project", icon: <Eraser size={13} /> },
  { id: "truedup", label: "True dup", hint: "Find items that are the same file", icon: <Copy size={13} /> },
  { id: "smartsync", label: "Smart synchronise", hint: "Line up the selected clips", icon: <RefreshCw size={13} /> },
];
const UNNEST: Act = { id: "unnest", label: "Un-nest", hint: "Turn a nest back into its clips", icon: <Package size={13} /> };
const LAYERS: Act[] = [
  { id: "textlayer", label: "Text", hint: "Add a text layer", icon: <Type size={13} /> },
  { id: "adjustment", label: "Adjustment", hint: "Add an adjustment layer", icon: <SlidersHorizontal size={13} /> },
  { id: "solid", label: "Solid", hint: "Add a solid in the color on the right", icon: <Square size={13} /> },
];

export default function Basic() {
  const [conn, setConn] = useState(false), [busy, setBusy] = useState(""), [msg, setMsg] = useState("");
  const [solid, setSolid] = useState(() => localStorage.getItem("basic.solid") || "#ffffff");
  useEffect(() => {
    let on = true;
    const t = async () => { try { const s = await invoke<{ connected: boolean }>("bridge_status"); if (on) setConn(s.connected); } catch { if (on) setConn(false); } };
    t(); const id = setInterval(t, 1500);
    return () => { on = false; clearInterval(id); };
  }, []);

  const run = async (action: string, extra: Record<string, unknown> = {}) => {
    if (busy) return; setBusy(action); setMsg("Sending to Premiere…");
    try { const r = await ask({ type: "ptb-action", action, ...extra }); setMsg((r.ok ? "Done: " : "Premiere said: ") + r.msg); }
    catch (e) { setMsg("Failed: " + String(e)); } finally { setBusy(""); }
  };

  const probe = async () => {
    if (busy) return; setBusy("probe"); setMsg("Step 1: checking the link to the Premiere panel…");
    try {
      const p = await ask({ type: "ptb-action", action: "ping" });
      if (!p.ok) {
        setMsg(/handle nahi karta|not built/i.test(p.msg)
          ? "The panel in Premiere is still the OLD one. Replace premiere-panel/main.js, then reload the panel. The top line of the panel should say \"connected ✓ · v14\"."
          : "The panel failed on the first test message: " + p.msg);
        return;
      }
      let all = "";
      for (let i = 0; i < 60; i++) {
        setMsg("Step 2: reading Premiere's feature list… " + all.length + " characters");
        const r = await ask({ type: "ptb-action", action: "probe", part: i });
        if (!r.ok) { setMsg("Stopped at part " + i + ": " + r.msg + "\n\nGot so far:\n" + all); return; }
        if (!r.msg) break; all += r.msg;
      }
      try { await navigator.clipboard.writeText(all); } catch { /* ignore */ }
      setMsg("Copied to the clipboard. Paste it in the chat.\n\n" + all);
    } catch (e) { setMsg("Failed: " + String(e)); } finally { setBusy(""); }
  };

  const paste = async () => {
    if (busy) return; setBusy("paste"); setMsg("Reading the clipboard…");
    try {
      const items = await navigator.clipboard.read();
      let blob: Blob | null = null;
      for (const it of items) { const t = it.types.find(x => x.startsWith("image/")); if (t) { blob = await it.getType(t); break; } }
      if (!blob) { setMsg("There is no image in the clipboard. Copy an image first, then press this again."); return; }
      const ext = blob.type === "image/jpeg" ? "jpg" : blob.type === "image/webp" ? "webp" : "png";
      const bytes = Array.from(new Uint8Array(await blob.arrayBuffer()));
      const path = await invoke<string>("save_trim", { key: "paste", name: `pasted_${Date.now()}.${ext}`, bytes });
      setMsg("Sending to Premiere…");
      const r = await ask({ type: "ptb-import", paths: [path] });
      setMsg((r.ok ? "Done: " : "Premiere said: ") + r.msg);
    } catch (e) { setMsg("Could not paste: " + String(e)); } finally { setBusy(""); }
  };

  const btn = (a: Act, wide = false) => (
    <button key={a.id} className={"bact" + (wide ? " wide" : "")} disabled={!conn || !!busy} title={a.hint}
      onClick={() => run(a.id, a.id === "solid" ? { color: solid } : {})}>
      <b>{busy === a.id ? <Loader2 size={13} className="spin" /> : a.icon} {a.label}</b><small>{a.hint}</small>
    </button>
  );

  return (
    <div className="cap basic">
      <div className="caph">
        <span className="capi"><Zap size={16} /></span>
        <div><b>Quick actions</b><small>One-click tools for the open Premiere project</small></div>
        <span className="bst" title={conn ? "Premiere panel connected" : "Open Window > Extensions > Premiere Toolbox in Premiere"}><i className={conn ? "on" : ""} />{conn ? "Premiere connected" : "Premiere offline"}</span>
      </div>

      <div className="csec"><span>Project and timeline</span></div>
      <div className="bgrid">{GRID.map(a => btn(a))}</div>
      {btn(UNNEST, true)}

      <div className="csec"><span>Add a layer</span></div>
      <div className="blay">
        {LAYERS.map(a => btn(a))}
        <input type="color" className="bsw" value={solid} title="Color for the solid layer" onChange={e => { setSolid(e.target.value); localStorage.setItem("basic.solid", e.target.value); }} />
      </div>

      <div className="csec"><span>Images</span></div>
      <button className="acc big" disabled={!conn || !!busy} onClick={paste} title="Copy an image anywhere, then press this to bring it into Premiere">
        {busy === "paste" ? <Loader2 size={15} className="spin" /> : <ImagePlus size={15} />}Paste image from clipboard
      </button>

      <button className="ghost" disabled={!conn || !!busy} onClick={probe} title="Copies a list of what this Premiere supports, so the actions can be finished">Check what Premiere supports</button>

      {msg && <pre className="dlog">{msg}</pre>}
    </div>
  );
}

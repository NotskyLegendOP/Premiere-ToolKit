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
  for (let n = 0; n < 30; n++) {
    await sleep(400);
    const s = await invoke<{ result: string | null }>("bridge_status");
    if (!s.result) continue;
    try { const r = JSON.parse(s.result); if (r.id === id) return { ok: !!r.ok, msg: String(r.msg ?? "") }; } catch { /* keep waiting */ }
  }
  return { ok: false, msg: "No response from Premiere. The panel may need the updated premiere-panel folder." };
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

      {msg && <pre className="dlog">{msg}</pre>}
    </div>
  );
}

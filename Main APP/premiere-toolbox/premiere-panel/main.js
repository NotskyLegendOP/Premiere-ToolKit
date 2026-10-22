const ppro = require("premierepro");
const $ = id => document.getElementById(id);
const BASE = "http://127.0.0.1:47800";
const log = m => { $("log").textContent = m + "\n" + $("log").textContent; };

async function selectedItem() {
  const project = await ppro.Project.getActiveProject();
  const seq = await project.getActiveSequence();
  if (!seq) throw new Error("Koi active sequence nahi hai");
  const sel = await seq.getSelection();
  const items = await sel.getTrackItems();
  if (!items || !items.length) throw new Error("Timeline mein pehle clip select karo");
  return { project, item: items[0] };
}

async function refresh() {
  try {
    const { item } = await selectedItem();
    const chain = await item.getComponentChain();
    const n = await chain.getComponentCount();
    const sel = $("target"); sel.innerHTML = "";
    for (let ci = 0; ci < n; ci++) {
      const comp = await chain.getComponentAtIndex(ci);
      let cname = ""; try { cname = await comp.getDisplayName(); } catch (e) { try { cname = await comp.getMatchName(); } catch (e2) { cname = "Component " + ci; } }
      const pc = await comp.getParamCount();
      for (let pi = 0; pi < pc; pi++) {
        const param = await comp.getParam(pi);
        let ok = false; try { ok = await param.areKeyframesSupported(); } catch (e) {}
        if (!ok) continue;
        const o = document.createElement("option"); o.value = ci + ":" + pi; o.textContent = cname + " › " + param.displayName; sel.appendChild(o);
      }
    }
    const saved = localStorage.getItem("target"); if (saved) sel.value = saved;
    log("Params mile: " + sel.options.length);
  } catch (e) { log("Refresh error: " + e.message); }
}

async function apply(curve) {
  const v = $("target").value; if (!v) throw new Error("Pehle Refresh karke parameter chuno (jaise Motion › Scale)");
  localStorage.setItem("target", v);
  const [ci, pi] = v.split(":").map(Number);
  const { project, item } = await selectedItem();
  const chain = await item.getComponentChain();
  const param = await (await chain.getComponentAtIndex(ci)).getParam(pi);
  const off = parseFloat($("off").value) || 0;
  let done = false;
  project.lockedAccess(() => {
    done = project.executeTransaction(ca => {
      ca.addAction(param.createSetTimeVaryingAction(true));
      for (const k of curve.keyframes) {
        const kf = param.createKeyframe(k.value);
        kf.position = ppro.TickTime.createWithSeconds(off + k.time);
        kf.setTemporalInterpolationMode(ppro.Constants.InterpolationMode.LINEAR);
        ca.addAction(param.createAddKeyframeAction(kf));
      }
    }, "Premiere Toolbox: apply curve");
  });
  return `${curve.keyframes.length} keyframes lagaye`;
}

async function importFiles(msg) {
  const project = await ppro.Project.getActiveProject();
  if (!project) throw new Error("Koi project open nahi hai");
  const paths = (msg.paths || []).filter(Boolean);
  if (!paths.length) throw new Error("Import ke liye koi file nahi mili");
  const root = await project.getRootItem();
  const ok = await project.importFiles(paths, true, root, false);
  if (!ok) throw new Error("Premiere ne import nahi kiya");
  return paths.length + " file project mein import ho gayi";
}

async function report(ok, msg, id) { try { await fetch(BASE + "/result", { method: "POST", body: JSON.stringify({ ok, msg, id }) }); } catch (e) {} }

async function poll() {
  try {
    const r = await fetch(BASE + "/pending");
    $("st").textContent = "App: connected ✓";
    if (r.status === 200) {
      const curve = await r.json();
      try {
        let m;
        if (curve.type === "ptb-import") m = await importFiles(curve);
        else if (curve.keyframes) m = await apply(curve);
        else throw new Error("Ye panel '" + (curve.type || "unknown") + "' abhi handle nahi karta");
        log(m); await report(true, m, curve.id);
      }
      catch (e) { log("Apply error: " + e.message); await report(false, e.message, curve && curve.id); }
    }
  } catch (e) { $("st").textContent = "App: offline ✗"; }
}
$("refresh").addEventListener("click", refresh);
setInterval(poll, 400);

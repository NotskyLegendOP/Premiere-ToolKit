let on = false;
export function initClickFx() {
  if (on) return; on = true;
  document.addEventListener("pointerdown", e => {
    const d = document.documentElement.dataset, m = d.fx;
    if (!m || m === "none" || d.anim === "off" || e.button !== 0) return;
    const t = e.target as HTMLElement;
    if (t.closest && t.closest("canvas,input[type=range],.wh")) return;   // never on the graph or sliders
    const c = document.createElement("div"); c.className = "fxc"; c.style.left = e.clientX + "px"; c.style.top = e.clientY + "px";
    if (m === "burst") {
      for (let i = 0; i < 8; i++) { const p = document.createElement("i"), a = (i / 8) * Math.PI * 2 + Math.random() * 0.4, r = 0.45 * parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--fxs") || "70");
        p.style.setProperty("--dx", Math.cos(a) * r + "px"); p.style.setProperty("--dy", Math.sin(a) * r + "px"); c.appendChild(p); }
      c.className += " fxb";
    } else { const r = document.createElement("span"); r.className = m === "ring" ? "fxring" : "fxrip"; c.appendChild(r); }
    document.body.appendChild(c); setTimeout(() => c.remove(), 700);
  }, true);
}

export function initBounce() {
  document.addEventListener("click", e => {
    const d = document.documentElement.dataset; if (d.bounce !== "on" || d.anim === "off") return;
    const t = e.target as HTMLElement; if (!t.closest) return;
    const el = t.closest("button,.card,.gotrow,.rcard,label.chk,select,[role=button],.pl > *,.side > *,.logo,.asset,.thumb") as HTMLElement | null;
    if (!el || el.matches("canvas,input[type=range]")) return;
    el.classList.remove("bnc"); void el.offsetWidth; el.classList.add("bnc");
    setTimeout(() => el.classList.remove("bnc"), 520);
  }, true);
}

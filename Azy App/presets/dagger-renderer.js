/* Dagger wheel — renderer. Purely presentational: the main process (dagger-main.js) tells it
 * when to open, which sector is under the cursor and when to close; the pick is decided there
 * from the real global cursor position, so this window never needs focus or mouse events. */
(function () {
  const P = window.presets;
  const root = document.documentElement;
  const wheel = document.getElementById('dagger');
  const sectorsG = document.getElementById('sectors');
  const labels = document.getElementById('labels');
  const needle = document.getElementById('needle');
  const dot = document.getElementById('dot');
  const caption = document.getElementById('captionText');
  const wedge = document.getElementById('wedge');
  const trail = document.getElementById('trail');
  const hubName = document.getElementById('hubName');
  const tkHub = document.getElementById('tkHub');
  const pulse = document.getElementById('pulse');
  const shock = document.getElementById('shock');
  // Decorative one-shots (pulse / flare / shockwave) run through WAAPI on transform + opacity
  // only, and never in Performance mode or with reduced motion. Nothing here gates the pick.
  const lively = () => !(window.azyTheme && !window.azyTheme.decorative());
  const fx = (el, frames, ms) => { if (el && el.animate && lively()) { try { el.animate(frames, { duration: ms, easing: 'cubic-bezier(.2,.8,.2,1)' }); } catch (e) { /* old engine */ } } };

  // Toolkit geometry: slices start at 12 o'clock, 1.4° gaps, disc 9px outside the slices.
  const R_OUT = 170, R_IN = 64, R_LABEL = 118, GAP = 1.4;
  const ICONS = {
    files: '<svg viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    presets: '<svg viewBox="0 0 24 24"><path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    flow: '<svg viewBox="0 0 24 24"><path d="M3 19 C9 19 9 5 15 5 S21 5 21 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="3" cy="19" r="1.8" fill="currentColor"/><circle cx="21" cy="5" r="1.8" fill="currentColor"/></svg>',
    snap: '<svg viewBox="0 0 24 24"><path d="M13 2 4 14h7l-1 8 9-12h-7z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    speed: '<svg viewBox="0 0 24 24"><path d="M4 14a8 8 0 1 1 16 0" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M12 14 16 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="14" r="1.6" fill="currentColor"/></svg>',
    settings: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
  };
  const HINT = { all: 'Everything in one window', files: 'Browse & drag media', presets: 'Apply a preset', flow: 'Smooth keyframes', snap: 'Effects & transitions', speed: 'Adjust speed', settings: 'Settings' };

  ICONS.all = '<svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
  ICONS.sfx = '<svg viewBox="0 0 24 24"><path d="M4 10v4h3l4 4V6L7 10z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M15 9a4 4 0 0 1 0 6M17.5 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  ICONS.preset = ICONS.presets;
  ICONS.empty = '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  const EMPTY_HINT = { sfx: 'No sounds pinned yet — right-click an audio file in Files → Pin to SFX wheel', presets: 'No presets pinned yet — use the ◎ badge on a preset card', flow: 'No Flow presets pinned yet — use the ◎ badge on a Flow tile' };
  // Flow items: the icon IS the preset's preview — its speed curve, drawn exactly like the Flow tile.
  function bez(t, x1, y1, x2, y2) { const mt = 1 - t; return { x: 3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t * t * t, y: 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t * t * t }; }
  function velocityPath(e) {
    if (!e) return 'M4 14 H20';
    const f = e.first, l = e.last, m = e.middle;
    let c = e.curve && typeof e.curve.x1 === 'number' ? e.curve : null;
    if (!c) {
      if (f === 'hold' && l === 'hold') return 'M4 20 H20';
      if (f === 'bezier' && l === 'bezier') c = { x1: 0.5, y1: 0, x2: 0.5, y2: 1 };
      else if (f === 'bezier') c = { x1: 0.5, y1: 0, x2: 0.65, y2: 0.65 };
      else if (l === 'bezier') c = { x1: 0.35, y1: 0.35, x2: 0.5, y2: 1 };
      else if (m === 'bezier') c = { x1: 0.25, y1: 0.35, x2: 0.75, y2: 0.65 };
      else return 'M4 14 H20';
    }
    const N = 40, xs = [], vs = [];
    let prev = bez(0, c.x1, c.y1, c.x2, c.y2);
    for (let i = 1; i <= N; i++) { const pt = bez(i / N, c.x1, c.y1, c.x2, c.y2); const dx = pt.x - prev.x; vs.push(dx > 1e-6 ? Math.max(0, (pt.y - prev.y) / dx) : 0); xs.push((pt.x + prev.x) / 2); prev = pt; }
    const peak = Math.max(1, ...vs);
    let d = '';
    for (let i = 0; i < xs.length; i++) d += `${i ? 'L' : 'M'}${(4 + 16 * xs[i]).toFixed(2)} ${(20 - 16 * (vs[i] / peak)).toFixed(2)} `;
    return d.trim();
  }
  const flowIcon = (e) => `<svg viewBox="0 0 24 24"><path d="M4 20 H20" stroke="currentColor" stroke-width="1" opacity="0.35"/><path d="${velocityPath(e)}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  let wheelId = 'main';
  let N = 6;

  const polar = (r, deg) => { const a = (deg - 90) * Math.PI / 180; return [r * Math.cos(a), r * Math.sin(a)]; };
  function sectorPath(i) {
    const step = 360 / N;
    const a0 = i * step + GAP, a1 = (i + 1) * step - GAP;
    const [x0, y0] = polar(R_OUT, a0), [x1, y1] = polar(R_OUT, a1);
    const [x2, y2] = polar(R_IN, a1), [x3, y3] = polar(R_IN, a0);
    return `M${x0} ${y0} A${R_OUT} ${R_OUT} 0 0 1 ${x1} ${y1} L${x2} ${y2} A${R_IN} ${R_IN} 0 0 0 ${x3} ${y3} Z`;
  }

  let sections = [];
  const els = new Map(); // id -> { sector, label }
  function build(list, def) {
    wheelId = def && def.id ? def.id : 'main';
    root.dataset.wheel = wheelId;
    sections = list.length ? list : [{ id: '__empty', label: wheelId === 'sfx' ? 'Pin sounds' : wheelId === 'flow' ? 'Pin Flow presets' : 'Pin presets', kind: 'empty' }];
    wheel.classList.toggle('is-empty', !list.length);
    N = Math.max(1, sections.length);
    sectorsG.innerHTML = ''; labels.innerHTML = ''; els.clear();
    paintWeb();
    paintWedge();
    const list2 = sections;
    const step = 360 / N;
    const rLabel = N <= 6 ? R_LABEL : 122;
    const sheensG = document.getElementById('sheens');
    if (sheensG) sheensG.innerHTML = '';
    // The highlight arc is drawn ONCE, centred on 12 o'clock; hovering only rotates it (see the motion loop).
    if (typeof tkHl !== 'undefined' && tkHl) { const hw = step / 2 - 2; tkHl.setAttribute('d', N > 1 ? arcPath(R_OUT + 9, -hw, hw) : ''); tkHl.style.opacity = '0'; }
    // Main wheel: a springy needle (a touch of overshoot, like the Toolkit one). Pointer-following needles
    // on the other wheels are stiffer and well damped so they never lag behind the hand.
    M.n.k = wheelId === 'main' ? 520 : 1100; M.n.c = wheelId === 'main' ? 30 : 62;
    list2.forEach((s, i) => {
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', sectorPath(i));
      p.setAttribute('class', 'sector');
      p.dataset.sec = s.id;
      p.style.setProperty('--i', i);
      sectorsG.appendChild(p);
      const sh = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      sh.setAttribute('d', sectorPath(i)); sh.setAttribute('class', 'sheen');
      if (sheensG) sheensG.appendChild(sh);
      const [lx, ly] = polar(rLabel, (i + 0.5) * step);
      const [nx, ny] = polar(R_OUT - 14, (i + 0.5) * step);
      const nb = document.createElement('div');
      nb.className = 'dagger-nb'; nb.style.left = `${230 + nx}px`; nb.style.top = `${230 + ny}px`;
      nb.textContent = s.kind === 'empty' ? '' : String(i + 1);
      labels.appendChild(nb);
      const l = document.createElement('div');
      l.className = 'dagger-label' + (N > 6 ? ' dagger-label--tight' : '');
      l.dataset.sec = s.kind || s.id;
      l.style.setProperty('--i', i);
      l.style.left = `${230 + lx}px`; l.style.top = `${230 + ly}px`;
      const ic = s.kind === 'flow' ? flowIcon(s.easing) : (ICONS[s.kind] || ICONS[s.id] || '');
      if (s.kind === 'flow') l.classList.add('dagger-label--flow');
      l.innerHTML = `<span class="ic">${ic}</span><span class="lbl">${esc(s.label)}</span><span class="kbd">${s.kind === 'empty' ? '' : i + 1}</span>`;
      labels.appendChild(l);
      els.set(s.id, { sector: p, label: l, sheen: sh, nb });
    });
  }

  // Original web geometry for the disc: N threads on the sector borders + sagging rings between
  // them. Rebuilt only when the wheel layout changes (build() is cached by build.lastKey).
  const webG = document.getElementById('web');
  function paintWeb() {
    if (!webG) return;
    webG.innerHTML = ''; return; // Toolkit look: clean glass, no web inside the wheel
    const step = 360 / N;
    let d = '';
    for (let i = 0; i < N; i++) { const [x0, y0] = polar(R_IN + 4, i * step + step / 2), [x1, y1] = polar(R_OUT, i * step + step / 2); d += `M${x0.toFixed(1)} ${y0.toFixed(1)}L${x1.toFixed(1)} ${y1.toFixed(1)}`; }
    let rings = '';
    [98, 128, 160, 192].forEach((r, k) => {
      let rd = '';
      for (let i = 0; i <= N; i++) {
        const a = i * step + step / 2;
        const [x, y] = polar(r, a);
        if (!i) { rd += `M${x.toFixed(1)} ${y.toFixed(1)}`; continue; }
        const [mx, my] = polar(r * (0.94 - k * 0.004), a - step / 2); // sag toward the hub between threads
        rd += `Q${mx.toFixed(1)} ${my.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
      }
      rings += `<path class="dagger-web-ring" d="${rd}"/>`;
    });
    webG.innerHTML = `<path class="dagger-web-thread" d="${d}"/>${rings}`;
  }

  // The hover glow: ONE wedge, prerendered to a canvas (soft glow baked in with shadowBlur),
  // then only rotated / faded. Repainted just when the layout, accent or style changes.
  let wedgeKey = '', wedgeAngle = 0, wedgeOn = false;
  function paintWedge() {
    if (!wedge) return;
    const cs = getComputedStyle(wheel);
    const rgb = (cs.getPropertyValue('--hue-rgb') || '214, 40, 63').trim();
    const glow = root.dataset.skin !== 'clean';
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const key = [N, rgb, glow, dpr].join('|');
    if (key === wedgeKey) return;
    wedgeKey = key;
    const c = document.createElement('canvas');
    c.width = c.height = Math.round(460 * dpr);
    const g = c.getContext('2d');
    if (!g) return;
    g.scale(dpr, dpr); g.translate(230, 230);
    const step = 360 / N, rad = (d) => (d - 90) * Math.PI / 180;
    const a0 = rad(-step / 2 + GAP), a1 = rad(step / 2 - GAP);
    const shape = (ro, ri) => { g.beginPath(); g.arc(0, 0, ro, a0, a1); g.arc(0, 0, ri, a1, a0, true); g.closePath(); };
    const grad = g.createRadialGradient(0, 0, R_IN, 0, 0, R_OUT);
    grad.addColorStop(0, `rgba(${rgb}, 0.05)`); grad.addColorStop(0.7, `rgba(${rgb}, 0.2)`); grad.addColorStop(1, `rgba(${rgb}, 0.34)`);
    if (glow) { g.shadowColor = `rgba(${rgb}, 0.7)`; g.shadowBlur = 18; }
    shape(R_OUT, R_IN); g.fillStyle = grad; g.fill();
    g.lineWidth = 1.6; g.strokeStyle = `rgba(${rgb}, 0.95)`; g.stroke();
    // bright lip on the outer edge
    g.shadowBlur = glow ? 10 : 0;
    g.beginPath(); g.arc(0, 0, R_OUT - 3, a0 + 0.02, a1 - 0.02); g.lineWidth = 4; g.lineCap = 'round'; g.strokeStyle = `rgba(${rgb}, 1)`; g.stroke();
    wedge.replaceChildren(c);
  }
  function aimWedge(i) {
    if (!wedge) return;
    const target = (i + 0.5) * (360 / N);
    // shortest way round, so 6 → 1 sweeps across the top instead of spinning back
    let d = ((target - wedgeAngle) % 360 + 540) % 360 - 180;
    if (!wedgeOn) { wedge.style.transition = 'none'; wedgeAngle = target; wedge.style.transform = `rotate(${target}deg)`; void wedge.offsetWidth; wedge.style.transition = ''; }
    else { wedgeAngle += d; wedge.style.transform = `rotate(${wedgeAngle}deg)`; }
    wedgeOn = true;
  }
  if (window.azyTheme && window.azyTheme.on) window.azyTheme.on(() => requestAnimationFrame(paintWedge));

  // Toolkit outer ticks: 72 lines, a longer one every 30°.
  (function paintTicks() {
    const g = document.getElementById('tkTicks'); if (!g) return;
    let d = '';
    for (let i = 0; i < 72; i++) { const [x1, y1] = polar(R_OUT + 17, i * 5), [x2, y2] = polar(R_OUT + (i % 6 === 0 ? 26 : 21), i * 5); d += `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`; }
    g.innerHTML = `<path d="${d}"/>`;
  })();
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let hover = null;
  // Toolkit hub: wheel name while idle, the hovered item while pointing; the small line says what
  // happens next, and follows the wheel's mode (hold = release, toggle = click).
  const tkTitle = document.getElementById('tkTitle'), tkSub = document.getElementById('tkSub'), tkHl = document.getElementById('tkHl');
  let wheelMode = 'hold';
  const WHEEL_TITLE = { main: 'Azy', sfx: 'SFX', presets: 'Presets', flow: 'Flow' };
  const VERB = { main: 'open', sfx: 'place', presets: 'apply', flow: 'apply' };
  const arcPath = (r, a0, a1) => { const [x1, y1] = polar(r, a0), [x2, y2] = polar(r, a1); return `M${x1.toFixed(1)} ${y1.toFixed(1)}A${r} ${r} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`; };
  const act = () => (wheelMode === 'toggle' ? 'Click' : 'Release');
  function paintHub(it) {
    if (!tkTitle || !tkSub) return;
    const empty = sections.length === 1 && sections[0].kind === 'empty';
    tkTitle.textContent = it ? it.label : (WHEEL_TITLE[wheelId] || 'Azy');
    tkSub.textContent = empty ? 'Nothing pinned yet' : it ? `${act()} to ${VERB[wheelId] || 'open'}` : (wheelMode === 'toggle' ? 'Move · click · Esc cancels' : 'Move · release to pick');
  }
  function setHover(id) {
    if (hover && els.has(hover)) { const o = els.get(hover); o.sector.classList.remove('hot'); o.label.classList.remove('hot'); o.sector.style.translate = ''; if (o.sheen) o.sheen.style.translate = ''; }
    const prev = hover;
    hover = id;
    if (hover && els.has(hover)) {
      els.get(hover).sector.classList.add('hot'); els.get(hover).label.classList.add('hot');
      const it = sections.find((s) => s.id === hover);
      if (wheelId === 'main') { const sec = hover === 'speed' ? 'flow' : hover === 'settings' ? 'snap' : hover === 'sfx' ? 'files' : hover; if (root.dataset.section !== sec) root.dataset.section = sec; }
      if (root.dataset.theme === 'panels') paintWedge(); // per-sector hue
      aimWedge(sections.indexOf(it));
      { const k = sections.indexOf(it), st = 360 / N, o = els.get(hover), [tx, ty] = polar(7, (k + 0.5) * st); o.sector.style.translate = `${tx.toFixed(1)}px ${ty.toFixed(1)}px`; if (o.sheen) o.sheen.style.translate = `${tx.toFixed(1)}px ${ty.toFixed(1)}px`; if (tkHl && N > 1) { aimArc((k + 0.5) * st, prev == null); tkHl.style.opacity = '1'; } }
      paintHub(it);
      if (hover !== prev) {
        if (hubName) { hubName.textContent = it ? it.label : ''; fx(hubName, [{ opacity: 0, transform: 'translate(-50%, 4px)' }, { opacity: 1, transform: 'translate(-50%, 0)' }], 160); }
        fx(pulse, [{ opacity: 0.55, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.32)' }], 360);
        // the hub answers every change of slice: the name slides in, the small line fades, the disc gives a tiny pulse
        fx(tkTitle, [{ opacity: 0, transform: 'translateY(5px)' }, { opacity: 1, transform: 'none' }], 170);
        fx(tkSub, [{ opacity: 0 }, { opacity: 1 }], 240);
        fx(tkHub, [{ scale: '1' }, { scale: '1.05', offset: 0.4 }, { scale: '1' }], 240);
      }
      const hint = wheelId === 'sfx' ? (wheelMode === 'toggle' ? 'click' : 'release') + ' to place at the playhead' : wheelId === 'presets' ? 'release to apply to the selected clips' : wheelId === 'flow' ? 'release to ease the selected keyframes' : (HINT[hover] || '');
      caption.innerHTML = `<b>${esc(it ? it.label : '')}</b> · ${hint}`;
    } else if (sections.length === 1 && sections[0].kind === 'empty') {
      caption.textContent = EMPTY_HINT[wheelId] || '';
    } else {
      caption.textContent = wheelId === 'sfx' ? 'Move to a sound · release to place it at the playhead' : wheelId === 'presets' ? 'Move to a preset · release to apply' : wheelId === 'flow' ? 'Move to an easing · release to apply' : 'Move to a section · release to open';
    }
    if (!hover) {
      wedgeOn = false; if (hubName) hubName.textContent = ''; if (tkHl) tkHl.style.opacity = '0'; paintHub(null);
      if (prev) { fx(tkTitle, [{ opacity: 0, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'none' }], 160); fx(tkSub, [{ opacity: 0 }, { opacity: 1 }], 200); }
    }
    // Main wheel (Toolkit look): the needle points at the CENTRE of the lit slice and hides when nothing
    // is lit, instead of chasing the raw pointer. Other wheels keep the pointer-following needle.
    const hk = hover ? sections.findIndex((x) => x.id === hover) : -1;
    if (wheelId === 'main') { if (hk >= 0) aimNeedle((hk + 0.5) * 360 / N, prev == null); needle.style.opacity = hk >= 0 ? '1' : '0'; }
    else needle.style.opacity = '';
    wheel.classList.toggle('has-hover', !!hover);
  }
  // ---- one requestAnimationFrame loop owns every continuous motion ------------------------------------
  // The helper reports the pointer ~125x/s, which is not a multiple of the display's refresh rate, so
  // writing the dot straight from each report made it stutter. A report now only moves a TARGET; this loop
  // (frame-rate independent, exponential easing + springs) eases the dot, its trailing ring, the needle
  // and the highlight arc toward their targets and writes each layer's transform once per frame. It goes
  // to sleep as soon as everything has settled, so an idle wheel costs nothing. Hover / hit-testing is
  // never delayed by it: the pick is decided in dagger-main.js from the real cursor.
  const wrap180 = (d) => ((d % 360) + 540) % 360 - 180;     // shortest way round, so 6 -> 1 never spins back
  const smooth = () => root.dataset.motion !== 'reduced';
  const M = { raf: 0, last: 0, hp: false, tx: 0, ty: 0, x: 0, y: 0, rx: 0, ry: 0, ang: 0, pend: null,
    n: { a: 0, v: 0, t: 0, k: 520, c: 30 }, h: { a: 0, v: 0, t: 0, k: 560, c: 38 } };
  function spring(st, dt) {
    let rem = dt;                                           // sub-steps keep a slow frame from blowing the spring up
    while (rem > 1e-6) { const h = Math.min(rem, 1 / 120); st.v += (st.k * (st.t - st.a) - st.c * st.v) * h; st.a += st.v * h; rem -= h; }
  }
  const writeNeedle = () => { needle.style.transform = `rotate(${M.n.a.toFixed(2)}deg)`; };
  const writeArc = () => { if (tkHl) tkHl.style.transform = `rotate(${M.h.a.toFixed(2)}deg)`; };
  function writeDot(stretch) {
    // a little comet stretch along the direction of travel; exactly a plain translate once the dot is at rest
    const t = `translate(${M.x.toFixed(2)}px, ${M.y.toFixed(2)}px)` + (stretch > 1.01 ? ` rotate(${M.ang.toFixed(1)}deg) scale(${stretch.toFixed(3)}, ${(1 / Math.sqrt(stretch)).toFixed(3)})` : '');
    dot.style.transform = t;
    if (trail) trail.style.transform = `translate(${M.rx.toFixed(2)}px, ${M.ry.toFixed(2)}px)`;
  }
  function settle(st, write, dt) {
    if (smooth() && (Math.abs(st.t - st.a) > 0.03 || Math.abs(st.v) > 0.1)) { spring(st, dt); write(); return true; }
    if (st.a !== st.t) { st.a = st.t; st.v = 0; write(); }
    return false;
  }
  function tick(now) {
    M.raf = 0;
    const dt = Math.min(0.05, M.last ? Math.max(0.001, (now - M.last) / 1000) : 1 / 60);
    M.last = now;
    const q = M.pend;                                       // newest hover state, applied once per frame
    if (q) { M.pend = null; if (q.hover !== hover) setHover(q.hover); }
    let busy = false;
    if (smooth()) {
      const px = M.x, py = M.y;
      const kd = 1 - Math.exp(-dt / 0.014), kt = 1 - Math.exp(-dt / 0.09);
      M.x += (M.tx - M.x) * kd; M.y += (M.ty - M.y) * kd;   // the dot: ~14 ms behind the real cursor, but even
      M.rx += (M.x - M.rx) * kt; M.ry += (M.y - M.ry) * kt; // the ring: a softer follower
      const vx = (M.x - px) / dt, vy = (M.y - py) / dt, sp = Math.hypot(vx, vy);
      if (sp > 120) M.ang = Math.atan2(vy, vx) * 180 / Math.PI;
      writeDot(1 + Math.min(0.55, sp / 3200));
      if (sp > 20 || Math.abs(M.tx - M.x) > 0.04 || Math.abs(M.ty - M.y) > 0.04 || Math.abs(M.x - M.rx) > 0.04 || Math.abs(M.y - M.ry) > 0.04) busy = true;
      else { M.x = M.rx = M.tx; M.y = M.ry = M.ty; writeDot(1); }
    } else { M.x = M.rx = M.tx; M.y = M.ry = M.ty; writeDot(1); }
    if (settle(M.n, writeNeedle, dt)) busy = true;
    if (settle(M.h, writeArc, dt)) busy = true;
    if (busy || M.pend) M.raf = requestAnimationFrame(tick); else M.last = 0;
  }
  const kick = () => { if (!M.raf) M.raf = requestAnimationFrame(tick); };
  // Angles stay continuous (atan2 jumps from +180 to -180 at 6 o'clock), so a target is always reached
  // by the SHORTEST way round. `snap` jumps there at once (first light after the hub, or a fresh open).
  function aimNeedle(target, snap) {
    const n = M.n;
    if (snap) { n.a = n.t = target; n.v = 0; writeNeedle(); return; }
    n.t += wrap180(target - n.t); kick();
  }
  function aimArc(target, snap) {
    const h = M.h;
    if (snap) { h.a = h.t = target; h.v = 0; writeArc(); return; }
    h.t += wrap180(target - h.t); kick();
  }
  function resetMotion() {
    M.pend = null; M.tx = M.ty = M.x = M.y = M.rx = M.ry = 0; M.ang = 0; M.hp = false;
    M.n.v = 0; M.h.v = 0; M.n.a = M.n.t = 0; M.h.a = M.h.t = 0;
    writeDot(1); writeNeedle(); writeArc();
  }
  // Dot, ring and needle are HTML layers moved by transform only (no SVG attribute writes, no repaint).
  function pointer(dx, dy) {
    const actual = Math.hypot(dx, dy);
    const len = actual || 1;
    const clamp = Math.min(len, 216);                       // the dot IS the cursor: it may travel to the rim of the window
    M.tx = dx / len * clamp; M.ty = dy / len * clamp;
    if (wheelId !== 'main' && actual > 1) aimNeedle(Math.atan2(dx, -dy) * 180 / Math.PI, false);
    // At the opening warp the Azy logo is the target. Showing a renderer dot there looked like
    // an uncaptured system cursor in real use, so only show the guide after a deliberate move.
    const hp = actual > 8;
    if (hp !== M.hp) { M.hp = hp; wheel.classList.toggle('has-pointer', hp); }
    kick();
  }

  function applyTheme(s) {
    // The theme engine owns the accent list (incl. crimson / indigo / graphite) and every dial.
    if (window.azyTheme) { window.azyTheme.apply(s || {}); return; }
    const themes = ['noir', 'crimson', 'dark-red', 'deep-purple', 'indigo', 'dark-blue', 'dark-cyan', 'dark-emerald', 'dark-magenta', 'dark-orange', 'graphite', 'midnight', 'obsidian', 'void', 'panels'];
    const mig = { mono: 'midnight', 'mono-cyan': 'dark-cyan', cyan: 'dark-cyan', violet: 'obsidian', rose: 'dark-magenta', mint: 'dark-emerald', amber: 'dark-orange' };
    const asked = s && (mig[s.uiTheme] || s.uiTheme);
    const v = asked && themes.includes(asked) ? asked : 'noir';
    root.dataset.theme = v;
  }
  if (window.api && window.api.getSettings) {
    window.api.getSettings().then(applyTheme).catch(() => {});
    if (window.api.onSettingsChanged) window.api.onSettingsChanged(applyTheme);
  }

  if (P && P.onDagger) {
    const onOpen = ({ sections: list, wheel: def, hover: h }) => {
      wheelMode = def && def.mode === 'toggle' ? 'toggle' : 'hold';
      const key = JSON.stringify([(def && def.id) || 'main', list.map((s) => s.id)]);
      if (key !== build.lastKey) { build(list, def); build.lastKey = key; }
      if (wheelId === 'sfx') root.dataset.section = 'files'; else if (wheelId === 'presets') root.dataset.section = 'presets'; else if (wheelId === 'flow') root.dataset.section = 'flow';
      wheel.classList.remove('closing', 'commit', 'has-pointer');
      for (const { sector } of els.values()) sector.classList.remove('picked');
      resetMotion();
      setHover(null); pointer(0, 0);
      void wheel.offsetWidth;
      wheel.classList.add('open');
      if (h) setHover(h);
    };
    P.onDagger('open', onOpen);
    if (P.daggerState) P.daggerState().then((st) => { if (st) onOpen(st); }).catch(() => {});
    // The helper reports the pointer ~125x/s. A report only moves the dot's TARGET (cheap, no DOM
    // writes); the motion loop above draws it once per frame. A change of hovered slice, which touches
    // more of the page, is queued the same way and applied with only the newest state.
    const queue = (q) => {
      pointer(q.dx, q.dy);
      if ('hover' in q) { M.pend = { hover: q.hover }; kick(); }
    };
    P.onDagger('hover', ({ hover: h, dx, dy }) => queue({ hover: h, dx, dy }));
    P.onDagger('pointer', ({ dx, dy }) => queue({ dx, dy }));
    P.onDagger('close', ({ pick }) => {
      M.pend = null; // a queued move must not relight a wheel that is closing
      if (pick && els.has(pick)) {
        els.get(pick).sector.classList.add('picked'); wheel.classList.add('commit');
        fx(wedge, [{ opacity: 1, scale: '1' }, { opacity: 1, scale: '1.05', offset: 0.35 }, { opacity: 0, scale: '1.08' }], 260);
        fx(shock, [{ opacity: 0.7, transform: 'scale(0.4)' }, { opacity: 0, transform: 'scale(1.9)' }], 360);
      }
      setTimeout(() => { wheel.classList.remove('open'); wheel.classList.add('closing'); }, pick ? 90 : 0);
      // let the loop sleep once the close has played (a quick re-open keeps it running)
      setTimeout(() => { if (!wheel.classList.contains('open') && M.raf) { cancelAnimationFrame(M.raf); M.raf = 0; M.last = 0; } }, 420);
    });
  }
  // The AZY sigil sits in the hub (the original mark), reacting to hover / commit.
  const hub = document.getElementById('hubSigil');
  const sig = hub && window.azyWeb ? window.azyWeb.sigil(hub, 'idle') : null;
  if (sig) root.classList.add('has-sigil');
  if (sig && P && P.onDagger) {
    P.onDagger('open', () => window.azyWeb.setSigilState(sig, 'appear'));
    P.onDagger('close', ({ pick }) => { if (pick) window.azyWeb.setSigilState(sig, 'success'); });
  }
  // Test hook
  window.__dagger = { build, setHover, pointer, paintWedge, open: () => wheel.classList.add('open') };
})();

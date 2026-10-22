// ---------- Flow tab ----------
// Keyframe easing for Premiere Pro 2026. Workflow: select the clip(s) in Premiere (or park the
// playhead between two keyframes), click an easing preset here → Premiere sets the temporal
// interpolation of those keyframes in one undoable step.
//
// Everything Premiere-specific is in the engine (presets/engine.js → Flow) and the single Azy
// connector; this file paints cards on the shared .file-grid, runs the small custom-ease editor,
// and reuses renderer.js's toast(). Search is local — no IPC per keystroke.

(() => {
  const P = window.presets;
  const $ = (id) => document.getElementById(id);
  const grid = $('flowGrid');
  const search = $('flowSearchInput');
  const countPill = $('flowCountPill');
  const target = $('flowTarget');
  const targetText = $('flowTargetText');
  const heroActivity = $('flowHeroActivity');
  const scopeCtl = window.azyScope && $('flowScopeSlot') ? window.azyScope.mount($('flowScopeSlot'), { key: 'flow' }) : null;
  let activeWait = null;
  let lastSummary = '';
  const createBtn = $('flowCreateBtn');
  const editor = $('flowEditor');
  const statusHint = document.querySelector('.status-hint');
  if (!grid) return;

  const STAR_ON = '<svg viewBox="0 0 24 24" width="11" height="11"><path d="M12 2.6 L14.1 8.3 L20.2 8.8 L15.5 12.8 L16.9 18.8 L12 15.6 L7.1 18.8 L8.5 12.8 L3.8 8.8 L9.9 8.3 Z" fill="currentColor"/></svg>';
  const STAR_OFF = '<svg viewBox="0 0 24 24" width="11" height="11"><path d="M12 2.6 L14.1 8.3 L20.2 8.8 L15.5 12.8 L16.9 18.8 L12 15.6 L7.1 18.8 L8.5 12.8 L3.8 8.8 L9.9 8.3 Z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/></svg>';

  // Curve library for the editor (same numbers as the engine's FLOW_CURVE_LIBRARY).
  const CURVES = [
    { name: 'Ease', x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 },
    { name: 'Ease In Quad', x1: 0.55, y1: 0.085, x2: 0.68, y2: 0.53 },
    { name: 'Ease Out Quad', x1: 0.25, y1: 0.46, x2: 0.45, y2: 0.94 },
    { name: 'Ease In Out Cubic', x1: 0.645, y1: 0.045, x2: 0.355, y2: 1 },
    { name: 'Ease Out Expo', x1: 0.19, y1: 1, x2: 0.22, y2: 1 },
    { name: 'Ease In Expo', x1: 0.95, y1: 0.05, x2: 0.795, y2: 0.035 },
    { name: 'Ease Out Back', x1: 0.175, y1: 0.885, x2: 0.32, y2: 1.275 },
    { name: 'Ease In Out Back', x1: 0.68, y1: -0.55, x2: 0.265, y2: 1.55 }
  ];

  let all = [];
  let list = [];
  let query = '';
  let status = null;
  let applying = null;
  let editorOpener = null;
  let requestingSpeed = false;
  let editing = null; // null = closed; { id?: string } when open
  let searchTimer = null;
  let booted = false;
  let warnedNotRunning = false;

  function cleanError(err) {
    return String((err && err.message) || err).replace(/^Error invoking remote method '[^']+': (Error: )?/, '').replace(/^BridgeError: /, '');
  }

  // ---------- Glyph per easing: a tiny curve drawn from the easing itself ----------

  function easingPath(e) {
    // first/last bezier → ease shape; hold → steps; linear → straight. Purely a visual hint.
    const f = e.first, l = e.last, m = e.middle;
    if (f === 'hold' && l === 'hold') return 'M4 20 H10 V13 H16 V6 H20';
    if (e.curve && typeof e.curve.x1 === 'number') {
      const c = e.curve;
      return `M4 20 C ${4 + 16 * c.x1} ${20 - 16 * c.y1}, ${4 + 16 * c.x2} ${20 - 16 * c.y2}, 20 4`;
    }
    if (f === 'bezier' && l === 'bezier') return 'M4 20 C 12 20, 12 4, 20 4';
    if (f === 'bezier') return 'M4 20 C 12 20, 14 10, 20 4';
    if (l === 'bezier') return 'M4 20 C 10 14, 12 4, 20 4';
    if (m === 'bezier') return 'M4 20 C 8 14, 16 10, 20 4';
    return 'M4 20 L20 4';
  }

  // Tile preview = the SPEED of the motion (velocity of the ease), not the value curve — the
  // shape editors read at a glance: a hump = accelerate then decelerate, ramp up = ease-in, etc.
  function velocityPath(e) {
    const f = e.first, l = e.last, m = e.middle;
    let c = e.curve && typeof e.curve.x1 === 'number' ? e.curve : null;
    if (!c) {
      if (f === 'hold' && l === 'hold') return 'M4 20 H20';
      if (f === 'bezier' && l === 'bezier') c = { x1: 0.5, y1: 0, x2: 0.5, y2: 1 };
      else if (f === 'bezier') c = { x1: 0.5, y1: 0, x2: 0.65, y2: 0.65 };
      else if (l === 'bezier') c = { x1: 0.35, y1: 0.35, x2: 0.5, y2: 1 };
      else if (m === 'bezier') c = { x1: 0.25, y1: 0.35, x2: 0.75, y2: 0.65 };
      else return 'M4 14 H20'; // linear = constant speed
    }
    const N = 40, xs = [], vs = [];
    let prev = bez(0, c.x1, c.y1, c.x2, c.y2);
    for (let i = 1; i <= N; i++) {
      const pt = bez(i / N, c.x1, c.y1, c.x2, c.y2);
      const dx = pt.x - prev.x;
      vs.push(dx > 1e-6 ? Math.max(0, (pt.y - prev.y) / dx) : 0);
      xs.push((pt.x + prev.x) / 2);
      prev = pt;
    }
    const peak = Math.max(1, ...vs);
    let d = '';
    for (let i = 0; i < xs.length; i++) d += `${i ? 'L' : 'M'}${(4 + 16 * xs[i]).toFixed(2)} ${(20 - 16 * (vs[i] / peak)).toFixed(2)} `;
    return d.trim();
  }

  // ---------- Cards ----------

  function card(p, i) {
    const el = document.createElement('div');
    el.className = 'file-card preset-card flow-card' + (applying === p.id ? ' applying' : '');
    el.setAttribute('role', 'button');
    el.setAttribute('aria-disabled', String(!!scopeCtl && !scopeCtl.canApply));
    el.tabIndex = 0;
    if (i < 30) { el.classList.add('rise'); el.style.animationDelay = `${Math.min(i, 24) * 14}ms`; }
    el.dataset.flowId = p.id;
    el.draggable = false;

    const thumb = document.createElement('div');
    thumb.className = 'thumb thumb--preset thumb--flow';
    thumb.innerHTML = `<svg class="flow-glyph" viewBox="0 0 24 24" width="44" height="44"><path class="flow-glyph-base" d="M4 20 H20" stroke="currentColor" stroke-width="1" opacity="0.35"/><path d="${velocityPath(p.easing)}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    thumb.title = 'Speed of the motion over time';

    const star = document.createElement('button');
    star.setAttribute('aria-pressed', String(!!p.favorite));
    star.className = 'fav-badge' + (p.favorite ? ' on' : '');
    star.innerHTML = p.favorite ? STAR_ON : STAR_OFF;
    star.title = p.favorite ? 'Remove from favorites' : 'Add to favorites';
    // The write and its undo are the same three lines, so the star on the card and the favourite
    // in the engine can never end up disagreeing with each other — including under Ctrl+Z.
    async function setFav(next) {
      const u = await P.flowSetFavorite(p.id, next);
      if (!u) return;
      p.favorite = u.favorite;
      star.classList.toggle('on', p.favorite);
      star.setAttribute('aria-pressed', String(!!p.favorite));
      star.title = p.favorite ? 'Remove from favorites' : 'Add to favorites';
      star.innerHTML = p.favorite ? STAR_ON : STAR_OFF;
      toast(p.favorite ? `Starred ${p.name}` : `Unstarred ${p.name}`);
    }
    star.addEventListener('click', async (e) => {
      e.stopPropagation();
      const was = p.favorite;
      try {
        await setFav(!was);
        if (window.azyUndo && was !== p.favorite) window.azyUndo.record({
          label: `${p.favorite ? 'Starred' : 'Unstarred'} ${p.name}`,
          id: `flow-fav:${p.id}`,
          undo: () => setFav(was),
          redo: () => setFav(!was),
        });
      } catch (err) {
        toast(cleanError(err));
      }
    });
    thumb.appendChild(star);
    if (window.azyDaggerPins) window.azyDaggerPins.badge(thumb, 'flow', { id: p.id, name: p.name, easing: p.easing });

    if (p.type === 'custom') {
      const edit = document.createElement('button');
      edit.className = 'count-badge flow-edit-badge';
      edit.textContent = 'edit';
      edit.title = 'Edit this preset';
      edit.addEventListener('click', (e) => {
        e.stopPropagation();
        openEditor(p);
      });
      thumb.appendChild(edit);
    }
    el.appendChild(thumb);

    const name = document.createElement('div');
    name.className = 'file-name';
    name.textContent = p.name;
    name.title = describe(p);
    el.appendChild(name);

    // The card is the curve thumbnail plus its name. What the easing does is in the title, and the
    // graph on the card already says the rest.

    el.addEventListener('click', (ev) => apply(p, el, (window.azyHold ? window.azyHold.matches(ev) : ev.shiftKey)));
    // Panel-only focus guard: clicking a Flow tile inside Premiere must not steal keyboard
    // focus from Effect Controls, or the Selected probe's Delete would land on the panel.
    el.addEventListener('mousedown', (ev) => {
      if (window.__AZY_PANEL__ && scopeCtl && scopeCtl.value === 'selected') ev.preventDefault();
    });
    el.addEventListener('keydown', (ev) => {
      if (ev.target !== el) return; // a focused favorite/pin must never apply the card
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); apply(p, el, (window.azyHold ? window.azyHold.matches(ev) : ev.shiftKey)); }
    });
    el.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      openEditor(p.type === 'custom' ? p : { duplicateOf: p });
    });
    return el;
  }

  function describe(p) {
    const e = p.easing;
    const parts = [`first: ${e.first}`, `middle: ${e.middle}`, `last: ${e.last}`];
    if (e.curve) parts.push(`curve (${e.curve.x1}, ${e.curve.y1}, ${e.curve.x2}, ${e.curve.y2}) × ${e.curve.steps} steps`);
    return (p.description ? p.description + '\n' : '') + parts.join(' · ') + '\nClick to apply · right-click to edit/duplicate';
  }

  function group(label, n) {
    const g = document.createElement('div');
    g.className = 'flow-group';
    g.innerHTML = `<span>${label}</span><span class="n">${n}</span>`;
    return g;
  }

  function paint() {
    grid.innerHTML = '';
    if (!list.length) {
      const e = document.createElement('div');
      e.className = 'empty-state';
      // Empty Flow = the ecosystem web with nothing wired yet (Web Matrix), drawn once
      // behind the orb. Decorative only — see presets/azy-artwork.css.
      const art = window.azyArt ? window.azyArt.markup('art-matrix', 'empty-art empty-art--fade') : '';
      e.innerHTML = art + (query
        ? `<div class="empty-orb"><svg viewBox="0 0 24 24" width="26" height="26"><circle cx="11" cy="11" r="6.2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="m15.6 15.6 4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></div><div>No easing preset matches “${escapeHtml(query)}”</div><div class="empty-hint">Try another spelling, or clear the search box.</div>`
        : `<div class="empty-orb"><svg viewBox="0 0 24 24" width="26" height="26"><path d="M4 19c6 0 4-14 10-14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M14 5h6v6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div>No easing presets yet</div><div class="empty-hint">Create one with the + button — it saves straight into this list.</div>`);
      grid.appendChild(e);
    } else {
      const built = list.filter((p) => p.type === 'builtin');
      const custom = list.filter((p) => p.type === 'custom');
      let i = 0;
      // The user's own presets first, built-ins below.
      if (custom.length) {
        grid.appendChild(group('My presets', custom.length));
        custom.forEach((p) => grid.appendChild(card(p, i++)));
      }
      if (built.length) {
        grid.appendChild(group('Built-in', built.length));
        built.forEach((p) => grid.appendChild(card(p, i++)));
      }
    }
    countPill.textContent = list.length ? `${list.length}` : '';
    countPill.style.opacity = list.length ? '1' : '0';
  }

  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  // ---------- Data ----------

  async function refresh() {
    try {
      all = await P.flowList('');
    } catch (err) {
      all = [];
    }
    filter();
  }

  function filter() {
    const q = query.toLowerCase();
    list = !q
      ? all.slice()
      : all
          .map((p) => {
            const lc = p.name.toLowerCase();
            let s = 0;
            if (lc === q) s = 100;
            else if (lc.startsWith(q)) s = 80;
            else if (lc.split(/[^a-z0-9&]+/).some((w) => w.startsWith(q))) s = 60;
            else if (lc.includes(q)) s = 40;
            else if ((p.description || '').toLowerCase().includes(q)) s = 10;
            return { p, s };
          })
          .filter((x) => x.s)
          .sort((a, b) => b.s - a.s || a.p.name.localeCompare(b.p.name))
          .map((x) => x.p);
    paint();
  }

  // ---------- Premiere state ----------

  async function loadStatus() {
    try {
      status = await P.flowStatus();
    } catch {
      status = null;
    }
    paintTarget();
  }

  // Status events can arrive in bursts (poll + ws reconnect); coalesce repaints
  // into one frame so the Flow header never costs more than a single layout.
  let targetQueued = false;
  function paintTarget() {
    if (targetQueued) return;
    targetQueued = true;
    requestAnimationFrame(() => { targetQueued = false; paintTargetNow(); });
  }
  function paintTargetNow() {
    target.classList.remove('is-ok', 'is-warn', 'is-off');
    let text = 'Premiere Pro not running';
    let cls = 'is-off';
    if (status) {
      switch (status.phase) {
        case 'connected':
          if (!status.canApply) { text = 'Connected — this Premiere can\'t edit keyframes through its scripting engine'; cls = 'is-warn'; }
          else if (!status.hasSequence) { text = 'Connected — open a sequence'; cls = 'is-warn'; }
          else if (!status.selectionCount) { text = 'Select the clip(s) with the keyframes in Premiere'; cls = 'is-warn'; }
          else { text = 'Ready to apply'; cls = 'is-ok'; }
          break;
        case 'connecting': {
          const m = window.azyStatus && window.azyStatus.premiereModule();
          text = m && (m.busy || m.connection === 'restart-host' || m.install !== 'installed') ? m.summary : 'Premiere Pro is open — Azy is starting inside it…'; cls = 'is-warn'; break;
        }
        case 'unsupported':
          text = status.detail || 'Premiere version not supported (needs 25.6+)'; cls = 'is-warn'; break;
        case 'error':
          text = status.detail || 'Azy could not reach Premiere'; cls = 'is-warn'; break;
        default:
          text = 'Open Premiere Pro to use Flow — Azy is ready there.';
      }
    }
    target.classList.add(cls);
    targetText.textContent = text;
    target.title = text;
    target.tabIndex = 0;
    target.setAttribute('aria-label', text);
    if (heroActivity) {
      heroActivity.textContent = cls === 'is-ok' ? 'Target ready — choose a curve' : cls === 'is-warn' ? 'Almost ready — see target status' : 'Waiting for Premiere';
    }
    if (statusHint && !$('flowPane').hidden) {
      statusHint.textContent = ''; // target health already has a dedicated line above the library
      statusHint.classList.remove('is-ok', 'is-warn');
      if (cls !== 'is-off') statusHint.classList.add(cls);
    }
  }

  // ---------- Apply ----------

  async function apply(p, el, withSpeed) {
    if (applying || requestingSpeed) return;
    const scope = { range: scopeCtl ? scopeCtl.value : 'all' };
    if (!status || status.phase === 'premiere-not-running') {
      toast('Premiere Pro is not running. Open Premiere Pro — Azy is ready there.', 3000);
      return;
    }
    if (status.phase === 'connecting') {
      // Premiere is open but Azy isn't linked yet: show the link code (auto-link still happens if the panel is open).
      if (window.azyPair) window.azyPair.show();
      else toast(window.azyStatus ? window.azyStatus.explain({ phase: 'premiere-running-no-connector' }) : 'Azy is starting inside Premiere Pro…', 4200);
      return;
    }
    if (status.phase !== 'connected') {
      toast(status.detail || 'This Premiere version is not supported', 4000);
      return;
    }
    if (!status.selectionCount) {
      toast('Select the clip(s) whose keyframes you want to ease in Premiere, then click the preset', 3500);
      return;
    }
    // Plain click applies at 100% straight away. Shift+click asks for a speed first (never remembered:
    // the card always opens at 100%).
    let speed = 1;
    if (withSpeed && window.azySpeedPrompt) {
      el.classList.add('asking');
      let v;
      requestingSpeed = true;
      try { v = await window.azySpeedPrompt.ask(document.body, { title: 'Apply with speed', name: p.name }); }
      finally { requestingSpeed = false; el.classList.remove('asking'); }
      if (v === null || applying) return;
      speed = v;
    }
    if (scopeCtl && scopeCtl.value !== scope.range) { toast('Scope changed — choose the easing again.', 2200); return; }
    applying = p.id;
    el.classList.add('applying');
    el.classList.remove('done', 'failed', 'warn');
    // Non-blocking: the runtime streams stage/progress events; the overlay shows real stages only.
    const pane = el.closest('.pane') || document.body;
    const operationId = 'op_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const w = window.azyWait ? window.azyWait.show(document.body, { title: 'Applying Flow', name: p.name, operationId, onCancel: () => P.cancelOperation(operationId) }) : null;
    activeWait = w;
    let outcome = 'failed';
    try {
      // Speed ≠ 100% (Shift-click only): first + last keyframe are the boundaries, Flow regenerates everything between.
      const r = await P.flowApply(p.id, scope, speed, speed !== 1 ? 'outer' : undefined, operationId);
      if (r.state === 'CANCELLED') {
        // Honest cancel (v1.17): only "Cancelled" when nothing was written; otherwise "Stopped".
        const wrote = (r.keyframesAdded || 0) + (r.keyframesChanged || 0);
        if (!wrote) { lastSummary = 'Cancelled · nothing was changed'; toast(`${p.name} cancelled — nothing was changed in Premiere`, 2400); }
        else { lastSummary = `Stopped · ${wrote.toLocaleString()} keyframes already written (Ctrl+Z reverts)`; toast(`${p.name} stopped — ${wrote.toLocaleString()} keyframes were already written; Ctrl+Z in Premiere reverts them`, 4200); }
      }
      const kf = r.keyframesChanged + r.keyframesAdded;
      if (r.state === 'CANCELLED') {
        /* handled above */
      } else if (r.state === 'SUCCESS') {
        outcome = 'done';
        const removed = r.keyframesRemoved || 0;
        const spd = speed !== 1 ? ` at ${Math.round(speed * 100)}%` : '';
        if (!kf && !removed) toast(`${p.name}: ${(r.warnings && r.warnings[0]) || 'keyframes already had this easing'}`, 3200);
        else if (!r.keyframesAdded && r.warnings && r.warnings.length) {
          // Curve requested but nothing baked: the runtime says why — show that, not a green summary.
          outcome = 'warn';
          lastSummary = r.warnings[0];
          toast(`${p.name}: ${r.warnings[0]}`, 5200);
        } else {
          const bits = [];
          if (r.keyframesAdded) bits.push(`${r.keyframesAdded} keyframes`);
          if (removed) bits.push(`${removed} replaced`);
          if (r.keyframesChanged && !r.keyframesAdded) bits.push(`${r.keyframesChanged} keyframe${r.keyframesChanged === 1 ? '' : 's'}`);
          lastSummary = `${r.keyframesAdded ? r.keyframesAdded.toLocaleString() + ' keyframes' : 'Applied'}${spd}`;
          if (window.azyDoneSfx) window.azyDoneSfx.play('flow'); // a real, clean completion only
          toast(`${p.name}${spd} → ${r.params} propert${r.params === 1 ? 'y' : 'ies'}, ${bits.join(', ')} · Ctrl+Z undoes`, 2600);
        }
      } else if (r.state === 'PARTIAL') {
        outcome = 'done';
        toast(`${p.name} applied with ${r.warnings.length} warning${r.warnings.length === 1 ? '' : 's'}: ${r.warnings[0] || ''}`, 4000);
      } else {
        toast(`Couldn't apply ${p.name}${r.warnings[0] ? ': ' + r.warnings[0] : ''}`, 4000);
      }
    } catch (err) {
      // Show Premiere's real reason (the runtime now explains *why*: no keyframes / outside In/Out / unreadable).
      const m = cleanError(err);
      lastSummary = m;
      toast(m || 'Flow could not be applied.', 5200);
    } finally {
      if (w) { if (outcome === 'done') w.done(lastSummary || 'Done'); else w.fail(lastSummary || "Couldn't apply"); }
      activeWait = null;
      lastSummary = '';
      applying = null;
      el.classList.remove('applying');
      el.classList.add(outcome);
      setTimeout(() => el.classList.remove('done', 'failed', 'warn'), 700);
      refresh();
    }
  }

  // ---------- Custom ease editor ----------
  // A real curve editor: drag the two handles (or pick a library curve / type numbers). Sample dots
  // show exactly which extra keyframes Azy will add between each keyframe pair when applied.

  const F = {
    name: $('flowEditName'), first: $('flowEditFirst'), middle: $('flowEditMiddle'), last: $('flowEditLast'),
    curveOn: $('flowEditCurveOn'), lib: $('flowEditCurveLib'), graph: $('flowGraph'),
    x1: $('flowEditX1'), y1: $('flowEditY1'), x2: $('flowEditX2'), y2: $('flowEditY2'), steps: $('flowEditSteps'), every: $('flowEditEvery'),
    path: $('flowCurvePath'), samples: $('flowCurveSamples'), speedCurve: $('flowVelocityCurve'), speedLabel: $('flowVelocityLabel'), speedOn: $('flowEditVelocityOn'), h1: $('flowHandle1'), h2: $('flowHandle2'),
    l1: $('flowHandleLine1'), l2: $('flowHandleLine2'), summary: $('flowInterpSummary'),
    save: $('flowEditSave'), del: $('flowEditDelete'), close: $('flowEditClose')
  };

  const libCurvePath = (c) => `M0 100 C ${c.x1 * 100} ${100 - c.y1 * 100}, ${c.x2 * 100} ${100 - c.y2 * 100}, 100 0`;
  CURVES.filter((c) => c.x1 !== null).forEach((c) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.title = c.name;
    b.dataset.name = c.name;
    b.innerHTML = `<svg viewBox="-8 -8 116 116"><line class="lib-handle" x1="0" y1="100" x2="${c.x1 * 100}" y2="${100 - c.y1 * 100}"/><line class="lib-handle" x1="100" y1="0" x2="${c.x2 * 100}" y2="${100 - c.y2 * 100}"/><path class="lib-curve" d="${libCurvePath(c)}"/></svg>`;
    b.addEventListener('click', () => {
      F.x1.value = c.x1; F.y1.value = c.y1; F.x2.value = c.x2; F.y2.value = c.y2;
      drawCurve();
    });
    F.lib.appendChild(b);
  });

  function openEditor(p) {
    editorOpener = document.activeElement;
    const src = p && p.duplicateOf ? p.duplicateOf : p;
    editing = { id: p && !p.duplicateOf && p.type === 'custom' ? p.id : null };
    const e = (src && src.easing) || { first: 'bezier', middle: 'linear', last: 'bezier' };
    F.name.value = editing.id ? src.name : src ? `${src.name} copy` : '';
    F.first.value = e.first;
    F.middle.value = e.middle;
    F.last.value = e.last;
    const c = e.curve || { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1, steps: 0 };
    F.curveOn.checked = !!e.curve || !src; // new presets start with the curve on
    F.x1.value = c.x1; F.y1.value = c.y1; F.x2.value = c.x2; F.y2.value = c.y2; F.steps.value = c.steps;
    if (F.every) F.every.value = c.every || 1;
    F.del.hidden = !editing.id;
    F.save.querySelector('span').textContent = editing.id ? 'Save changes' : 'Save preset';
    editor.hidden = false;
    grid.classList.add('is-editing');
    drawCurve();
    F.name.focus();
    F.name.select();
  }

  function closeEditor() {
    editing = null;
    editor.hidden = true;
    grid.classList.remove('is-editing');
    (editorOpener && editorOpener.isConnected ? editorOpener : createBtn).focus();
  }

  function readEasing() {
    const easing = { first: F.first.value, middle: F.middle.value, last: F.last.value };
    if (F.curveOn.checked) {
      const st = Math.round(+F.steps.value);
      const ev = F.every ? Math.round(+F.every.value) : 1;
      easing.curve = { x1: +F.x1.value, y1: +F.y1.value, x2: +F.x2.value, y2: +F.y2.value, steps: st > 0 && st < 2 ? 2 : Math.max(0, st), every: ev >= 1 && ev <= 6 ? ev : 1 };
    }
    return easing;
  }

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const r2 = (v) => Math.round(v * 100) / 100;

  function bez(t, x1, y1, x2, y2) {
    const mt = 1 - t;
    return {
      x: 3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t * t * t,
      y: 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t * t * t
    };
  }

  function drawCurve() {
    const x1 = clamp(+F.x1.value || 0, 0, 1), y1 = +F.y1.value || 0, x2 = clamp(+F.x2.value || 0, 0, 1), y2 = +F.y2.value || 0;
    F.path.setAttribute('d', `M0 100 C ${x1 * 100} ${100 - y1 * 100}, ${x2 * 100} ${100 - y2 * 100}, 100 0`);
    F.h1.setAttribute('cx', x1 * 100); F.h1.setAttribute('cy', 100 - y1 * 100);
    F.h2.setAttribute('cx', x2 * 100); F.h2.setAttribute('cy', 100 - y2 * 100);
    F.l1.setAttribute('x2', x1 * 100); F.l1.setAttribute('y2', 100 - y1 * 100);
    F.l2.setAttribute('x2', x2 * 100); F.l2.setAttribute('y2', 100 - y2 * 100);
    const stepsRaw = Math.round(+F.steps.value);
    const steps = stepsRaw > 0 ? clamp(stepsRaw, 2, 24) : 12; // 0 = every frame; preview shows 12 dots
    let d = '';
    if (F.curveOn.checked) {
      for (let i = 1; i < steps; i++) {
        const pt = bez(i / steps, x1, y1, x2, y2);
        d += `M${pt.x * 100 - 1.4} ${100 - pt.y * 100} a1.4 1.4 0 1 0 2.8 0 a1.4 1.4 0 1 0 -2.8 0 `;
      }
    }
    F.samples.setAttribute('d', d);
    drawSpeed(x1, y1, x2, y2);
    F.graph.classList.toggle('is-off', !F.curveOn.checked);
    const hit = CURVES.find((c) => c.x1 !== null && r2(x1) === c.x1 && r2(y1) === c.y1 && r2(x2) === c.x2 && r2(y2) === c.y2);
    F.lib.querySelectorAll('button').forEach((b) => b.classList.toggle('active', !!hit && b.dataset.name === hit.name));
    F.summary.textContent = `${F.first.value} · ${F.middle.value} · ${F.last.value}${F.curveOn.checked ? (stepsRaw > 0 ? ` · ${steps} samples` : ' · baked every frame') : ''}`;
  }

  // Speed indicator: the velocity of the ease (dy/dt of the value curve) drawn over the graph, like the
  // speed graph in Smoothify / After Effects. Peaks where the motion is fastest; a flat line = linear.
  function drawSpeed(x1, y1, x2, y2) {
    const on = F.speedOn ? F.speedOn.checked : true;
    if (!F.speedCurve) return;
    F.graph.classList.toggle('speed-off', !on);
    if (!on || !F.curveOn.checked) { F.speedCurve.setAttribute('d', ''); return; }
    const N = 120;
    const xs = [], vs = [];
    let prev = bez(0, x1, y1, x2, y2);
    for (let i = 1; i <= N; i++) {
      const pt = bez(i / N, x1, y1, x2, y2);
      const dx = pt.x - prev.x;
      vs.push(dx > 1e-6 ? (pt.y - prev.y) / dx : 0);
      xs.push((pt.x + prev.x) / 2);
      prev = pt;
    }
    const peak = Math.max(1, ...vs.map((v) => Math.abs(v)));
    let d = '';
    for (let i = 0; i < xs.length; i++) {
      const y = 100 - (Math.max(0, vs[i]) / peak) * 96;
      d += `${i ? 'L' : 'M'}${(xs[i] * 100).toFixed(2)} ${y.toFixed(2)} `;
    }
    F.speedCurve.setAttribute('d', d);
    if (F.speedLabel) F.speedLabel.textContent = `velocity · peak ${peak.toFixed(2)}×`;
  }

  // Handle dragging (pointer events; the svg is 0..100 in both axes, y flipped).
  let drag = null;
  function graphPoint(ev) {
    const r = F.graph.getBoundingClientRect();
    return { x: clamp((ev.clientX - r.left) / r.width, 0, 1), y: clamp(1 - (ev.clientY - r.top) / r.height, -0.6, 1.6) };
  }
  F.graph.addEventListener('pointerdown', (ev) => {
    let which = ev.target.dataset && ev.target.dataset.handle;
    if (!which) {
      // click anywhere: grab the nearer handle
      const p = graphPoint(ev);
      const d1 = Math.hypot(p.x - +F.x1.value, p.y - +F.y1.value);
      const d2 = Math.hypot(p.x - +F.x2.value, p.y - +F.y2.value);
      which = d1 <= d2 ? '1' : '2';
    }
    drag = which;
    (which === '1' ? F.h1 : F.h2).classList.add('dragging');
    F.graph.setPointerCapture(ev.pointerId);
    move(ev);
    ev.preventDefault();
  });
  function move(ev) {
    if (!drag) return;
    const p = graphPoint(ev);
    if (drag === '1') { F.x1.value = r2(p.x); F.y1.value = r2(p.y); } else { F.x2.value = r2(p.x); F.y2.value = r2(p.y); }
    drawCurve();
  }
  F.graph.addEventListener('pointermove', move);
  const endDrag = () => { if (!drag) return; (drag === '1' ? F.h1 : F.h2).classList.remove('dragging'); drag = null; };
  F.graph.addEventListener('pointerup', endDrag);
  F.graph.addEventListener('pointercancel', endDrag);

  [F.x1, F.y1, F.x2, F.y2, F.steps].forEach((inp) => inp.addEventListener('input', drawCurve));
  [F.first, F.middle, F.last].forEach((sel) => sel.addEventListener('change', drawCurve));
  F.curveOn.addEventListener('change', drawCurve);
  if (F.speedOn) F.speedOn.addEventListener('change', drawCurve);
  F.close.addEventListener('click', closeEditor);
  F.save.addEventListener('click', async () => {
    const name = F.name.value.trim();
    if (!name) { toast('Give the preset a name'); F.name.focus(); return; }
    try {
      const easing = readEasing();
      const was = editing && editing.id ? { name: editing.name, easing: editing.easing } : null;
      const saved = editing && editing.id ? await P.flowUpdate(editing.id, { name, easing }) : await P.flowCreate({ name, easing });
      toast(editing && editing.id ? `Saved ${saved.name}` : `Created ${saved.name}`);
      closeEditor();
      refresh();
      if (window.azyUndo) {
        // A curve Azy wrote is a curve Azy can write back: the previous settings go into the stack
        // before the panel has even finished closing, so Ctrl+Z lands the old easing on the same
        // preset rather than in a new one.
        window.azyUndo.record(was ? {
          label: `Saved easing ${saved.name}`,
          undo: () => P.flowUpdate(saved.id, was).then(refresh).catch(() => {}),
          redo: () => P.flowUpdate(saved.id, { name, easing }).then(refresh).catch(() => {}),
        } : {
          label: `Created easing ${saved.name}`,
          undo: () => P.flowDelete(saved.id).then(refresh).catch(() => {}),
          redo: () => P.flowCreate({ name, easing }).then(refresh).catch(() => {}),
        });
      }
    } catch (err) {
      toast(cleanError(err), 3500);
    }
  });
  F.del.addEventListener('click', async () => {
    if (!editing || !editing.id) return;
    try {
      const gone = { name: editing.name, easing: editing.easing, type: editing.type };
      await P.flowDelete(editing.id);
      toast('Preset deleted', 2000);
      closeEditor();
      refresh();
      if (window.azyUndo) {
        // A deleted custom curve is written back as a new preset: Premiere has no "undelete", and
        // the engine mints a fresh id — the shape of the easing, which is the part you miss, is
        // byte-for-byte what it was. The status line says so after the undo.
        window.azyUndo.record({
          label: `Deleted easing ${gone.name}`,
          undo: () => P.flowCreate({ name: gone.name, easing: gone.easing }).then(() => {
            toast('Curve restored — it comes back as a new preset, because Premiere has no undelete', 4200);
            return refresh();
          }).catch(() => {}),
          redo: () => P.flowList().then((list) => {
            const again = (list.presets || list || []).find((x) => x.name === gone.name);
            if (again) return P.flowDelete(again.id);
            return null;
          }).then(refresh).catch(() => {}),
        });
      }
    } catch (err) {
      toast(cleanError(err), 3500);
    }
  });
  editor.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.stopPropagation(); closeEditor(); }
    if (e.key === 'Enter' && e.target === F.name) F.save.click();
  });

  // ---------- Events ----------

  search.addEventListener('input', () => {
    query = search.value.trim();
    clearTimeout(searchTimer);
    searchTimer = setTimeout(filter, 40);
  });
  createBtn.addEventListener('click', () => openEditor(null));
  function paintScope() {
    const blocked = !!scopeCtl && !scopeCtl.canApply;
    const note = $('flowScopeNote');
    if (note) { note.hidden = !blocked; note.textContent = blocked ? scopeCtl.hint() : ''; }
    grid.querySelectorAll('.flow-card').forEach((card) => card.setAttribute('aria-disabled', String(blocked)));
    paintTarget();
  }
  if (scopeCtl) scopeCtl.onChange(paintScope);
  paintScope();

  P.on('operationProgress', (ev) => { if (activeWait) activeWait.fromEvent(ev); });
  P.on('flowChange', () => { refresh(); loadStatus(); });
  // The same Flow also lives inside the Azy panel in Premiere; a tile clicked there is reported here
  // so the desktop app shows the same result (and lastUsed/favorites stay in sync both ways).
  P.on('flowApplied', (p) => {
    if (!p || p.source !== 'panel') return;
    const r = p.result || {};
    const kf = (r.keyframesChanged || 0) + (r.keyframesAdded || 0);
    toast(r.state === 'SUCCESS'
      ? (kf || r.keyframesRemoved ? `${p.presetName} applied in Premiere${r.keyframesAdded ? ` → ${r.keyframesAdded} baked` : r.keyframesRemoved ? ` → ${r.keyframesRemoved} replaced` : ` → ${r.keyframesChanged} keyframes`}` : `${p.presetName}: keyframes already had this easing`)
      : `${p.presetName} in Premiere: ${String(r.state || '').toLowerCase()}`, 2600);
    const el = Array.from(grid.querySelectorAll('[data-flow-id]')).find((c) => c.dataset.flowId === p.presetId);
    if (el) { el.classList.add('applying'); setTimeout(() => el.classList.remove('applying'), 700); }
  });
  if (window.azyStatus) window.azyStatus.onChange(() => paintTarget());
  P.on('connection', () => {
    const before = status && status.phase;
    loadStatus().then(() => {
      if (!status) return;
      // Non-blocking: one toast when Premiere goes away, one when it comes back.
      if (before === 'connected' && status.phase !== 'connected') toast('Premiere Pro disconnected — Flow paused until it\'s back', 3000);
      else if (before && before !== 'connected' && status.phase === 'connected') toast('Premiere Pro connected — Flow ready', 2000);
    });
  });

  async function show() {
    if (!booted) {
      booted = true;
      try {
        await P.boot();
      } catch (err) {
        booted = false;
        grid.innerHTML = `<div class="empty-state"><div>Couldn't start the preset engine</div><div>${escapeHtml(cleanError(err))}</div></div>`;
        return;
      }
    }
    await Promise.all([refresh(), loadStatus()]);
    if (!warnedNotRunning && status && status.phase === 'premiere-not-running') {
      warnedNotRunning = true;
      toast('Premiere Pro is not running. Open Premiere Pro to use Flow.', 3200);
    }
    search.focus();
  }

  // ---------- Move selected keyframes to playhead ----------
  // SELECT keys → park the playhead → one click (or the global shortcut). The group is
  // translated in time so its first (Start) or last (End) key lands exactly on the playhead;
  // values, interpolation and relative spacing never change. The heavy lifting (detection →
  // single offset → one batched write) lives in presets-main.js + the connector.
  const moveMode = $('flowMoveMode');
  const moveBtn = $('flowMoveBtn');
  const moveShortcutBtn = $('flowMoveShortcutBtn');
  const moveShortcutText = $('flowMoveShortcutText');
  let moving = false;
  let moveShortcut = 'Ctrl+Alt+P';
  const MOVE_DEFAULT_SHORTCUT = 'Ctrl+Alt+P';

  function paintMoveSettings(s) {
    if (!s) return;
    moveShortcut = typeof s.shortcut === 'string' && s.shortcut ? s.shortcut : MOVE_DEFAULT_SHORTCUT;
    if (moveShortcutText) moveShortcutText.textContent = moveShortcut;
    if (moveMode && (s.mode === 'start' || s.mode === 'end')) moveMode.value = s.mode;
    if (moveShortcutBtn) {
      if (s.registered === false) {
        moveShortcutBtn.classList.add('is-conflict');
        moveShortcutBtn.title = `${moveShortcut} is taken by another app — click to pick a different combination`;
      } else {
        moveShortcutBtn.classList.remove('is-conflict');
        moveShortcutBtn.title = 'Global shortcut — works with the Flow panel closed. Click to record a new one.';
      }
    }
  }

  async function runMove(mode) {
    if (moving) return;
    if (!status || status.phase === 'premiere-not-running') { toast('Premiere Pro is not running. Open Premiere Pro first.', 3000); return; }
    if (status.phase !== 'connected') { toast(status && status.detail ? status.detail : 'Azy is not connected to Premiere yet.', 3500); return; }
    if (!status.selectionCount) { toast('Select the clip(s) with the keyframes in Premiere first.', 3200); return; }
    moving = true;
    if (moveBtn) moveBtn.classList.add('applying');
    const w = window.azyWait ? window.azyWait.show(document.body, { title: 'Moving keyframes', name: mode === 'end' ? 'End at playhead' : 'Start at playhead' }) : null;
    try {
      const r = await P.flowMove(mode);
      const n = Number(r && r.moved) || 0;
      const msg = n
        ? (mode === 'end' ? `${n} keyframe${n === 1 ? '' : 's'} aligned to the playhead (end)` : `${n} keyframe${n === 1 ? '' : 's'} moved to the playhead`)
        : 'Keyframes already at the playhead';
      toast(`${msg} · Ctrl+Z undoes`, 2600);
      if (w) w.done(msg);
    } catch (err) {
      const m = cleanError(err);
      toast(m, 4600);
      if (w) w.fail(m);
    } finally {
      moving = false;
      if (moveBtn) moveBtn.classList.remove('applying');
    }
  }

  if (moveBtn) {
    moveBtn.addEventListener('click', () => runMove(moveMode ? moveMode.value : 'start'));
    // Same panel focus guard as the cards: the move's detection probe sends Delete to
    // Effect Controls, so clicking the button inside Premiere must not steal keyboard focus.
    moveBtn.addEventListener('mousedown', (ev) => { if (window.__AZY_PANEL__) ev.preventDefault(); });
  }
  if (moveMode) moveMode.addEventListener('change', () => { if (P.flowMoveSetSettings) P.flowMoveSetSettings({ mode: moveMode.value }).catch(() => {}); });

  // Shortcut recorder — same accelerator rules as the Snap/Speed settings.
  if (moveShortcutBtn) {
    const MOD_KEYS = new Set(['Shift', 'Control', 'Alt', 'Meta', 'AltGraph', 'CapsLock', 'NumLock']);
    const KEY_NAMES = { ' ': 'Space', 'ArrowUp': 'Up', 'ArrowDown': 'Down', 'ArrowLeft': 'Left', 'ArrowRight': 'Right', 'Escape': 'Esc', 'Enter': 'Return', 'Backspace': 'Backspace', 'Delete': 'Delete', 'Tab': 'Tab', 'Home': 'Home', 'End': 'End', 'PageUp': 'PageUp', 'PageDown': 'PageDown', 'Insert': 'Insert', '+': 'Plus', '=': '=', '-': '-', ',': ',', '.': '.', '/': '/', ';': ';', "'": "'", '[': '[', ']': ']', '\\': '\\', '`': '`' };
    let recording = false;
    function accelFrom(e) {
      if (MOD_KEYS.has(e.key)) return null;
      let key;
      if (/^F\d{1,2}$/.test(e.key)) key = e.key;
      else if (e.key.length === 1 && /[a-z0-9]/i.test(e.key)) key = e.key.toUpperCase();
      else if (e.code && /^Key[A-Z]$/.test(e.code)) key = e.code.slice(3);
      else if (e.code && /^Digit\d$/.test(e.code)) key = e.code.slice(5);
      else key = KEY_NAMES[e.key];
      if (!key) return null;
      const mods = [];
      if (e.ctrlKey) mods.push('Ctrl');
      if (e.altKey) mods.push('Alt');
      if (e.shiftKey) mods.push('Shift');
      if (e.metaKey) mods.push('Super');
      if (!mods.length && !/^F\d{1,2}$/.test(key)) return { error: 'Add Ctrl, Alt or Shift — a bare key would block typing in other apps' };
      return { accel: mods.concat(key).join('+') };
    }
    function stopRecording() {
      recording = false;
      document.removeEventListener('keydown', onRecordKey, true);
      moveShortcutBtn.classList.remove('recording');
      if (moveShortcutText) moveShortcutText.textContent = moveShortcut;
    }
    function onRecordKey(e) {
      e.preventDefault(); e.stopPropagation();
      if (e.key === 'Escape' && !e.ctrlKey && !e.altKey && !e.shiftKey) { stopRecording(); return; }
      const r = accelFrom(e);
      if (!r) return;
      if (r.error) { toast(r.error, 3200); return; }
      stopRecording();
      if (r.accel !== moveShortcut && P.flowMoveSetSettings) P.flowMoveSetSettings({ shortcut: r.accel }).catch(() => {});
    }
    moveShortcutBtn.addEventListener('click', () => {
      if (recording) { stopRecording(); return; }
      recording = true;
      moveShortcutBtn.classList.add('recording');
      if (moveShortcutText) moveShortcutText.textContent = 'Press keys…';
      document.addEventListener('keydown', onRecordKey, true);
    });
  }

  // Shortcut-triggered moves (Flow panel closed / another window): same toast surface.
  P.on('flowMoved', (p) => {
    if (!p) return;
    if (p.ok) toast(`${p.mode === 'end' ? 'End at playhead' : 'Start at playhead'} → ${p.moved ? `${p.moved} keyframe${p.moved === 1 ? '' : 's'} moved` : 'keyframes moved'}`, 2600);
    else toast(p.message || 'Could not move the selected keyframes.', 4600);
  });
  P.on('flowMoveSettings', paintMoveSettings);
  if (P.flowMoveGetSettings) P.flowMoveGetSettings().then(paintMoveSettings).catch(() => {});

  window.azyFlow = { show };
})();

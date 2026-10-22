/* Pins for the SFX and Presets wheels (Dagger). One badge (◎) on audio cards and preset cards;
 * click toggles the pin. State comes from dagger-main.js's settings and is pushed to every
 * badge on change, so Files, Presets and the Settings list always agree. Also shows the
 * wheels' result toasts (placed / applied / failed) in the main window. */
(function () {
  const P = window.presets;
  if (!P || !P.daggerGetSettings) return;
  const RING = '<svg viewBox="0 0 24 24" width="11" height="11"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="2.6" fill="currentColor"/><path d="M12 4v4M12 16v4M4 12h4M16 12h4" stroke="currentColor" stroke-width="1.4"/></svg>';
  let pins = { sfx: [], presets: [], flow: [] };
  const badges = new Set(); // { el, wheel, item }
  const keyOf = (wheel, item) => wheel === 'sfx' ? item.path : item.id;
  const WNAME = { sfx: 'SFX', presets: 'Presets', flow: 'Flow' };
  const WKEY = { sfx: 'Alt + Right mouse', presets: 'Shift + Right mouse', flow: 'Ctrl + Shift + Right mouse' }; // replaced by the live bindings below
  const isPinned = (wheel, item) => (pins[wheel] || []).some((p) => keyOf(wheel, p) === keyOf(wheel, item));
  function paint(b) {
    const on = isPinned(b.wheel, b.item);
    b.el.classList.toggle('on', on);
    if (b.el.disabled && !on) return; // e.g. a missing file: its own explanation stays
    b.el.title = on ? `Unpin from the ${WNAME[b.wheel]} wheel` : `Pin to the ${WNAME[b.wheel]} wheel (${WKEY[b.wheel]})`;
    b.el.setAttribute('aria-pressed', on ? 'true' : 'false');
    b.el.setAttribute('aria-label', `${b.el.title}: ${b.item.name || ''}`);
  }
  let apply = function (v) {
    if (!v || !v.pins) return;
    pins = v.pins;
    if (Array.isArray(v.wheels)) for (const w of v.wheels) if (w.id in WKEY) WKEY[w.id] = w.label;
    document.querySelectorAll('.wheel-btn').forEach((b) => { const w = b.dataset.wheel; if (WKEY[w]) b.title = `${WNAME[w]} wheel — ${w === 'sfx' ? 'pinned sounds' : w === 'presets' ? 'pinned presets' : 'pinned easings'} (${WKEY[w]})`; });
    for (const b of badges) { if (!b.el.isConnected) badges.delete(b); else paint(b); }
  };
  async function toggle(wheel, item) {
    const want = !isPinned(wheel, item);
    try {
      const v = await P.daggerPin(wheel, item, want);
      if (v && v.error) { toast(v.error, 3000); return; }
      apply(v);
      if (window.azyUiSounds) window.azyUiSounds.play(want ? 'pin' : 'unpin'); // success only
      toast(want ? `${item.name} pinned to the ${WNAME[wheel]} wheel` : `${item.name} unpinned`, 1500);
      // Keep each toggle as its own entry; coalescing different pins loses their inverses.
      if (window.azyUndo) window.azyUndo.record({
        label: `${want ? 'Pinned' : 'Unpinned'} ${item.name}`,
        undo: () => toggle(wheel, item),
        redo: () => toggle(wheel, item),
      });
    } catch (err) { toast(String(err && err.message ? err.message : err), 3000); }
  }
  function badge(thumb, wheel, item) {
    const el = document.createElement('button');
    el.className = 'wheel-badge';
    el.dataset.sfx = 'own';
    el.innerHTML = RING;
    el.addEventListener('click', (e) => { e.stopPropagation(); e.preventDefault(); toggle(wheel, item); });
    el.addEventListener('dblclick', (e) => e.stopPropagation());
    thumb.appendChild(el);
    const b = { el, wheel, item };
    badges.add(b); paint(b);
    return el;
  }
  P.onDagger('settings', (v) => apply(v));

  // While a wheel is up, the press that opened it (and its release / context menu / auxclick) must
  // not act inside Azy. Capture-phase listeners on window, armed by main, disarmed ~200 ms after
  // the wheel closes so the trailing button-up is eaten too.
  //
  // Keyboard needs a slightly different fence. A binding modifier's keydown happened *before*
  // Dagger opened, therefore its keyup must keep travelling through Chromium so its real focus
  // target cannot retain Ctrl/Alt/Shift. New keydowns while a radial is up are fenced from Azy's
  // own shortcuts, and only their matching keyups are fenced too. This keeps the pair balanced
  // without swallowing the activation modifier's release.
  let guardTimer = 0, guardOn = false, keyboardFenceOn = false, guardSince = 0;
  // Watchdog: the wheel confines and hides the cursor for the whole gesture, so a primary-button
  // press that reaches an Azy window while the fence is up proves the "wheel closed" message was
  // lost (helper restart, crashed wheel renderer). Release the fence instead of leaving Azy deaf.
  const releaseStuckFence = (why) => {
    if (!guardOn && !keyboardFenceOn) return;
    clearTimeout(guardTimer);
    guardOn = false; keyboardFenceOn = false;
    resetKeyboardFence(true);
    console.warn('[dagger] input fence released: ' + why);
  };
  const observedKeys = new Set();
  const fencedKeyUps = new Set();
  const DOM_BTN = { 2: 2, 3: 1, 4: 3, 5: 4 }; // native helper IDs → DOM button numbers
  let guardBtn = 2;
  const keyId = (e) => String(e.code || e.key || e.keyCode || '');
  const resetKeyboardFence = (clearPairs = true) => {
    observedKeys.clear();
    if (clearPairs) fencedKeyUps.clear();
  };
  const eat = (e) => {
    if ((guardOn || keyboardFenceOn) && e.type === 'pointerdown' && e.button === 0 && guardSince && Date.now() - guardSince > 400) releaseStuckFence('primary press while a wheel was reported open');
    if (guardOn && (e.type === 'contextmenu' || e.button === guardBtn || e.button === 2)) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  };
  const fenceKeydown = (e) => {
    const id = keyId(e);
    if (id) observedKeys.add(id);
    if (!keyboardFenceOn) {
      // A fresh, unfenced press owns its own release. Drop any stale fenced keyup for this key
      // (its release was lost to a blur / focus change), otherwise it would swallow THIS keyup
      // and leave the key looking held to Azy's handlers.
      if (id) fencedKeyUps.delete(id);
      return;
    }
    if (id) fencedKeyUps.add(id);
    e.preventDefault();
    e.stopImmediatePropagation();
  };
  const fenceKeyup = (e) => {
    const id = keyId(e);
    if (id) observedKeys.delete(id);
    // A key whose down was fenced must not leave a lone keyup in an Azy pane.
    // The activation modifier is intentionally absent from this set, so its
    // physically delivered release remains visible to the focused application.
    if (id && fencedKeyUps.delete(id)) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  };
  for (const t of ['mousedown', 'mouseup', 'pointerdown', 'pointerup', 'pointercancel', 'auxclick', 'contextmenu', 'click']) window.addEventListener(t, eat, true);
  window.addEventListener('keydown', fenceKeydown, true);
  window.addEventListener('keyup', fenceKeyup, true);
  // A window can lose focus while Premiere owns the actual gesture. Clear only transient local
  // bookkeeping; do not disarm the mouse guard on blur because the physical release may still
  // arrive after focus returns. A hidden/unloaded document cannot receive it, so it is safe to
  // discard both fences there instead of carrying state into a later renderer session.
  window.addEventListener('blur', () => resetKeyboardFence(false), true);
  window.addEventListener('focus', () => {
    resetKeyboardFence(false);
    // Focus coming back long after a wheel opened (no gesture lasts 20 s): the close was lost.
    if (guardSince && Date.now() - guardSince > 20000) releaseStuckFence('focus returned after a stale wheel session');
  }, true);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') {
      keyboardFenceOn = false;
      guardOn = false;
      resetKeyboardFence(true);
    }
  }, true);
  window.addEventListener('pagehide', () => {
    keyboardFenceOn = false;
    guardOn = false;
    resetKeyboardFence(true);
  }, true);
  P.onDagger('guard', (g) => {
    clearTimeout(guardTimer);
    if (g && g.open) {
      // A new wheel never inherits a key blocked by a prior cancelled session.
      resetKeyboardFence(true);
      keyboardFenceOn = true;
      guardOn = true;
      guardSince = Date.now();
      guardBtn = DOM_BTN[g.button] ?? 2;
    } else {
      // Stop blocking new keyboard commands immediately. Keep the paired keyup
      // set until those keys release, so a key pressed during Dagger stays paired.
      keyboardFenceOn = false;
      resetKeyboardFence(false);
      guardSince = 0;
      guardTimer = setTimeout(() => { guardOn = false; }, 220);
    }
  });
  // Narrow diagnostic/coordination surface for the shared Files/Presets/Flow keyboard handlers.
  // It contains no physical key state and is cleared on every Dagger lifecycle boundary.
  window.azyDaggerInput = { active: () => keyboardFenceOn, reset: () => resetKeyboardFence(true), release: () => releaseStuckFence('manual') };
  P.onDagger('toast', ({ text }) => toast(text, 3200));

  // ---- Wheel buttons (Files toolbar → SFX, Presets toolbar → Presets): count badge + popover ----
  // The popover lists what's on the wheel in wheel order (1–8), lets you drop items, preview the
  // wheel, and tells you how to add more. Adding is done on the tiles (◎ badge) so the list stays
  // the single source of truth.
  const LABEL = { sfx: 'SFX wheel', presets: 'Presets wheel', flow: 'Flow wheel' };
  const HOW = { sfx: 'Hover a sound in Files and click its ◎ to pin it here. Hold the SFX wheel binding (see Settings › Dagger) anywhere to open it; release on a sound to drop it at the playhead.', presets: 'Hover a preset and click its ◎ to pin it here. Hold the Presets wheel binding anywhere to open it; release on a preset to apply it to the selected clips.', flow: 'Hover a Flow preset and click its ◎ to pin it here. Hold the Flow wheel binding anywhere to open it; release on an easing to apply it to the selected clips\' keyframes.' };
  let pop = null, popWheel = null;
  function closePop() { if (pop) { pop.classList.remove('in'); const p = pop; setTimeout(() => p.remove(), 160); pop = null; popWheel = null; } }
  function paintButtons() {
    document.querySelectorAll('.wheel-btn').forEach((b) => {
      const w = b.dataset.wheel, n = (pins[w] || []).length;
      const c = b.querySelector('.wheel-btn-count'); if (c) c.textContent = n ? String(n) : '';
      b.classList.toggle('has-pins', n > 0);
      b.setAttribute('aria-pressed', popWheel === w ? 'true' : 'false');
    });
    if (pop && popWheel) renderPop(popWheel);
  }
  function renderPop(wheel) {
    const list = pins[wheel] || [];
    pop.innerHTML = '';
    const head = document.createElement('div'); head.className = 'wheel-pop-head';
    head.innerHTML = `<b>${LABEL[wheel]}</b><span>${list.length}/8 · ${WKEY[wheel]}</span>`;
    pop.appendChild(head);
    if (!list.length) {
      const e = document.createElement('div'); e.className = 'wheel-pop-empty'; e.textContent = HOW[wheel]; pop.appendChild(e);
    } else {
      const ul = document.createElement('div'); ul.className = 'wheel-pop-list';
      list.forEach((it, i) => {
        const row = document.createElement('div'); row.className = 'wheel-pop-row';
        row.innerHTML = `<span class="wheel-pop-n">${i + 1}</span><span class="wheel-pop-name"></span><button class="icon-btn wheel-pop-x" title="Remove from the wheel">✕</button>`;
        row.querySelector('.wheel-pop-name').textContent = it.name; row.querySelector('.wheel-pop-name').title = it.path || it.id;
        row.querySelector('.wheel-pop-x').dataset.sfx = 'own'; row.querySelector('.wheel-pop-x').addEventListener('click', (e) => { e.stopPropagation(); toggle(wheel, it); });
        ul.appendChild(row);
      });
      pop.appendChild(ul);
      const how = document.createElement('div'); how.className = 'wheel-pop-hint'; how.textContent = list.length >= 8 ? 'Wheel is full — remove one to pin another.' : 'Pin more with the ◎ on any tile.'; pop.appendChild(how);
    }
    const foot = document.createElement('div'); foot.className = 'wheel-pop-foot';
    const prev = document.createElement('button'); prev.className = 'chip chip--ghost'; prev.innerHTML = '<span>Preview wheel</span>';
    prev.addEventListener('click', () => { P.daggerPreview(wheel).catch(() => {}); });
    foot.appendChild(prev);
    if (list.length) { const clr = document.createElement('button'); clr.className = 'chip chip--ghost'; clr.innerHTML = '<span>Clear</span>'; clr.addEventListener('click', async () => { for (const it of list.slice()) await P.daggerPin(wheel, it, false).catch(() => {}); }); foot.appendChild(clr); }
    pop.appendChild(foot);
  }
  function openPop(btn, wheel) {
    if (pop && popWheel === wheel) { closePop(); paintButtons(); return; }
    closePop();
    pop = document.createElement('div'); pop.className = 'wheel-pop'; popWheel = wheel;
    renderPop(wheel);
    document.body.appendChild(pop);
    const r = btn.getBoundingClientRect();
    pop.style.top = `${Math.round(r.bottom + 6)}px`;
    pop.style.right = `${Math.max(8, Math.round(window.innerWidth - r.right))}px`;
    requestAnimationFrame(() => pop && pop.classList.add('in'));
    paintButtons();
  }
  document.querySelectorAll('.wheel-btn').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); openPop(b, b.dataset.wheel); }));
  document.addEventListener('click', (e) => { if (pop && !pop.contains(e.target)) { closePop(); paintButtons(); } });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && pop) { closePop(); paintButtons(); } });
  const _apply = apply;
  apply = function (v) { _apply(v); paintButtons(); };
  P.daggerGetSettings().then(apply).catch(() => {});

  window.azyDaggerPins = { badge, toggle, isPinned, get pins() { return pins; } };
})();

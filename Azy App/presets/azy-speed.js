/* Azy Speed — the one "Adjust Speed" control, shared by Presets and Flow.
 *
 *   Speed   −  ────────●────────  +   100%
 *
 * 100% = as designed. 50% = half speed (twice as long), 200% = twice as fast (half as long).
 * The value is a plain multiplier (0.1–10) that travels as `options.speed` / `speed`; the Azy
 * keyframe engine in the Premiere runtime rescales keyframe TIMING with it — values/motion untouched.
 *
 *   const speed = window.azySpeed.mount(slotEl, { key: 'flow' });
 *   speed.value   // 1 = 100%
 *
 * Drag the slider · − / + step · scroll to nudge · click the value to type · double‑click (or the
 * ↺ that appears when not at 100%) to reset. Remembered per tab, in the app and in the Premiere panel.
 */
(function () {
  const MIN = 10, MAX = 1000, DEFAULT = 100; // percent
  const STEPS = [10, 25, 50, 75, 100, 125, 150, 200, 300, 400, 600, 800, 1000];

  const clamp = (p) => {
    p = Math.round(Number(p));
    if (!Number.isFinite(p)) return DEFAULT;
    return Math.min(MAX, Math.max(MIN, p));
  };
  // Slider position (0–1) ⇄ percent. Log-scaled so 100% sits exactly in the middle and 50%/200%
  // are symmetric around it.
  const toPos = (p) => Math.log(p / MIN) / Math.log(MAX / MIN);
  const fromPos = (x) => clamp(MIN * Math.pow(MAX / MIN, Math.min(1, Math.max(0, x))));
  const nearestStep = (p, dir) => {
    if (dir > 0) return STEPS.find((s) => s > p) || MAX;
    for (let i = STEPS.length - 1; i >= 0; i--) if (STEPS[i] < p) return STEPS[i];
    return MIN;
  };

  function mount(host, opts) {
    opts = opts || {};
    const storeKey = 'azy.speed.' + (opts.key || 'default');
    const persist = opts.persist !== false;
    let pct = DEFAULT;
    if (persist) { try { pct = clamp(localStorage.getItem(storeKey) || DEFAULT); } catch (_) {} }

    const root = document.createElement('div');
    root.className = 'azy-speed';
    root.title = 'Speed · 100% = as designed · 200% twice as fast · 50% half speed';
    root.innerHTML =
      '<span class="azy-speed-label">Speed</span>' +
      '<button class="azy-speed-step" type="button" data-dir="-1" aria-label="Slower">−</button>' +
      '<input class="azy-speed-range" type="range" min="0" max="1000" step="1" aria-label="Speed" />' +
      '<button class="azy-speed-step" type="button" data-dir="1" aria-label="Faster">+</button>' +
      '<button class="azy-speed-value" type="button" aria-label="Speed value — click to type an exact value"></button>' +
      '<button class="azy-speed-reset" type="button" aria-label="Back to 100%" title="Back to 100%">↺</button>';
    const range = root.querySelector('.azy-speed-range');
    const valueBtn = root.querySelector('.azy-speed-value');
    const resetBtn = root.querySelector('.azy-speed-reset');
    const listeners = [];
    let disabled = false;

    function render() {
      range.value = String(Math.round(toPos(pct) * 1000));
      valueBtn.textContent = pct + '%';
      root.classList.toggle('is-default', pct === DEFAULT);
      root.classList.toggle('is-fast', pct > DEFAULT);
      root.classList.toggle('is-slow', pct < DEFAULT);
      root.style.setProperty('--azy-speed-pos', (toPos(pct) * 100).toFixed(2) + '%');
      range.setAttribute('aria-valuetext', pct + '%');
    }
    function set(p, persistThis) {
      const next = clamp(p);
      if (next === pct) { render(); return; }
      pct = next;
      render();
      bump();
      if (persist && persistThis !== false) { try { localStorage.setItem(storeKey, String(pct)); } catch (_) {} }
      for (const fn of listeners) { try { fn(pct / 100); } catch (_) {} }
    }
    let bumpT = null;
    function bump() {
      // Tiny value "tick" so a change is felt even when the slider barely moved.
      valueBtn.classList.remove('bump');
      void valueBtn.offsetWidth;
      valueBtn.classList.add('bump');
      clearTimeout(bumpT);
      bumpT = setTimeout(() => valueBtn.classList.remove('bump'), 220);
    }

    range.addEventListener('input', () => set(fromPos(Number(range.value) / 1000)));
    range.addEventListener('dblclick', () => set(DEFAULT));
    range.addEventListener('keydown', (e) => {
      // Arrow keys snap to friendly steps instead of 1/1000 slider units.
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); set(nearestStep(pct, -1)); }
      else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); set(nearestStep(pct, 1)); }
      else if (e.key === 'Home') { e.preventDefault(); set(DEFAULT); }
    });
    root.addEventListener('wheel', (e) => {
      if (disabled) return;
      e.preventDefault();
      set(nearestStep(pct, e.deltaY < 0 ? 1 : -1));
    }, { passive: false });
    for (const b of root.querySelectorAll('.azy-speed-step')) {
      b.addEventListener('click', () => set(nearestStep(pct, Number(b.dataset.dir))));
    }
    resetBtn.addEventListener('click', () => set(DEFAULT));

    let clickTimer = null;
    valueBtn.addEventListener('click', () => {
      if (clickTimer) return;
      clickTimer = setTimeout(() => { clickTimer = null; edit(); }, 200);
    });
    valueBtn.addEventListener('dblclick', () => {
      if (clickTimer) { clearTimeout(clickTimer); clickTimer = null; }
      set(DEFAULT);
    });

    function edit() {
      if (disabled || root.querySelector('input.azy-speed-edit')) return;
      const input = document.createElement('input');
      input.className = 'azy-speed-edit';
      input.type = 'text';
      input.inputMode = 'numeric';
      input.value = String(pct);
      input.setAttribute('aria-label', 'Speed percent');
      valueBtn.replaceWith(input);
      input.focus();
      input.select();
      let done = false;
      const finish = (commit) => {
        if (done) return;
        done = true;
        input.replaceWith(valueBtn);
        if (commit) {
          const m = String(input.value).trim().match(/^(\d+(?:[.,]\d+)?)\s*(%|x)?$/i);
          if (m) {
            const n = Number(m[1].replace(',', '.'));
            set(m[2] && m[2].toLowerCase() === 'x' ? n * 100 : n);
          }
        }
      };
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); finish(true); }
        else if (e.key === 'Escape') { e.preventDefault(); finish(false); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); input.value = String(clamp(Number(input.value) + (e.shiftKey ? 25 : 5))); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); input.value = String(clamp(Number(input.value) - (e.shiftKey ? 25 : 5))); }
        e.stopPropagation();
      });
      input.addEventListener('blur', () => finish(true));
    }

    render();
    host.appendChild(root);
    return {
      el: root,
      get value() { return pct / 100; },
      get percent() { return pct; },
      set(p) { set(p); },
      reset() { set(DEFAULT); },
      /** Grey out while an apply is in flight (value stays visible). */
      setBusy(b) {
        disabled = !!b;
        root.classList.toggle('is-busy', disabled);
        range.disabled = disabled;
        for (const x of root.querySelectorAll('button')) x.disabled = disabled;
      },
      onChange(fn) { listeners.push(fn); return () => { const i = listeners.indexOf(fn); if (i >= 0) listeners.splice(i, 1); }; },
    };
  }

  window.azySpeed = { mount, MIN, MAX, DEFAULT, STEPS };
})();

/* AZY UI sounds — a tiny synthesised interface-sound system.
 *
 * Everything is generated with WebAudio (no asset files to load, cache or leak):
 * short filtered blips with fast envelopes, mastered through one gain node at the
 * user's chosen volume (default 25%). The system is strictly separate from media
 * and SFX previews — turning it off silences interface feedback only.
 *
 * Hooks are passive observers (delegated clicks + MutationObservers), so no other
 * module had to change and nothing can double-fire from a stray listener.
 *   click / tab / open / close / success / error / apply
 * Guards: lazy AudioContext on first gesture, per-name debounce, voice cap,
 * full teardown of timers, and a silent no-op path where WebAudio is missing.
 */
(function azyUiSounds() {
  const LS_ON = 'azy.ui.sounds';
  const LS_VOL = 'azy.ui.sounds.volume';

  let enabled = true;
  let volume = 0.25;
  try {
    enabled = localStorage.getItem(LS_ON) !== '0';
    const v = parseFloat(localStorage.getItem(LS_VOL));
    if (!Number.isNaN(v)) volume = Math.min(1, Math.max(0, v));
  } catch { /* private mode: defaults */ }

  const AC = window.AudioContext || window.webkitAudioContext;
  let ctx = null;
  let master = null;
  const lastPlay = new Map(); // name -> timestamp (debounce)
  let voices = []; // {t} recent voice starts (cap)

  function ensureCtx() {
    if (!AC) return null;
    if (!ctx) {
      try {
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = volume * 0.9;
        master.connect(ctx.destination);
      } catch { ctx = null; master = null; return null; }
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }
  // Browsers only allow audio after a gesture — arm on the first one, once.
  function arm() {
    ensureCtx();
    window.removeEventListener('pointerdown', arm, true);
    window.removeEventListener('keydown', arm, true);
  }
  window.addEventListener('pointerdown', arm, true);
  window.addEventListener('keydown', arm, true);

  function voice(freq, dur, opts = {}) {
    const c = ensureCtx();
    if (!c || !master) return;
    const t0 = c.currentTime + (opts.at || 0);
    const osc = c.createOscillator();
    osc.type = opts.type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (opts.to) osc.frequency.exponentialRampToValueAtTime(Math.max(40, opts.to), t0 + dur);
    const g = c.createGain();
    const peak = opts.peak || 0.06;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    let node = osc;
    if (opts.lp) {
      const f = c.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = opts.lp;
      osc.connect(f);
      node = f;
    }
    node.connect(g);
    g.connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
    osc.onended = () => { try { g.disconnect(); } catch { /* gone */ } };
  }

  const RECIPES = {
    click: () => voice(1450, 0.035, { peak: 0.05, to: 1150, lp: 4200 }),
    tab: () => voice(920, 0.04, { peak: 0.045, lp: 3600 }),
    open: () => voice(430, 0.08, { peak: 0.05, to: 740, lp: 2600 }),
    close: () => voice(620, 0.09, { peak: 0.042, to: 300, lp: 2200 }),
    success: () => { voice(880, 0.07, { peak: 0.05, lp: 5200 }); voice(1318, 0.09, { peak: 0.045, at: 0.055, lp: 6000 }); },
    error: () => voice(250, 0.16, { peak: 0.06, type: 'triangle', to: 190, lp: 1400 }),
    apply: () => { voice(660, 0.05, { peak: 0.05, lp: 4200 }); voice(990, 0.08, { peak: 0.045, at: 0.04, lp: 5200 }); },
    // v1.19: pin / unpin (Dagger pins, stars) — played only AFTER the change succeeded.
    pin: () => { voice(740, 0.045, { peak: 0.042, lp: 4800 }); voice(1110, 0.07, { peak: 0.038, at: 0.035, lp: 5600 }); },
    unpin: () => voice(820, 0.07, { peak: 0.038, to: 560, lp: 3600 }),
  };

  function play(name) {
    if (!enabled) return;
    const recipe = RECIPES[name];
    if (!recipe) return;
    const now = (ctx ? ctx.currentTime : performance.now() / 1000);
    const last = lastPlay.get(name) || -1;
    if (now - last < 0.07) return; // rapid-fire guard: one click, one sound
    // Global voice cap so mashing the UI never stacks into noise.
    voices = voices.filter((v) => now - v.t < 0.12);
    if (voices.length >= 4) return;
    voices.push({ t: now });
    lastPlay.set(name, now);
    try { recipe(); } catch { /* audio is never worth an exception */ }
  }

  function setEnabled(on) {
    enabled = !!on;
    try { localStorage.setItem(LS_ON, enabled ? '1' : '0'); } catch { /* private mode */ }
    if (enabled) play('tab');
    syncSettingsUi();
  }
  function setVolume(v) {
    volume = Math.min(1, Math.max(0, Number(v) || 0));
    if (master) { try { master.gain.value = volume * 0.9; } catch { /* gone */ } }
    try { localStorage.setItem(LS_VOL, String(volume)); } catch { /* private mode */ }
    syncSettingsUi();
  }
  function syncSettingsUi() {
    const sw = document.getElementById('uiSoundsSwitch');
    const vol = document.getElementById('uiSoundsVolume');
    const out = document.getElementById('uiSoundsVolumeOut');
    if (sw && sw.checked !== enabled) sw.checked = enabled;
    if (vol && Number(vol.value) !== Math.round(volume * 100)) vol.value = String(Math.round(volume * 100));
    if (out) out.textContent = String(Math.round(volume * 100)) + '%';
  }

  /* ------------------------------------------------------------- the hooks */
  // One delegated listener: buttons and tabs answer with a soft tick.
  document.addEventListener('click', (e) => {
    const t = e.target && e.target.closest ? e.target.closest('button, .chip, .mode-tab, .settings-cat, [role="tab"], .nav-item, .files-sidebar-nav-item, .sound-play') : null;
    if (!t || t.disabled) return;
    if (t.closest('[data-sfx="own"]')) return; // the control plays its own confirmation after success (no overlap)
    play(t.closest('.mode-tab, .settings-cat, [role="tab"], .files-sidebar-nav-item') ? 'tab' : 'click');
  }, true);

  // Toasts and the processing popup announce themselves in the DOM; observe,
  // never instrument — adding sounds must not touch the working modules.
  const obs = new MutationObserver((muts) => {
    for (const m of muts) {
      for (const n of m.addedNodes) {
        if (!n.classList) continue;
        if (n.classList.contains('toast')) {
          const bad = n.classList.contains('toast--error') || n.classList.contains('toast--warn');
          // v1.18: a cancel / stop is not a success, and a completion chime that just played
          // (azy-done-sfx) already said "done" — never two sounds for one apply.
          if (!bad && (/\b(cancel(l)?ed|stopped)\b/i.test(n.textContent || '') || (window.azyDoneSfx && window.azyDoneSfx.recent()))) continue;
          play(bad ? 'error' : 'success');
        } else if (n.classList.contains('azy-wait') || n.querySelector && n.querySelector('.azy-wait')) {
          play('open');
        }
      }
      for (const n of m.removedNodes) {
        if (n.classList && n.classList.contains('azy-wait')) play('close');
      }
    }
  });
  obs.observe(document.body || document.documentElement, { childList: true, subtree: true });

  /* ------------------------------------------------------------- settings */
  function bindSettings() {
    const sw = document.getElementById('uiSoundsSwitch');
    const vol = document.getElementById('uiSoundsVolume');
    if (sw) sw.addEventListener('change', () => setEnabled(sw.checked));
    if (vol) vol.addEventListener('input', () => setVolume(Number(vol.value) / 100));
    syncSettingsUi();
    // Success chime (azy-done-sfx.js): its own switch + level, silenced with the UI-sounds switch.
    const D = window.azyDoneSfx;
    const dsw = document.getElementById('doneSfxSwitch'), dvol = document.getElementById('doneSfxVolume'), dout = document.getElementById('doneSfxVolumeOut');
    if (D && dsw && dvol) {
      const paintDone = () => {
        const s = D.settings();
        dsw.checked = s.on;
        if (document.activeElement !== dvol) dvol.value = String(Math.round(s.volume * 100));
        if (dout) dout.textContent = Math.round(s.volume * 100) + '%';
        const row = document.getElementById('doneSfxVolumeRow');
        if (row) row.classList.toggle('is-off', !s.on || !enabled);
      };
      paintDone();
      dsw.addEventListener('change', () => { D.set({ on: dsw.checked }); paintDone(); if (dsw.checked) D.play('presets'); });
      dvol.addEventListener('input', () => { D.set({ volume: Number(dvol.value) / 100 }); paintDone(); });
      dvol.addEventListener('change', () => D.play('presets')); // preview the level once, on release
      if (sw) sw.addEventListener('change', paintDone);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindSettings, { once: true });
  else bindSettings();

  window.azyUiSounds = { play, setEnabled, setVolume, get enabled() { return enabled; }, get volume() { return volume; } };
})();

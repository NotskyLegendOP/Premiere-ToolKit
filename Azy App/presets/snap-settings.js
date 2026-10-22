// ---------- Settings workspace (main window) ----------
// Settings for Snap Action: the global shortcut (recorded by pressing keys), whether it
// should only fire when a clip is selected in Premiere, whether the window hides after
// applying, plus "open now" and a catalogue refresh. Persisted by the main process in
// userData/presets/snap-settings.json; the shortcut is re-registered live.

(() => {
  const P = window.presets;
  const $ = (id) => document.getElementById(id);
  const keyBtn = $('snapShortcutBtn');
  const resetBtn = $('snapShortcutResetBtn');
  const note = $('snapShortcutNote');
  const reqSel = $('snapRequireSelection');
  const hideAfter = $('snapHideAfterApply');
  const openBtn = $('snapOpenBtn');
  const refreshBtn = $('snapRefreshBtn');
  const catDesc = $('snapCatalogueDesc');
  if (!keyBtn) return;

  const DEFAULT = 'Shift+Space';
  let settings = { shortcut: DEFAULT, requireSelection: true, hideAfterApply: true, registered: true };
  let recording = false;

  // toast() is renderer.js's global, same as presets-renderer.js uses.

  function paint() {
    keyBtn.textContent = recording ? 'Press keys…' : settings.shortcut;
    keyBtn.classList.toggle('recording', recording);
    reqSel.checked = !!settings.requireSelection;
    hideAfter.checked = !!settings.hideAfterApply;
    if (settings.registered === false) {
      note.textContent = `${settings.shortcut} is taken by another app — choose a different combination.`;
      note.classList.add('warn');
    } else {
      note.textContent = 'Works while Azy is minimized or behind Premiere.';
      note.classList.remove('warn');
    }
  }

  async function load() {
    try {
      settings = await P.snapGetSettings();
      paint();
    } catch {
      /* settings remain usable if the app is closing */
    }
    // snapStatus and azyStatus belong to the lazy runtime. Await its one shared boot promise
    // before querying, so the Settings pane never causes Electron's missing-channel warning.
    try { await P.boot(); } catch { /* the empty state below explains an unavailable runtime */ }
    if (window.azyStatus) { await window.azyStatus.refresh(); paintModule(); }
    await paintCatalogue();
  }

  const SETTING_NAMES = {
    shortcut: 'Snap shortcut', requireSelection: 'Clip requirement', hideAfterApply: 'Hide after applying',
  };
  async function save(patch) {
    // One way in for every setting this window owns, so every one of them is reversible from here:
    // the value being replaced is in hand before the write, and Ctrl+Z writes exactly those keys
    // back through this same function — same paint, same toast, same registered-check.
    const before = {};
    for (const key of Object.keys(patch)) if (settings && settings[key] !== undefined) before[key] = settings[key];
    try {
      settings = await P.snapSetSettings(patch);
      paint();
      if (patch.shortcut && settings.registered === false) toast(`${settings.shortcut} is already used by another application`, 3500);
      else if (patch.shortcut) toast(`Shortcut set to ${settings.shortcut}`, 1600);
      if (window.azyUndo && Object.keys(before).length) {
        const label = Object.keys(patch).map((k) => SETTING_NAMES[k] || k).join(' + ');
        window.azyUndo.record({
          label,
          id: 'snap-setting',
          undo: () => save(before),
          redo: () => save(patch),
        });
      }
    } catch (err) {
      toast(String((err && err.message) || err).replace(/^Error invoking remote method '[^']+': (Error: )?/, ''), 3500);
    }
  }

  async function paintCatalogue() {
    try {
      const st = await P.snapStatus();
      catDesc.textContent = `${st.effects} effects · ${st.presets} Premiere presets · ${st.favorites} starred` +
        (st.effectsSyncedAt ? '' : st.effectsFromCache ? ' · effects from last session' : ' · connect Premiere to list its effects');
    } catch {
      catDesc.textContent = 'Not loaded yet';
    }
  }

  // ---- shortcut recorder: Electron accelerator from a keydown ----
  const MOD_KEYS = new Set(['Shift', 'Control', 'Alt', 'Meta', 'AltGraph', 'CapsLock', 'NumLock']);
  const KEY_NAMES = {
    ' ': 'Space', 'ArrowUp': 'Up', 'ArrowDown': 'Down', 'ArrowLeft': 'Left', 'ArrowRight': 'Right',
    'Escape': 'Esc', 'Enter': 'Return', 'Backspace': 'Backspace', 'Delete': 'Delete', 'Tab': 'Tab',
    'Home': 'Home', 'End': 'End', 'PageUp': 'PageUp', 'PageDown': 'PageDown', 'Insert': 'Insert',
    '+': 'Plus', '=': '=', '-': '-', ',': ',', '.': '.', '/': '/', ';': ';', "'": "'", '[': '[', ']': ']', '\\': '\\', '`': '`'
  };

  function accelFrom(e) {
    if (MOD_KEYS.has(e.key)) return null; // wait for a real key
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
    // A bare letter/digit as a *global* hotkey would swallow typing in every app.
    if (!mods.length && !/^F\d{1,2}$/.test(key)) return { error: 'Add Ctrl, Alt or Shift — a bare key would block typing in other apps' };
    return { accel: mods.concat(key).join('+') };
  }

  function stopRecording() {
    recording = false;
    document.removeEventListener('keydown', onRecordKey, true);
    paint();
  }

  /** Undo for the prefs that have no UI of their own to repaint: the write is its own inverse. */
  function recordPref(label, patch, previous) {
    if (!window.azyUndo || !A || !A.setPrefs) return;
    const before = {};
    for (const key of Object.keys(patch)) if (previous[key] !== undefined) before[key] = previous[key];
    if (!Object.keys(before).length) return;
    window.azyUndo.record({
      label,
      undo: () => A.setPrefs(before).then(paintPrefs),
      redo: () => A.setPrefs(patch).then(paintPrefs),
    });
  }

  function onRecordKey(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.key === 'Escape' && !e.ctrlKey && !e.altKey && !e.shiftKey) {
      stopRecording();
      return;
    }
    const r = accelFrom(e);
    if (!r) return;
    if (r.error) {
      note.textContent = r.error;
      note.classList.add('warn');
      return;
    }
    stopRecording();
    if (r.accel !== settings.shortcut) save({ shortcut: r.accel });
  }

  keyBtn.addEventListener('click', () => {
    if (recording) return stopRecording();
    recording = true;
    paint();
    note.textContent = 'Press the new combination (Esc to cancel)';
    note.classList.remove('warn');
    document.addEventListener('keydown', onRecordKey, true);
  });
  keyBtn.addEventListener('blur', () => {
    if (recording) stopRecording();
  });
  resetBtn.addEventListener('click', () => save({ shortcut: DEFAULT }));
  reqSel.addEventListener('change', () => save({ requireSelection: reqSel.checked }));

  // ---- Azy Speed shortcut (same recorder, its own settings) ----
  const SPEED_DEFAULT = 'Shift+Alt+S';
  const spKey = document.getElementById('speedShortcutBtn');
  const spReset = document.getElementById('speedShortcutResetBtn');
  const spOpen = document.getElementById('speedOpenBtn');
  const spNote = document.getElementById('speedShortcutNote');
  if (spKey && P.speedGetSettings) {
    let sp = { shortcut: SPEED_DEFAULT, registered: true };
    let spRecording = false;
    const spPaint = () => {
      spKey.textContent = spRecording ? 'Press keys…' : sp.shortcut;
      spKey.classList.toggle('recording', spRecording);
      if (!spRecording) {
        spNote.textContent = sp.registered === false ? `${sp.shortcut} is taken by another app — choose a different combination.` : '';
        spNote.classList.toggle('warn', sp.registered === false);
      }
    };
    const spSave = async (patch) => {
      try {
        sp = await P.speedSetSettings(patch);
        spPaint();
        if (patch.shortcut && sp.registered === false) toast(`${sp.shortcut} is already used by another application`, 3500);
        else if (patch.shortcut) toast(`Azy Speed shortcut set to ${sp.shortcut}`, 1600);
      } catch (err) {
        toast(String(err.message || err), 3000);
      }
    };
    const spStop = () => { spRecording = false; document.removeEventListener('keydown', spOnKey, true); spPaint(); };
    const spOnKey = (e) => {
      e.preventDefault(); e.stopPropagation();
      if (e.key === 'Escape' && !e.ctrlKey && !e.altKey && !e.shiftKey) return spStop();
      const r = accelFrom(e);
      if (!r) return;
      if (r.error) { spNote.textContent = r.error; spNote.classList.add('warn'); return; }
      spStop();
      if (r.accel !== sp.shortcut) spSave({ shortcut: r.accel });
    };
    spKey.addEventListener('click', () => {
      if (spRecording) return spStop();
      spRecording = true; spPaint();
      spNote.textContent = 'Press the new combination (Esc to cancel)'; spNote.classList.remove('warn');
      document.addEventListener('keydown', spOnKey, true);
    });
    spKey.addEventListener('blur', () => { if (spRecording) spStop(); });
    spReset.addEventListener('click', () => spSave({ shortcut: SPEED_DEFAULT }));
    spOpen.addEventListener('click', async () => {
      const r = await P.speedToggle({ force: true });
      if (r && r.shown === false) toast('Azy Speed could not open', 2000);
    });
    P.on('speedSettings', (v) => { sp = v; spPaint(); });
    P.speedGetSettings().then((v) => { sp = v; spPaint(); }).catch(() => {});
  }
  // ---- Show / hide Azy shortcut (same recorder) ----
  const WINDOW_DEFAULT = 'Shift+Alt+A';
  const wKey = document.getElementById('windowShortcutBtn');
  const wReset = document.getElementById('windowShortcutResetBtn');
  const wNote = document.getElementById('windowShortcutNote');
  if (wKey && P.windowGetSettings) {
    let ws = { shortcut: WINDOW_DEFAULT, registered: true };
    let wRecording = false;
    const wPaint = () => {
      wKey.textContent = wRecording ? 'Press keys…' : ws.shortcut;
      wKey.classList.toggle('recording', wRecording);
      if (!wRecording) {
        wNote.textContent = ws.registered === false ? `${ws.shortcut} is taken by another app — choose a different combination.` : '';
        wNote.classList.toggle('warn', ws.registered === false);
      }
    };
    const wSave = async (patch) => {
      try {
        ws = await P.windowSetSettings(patch);
        wPaint();
        if (patch.shortcut && ws.registered === false) toast(`${ws.shortcut} is already used by another application`, 3500);
        else if (patch.shortcut) toast(`Show / hide Azy shortcut set to ${ws.shortcut}`, 1600);
      } catch (err) {
        toast(String(err.message || err), 3000);
      }
    };
    const wStop = () => { wRecording = false; document.removeEventListener('keydown', wOnKey, true); wPaint(); };
    const wOnKey = (e) => {
      e.preventDefault(); e.stopPropagation();
      if (e.key === 'Escape' && !e.ctrlKey && !e.altKey && !e.shiftKey) return wStop();
      const r = accelFrom(e);
      if (!r) return;
      if (r.error) { wNote.textContent = r.error; wNote.classList.add('warn'); return; }
      wStop();
      if (r.accel !== ws.shortcut) wSave({ shortcut: r.accel });
    };
    wKey.addEventListener('click', () => {
      if (wRecording) return wStop();
      wRecording = true; wPaint();
      wNote.textContent = 'Press the new combination (Esc to cancel)'; wNote.classList.remove('warn');
      document.addEventListener('keydown', wOnKey, true);
    });
    wKey.addEventListener('blur', () => { if (wRecording) wStop(); });
    wReset.addEventListener('click', () => wSave({ shortcut: WINDOW_DEFAULT }));
    P.on('windowSettings', (v) => { ws = v; wPaint(); });
    P.windowGetSettings().then((v) => { ws = v; wPaint(); }).catch(() => {});
  }
  hideAfter.addEventListener('change', () => save({ hideAfterApply: hideAfter.checked }));
  openBtn.addEventListener('click', () => P.snapToggle({ force: true }).catch(() => {}));
  refreshBtn.addEventListener('click', async () => {
    refreshBtn.disabled = true;
    try {
      await P.snapSync();
      toast('Effects refreshed from Premiere', 1500);
    } catch (err) {
      toast(String((err && err.message) || err).replace(/^Error invoking remote method '[^']+': (Error: )?/, ''), 3500);
    } finally {
      refreshBtn.disabled = false;
      paintCatalogue();
    }
  });

  P.on('snapChange', paintCatalogue);
  P.on('snapSettings', (s) => {
    settings = s;
    paint();
  });

  // ---------- Dagger wheel (Ctrl + right mouse) ----------
  const daggerToggle = document.getElementById('daggerEnabled');
  const daggerPreview = document.getElementById('daggerPreviewBtn');
  const daggerDesc = document.getElementById('daggerDesc');
  const daggerPinsEl = document.getElementById('daggerPins');
  // Tiny static SVG of a wheel with n slots, same angles as dagger-renderer (no animation, no glow).
  function daggerMiniWheel(n) {
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '-50 -50 100 100'); svg.setAttribute('class', 'dagger-mini'); svg.setAttribute('aria-hidden', 'true');
    const polar = (r, deg) => { const a = (deg - 90) * Math.PI / 180; return [r * Math.cos(a), r * Math.sin(a)]; };
    const step = 360 / Math.max(1, n), R1 = 46, R0 = 17, slots = [];
    for (let i = 0; i < n; i++) {
      const a0 = i * step - step / 2 + 2, a1 = i * step + step / 2 - 2, big = step - 4 > 180 ? 1 : 0;
      const [x0, y0] = polar(R1, a0), [x1, y1] = polar(R1, a1), [x2, y2] = polar(R0, a1), [x3, y3] = polar(R0, a0);
      const path = document.createElementNS(NS, 'path');
      path.setAttribute('d', n === 1 ? `M0 -${R1}A${R1} ${R1} 0 1 1 -0.01 -${R1}ZM0 -${R0}A${R0} ${R0} 0 1 0 0.01 -${R0}Z` : `M${x0} ${y0}A${R1} ${R1} 0 ${big} 1 ${x1} ${y1}L${x2} ${y2}A${R0} ${R0} 0 ${big} 0 ${x3} ${y3}Z`);
      path.setAttribute('class', 'dagger-mini-slot');
      const [tx, ty] = polar((R1 + R0) / 2, i * step);
      const t = document.createElementNS(NS, 'text'); t.setAttribute('x', tx.toFixed(1)); t.setAttribute('y', (ty + 3.5).toFixed(1)); t.setAttribute('class', 'dagger-mini-n'); t.textContent = String(i + 1);
      svg.appendChild(path); svg.appendChild(t); slots.push(path);
    }
    return { el: svg, light: (k) => slots.forEach((sl, i) => sl.classList.toggle('on', i === k)) };
  }
  function paintDagger(d) {
    if (!d || !daggerToggle) return;
    paintBinds(d); // hoisted; defined with the bindings UI below
    daggerToggle.checked = d.enabled === true;
    if (daggerDesc && d.enabled && d.available === false && d.sections.length) daggerDesc.textContent = 'The system input hook could not start, so the wheels are off. Restart Azy or check the log.';
    const pins = d.pins || { sfx: [], presets: [], flow: [] };
    pins.flow = pins.flow || [];

    // Native helper status (Windows): which of warp / confine / hide / click guard bound. A failed
    // one is the reason "the cursor didn't jump/hide" — say so instead of leaving the user guessing.
    const nativeEl = document.getElementById('daggerNative');
    if (nativeEl) {
      const n = d.native || {};
      if (n.platform !== 'win32') { nativeEl.hidden = true; }
      else {
        nativeEl.hidden = false;
        const parts = [['driver', 'direct Windows hook'], ['warp', 'cursor to centre'], ['hide', 'cursor hidden'], ['confine', 'confined to wheel'], ['clickGuard', 'click kept from Premiere']];
        nativeEl.innerHTML = parts.map(([k, l]) => `<span class="dagger-native-chip ${n[k] === false ? 'is-bad' : n[k] ? 'is-ok' : ''}">${l}</span>`).join('') + (n.error ? `<div class="snap-setting-note warn">${String(n.error).replace(/[<>&]/g, '')}</div>` : '');
      }
    }

    // Order: one list per wheel (the main wheel's sections, then each wheel's pins), ▲ ▼ to move.
    if (daggerPinsEl) {
      daggerPinsEl.innerHTML = '';
      const move = (wheel, from, to) => P.daggerSetSettings({ reorder: { wheel, from, to } }).then(paintDagger).catch(() => {});
      const lists = [
        ['main', (d.sections || []).map((id) => ({ id, name: (d.sectionLabels || {})[id] || id })), 'Azy wheel · sections'],
        ['sfx', pins.sfx, 'SFX wheel'], ['presets', pins.presets, 'Presets wheel'], ['flow', pins.flow, 'Flow wheel']
      ];
      for (const [wheel, list, label] of lists) {
        if (!list.length) continue;
        const h = document.createElement('div'); h.className = 'dagger-pins-h'; h.textContent = label;
        if (wheel === 'main') {
          // Restore defaults: the main wheel's built-in section order (pins have no "default" — they are yours).
          const rs = document.createElement('button'); rs.className = 'chip chip--ghost dagger-pins-reset'; rs.innerHTML = '<span>Restore default order</span>';
          rs.title = 'Put the Azy wheel sections back in their original order (pins are not touched)';
          rs.addEventListener('click', () => {
            const before = (d.sections || []).slice();
            P.daggerSetSettings({ order: { main: [] } }).then((nd) => {
              paintDagger(nd); toast('Azy wheel order restored', 1500);
              if (window.azyUndo) window.azyUndo.record({ label: 'Restored wheel order', undo: () => P.daggerSetSettings({ order: { main: before } }).then(paintDagger).catch(() => {}), redo: () => P.daggerSetSettings({ order: { main: [] } }).then(paintDagger).catch(() => {}) });
            }).catch(() => {});
          });
          h.appendChild(rs);
        }
        daggerPinsEl.appendChild(h);
        // The arrangement at a glance: a mini wheel with the same geometry as the real one (slot i at
        // i·360/N, clockwise from the top). Hovering a row lights its slot.
        const mini = daggerMiniWheel(list.length);
        const group = document.createElement('div'); group.className = 'dagger-pins-group';
        const rows = document.createElement('div'); rows.className = 'dagger-pins-rows';
        group.appendChild(mini.el); group.appendChild(rows); daggerPinsEl.appendChild(group);
        list.forEach((p, i) => {
          const row = document.createElement('div'); row.className = 'dagger-pin';
          row.addEventListener('mouseenter', () => mini.light(i));
          row.addEventListener('mouseleave', () => mini.light(-1));
          row.innerHTML = `<span class="dagger-pin-n"></span><span class="dagger-pin-name"></span>
            <button class="icon-btn dagger-pin-up" title="Move up"><svg viewBox="0 0 24 24" width="13" height="13"><path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
            <button class="icon-btn dagger-pin-down" title="Move down"><svg viewBox="0 0 24 24" width="13" height="13"><path d="M12 5v14M5 12l7 7 7-7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
            ${wheel === 'main' ? '' : '<button class="icon-btn dagger-pin-x" title="Unpin" aria-label="Unpin"><svg viewBox="0 0 24 24" width="12" height="12"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>'}`;
          // Choose the position directly: the slot number is a picker (1…N).
          const pos = document.createElement('select'); pos.className = 'dagger-pin-pos'; pos.title = 'Position on the wheel (1 = top, then clockwise)';
          pos.setAttribute('aria-label', `Position of ${p.name}`);
          for (let k = 0; k < list.length; k++) { const o = document.createElement('option'); o.value = String(k); o.textContent = String(k + 1); pos.appendChild(o); }
          pos.value = String(i);
          pos.addEventListener('change', () => move(wheel, i, Number(pos.value)));
          row.querySelector('.dagger-pin-n').appendChild(pos);
          row.querySelector('.dagger-pin-name').textContent = p.name;
          if (p.missing) { row.classList.add('is-missing'); const tag = document.createElement('span'); tag.className = 'dagger-pin-missing'; tag.textContent = 'missing'; tag.title = `${p.path} is missing or was moved — unpin it, or put the file back`; row.querySelector('.dagger-pin-name').appendChild(tag); }
          const up = row.querySelector('.dagger-pin-up'), down = row.querySelector('.dagger-pin-down');
          up.disabled = i === 0; down.disabled = i === list.length - 1;
          up.addEventListener('click', () => move(wheel, i, i - 1));
          down.addEventListener('click', () => move(wheel, i, i + 1));
          const x = row.querySelector('.dagger-pin-x'); if (x) x.addEventListener('click', () => P.daggerPin(wheel, p, false).then(paintDagger).catch(() => {}));
          rows.appendChild(row);
        });
      }
    }
  }
  // Pins backup (v1.18): Export writes a portable file; Import validates, previews, then asks.
  (function bindPinsIO() {
    const ex = document.getElementById('daggerPinsExport'), im = document.getElementById('daggerPinsImport'), box = document.getElementById('daggerPinsImportBox');
    if (!ex || !im || !box || !P.daggerPinsExport || !P.daggerPinsImportPick) { const io = document.getElementById('daggerPinsIO'); if (io) io.hidden = true; return; }
    const clean = (err) => String((err && err.message) || err).replace(/^Error invoking remote method '[^']+': (Error: )?/, '');
    const WL = { sfx: 'sounds', presets: 'presets', flow: 'Flow easings' };
    ex.addEventListener('click', async () => {
      ex.disabled = true;
      try {
        const r = await P.daggerPinsExport();
        if (r) toast(`Exported ${r.counts.sfx} sound${r.counts.sfx === 1 ? '' : 's'}, ${r.counts.presets} preset${r.counts.presets === 1 ? '' : 's'}, ${r.counts.flow} Flow easing${r.counts.flow === 1 ? '' : 's'}`, 2600);
      } catch (err) { toast(clean(err), 3600); } finally { ex.disabled = false; }
    });
    const close = (cancel) => { box.hidden = true; box.textContent = ''; if (cancel && P.daggerPinsImportCancel) P.daggerPinsImportCancel().catch(() => {}); };
    im.addEventListener('click', async () => {
      im.disabled = true;
      try {
        const r = await P.daggerPinsImportPick();
        if (!r) return;
        box.textContent = '';
        const h = document.createElement('div'); h.className = 'dagger-pins-import-h'; h.textContent = `Import "${r.file}"`;
        box.appendChild(h);
        const sum = document.createElement('ul'); sum.className = 'dagger-pins-import-sum';
        for (const w of ['sfx', 'presets', 'flow']) {
          const m = r.merge[w]; if (!m.incoming) continue;
          const li = document.createElement('li');
          li.textContent = `${m.incoming} ${WL[w]}` + (m.duplicates ? ` · ${m.duplicates} already pinned` : '') + (m.missing ? ` · ${m.missing} file${m.missing === 1 ? '' : 's'} missing on this computer` : '');
          sum.appendChild(li);
        }
        if (!sum.children.length) { const li = document.createElement('li'); li.textContent = 'The file has no pins.'; sum.appendChild(li); }
        box.appendChild(sum);
        const note = document.createElement('div'); note.className = 'snap-setting-note';
        const over = ['sfx', 'presets', 'flow'].filter((w) => r.merge[w].dropped).map((w) => `${r.merge[w].dropped} ${WL[w]}`);
        note.textContent = (r.newer ? 'Made by a newer Azy — known fields are imported. ' : '') + 'Merge keeps your pins and adds the new ones; Replace uses only the file\u2019s pins.' + (over.length ? ` Merge leaves out ${over.join(', ')} (each wheel holds 8).` : '');
        box.appendChild(note);
        const row = document.createElement('div'); row.className = 'dagger-pins-import-btns';
        const mk = (label, cls, fn) => { const b = document.createElement('button'); b.type = 'button'; b.className = cls; b.innerHTML = '<span></span>'; b.firstChild.textContent = label; b.addEventListener('click', fn); row.appendChild(b); return b; };
        const go = (mode) => async () => {
          row.querySelectorAll('button').forEach((b) => { b.disabled = true; });
          try {
            const v = await P.daggerPinsImportApply(r.token, mode);
            paintDagger(v);
            if (window.azyUiSounds) window.azyUiSounds.play('success'); // confirmation only after the import saved
            const add = ['sfx', 'presets', 'flow'].reduce((n, w) => n + v.report[w].added, 0);
            toast(mode === 'replace' ? `Pins replaced from ${r.file}` : `Merged ${add} new pin${add === 1 ? '' : 's'} from ${r.file}`, 2600);
            close(false);
          } catch (err) { toast(clean(err), 4200); row.querySelectorAll('button').forEach((b) => { b.disabled = false; }); }
        };
        mk('Merge', 'chip', go('merge'));
        mk('Replace', 'chip chip--ghost', go('replace'));
        mk('Cancel', 'chip chip--ghost', () => close(true));
        box.appendChild(row);
        box.hidden = false;
      } catch (err) { toast(clean(err), 4200); } finally { im.disabled = false; }
    });
  })();
  if (P.daggerGetSettings) {
    P.daggerGetSettings().then(paintDagger).catch(() => {});
    if (P.onDagger) P.onDagger('settings', paintDagger);
    if (daggerToggle) daggerToggle.addEventListener('change', () => {
      const want = daggerToggle.checked;
      P.daggerSetSettings({ enabled: want }).then((d) => {
        paintDagger(d);
        toast(d.enabled ? 'Dagger wheels on' : 'Dagger wheels off', 1600);
        if (window.azyUndo) window.azyUndo.record({
          label: d.enabled ? 'Dagger wheels on' : 'Dagger wheels off',
          undo: () => P.daggerSetSettings({ enabled: !want }).then(paintDagger).catch(() => {}),
          redo: () => P.daggerSetSettings({ enabled: want }).then(paintDagger).catch(() => {}),
        });
      }).catch(() => {});
    });
    document.querySelectorAll('#daggerPreviewBtn, .dagger-preview').forEach((b) => b.addEventListener('click', () => { P.daggerPreview(b.dataset.wheel || 'main').catch(() => {}); }));
  }

  // ---------- Animation (UI fps), launch at login, diagnostics ----------
  const fpsSeg = document.getElementById('fpsSeg');
  const themeSeg = document.getElementById('themeSeg');
  const previewPanelToggle = document.getElementById('previewPanelToggle');
  const loginToggle = document.getElementById('launchAtLogin');
  const logsBtn = document.getElementById('openLogsBtn');
  const A = window.api;
  // About (settings rail): the second logs button and the version chip share one wiring.
  const logsBtn2 = document.getElementById('openLogsBtn2');
  if (logsBtn2) logsBtn2.addEventListener('click', () => { if (A && A.openLogs) A.openLogs().catch(() => {}); });
  const aboutVersionBtn = document.getElementById('aboutVersionBtn');
  if (aboutVersionBtn && A && A.appInfo) {
    Promise.resolve(A.appInfo()).then((i) => {
      const label = aboutVersionBtn.querySelector('span');
      if (i && i.version && label) label.textContent = 'Azy v' + i.version;
    }).catch(() => {});
  }
  let prefs = {};
  // Web layer (was "Spider motif"): now a theme-engine dial, persisted in settings for every window.
  function applySpider(on) {
    if (window.azyTheme) window.azyTheme.setWebs(!!on);
    else if (A && A.setPrefs) A.setPrefs({ uiWebs: !!on }).catch(() => {});
    const sw = document.getElementById('spiderMotif');
    if (sw && sw.checked !== !!on) sw.checked = !!on;
  }
  window.azySpider = { apply: applySpider };
  const perfSeg = document.getElementById('perfSeg');
  const motionSeg = document.getElementById('motionSeg');
  const charactersToggle = document.getElementById('charactersToggle');
  // One recorder for the engine dials: instant apply → persist → undoable.
  function setDial(label, patch) {
    const previous = { uiPerf: prefs.uiPerf, uiMotion: prefs.uiMotion, uiWebs: prefs.uiWebs, uiCharacters: prefs.uiCharacters, uiSkin: prefs.uiSkin || 'glow' };
    if (window.azyTheme) window.azyTheme.apply(patch);
    return A.setPrefs(patch).then((s) => {
      paintPrefs(s);
      if (window.azyUndo) window.azyUndo.record({
        label,
        undo: () => { if (window.azyTheme) window.azyTheme.apply(previous); return A.setPrefs(previous).then(paintPrefs).catch(() => {}); },
        redo: () => { if (window.azyTheme) window.azyTheme.apply(patch); return A.setPrefs(patch).then(paintPrefs).catch(() => {}); },
      });
    }).catch(() => {});
  }

  function paintPrefs(s) {
    if (!s) return;
    prefs = s;
    renderThemeLists();
    syncThemeActions();
    if (fpsSeg) fpsSeg.querySelectorAll('[data-fps]').forEach((b) => { const on = Number(b.dataset.fps) === Number(s.uiFps); b.classList.toggle('active', on); b.setAttribute('aria-checked', String(on)); });
    if (themeSeg) themeSeg.querySelectorAll('[data-theme]').forEach((b) => { const on = b.dataset.theme === (s.uiTheme || 'noir'); b.classList.toggle('active', on); b.setAttribute('aria-checked', String(on)); });
    { const hs = document.getElementById('speedHoldSeg'); if (hs) hs.querySelectorAll('[data-hold]').forEach((b) => { const on = b.dataset.hold === (s.uiSpeedHold || 'shift'); b.classList.toggle('active', on); b.setAttribute('aria-checked', String(on)); }); }
    if (window.azyHold) window.azyHold.set(s.uiSpeedHold);
    if (perfSeg) perfSeg.querySelectorAll('[data-perf]').forEach((b) => { const on = b.dataset.perf === (s.uiPerf || 'full'); b.classList.toggle('active', on); b.setAttribute('aria-checked', String(on)); });
    if (motionSeg) motionSeg.querySelectorAll('[data-motion]').forEach((b) => { const on = b.dataset.motion === (s.uiMotion || 'system'); b.classList.toggle('active', on); b.setAttribute('aria-checked', String(on)); });
    const spiderSw0 = document.getElementById('spiderMotif');
    if (spiderSw0) spiderSw0.checked = s.uiWebs !== false;
    if (charactersToggle) charactersToggle.checked = s.uiCharacters !== false;
    if (previewPanelToggle) previewPanelToggle.checked = s.previewPanel !== false;
    if (loginToggle) loginToggle.checked = s.launchAtLogin === true;
    paintCustom(s);
  }
  /* ---- Settings → Customise (v1.16) ----------------------------------------------------------
     Sliders preview live (theme engine only, no IPC) while dragged and persist + record one undo
     step on release. main.js clamps every value again. Text & UI size applies on release only —
     zooming mid-drag would move the slider under the pointer. */
  const CZ = [
    { id: 'czWebOpacity', key: 'uiWebOpacity', toUi: (v) => v * 100, fromUi: (v) => v / 100, label: 'Web opacity' },
    { id: 'czRadius', key: 'uiRadius', toUi: (v) => v * 100, fromUi: (v) => v / 100, label: 'Corner roundness' },
    { id: 'czGlass', key: 'uiGlass', toUi: (v) => v, fromUi: (v) => v, label: 'Panel translucency' },
    { id: 'czAnimSpeed', key: 'uiAnimSpeed', toUi: (v) => v * 100, fromUi: (v) => v / 100, label: 'Animation speed' },
    { id: 'czScale', key: 'uiScale', toUi: (v) => v * 100, fromUi: (v) => v / 100, label: 'Text & UI size', onRelease: true }
  ];
  const CZ_DEFAULTS = { uiGlow: 1, uiWebOpacity: 1, uiWebDensity: 'normal', uiRadius: 1, uiGlass: 30, uiAnimSpeed: 1, uiScale: 1 };
  const czDensity = document.getElementById('czWebDensity');
  var czGlowSwitch = document.getElementById('czGlowSwitch'); // var: paintCustom() may run before this line
  if (czGlowSwitch) czGlowSwitch.addEventListener('change', () => {
    const on = czGlowSwitch.checked;
    setCustom(on ? 'Glow on' : 'Glow off', { uiGlow: on ? 1 : 0 }, { uiGlow: czCurrent('uiGlow') });
  });
  const czAccent = document.getElementById('czAccent');
  function czOut(d, uiVal) { const o = document.getElementById(d.id + 'Out'); if (o) o.textContent = Math.round(uiVal) + '%'; }
  function paintCustom(s) {
    for (const d of CZ) {
      const el = document.getElementById(d.id);
      const v = s[d.key] !== undefined ? s[d.key] : CZ_DEFAULTS[d.key];
      if (el && document.activeElement !== el) el.value = String(Math.round(d.toUi(v)));
      if (el) czOut(d, Number(el.value));
    }
    if (czGlowSwitch) czGlowSwitch.checked = Number(s.uiGlow !== undefined ? s.uiGlow : 1) > 0;
    if (czDensity) czDensity.querySelectorAll('[data-density]').forEach((b) => { const on = b.dataset.density === (s.uiWebDensity || 'normal'); b.classList.toggle('active', on); b.setAttribute('aria-checked', String(on)); });
    if (czAccent) czAccent.querySelectorAll('[data-theme]').forEach((b) => { const on = b.dataset.theme === (s.uiTheme || 'noir'); b.classList.toggle('active', on); b.setAttribute('aria-checked', String(on)); });
  }
  // One recorder for the Customise dials: persist the patch, undo restores exactly the old values.
  function setCustom(label, patch, previous) {
    if (window.azyTheme) window.azyTheme.apply(patch);
    if (!A || !A.setPrefs) return Promise.resolve();
    return A.setPrefs(patch).then((s) => {
      paintPrefs(s);
      if (window.azyUndo) window.azyUndo.record({
        label,
        undo: () => { if (window.azyTheme) window.azyTheme.apply(previous); return A.setPrefs(previous).then(paintPrefs).catch(() => {}); },
        redo: () => { if (window.azyTheme) window.azyTheme.apply(patch); return A.setPrefs(patch).then(paintPrefs).catch(() => {}); },
      });
    }).catch(() => {});
  }
  function czCurrent(key) { return prefs[key] !== undefined ? prefs[key] : CZ_DEFAULTS[key]; }
  for (const d of CZ) {
    const el = document.getElementById(d.id);
    if (!el) continue;
    let startVal = null;
    el.addEventListener('pointerdown', () => { startVal = czCurrent(d.key); });
    el.addEventListener('input', () => {
      if (startVal === null) startVal = czCurrent(d.key);
      czOut(d, Number(el.value));
      if (!d.onRelease && window.azyTheme) window.azyTheme.apply({ [d.key]: d.fromUi(Number(el.value)) });
    });
    el.addEventListener('change', () => {
      const previous = { [d.key]: startVal === null ? czCurrent(d.key) : startVal };
      startVal = null;
      setCustom(d.label, { [d.key]: d.fromUi(Number(el.value)) }, previous);
    });
  }
  if (czDensity) czDensity.addEventListener('click', (e) => {
    const b = e.target.closest('[data-density]'); if (!b) return;
    setCustom('Web density', { uiWebDensity: b.dataset.density }, { uiWebDensity: czCurrent('uiWebDensity') });
  });
  // Theme swatches mirror General › Theme (one source of truth: a click is that button's click).
  if (czAccent && themeSeg) {
    renderThemeLists(true);
    czAccent.addEventListener('click', (e) => {
      const b = e.target.closest('[data-theme]'); if (!b) return;
      const src = themeSeg.querySelector('[data-theme="' + b.dataset.theme + '"]');
      if (src) src.click();
      czAccent.querySelectorAll('[data-theme]').forEach((x) => { const on = x === b; x.classList.toggle('active', on); x.setAttribute('aria-checked', String(on)); });
    });
  }
  /* ---- Custom colour themes (v1.17) -----------------------------------------------------------
     Lists: General › Theme (#themeSeg) and Customise › Theme (#czAccent) show the built-in Dark red
     plus the saved themes. The editor previews instantly in this window (azyTheme.preview, nothing
     saved); Apply saves + selects, Save stores without switching, Reset reverts the fields, × closes
     and discards. main.js re-validates everything and every window repaints from the broadcast. */
  function themeList() { return Array.isArray(prefs.uiCustomThemes) ? prefs.uiCustomThemes : []; }
  function esc(v) { return String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  var themeKey = null; // var: renderThemeLists() first runs before this line (hoisting)
  function renderThemeLists(force) {
    if (!themeSeg) return;
    const list = themeList();
    const key = JSON.stringify(list);
    if (key === themeKey && !force) return;
    themeKey = key;
    themeSeg.querySelectorAll('[data-theme^="custom:"]').forEach((b) => b.remove());
    for (const t of list) {
      const b = document.createElement('button');
      b.className = 'snap-seg-btn'; b.setAttribute('role', 'radio'); b.dataset.theme = 'custom:' + t.id; b.title = t.name;
      b.innerHTML = '<span class="theme-sw theme-sw--custom" style="--sw-a:' + t.colors.accent + ';--sw-b:' + t.colors.bg + '"></span>' + esc(t.name);
      themeSeg.appendChild(b);
    }
    if (czAccent) {
      czAccent.innerHTML = [...themeSeg.querySelectorAll('[data-theme]')].map((b) => {
        const name = esc((b.textContent || '').trim());
        const sw = b.querySelector('.theme-sw');
        return '<button class="azy-cz-swatch" type="button" role="radio" data-theme="' + esc(b.dataset.theme) + '" title="' + name + '" aria-label="' + name + '">' + (sw ? sw.outerHTML : '') + '<em>' + name + '</em></button>';
      }).join('');
      const cur = prefs.uiTheme || 'noir';
      czAccent.querySelectorAll('[data-theme]').forEach((b) => { const on = b.dataset.theme === cur; b.classList.toggle('active', on); b.setAttribute('aria-checked', String(on)); });
    }
    syncThemeActions();
  }
  const TE = {
    box: document.getElementById('czThemeEditor'), name: document.getElementById('czThemeName'), grid: document.getElementById('czThemeGrid'),
    state: document.getElementById('czThemeState'), editing: null, base: null
  };
  function teBtn(id) { return document.getElementById(id); }
  function selectedCustom() { const cur = prefs.uiTheme || ''; return /^custom:/.test(cur) ? themeList().find((t) => 'custom:' + t.id === cur) || null : null; }
  function currentColors() { const t = selectedCustom(); const A = window.azyTheme || {}; const b = (A.BUILTIN_THEMES && A.BUILTIN_THEMES[prefs.uiTheme || 'noir']) || A.BUILTIN_COLORS || {}; return { ...(t ? t.colors : b) }; }
  function newThemeId() { return 't-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function syncThemeActions() {
    const sel = selectedCustom();
    const ed = teBtn('czThemeEdit'), del = teBtn('czThemeDel'), dup = teBtn('czThemeDup');
    if (ed) { ed.disabled = !sel; ed.title = sel ? 'Edit "' + sel.name + '"' : 'Dark red is built in — duplicate it to make your own'; }
    if (del) { del.disabled = !sel; del.title = sel ? 'Delete "' + sel.name + '"' : 'The built-in theme cannot be deleted'; }
    if (dup) dup.title = 'Copy the selected theme into a new one';
    const n = teBtn('czThemeNew'); if (n) n.disabled = themeList().length >= 24; const fc = teBtn('czThemeFromColor'); if (fc) fc.disabled = themeList().length >= 24;
  }
  function teDirty() { return !!TE.editing && JSON.stringify({ n: TE.editing.name, c: TE.editing.colors }) !== JSON.stringify({ n: TE.base.name, c: TE.base.colors }); }
  function tePaint() {
    if (!TE.editing || !TE.box) return;
    if (document.activeElement !== TE.name) TE.name.value = TE.editing.name;
    TE.grid.querySelectorAll('input[type="color"]').forEach((inp) => { inp.value = TE.editing.colors[inp.dataset.key]; });
    if (TE.state) TE.state.textContent = TE.editing.id && themeList().some((t) => t.id === TE.editing.id) ? (teDirty() ? 'Unsaved changes · previewing' : 'Saved') : 'New · previewing';
    if (window.azyTheme && window.azyTheme.preview) window.azyTheme.preview(TE.editing.colors);
  }
  function teOpen(theme) {
    if (!TE.box) return;
    TE.editing = { id: theme.id || null, name: theme.name, colors: { ...theme.colors } };
    TE.base = { id: TE.editing.id, name: TE.editing.name, colors: { ...TE.editing.colors } };
    TE.box.hidden = false;
    TE.autoName = /^(My theme|Untitled theme)$/.test(theme.name || '');
    const seedEl = document.getElementById('czThemeSeed'); if (seedEl && theme.colors && theme.colors.accent) seedEl.value = theme.colors.accent;
    tePaint();
    try { TE.name.focus(); TE.name.select(); } catch { /* not focusable yet */ }
  }
  function teClose() {
    if (!TE.box) return;
    TE.editing = null; TE.base = null; TE.box.hidden = true;
    if (window.azyTheme && window.azyTheme.preview) window.azyTheme.preview(null); // back to the saved theme
  }
  function persistThemes(list, select, label) {
    const previous = { uiCustomThemes: themeList(), uiTheme: prefs.uiTheme || 'noir' };
    const patch = { uiCustomThemes: list }; if (select) patch.uiTheme = select;
    if (window.azyTheme) window.azyTheme.apply({ themes: list, ...(select ? { accent: select } : {}) });
    if (!A || !A.setPrefs) return Promise.resolve();
    return A.setPrefs(patch).then((st) => {
      paintPrefs(st);
      if (window.azyUndo) window.azyUndo.record({
        label,
        undo: () => { if (window.azyTheme) window.azyTheme.apply({ themes: previous.uiCustomThemes, accent: previous.uiTheme }); return A.setPrefs(previous).then(paintPrefs).catch(() => {}); },
        redo: () => { if (window.azyTheme) window.azyTheme.apply({ themes: list, ...(select ? { accent: select } : {}) }); return A.setPrefs(patch).then(paintPrefs).catch(() => {}); },
      });
    }).catch(() => { toast('Could not save the theme — try again', 1800); });
  }
  function teCommit(select) {
    if (!TE.editing) return;
    const id = TE.editing.id || newThemeId();
    const name = (TE.name.value || '').trim().slice(0, 40) || 'Untitled theme';
    const t = window.azyTheme && window.azyTheme.normTheme ? window.azyTheme.normTheme({ id, name, colors: TE.editing.colors }) : { id, name, colors: TE.editing.colors };
    const list = themeList().slice();
    const at = list.findIndex((x) => x.id === id);
    if (at >= 0) list[at] = t; else list.push(t);
    TE.editing = { id, name: t.name, colors: { ...t.colors } };
    TE.base = { id, name: t.name, colors: { ...t.colors } };
    const isSelected = (prefs.uiTheme || '') === 'custom:' + id;
    persistThemes(list, select || isSelected ? 'custom:' + id : null, select ? 'Apply theme' : 'Save theme').then(() => {
      tePaint();
      toast(select ? '“' + t.name + '” applied' : '“' + t.name + '” saved', 1300);
    });
  }
  if (TE.box) {
    TE.grid.addEventListener('input', (e) => {
      const inp = e.target.closest('input[type="color"]'); if (!inp || !TE.editing) return;
      TE.editing.colors[inp.dataset.key] = inp.value;
      tePaint(); // instant preview in this window; nothing is written until Apply / Save
    });
    TE.name.addEventListener('input', () => { if (TE.editing) { TE.editing.name = TE.name.value; TE.autoName = false; tePaint(); } });
    // v1.19: build the whole theme from one colour (live while the picker moves; nothing saved until Apply/Save).
    const seed = document.getElementById('czThemeSeed');
    const fromSeed = () => {
      if (!TE.editing || !window.azyTheme || !window.azyTheme.themeFromColor) return;
      const gen = window.azyTheme.themeFromColor(seed.value);
      if (!gen) return;
      TE.editing.colors = { ...gen.colors };
      if (TE.autoName) { TE.editing.name = gen.name; TE.name.value = gen.name; }
      tePaint();
    };
    if (seed) { seed.addEventListener('input', fromSeed); seed.addEventListener('change', fromSeed); }
    const fromColorBtn = teBtn('czThemeFromColor');
    if (fromColorBtn) fromColorBtn.addEventListener('click', () => {
      if (themeList().length >= 24) { toast('Up to 24 themes — delete one first', 1600); return; }
      const start = currentColors().accent || '#d6283f';
      const gen = window.azyTheme && window.azyTheme.themeFromColor ? window.azyTheme.themeFromColor(start) : null;
      teOpen({ id: null, name: gen ? gen.name : 'My theme', colors: gen ? gen.colors : currentColors() });
      TE.autoName = true;
      if (seed) { seed.value = start; try { seed.showPicker ? seed.showPicker() : seed.click(); } catch { seed.click(); } }
    });
    TE.name.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); teCommit(true); } else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); teClose(); } });
    teBtn('czThemeClose').addEventListener('click', teClose);
    teBtn('czThemeReset').addEventListener('click', () => { if (!TE.editing) return; TE.editing = { ...TE.base, colors: { ...TE.base.colors } }; TE.name.value = TE.editing.name; tePaint(); });
    teBtn('czThemeSave').addEventListener('click', () => teCommit(false));
    teBtn('czThemeApply').addEventListener('click', () => teCommit(true));
    teBtn('czThemeNew').addEventListener('click', () => {
      if (themeList().length >= 24) { toast('Up to 24 themes — delete one first', 1600); return; }
      teOpen({ id: null, name: 'My theme', colors: currentColors() });
    });
    teBtn('czThemeEdit').addEventListener('click', () => { const t = selectedCustom(); if (t) teOpen(t); });
    teBtn('czThemeDup').addEventListener('click', () => {
      if (themeList().length >= 24) { toast('Up to 24 themes — delete one first', 1600); return; }
      const src = selectedCustom();
      teOpen({ id: null, name: ((src ? src.name : (prefs.uiTheme === 'crimson' ? 'Dark red' : 'Dark')) + ' copy').slice(0, 40), colors: currentColors() });
    });
    let delArm = 0;
    teBtn('czThemeDel').addEventListener('click', (e) => {
      const t = selectedCustom(); if (!t) return;
      const b = e.currentTarget;
      if (Date.now() - delArm > 2500) { delArm = Date.now(); b.querySelector('span').textContent = 'Delete “' + t.name + '”?'; setTimeout(() => { if (Date.now() - delArm >= 2400) b.querySelector('span').textContent = 'Delete'; }, 2500); return; }
      delArm = 0; b.querySelector('span').textContent = 'Delete';
      if (TE.editing && TE.editing.id === t.id) teClose();
      persistThemes(themeList().filter((x) => x.id !== t.id), 'noir', 'Delete theme').then(() => toast('“' + t.name + '” deleted · Ctrl+Z restores it', 1800));
    });
  }

  const czReset = document.getElementById('czReset');
  if (czReset) czReset.addEventListener('click', () => {
    const previous = {};
    for (const k of Object.keys(CZ_DEFAULTS)) previous[k] = czCurrent(k);
    setCustom('Reset customisation', { ...CZ_DEFAULTS }, previous);
    toast('Customisation reset to the stock Spider look', 1400);
  });
  if (A && A.getSettings) {
    A.getSettings().then(paintPrefs).catch(() => {});
    if (A.onSettingsChanged) A.onSettingsChanged(paintPrefs);
    if (fpsSeg) fpsSeg.addEventListener('click', (e) => {
      const b = e.target.closest('[data-fps]'); if (!b) return;
      const previous = { ...prefs };
      const next = { uiFps: Number(b.dataset.fps) };
      A.setPrefs(next).then((s) => { paintPrefs(s); toast(`Azy animates at up to ${s.uiFps} fps`, 1400); recordPref('UI frame rate', next, previous); }).catch(() => {});
    });
    if (themeSeg) themeSeg.addEventListener('click', (e) => {
      const b = e.target.closest('[data-theme]'); if (!b) return;
      if (TE.editing && !teDirty()) teClose(); // picking another theme ends a clean preview
      if (window.azyMotion && window.azyMotion.setTheme) window.azyMotion.setTheme(b.dataset.theme); // instant, before the round trip
      const next = { uiTheme: b.dataset.theme };
      const was = prefs.uiTheme;
      A.setPrefs(next).then((s) => {
        paintPrefs(s);
        if (window.azyUndo) window.azyUndo.record({
          label: 'Colour theme',
          undo: () => { if (window.azyMotion && window.azyMotion.setTheme) window.azyMotion.setTheme(was); return A.setPrefs({ uiTheme: was }).then(paintPrefs).catch(() => {}); },
          redo: () => { if (window.azyMotion && window.azyMotion.setTheme) window.azyMotion.setTheme(next.uiTheme); return A.setPrefs(next).then(paintPrefs).catch(() => {}); },
        });
      }).catch(() => {});
    });
    const speedHoldSeg = document.getElementById('speedHoldSeg');
    if (speedHoldSeg) speedHoldSeg.addEventListener('click', (e) => {
      const b = e.target.closest('[data-hold]'); if (!b) return;
      const previous = { uiSpeedHold: prefs.uiSpeedHold || 'shift' };
      const next = { uiSpeedHold: b.dataset.hold };
      if (window.azyHold) window.azyHold.set(next.uiSpeedHold); // instant, before the round trip
      A.setPrefs(next).then((st) => {
        paintPrefs(st);
        toast(next.uiSpeedHold === 'off' ? 'Apply-with-speed hold is off' : next.uiSpeedHold[0].toUpperCase() + next.uiSpeedHold.slice(1) + ' + click asks for a speed', 1500);
        recordPref('Apply-with-speed key', next, previous);
      }).catch(() => {});
    });
    const spiderSw = document.getElementById('spiderMotif');
    if (spiderSw) spiderSw.addEventListener('change', () => setDial('Web layer', { uiWebs: spiderSw.checked }));
    if (charactersToggle) charactersToggle.addEventListener('change', () => setDial('Spider companion', { uiCharacters: charactersToggle.checked }));
    if (perfSeg) perfSeg.addEventListener('click', (e) => {
      const b = e.target.closest('[data-perf]'); if (!b) return;
      setDial('Visual quality', { uiPerf: b.dataset.perf });
    });
    if (motionSeg) motionSeg.addEventListener('click', (e) => {
      const b = e.target.closest('[data-motion]'); if (!b) return;
      setDial('Motion', { uiMotion: b.dataset.motion });
    });
    if (previewPanelToggle) previewPanelToggle.addEventListener('change', () => {
      const on = previewPanelToggle.checked;
      const run = () => A.setPrefs({ previewPanel: on }).then(paintPrefs);
      const action = { label: on ? 'Preview panel on' : 'Preview panel off', apply: run, undo: () => A.setPrefs({ previewPanel: !on }).then(paintPrefs), redo: run };
      Promise.resolve(window.azyUndo ? window.azyUndo.run(action) : run()).catch(() => { paintPrefs(prefs); toast('Could not save preview setting', 1800); });
    });
    if (loginToggle) loginToggle.addEventListener('change', () => {
      const previous = { ...prefs };
      const next = { launchAtLogin: loginToggle.checked };
      A.setPrefs(next).then((s) => { paintPrefs(s); toast(s.launchAtLogin ? 'Azy will start with Windows' : 'Azy will not start with Windows', 1600); recordPref('Launch with Windows', next, previous); }).catch(() => {});
    });
    if (logsBtn) logsBtn.addEventListener('click', () => {
      (window.azyMotion ? window.azyMotion.loading(logsBtn, A.openLogs()) : A.openLogs()).catch(() => toast('Could not open the log folder', 2000));
    });
  }

  // ---- Settings categories (rail on the left, one group visible at a time; remembered per session)
  const rail = document.getElementById('settingsRail');
  const groups = Array.from(document.querySelectorAll('.settings-group'));
  let currentCat = 'general';
  function showCat(cat, animate = true) {
    if (!groups.some((g) => g.dataset.cat === cat)) cat = 'general';
    currentCat = cat;
    for (const g of groups) { const on = g.dataset.cat === cat; if (on && g.hidden && animate) { g.hidden = false; g.classList.remove('enter'); void g.offsetWidth; g.classList.add('enter'); } else g.hidden = !on; }
    if (rail) rail.querySelectorAll('.settings-cat').forEach((b) => { const on = b.dataset.cat === cat; b.classList.toggle('active', on); b.setAttribute('aria-selected', String(on)); });
  }
  if (rail) rail.addEventListener('click', (e) => { const b = e.target.closest('.settings-cat'); if (b) showCat(b.dataset.cat); });
  showCat(currentCat, false);

  // ---- Dagger bindings: one row per wheel; click → hold modifiers + press a mouse button
  const bindsEl = document.getElementById('daggerBinds');
  const bindNote = document.getElementById('daggerBindNote');
  const BIND_DEFAULT_NOTE = bindNote ? bindNote.textContent : '';
  let bindRecording = null; // wheel id
  const MODN = { ctrl: 'Ctrl', alt: 'Alt', shift: 'Shift' };
  function paintBinds(d) {
    if (!bindsEl || !d || !Array.isArray(d.wheels)) return;
    bindsEl.innerHTML = '';
    for (const w of d.wheels) {
      const row = document.createElement('div'); row.className = 'snap-setting dagger-bind';
      const n = d.pins && d.pins[w.id] ? ` · ${d.pins[w.id].length}/${w.max} pinned` : '';
      row.innerHTML = `<div class="snap-setting-text"><div class="snap-setting-title"></div><div class="snap-setting-desc"></div></div>
        <div class="snap-keys"><span class="dagger-bind-mode" role="group" aria-label="Wheel mode"><button type="button" class="chip chip--ghost" data-mode="hold" title="Hold the gesture, point, let go to pick"><span>Hold</span></button><button type="button" class="chip chip--ghost" data-mode="toggle" title="Press once to open, click (or Enter) to pick, press again or Esc to cancel"><span>Toggle</span></button></span><button class="snap-keycap dagger-bind-key" title="Click, then press any mouse button or key (with any modifiers you want held)"></button>
        <button class="icon-btn dagger-bind-reset" title="Reset"><svg viewBox="0 0 24 24" width="14" height="14"><path d="M20 12a8 8 0 0 1-14.3 4.9M4 12a8 8 0 0 1 14.3-4.9M18.5 3v4.5H14M5.5 21v-4.5H10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>`;
      row.querySelector('.snap-setting-title').textContent = `${w.title} wheel`;
      row.querySelector('.snap-setting-desc').textContent = (w.id === 'main' ? 'Azy windows · SFX library' : w.id === 'sfx' ? 'Pinned sounds → playhead' : w.id === 'presets' ? 'Pinned presets → selected clips' : 'Pinned easings → selected keyframes') + n;
      const key = row.querySelector('.dagger-bind-key');
      const rec = bindRecording === w.id;
      key.textContent = rec ? 'Press a button or key…' : w.label;
      row.querySelectorAll('.dagger-bind-mode button').forEach((mb) => {
        const on = mb.dataset.mode === (w.mode || 'hold');
        mb.classList.toggle('active', on); mb.setAttribute('aria-pressed', String(on));
        mb.addEventListener('click', () => {
          if (on) return;
          P.daggerSetSettings({ binds: { [w.id]: { mode: mb.dataset.mode } } }).then((v) => {
            if (v && v.error) { toast(v.error, 2400); return; }
            paintDagger(v); toast(`${w.title} wheel: ${mb.dataset.mode === 'toggle' ? 'Toggle (click to pick)' : 'Hold (release to pick)'}`, 1800);
          }).catch(() => {});
        });
      });
      key.classList.toggle('recording', rec);
      key.addEventListener('click', (e) => { e.preventDefault(); startBind(w.id); });
      const reset = row.querySelector('.dagger-bind-reset');
      reset.disabled = !!w.isDefault; reset.title = `Reset to ${w.defaultLabel}`;
      reset.addEventListener('click', () => P.daggerSetSettings({ binds: { [w.id]: null } }).then((v) => { paintDagger(v); toast(`${w.title} wheel: ${w.defaultLabel}`, 1600); }).catch(() => {}));
      bindsEl.appendChild(row);
    }
  }
  function stopBind() {
    bindRecording = null;
    document.removeEventListener('mousedown', onBindMouse, true);
    document.removeEventListener('contextmenu', swallow, true);
    document.removeEventListener('auxclick', swallow, true);
    document.removeEventListener('keydown', onBindKey, true);
    if (bindNote) { bindNote.textContent = BIND_DEFAULT_NOTE; bindNote.classList.remove('warn'); }
    P.daggerGetSettings().then(paintDagger).catch(() => {});
  }
  const swallow = (e) => { e.preventDefault(); e.stopPropagation(); };
  function saveBind(id, bind) {
    P.daggerSetSettings({ binds: { [id]: bind } }).then((v) => {
      if (v && v.error) { if (bindNote) { bindNote.textContent = v.error; bindNote.classList.add('warn'); } return; }
      stopBind(); paintDagger(v);
      const w = v.wheels.find((x) => x.id === id); toast(`${w.title} wheel: ${w.label}`, 1800);
    }).catch((err) => { if (bindNote) { bindNote.textContent = String(err && err.message || err); bindNote.classList.add('warn'); } });
  }
  // Keyboard binding: any key (with optional Ctrl / Alt / Shift). Esc cancels the recording.
  function onBindKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); stopBind(); return; }
    if (['Control', 'Alt', 'Shift', 'Meta', 'OS'].includes(e.key)) return; // a modifier alone is not a trigger
    e.preventDefault(); e.stopPropagation();
    const id = bindRecording; if (!id) return;
    const mods = ['ctrl', 'alt', 'shift'].filter((k) => (k === 'ctrl' ? e.ctrlKey : k === 'alt' ? e.altKey : e.shiftKey));
    const vk = e.keyCode || 0; // Chromium on Windows reports the Win32 virtual-key code
    if (!vk) return;
    saveBind(id, { modifier: mods.join('+'), key: vk });
  }
  function onBindMouse(e) {
    e.preventDefault(); e.stopPropagation();
    const id = bindRecording; if (!id) return;
    const mods = ['ctrl', 'alt', 'shift'].filter((k) => (k === 'ctrl' ? e.ctrlKey : k === 'alt' ? e.altKey : e.shiftKey)); // optional
    const button = e.button === 0 ? 1 : e.button === 2 ? 2 : e.button === 1 ? 3 : e.button === 3 ? 4 : e.button === 4 ? 5 : 0; // DOM → native helper IDs
    if (!button) return;
    saveBind(id, { modifier: mods.join('+'), button });
  }
  function startBind(id) {
    if (bindRecording === id) { stopBind(); return; }
    bindRecording = id;
    if (bindNote) { bindNote.textContent = `Press any mouse button or key for the ${id} wheel (hold Ctrl / Alt / Shift too if you want) — Esc cancels.`; bindNote.classList.remove('warn'); }
    document.addEventListener('mousedown', onBindMouse, true);
    document.addEventListener('contextmenu', swallow, true);
    document.addEventListener('auxclick', swallow, true);
    document.addEventListener('keydown', onBindKey, true);
    P.daggerGetSettings().then(paintDagger).catch(() => {});
  }

  window.azySnapSettings = { show: load };

  // ---------- Azy in Premiere Pro (module card) ----------
  const modDesc = document.getElementById('azyModuleDesc');
  const modDot = document.getElementById('azyModuleDot');
  const modBtn = document.getElementById('azyModuleBtn');
  function paintModule() {
    if (!modDesc || !window.azyStatus) return;
    const st = window.azyStatus.get();
    const m = window.azyStatus.premiereModule();
    modDot.className = 'azy-module-dot';
    if (!st || !m) { modDesc.textContent = 'Starting Azy…'; return; }
    const ver = m.runtimeVersion ? ` · runtime ${m.runtimeVersion}` : '';
    modDesc.textContent = m.summary + (m.next ? ' — ' + m.next : '') + (m.connection === 'connected' ? ver : '');
    const dotCls = m.busy ? 'busy' : m.connection === 'connected' ? 'ok' : m.install === 'installed' && m.connection === 'host-not-running' ? '' : 'warn';
    if (dotCls) modDot.classList.add(dotCls);
    modBtn.querySelector('span').textContent = m.busy ? 'Working…' : m.install === 'installed' ? 'Check' : 'Fix';
    modBtn.disabled = !!m.busy;
  }
  if (modBtn) modBtn.addEventListener('click', async () => {
    modBtn.disabled = true;
    try {
      const m = window.azyStatus.premiereModule();
      if (m && m.install !== 'installed') await window.azyStatus.repair();
      else await P.moduleRefresh().then(window.azyStatus.set);
    } catch (err) { toast((err && err.message) || String(err), 3000); }
    modBtn.disabled = false; paintModule();
  });
  // Status is refreshed by load() after the user opens Settings. Keeping this listener passive
  // at app boot avoids sending an IPC call before the lazy Presets engine registers its channel.
  if (window.azyStatus) window.azyStatus.onChange(paintModule);
})();
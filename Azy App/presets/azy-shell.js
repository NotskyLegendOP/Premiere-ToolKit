/* AZY Shell — main shell + navigation layer (v1.13).
 *
 * Adds the spider-tech shell behaviour on top of the EXISTING navigation. It does not own or
 * replace section switching: presets-renderer.js still decides which pane shows (setMode →
 * showPane, panes are only hidden, never rebuilt). This file only:
 *
 *   1. keeps a small SECTOR REGISTRY (files · sfx · presets · flow · speed · settings) so new
 *      sectors plug in with one entry, and routes the two extra entries to what already exists:
 *        SFX   → the Files pane's Sounds section      Speed → the Speed window (presets.speedToggle)
 *   2. mirrors the active sector onto the nav (tab state + gliding pill) — incl. SFX, which is a
 *      state of the Files pane — and on <html data-sector> for CSS;
 *   3. gives CLICK → IMMEDIATE FEEDBACK: the pill starts gliding on pointerdown; the switch itself
 *      still happens on click, exactly as before, and is never delayed by any animation;
 *   4. keyboard: ←/→/Home/End inside the tab row (ARIA tabs), Ctrl+1…6 sector shortcuts (window-
 *      local only — never a global hotkey, never while a Dagger wheel is up, never with Alt/Shift);
 *   5. header: AZY sigil mark, current-sector crumb, a compact Premiere link chip mirroring the
 *      status bar (click = the status bar's own action);
 *   6. event-driven web moments: a short web thread from the active tab into the workspace on each
 *      switch, a sigil flex, and a rare, faint ambient pulse when idle. All skipped when the main
 *      thread is busy (long tasks → html[data-busy]), in Performance / reduced motion, or when the
 *      window is small.
 *
 * Cost model: no timers while idle except one 24–40 s ambient timeout, one PerformanceObserver,
 * one MutationObserver on two attributes. Nothing per-frame.
 */
(function (root) {
  'use strict';
  var SECTORS = [
    { id: 'files',    tab: 'filesTab',   key: '1', kind: 'pane',   title: 'Files' },
    { id: 'sfx',      tab: 'sfxTab',     key: '2', kind: 'state',  title: 'SFX' },
    { id: 'presets',  tab: 'presetsTab', key: '3', kind: 'pane',   title: 'Presets' },
    { id: 'flow',     tab: 'flowTab',    key: '4', kind: 'pane',   title: 'Flow' },
    { id: 'speed',    tab: 'speedTab',   key: '5', kind: 'launch', title: 'Speed' },
    { id: 'settings', tab: 'snapTab',    key: '6', kind: 'pane',   title: 'Settings' }
  ];
  if (typeof module === 'object' && module.exports) module.exports = { SECTORS: SECTORS };
  if (!root || !root.document) return;
  var doc = root.document, html = doc.documentElement;
  var $ = function (id) { return doc.getElementById(id); };
  var row = $('modeRow'), pill = $('modePill');
  if (!row) return;
  var fx = function (t, k, o) { try { return root.azyWeb ? root.azyWeb.fx(t, k, o) : null; } catch (e) { return null; } };
  var decorative = function () { return (!root.azyTheme || root.azyTheme.decorative()) && !html.hasAttribute('data-busy') && !html.classList.contains('azy-art-off'); };
  var byId = {}; SECTORS.forEach(function (s) { byId[s.id] = s; });
  var tabOf = function (s) { return s ? $(s.tab) : null; };

  // ─── which sector is showing (derived from the real DOM state, never cached state) ─────
  function current() {
    var files = $('filesPane');
    if (files && !files.hidden) return doc.body.classList.contains('sounds-section') ? 'sfx' : 'files';
    var sec = html.getAttribute('data-section');
    return sec === 'snap' ? 'settings' : (byId[sec] ? sec : 'files');
  }

  function paintPill(tab) {
    if (!pill || !tab || tab.offsetParent === null) return;
    var r0 = row.getBoundingClientRect(), r = tab.getBoundingClientRect();
    pill.style.transform = 'translateX(' + Math.round(r.left - r0.left) + 'px)';
    pill.style.width = Math.round(r.width) + 'px';
    pill.classList.add('ready');
  }

  var lastSector = null;
  function sync() {
    var id = current();
    SECTORS.forEach(function (s) {
      var t = tabOf(s); if (!t || s.kind === 'launch') return;
      var on = s.id === id;
      if (t.classList.contains('active') !== on) t.classList.toggle('active', on);
      if (t.getAttribute('aria-selected') !== String(on)) t.setAttribute('aria-selected', String(on));
    });
    var tab = tabOf(byId[id]);
    paintPill(tab);
    if (html.getAttribute('data-sector') !== id) html.setAttribute('data-sector', id);
    var title = $('workspaceTitle');
    if (title && byId[id] && html.getAttribute('data-workspace') === 'all' && title.textContent !== byId[id].title) title.textContent = byId[id].title;
    if (lastSector && lastSector !== id) arrived(tab, id);
    lastSector = id;
  }

  // ─── the switch moment: feedback only, after the pane has already switched ──────────
  var thread = null, threadTimer = 0;
  function arrived(tab, id) {
    var sig = doc.querySelector('#brandMark .azy-sigil');
    if (sig && root.azyWeb) root.azyWeb.setSigilState(sig, 'active');
    if (root.azyCharacters && root.azyCharacters.react) root.azyCharacters.react('look');
    if (!tab || !decorative() || root.innerWidth < 380) return;
    // A thin web thread drops from the active tab into the workspace (≈200 ms, transform/opacity).
    if (!thread) {
      thread = doc.createElement('span');
      thread.className = 'azy-nav-thread';
      thread.setAttribute('aria-hidden', 'true');
      (doc.body || html).appendChild(thread);
    }
    var r = tab.getBoundingClientRect(), rr = row.getBoundingClientRect();
    thread.style.left = Math.round(r.left + r.width / 2) + 'px';
    thread.style.top = Math.round(rr.bottom - 2) + 'px';
    thread.classList.remove('is-on'); void thread.offsetWidth; thread.classList.add('is-on');
    clearTimeout(threadTimer);
    threadTimer = setTimeout(function () { if (thread) thread.classList.remove('is-on'); }, 320);
  }

  // ─── routing the registry entries that are not panes ───────────────────────────────
  function soundsOn() { return doc.body.classList.contains('sounds-section'); }
  function go(id, via) {
    var s = byId[id]; if (!s) return;
    var t = tabOf(s);
    if (s.kind === 'launch') {
      var P = root.presets;
      if (id === 'speed' && P && P.speedToggle) { try { var p = P.speedToggle(); if (p && p.catch) p.catch(function () {}); } catch (e) { /* window unavailable */ } }
      if (t) fx(t, 'snap', { size: 56 });
      return;
    }
    if (via !== 'click' && t) t.click();                       // tabs: the existing click path does the switch
    if (id === 'sfx' || id === 'files') {
      var want = id === 'sfx';
      if (soundsOn() !== want) { var b = $(want ? 'sectionSoundsBtn' : 'sectionMediaBtn'); if (b && !$('filesPane').hidden) b.click(); }
    }
  }

  // SFX tab: open Files, then its Sounds section. Files tab: when Sounds is showing, go back to Media.
  var sfxTab = $('sfxTab'), filesTab = $('filesTab'), speedTab = $('speedTab');
  // A sector whose module is absent in this host is hidden rather than offered as a dead end.
  if (sfxTab && !(root.api && root.api.soundsGet)) sfxTab.hidden = true;
  if (speedTab && !(root.presets && root.presets.speedToggle)) speedTab.hidden = true;
  var routing = false;
  if (sfxTab) sfxTab.addEventListener('click', function () {
    routing = true;
    try { if (filesTab && $('filesPane').hidden) filesTab.click(); } finally { routing = false; }
    if (!soundsOn()) { var b = $('sectionSoundsBtn'); if (b) b.click(); }
    sync();
  });
  if (filesTab) filesTab.addEventListener('click', function () {
    // presets-renderer.js has already switched to the Files pane (its listener was added first).
    // With a dedicated SFX tab, "Files" always means the media library.
    if (!routing && soundsOn()) { var b = $('sectionMediaBtn'); if (b) b.click(); }
    sync();
  });
  if (speedTab) speedTab.addEventListener('click', function () { go('speed', 'click'); });

  // ─── immediate press feedback: pill glides on pointerdown, snaps back if the press is abandoned
  var pressing = null;
  row.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return;
    var t = e.target.closest && e.target.closest('.mode-tab');
    if (!t || t.classList.contains('mode-tab--launch') || t.classList.contains('active')) return;
    pressing = t;
    row.classList.add('is-pressing');
    paintPill(t);
  });
  var release = function () {
    if (!pressing) return;
    pressing = null;
    row.classList.remove('is-pressing');
    // If the click switched sectors, sync() already painted the new tab; otherwise go back.
    setTimeout(sync, 0);
  };
  root.addEventListener('pointerup', release, true);
  root.addEventListener('pointercancel', release, true);
  root.addEventListener('blur', release);

  // ─── keyboard ──────────────────────────────────────────────────────────────────────
  row.addEventListener('keydown', function (e) {
    var tabs = Array.prototype.filter.call(row.querySelectorAll('.mode-tab'), function (t) { return t.offsetParent !== null && !t.disabled; });
    var i = tabs.indexOf(doc.activeElement);
    if (i < 0) return;
    var next = null;
    if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
    else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
    else if (e.key === 'Home') next = tabs[0];
    else if (e.key === 'End') next = tabs[tabs.length - 1];
    if (!next) return;
    e.preventDefault();
    next.focus();
    // Automatic activation for real tabs; launchers (Speed) wait for Enter/Space.
    if (!next.classList.contains('mode-tab--launch')) next.click();
  });
  doc.addEventListener('keydown', function (e) {
    if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey || e.repeat) return;
    if (root.azyDaggerInput && root.azyDaggerInput.active()) return;   // a wheel is up: Dagger owns input
    var s = null;
    for (var k = 0; k < SECTORS.length; k++) if (SECTORS[k].key === e.key) s = SECTORS[k];
    if (!s || !tabOf(s)) return;
    if (html.getAttribute('data-workspace') !== 'all' && s.kind === 'state') return; // SFX lives in the Files window
    e.preventDefault();
    go(s.id, 'key');
  });

  // ─── header: sigil mark + Premiere link chip ─────────────────────────────────────────
  var mark = doc.querySelector('.app-chrome .brand-mark');
  if (mark && root.azyWeb) {
    mark.id = mark.id || 'brandMark';
    var old = mark.querySelector('svg:not(.azy-sigil)'); if (old) old.remove();
    root.azyWeb.sigil(mark, 'appear');
  }
  var chip = $('chromeConn'), box = $('statusConn'), dot = $('statusConnDot'), txt = $('statusConnText');
  var LABEL = { ok: 'connected', wait: 'connecting', off: 'not connected', err: 'needs attention' };
  function paintConn() {
    if (!chip || !box) return;
    var st = box.classList.contains('is-ok') ? 'ok' : box.classList.contains('is-err') ? 'err' : box.classList.contains('is-warn') ? 'wait' : 'off';
    var text = txt ? txt.textContent : '';
    if (chip.getAttribute('data-state') !== st) {
      var was = chip.getAttribute('data-state');
      chip.setAttribute('data-state', st);
      html.setAttribute('data-conn', st);
      // One short web pulse on a real change (never a loop). Connected → success tone.
      if (was && decorative()) fx(chip, st === 'ok' ? 'connect' : st === 'err' ? 'break' : 'pulse', { size: 48, tone: st === 'ok' ? 'ok' : st === 'err' ? 'err' : undefined });
    }
    chip.setAttribute('aria-label', 'Premiere Pro ' + (LABEL[st] || '') + (text ? ' — ' + text : ''));
    chip.title = (box.title || text || 'Premiere Pro connection');
  }
  if (chip && box) {
    chip.addEventListener('click', function () { box.click(); });
    var mo = new root.MutationObserver(paintConn);
    mo.observe(box, { attributes: true, attributeFilter: ['class', 'title'] });
    if (txt) mo.observe(txt, { childList: true, characterData: true, subtree: true });
    if (dot) mo.observe(dot, { attributes: true, attributeFilter: ['class'] });
    paintConn();
  }

  // ─── busy detection: long tasks switch decoration off for a moment ───────────────────
  var busyTimer = 0;
  function busy() {
    if (!html.hasAttribute('data-busy')) html.setAttribute('data-busy', '');
    clearTimeout(busyTimer);
    busyTimer = setTimeout(function () { html.removeAttribute('data-busy'); }, 1500);
  }
  try {
    if (root.PerformanceObserver && (root.PerformanceObserver.supportedEntryTypes || []).indexOf('longtask') >= 0) {
      new root.PerformanceObserver(function (list) { if (list.getEntries().some(function (en) { return en.duration > 80; })) busy(); }).observe({ entryTypes: ['longtask'] });
    }
  } catch (e) { /* no long-task API */ }

  // ─── ambient: a rare, faint web pulse in the top-right web when the app is idle ─────
  var lastInput = Date.now();
  ['pointerdown', 'keydown', 'wheel'].forEach(function (ev) { doc.addEventListener(ev, function () { lastInput = Date.now(); }, { capture: true, passive: true }); });
  function ambient() {
    setTimeout(ambient, 24000 + Math.random() * 16000);
    if (doc.hidden || !decorative() || root.innerWidth < 460 || Date.now() - lastInput < 4000) return;
    if (html.getAttribute('data-webs') === 'off') return;
    fx({ x: root.innerWidth - 70, y: 86 }, 'pulse', { size: 170, tone: 'faint' });
  }
  setTimeout(ambient, 30000);

  // ─── keep in step with the existing switcher (runs after its own paint, same task) ────
  new root.MutationObserver(function () { sync(); }).observe(html, { attributes: true, attributeFilter: ['data-section'] });
  var soundsWas = soundsOn();
  new root.MutationObserver(function () { var n = soundsOn(); if (n !== soundsWas) { soundsWas = n; sync(); } }).observe(doc.body, { attributes: true, attributeFilter: ['class'] });
  root.addEventListener('resize', function () { paintPill(tabOf(byId[current()])); });
  doc.addEventListener('azy:themechange', function () { paintPill(tabOf(byId[current()])); });
  sync();
  if (root.requestAnimationFrame) root.requestAnimationFrame(sync);

  root.azyShell = { SECTORS: SECTORS, current: current, go: go, sync: sync };
})(typeof window !== 'undefined' ? window : null);

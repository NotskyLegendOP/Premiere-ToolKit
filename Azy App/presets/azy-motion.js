/* Azy motion layer (v1.15) — the living web + event micro-animations.
 *
 *  Every animation is catalogued in azy-motion.css as a `/* Mnnn … *\/` block (test-motion.js
 *  counts them). This file only does what CSS cannot:
 *
 *   1. LIVING WEB  — builds one fixed, pointer-less layer (#azyWebLife) behind the app with dew,
 *      drops, fireflies, silk motes, strand glints and a hanging spider, placed ON the frame web's
 *      real threads (azyWeb.anchors()). ~40 tiny elements, transform/opacity only: the compositor
 *      moves them, nothing re-rasters. CSS shows it only for the glow skin at Full quality + Full
 *      motion; Balanced / Performance / Reduced motion never render it.
 *   2. IDLE PAUSE — ambient loops pause (html.azy-idle) while the window is hidden, or when it has
 *      been unfocused and untouched for 12 s (you're working in Premiere — Azy shouldn't burn
 *      frames behind it). Any pointer movement or focus wakes it instantly.
 *   3. EVENT HOOKS — one-shot classes for things with no CSS state: tab switch (web pluck +
 *      tremor), refresh spin, favourite pop, count/speed value pop, search typing, toggles.
 *      All delegated (one listener per event type), never per element, never per frame.
 *
 *  Nothing here delays functionality: hooks run after the app's own handlers (bubbling phase,
 *  passive) and only toggle classes.
 */
(function (root) {
  'use strict';
  if (!root || !root.document) return;
  var doc = root.document, html = doc.documentElement;
  var api = root.azyLife = root.azyLife || {};   // NB: window.azyMotion belongs to renderer.js (fps throttle)

  /* ---- one-shot helper: (re)start a CSS animation class, auto-clean ----------------------- */
  function pulse(el, cls, ms) {
    if (!el || !el.classList) return;
    // Restart without forcing a synchronous layout (no offsetWidth read): drop the class now,
    // re-add it on the next frame — the browser sees two style states and restarts the animation.
    if (el.classList.contains(cls)) {
      el.classList.remove(cls);
      root.requestAnimationFrame(function () { el.classList.add(cls); });
    } else el.classList.add(cls);
    clearTimeout(el['_azyM_' + cls]);
    el['_azyM_' + cls] = setTimeout(function () { el.classList.remove(cls); }, ms || 700);
  }
  api.pulse = pulse;

  /* ---- 1. living web ------------------------------------------------------------------------ */
  function mk(tag, cls, style, parent) {
    var el = doc.createElement(tag);
    el.className = cls;
    if (style) el.setAttribute('style', style);
    if (parent) parent.appendChild(el);
    return el;
  }
  var SPIDER =
    '<svg viewBox="-12 -12 24 24" aria-hidden="true" focusable="false">' +
      '<g class="awl-legs awl-legs-l" stroke="currentColor" stroke-width="1" fill="none" stroke-linecap="round">' +
        '<path d="M-2 -1 L-7 -6 L-9 -3"/><path d="M-2.4 0 L-8 -2 L-11 1"/><path d="M-2.4 1 L-8 3 L-10 7"/><path d="M-2 2 L-6 6 L-7 10"/></g>' +
      '<g class="awl-legs awl-legs-r" stroke="currentColor" stroke-width="1" fill="none" stroke-linecap="round">' +
        '<path d="M2 -1 L7 -6 L9 -3"/><path d="M2.4 0 L8 -2 L11 1"/><path d="M2.4 1 L8 3 L10 7"/><path d="M2 2 L6 6 L7 10"/></g>' +
      '<ellipse cx="0" cy="-2.6" rx="2.3" ry="2" fill="currentColor"/>' +
      '<ellipse cx="0" cy="2.2" rx="3.1" ry="3.8" fill="currentColor"/>' +
      '<path d="M0 0.2 L-1.3 2.2 L0 4.4 L1.3 2.2 Z" class="awl-mark"/>' +
      '<circle class="awl-eye" cx="-0.8" cy="-3" r="0.45"/><circle class="awl-eye" cx="0.8" cy="-3" r="0.45"/>' +
    '</svg>';

  var life = null;
  function buildLife() {
    if (life || !doc.body || !doc.body.classList.contains('minimal-ui')) return;
    var A = root.azyWeb && root.azyWeb.anchors ? root.azyWeb.anchors() : { hubs: [], nodes: [] };
    life = mk('div', 'azy-web-life');
    life.id = 'azyWebLife';
    life.setAttribute('aria-hidden', 'true');
    var sway = mk('div', 'awl-sway', '', life);

    // Dew on the outer ring of each corner web (visible part of the masked frame).
    var outer = A.nodes.filter(function (n) { return n.x > 2 && n.x < 98 && n.y > 2 && n.y < 98; });
    outer.filter(function (n, i) { return i % 2 === 0; }).slice(0, 6).forEach(function (n, i) {
      mk('i', 'awl-dew' + (i % 2 ? ' awl-dew-lit' : ''), '--x:' + n.x + '%;--y:' + n.y + '%;--d:' + (i * 0.73).toFixed(2) + 's', sway);
    });
    // Drops that slide down a strand, fall and splash (two corners, offset beats).
    [[9, 14, 0], [91, 15, 5.5]].forEach(function (p, i) {
      var g = mk('div', 'awl-dripper', '--x:' + p[0] + '%;--y:' + p[1] + '%;--d:' + p[2] + 's', sway);
      mk('i', 'awl-drop', '', g);
      mk('i', 'awl-splash', '', g);
    });
    // Light travelling along a spoke from each hub.
    A.hubs.forEach(function (h, i) {
      var ang = [38, 142, -38, -142][i];
      var g = mk('div', 'awl-strand', '--x:' + h[0] + '%;--y:' + h[1] + '%;--a:' + ang + 'deg;--d:' + (i * 2.1) + 's', sway);
      mk('i', 'awl-glint', '', g);
    });
    // Hanging spider (original sigil proportions) on its own thread, top right.
    var sp = mk('div', 'awl-spider', '', sway);
    mk('i', 'awl-thread', '', sp);
    var bob = mk('div', 'awl-spider-bob', '', sp);
    var sw = mk('div', 'awl-spider-body', '', bob);
    sw.innerHTML = SPIDER;
    // Fireflies along the edges, silk motes drifting up, a caught spark struggling in a web.
    for (var f = 0; f < 3; f++) {
      var fx = [6, 94, 50][f], fy = [44, 58, 92][f];
      var fl = mk('div', 'awl-fly awl-fly-' + (f % 2 ? 'b' : 'a'), '--x:' + fx + '%;--y:' + fy + '%;--d:' + (f * 1.9) + 's', sway);
      mk('i', 'awl-fly-dot', '', fl);
    }
    for (var m = 0; m < 4; m++) mk('i', 'awl-mote', '--x:' + (12 + m * 25) + '%;--d:' + (m * 4.1) + 's;--s:' + (0.6 + (m % 3) * 0.25), sway);
    mk('i', 'awl-prey', '--x:14%;--y:84%', sway);
    // Pluck strands (fired on tab switch) — one per top corner.
    mk('i', 'awl-pluck awl-pluck-l', '', sway);
    mk('i', 'awl-pluck awl-pluck-r', '', sway);
    doc.body.insertBefore(life, doc.body.firstChild);
    guard();
  }
  /* Adaptive guard: sample ~1.5 s of frames once the web is on screen. If this machine can't
     hold ~45 fps with it (weak GPU, software rendering, remote desktop), the ambient web is
     switched off for the session (html.azy-lite) — hover / press motion stays. No fake smoothness. */
  var guarded = false;
  /* Ambient motion is only free when a GPU composites it. Software rendering (SwiftShader, llvmpipe,
     Microsoft Basic Render Driver — remote desktop, broken drivers, CI) runs every loop on the CPU,
     so there the web starts lite. Read once from a throwaway WebGL context, then released. */
  var soft = null;
  function softwareGpu() {
    if (soft !== null) return soft;
    soft = false;
    try {
      var cv = doc.createElement('canvas');
      var gl = cv.getContext && (cv.getContext('webgl') || cv.getContext('experimental-webgl'));
      if (!gl) { soft = true; return soft; }                          // no GPU path at all
      var ext = gl.getExtension('WEBGL_debug_renderer_info');
      var name = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER) || '');
      soft = /swiftshader|llvmpipe|softpipe|basic render|software/i.test(name);
      api.gpu = name;
      var lose = gl.getExtension('WEBGL_lose_context'); if (lose) lose.loseContext();
    } catch (e) { soft = false; }
    return soft;
  }
  function guard() {
    if (guarded || typeof root.requestAnimationFrame !== 'function') return;
    if (!life || root.getComputedStyle(life).display === 'none') return;
    guarded = true;
    if (softwareGpu()) { html.classList.add('azy-lite'); api.lite = 'software-rendering'; return; }
    var ds = [], last = 0, t0 = 0;
    function tick(t) {
      if (doc.visibilityState === 'hidden') { guarded = false; return; }   // re-check when visible
      if (last) ds.push(t - last); else t0 = t;
      last = t;
      if (t - t0 < 1500) { root.requestAnimationFrame(tick); return; }
      ds.sort(function (a, b) { return a - b; });
      var med = ds[ds.length >> 1] || 0;
      api.frameMedian = med;
      if (med > 22) {
        html.classList.add('azy-lite');
        // A busy startup (thumbnails, Premiere launching) can look like a slow machine: give the
        // web ONE more chance 30 s later — on for 1.5 s, measured, kept only if it holds up.
        if (!api._retried) {
          api._retried = true;
          setTimeout(function () {
            if (doc.visibilityState === 'hidden') return;
            html.classList.remove('azy-lite');
            guarded = false; guard();
          }, 30000);
        }
      }
    }
    setTimeout(function () { root.requestAnimationFrame(tick); }, 1200);    // after startup work
  }
  api.pluck = function () {
    if (!life) return;
    pulse(life, 'is-plucked', 900);
  };

  /* ---- 2. idle pause ------------------------------------------------------------------------- */
  var idleT = 0;
  function setIdle(on) { if (html.classList.contains('azy-idle') !== on) html.classList.toggle('azy-idle', on); }
  function wake() {
    clearTimeout(idleT);
    setIdle(doc.visibilityState === 'hidden');
    if (!doc.hasFocus || !doc.hasFocus()) idleT = setTimeout(function () { setIdle(true); }, 12000);
  }
  doc.addEventListener('visibilitychange', function () { wake(); if (!guarded) guard(); });
  root.addEventListener('focus', wake);
  root.addEventListener('blur', wake);
  var lastMove = 0;
  doc.addEventListener('pointermove', function () {
    var t = Date.now(); if (t - lastMove < 1000) return; lastMove = t; wake();
  }, { passive: true });

  /* ---- 3. event hooks ------------------------------------------------------------------------ */
  function closest(t, sel) { return t && t.closest ? t.closest(sel) : null; }
  doc.addEventListener('click', function (e) {
    var t = e.target, el;
    if ((el = closest(t, '.mode-tab'))) { pulse(el, 'azy-m-flash', 520); api.pluck(); return; }
    if ((el = closest(t, '#refreshBtn, #snapSyncBtn'))) { pulse(el, 'azy-m-spin', 700); return; }
    if ((el = closest(t, '.fav-badge, .snap-star'))) { pulse(el, 'azy-m-star', 620); return; }
    if ((el = closest(t, '.wheel-badge'))) { pulse(el, 'azy-m-whirl', 620); return; }
    if ((el = closest(t, '.preview-toggle'))) { pulse(el, 'azy-m-blink', 420); return; }
    if ((el = closest(t, '.pin-btn, .chip--pin, .hero-action, #snapPinBtn'))) { pulse(el, 'azy-m-pin', 520); return; }
    if ((el = closest(t, '.win-btn, .pin-toggle, .snap-seg-btn, .file-filter-btn, .file-view-btn, .azy-scope-btn, .settings-cat, .speed-sel-btn'))) { pulse(el, 'azy-m-tap', 360); return; }
    if ((el = closest(t, '.file-card, .snap-row'))) pulse(el, 'azy-m-press', 380);
  }, { passive: true });
  doc.addEventListener('change', function (e) {
    var t = e.target;
    if (t && t.classList && (t.classList.contains('snap-switch') || t.type === 'checkbox')) pulse(t, 'azy-m-flip', 420);
  }, { passive: true });
  var typeT = 0;
  doc.addEventListener('input', function (e) {
    var t = e.target;
    if (!t || t.tagName !== 'INPUT' || (t.type !== 'search' && t.type !== 'text')) return;
    var box = closest(t, '.search-row, .snap-search') || t.parentNode;
    if (!box || typeT) return;
    typeT = setTimeout(function () { typeT = 0; }, 260);    // at most ~4 pulses/s while typing
    pulse(box, 'azy-m-type', 240);
  }, { passive: true });
  root.addEventListener('focus', function () { if (life) pulse(life, 'is-tremor', 900); });
  // Value pops: count pills, the Speed readout, Snap's item count — text changes → pop.
  function watchText(sel, cls) {
    if (typeof MutationObserver !== 'function') return;
    var els = doc.querySelectorAll(sel);
    Array.prototype.forEach.call(els, function (el) {
      var last = el.textContent;
      new MutationObserver(function () {
        if (el.textContent === last) return;
        last = el.textContent; pulse(el, cls, 360);
      }).observe(el, { childList: true, characterData: true, subtree: true });
    });
  }

  function init() {
    buildLife();
    watchText('.count-pill, .speed-big-value, .snap-count, #snapCount', 'azy-m-pop');
    watchText('#chromeConn, .speed-detect-text', 'azy-m-ping');
    watchText('#workspaceTitle', 'azy-m-swap');
    wake();
  }
  doc.addEventListener('azy:themechange', function () { setTimeout(guard, 50); });
  setTimeout(guard, 2500);
  api.rebuild = function () { if (life && life.parentNode) life.parentNode.removeChild(life); life = null; buildLife(); };
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})(typeof window !== 'undefined' ? window : null);

/* AZY Web — the original web geometry, web animations and the AZY spider sigil (v1.12).
 *
 * Three layers, all cheap:
 *
 *  1. GEOMETRY (pure, cached). Webs are generated once from a few numbers — centre, spokes,
 *     rings, sweep angle, sag — with a deterministic jitter so they look hand-spun but never
 *     change between frames. Result strings are memoised by key; nothing is recomputed per frame.
 *
 *  2. STATIC DECORATION with zero DOM. At startup the common shapes (corner, edge, radial,
 *     partial, nodes, background) are published as CSS custom properties holding SVG data-URI
 *     masks (--azy-web-mask-*). Any stylesheet can then paint a web with
 *     `mask-image: var(--azy-web-mask-corner); background: rgba(var(--azy-web-rgb), <alpha>)`,
 *     tinted by the accent and faded by the visibility ladder in design-tokens.css.
 *     `<i class="azy-web" data-web="corner-tl"></i>` elements are also supported for inline SVG.
 *
 *  3. EVENT-DRIVEN FX. azyWeb.fx(el, kind) plays one short (80-320 ms) web animation over an
 *     element in a single shared, pointer-events:none fixed layer, then removes itself. It is
 *     fire-and-forget: it returns immediately and never delays the action that triggered it.
 *     Kinds: draw · pulse · ripple · snap · sweep · connect · dissolve · break.
 *
 * Everything is original abstract geometry (spokes, catenary rings, angular legs). No existing
 * character, logo or costume is referenced.
 */
(function (root) {
  'use strict';

  var cache = new Map();
  function memo(key, fn) { if (!cache.has(key)) cache.set(key, fn()); return cache.get(key); }
  var r2 = function (n) { return Math.round(n * 100) / 100; };

  // Deterministic PRNG: the same web every time, no per-frame randomness.
  function rng(seed) { var s = seed >>> 0 || 1; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  /**
   * Radial web geometry on a 100×100 box.
   * o: { cx, cy, r, spokes, rings, from, to (degrees), sag (0..0.4), seed, gap (ring-break chance) }
   * → { spokes: 'd', rings: ['d', ...], nodes: [[x,y], ...] }
   */
  function radial(o) {
    var cx = o.cx, cy = o.cy, R = o.r, n = o.spokes, m = o.rings;
    var from = (o.from || 0) * Math.PI / 180, to = (o.to === undefined ? 360 : o.to) * Math.PI / 180;
    var full = Math.abs(to - from) >= Math.PI * 2 - 1e-6;
    var rand = rng(o.seed || 7), sag = o.sag === undefined ? 0.18 : o.sag, gap = o.gap || 0;
    var angles = [], k, j;
    var count = full ? n : n - 1;
    for (k = 0; k < n; k++) angles.push(from + (to - from) * (k / count) + (full ? (rand() - 0.5) * 0.12 : 0));
    var spokes = '';
    var tips = angles.map(function (a) { var len = R * (0.92 + rand() * 0.08); return [cx + Math.cos(a) * len, cy + Math.sin(a) * len]; });
    for (k = 0; k < n; k++) spokes += 'M' + r2(cx) + ' ' + r2(cy) + 'L' + r2(tips[k][0]) + ' ' + r2(tips[k][1]);
    var rings = [], nodes = [];
    for (j = 1; j <= m; j++) {
      var rr = R * (j / (m + 0.35)), d = '', pts = [];
      for (k = 0; k < n; k++) { var jr = rr * (0.96 + rand() * 0.06); pts.push([cx + Math.cos(angles[k]) * jr, cy + Math.sin(angles[k]) * jr]); }
      var segs = full ? n : n - 1, pen = false;
      for (k = 0; k < segs; k++) {
        var a = pts[k], b = pts[(k + 1) % n];
        if (gap && rand() < gap) { pen = false; continue; }          // partial / broken webs
        // Catenary-ish sag: the control point is pulled toward the centre.
        var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
        var qx = mx + (cx - mx) * sag, qy = my + (cy - my) * sag;
        d += (pen ? '' : 'M' + r2(a[0]) + ' ' + r2(a[1])) + 'Q' + r2(qx) + ' ' + r2(qy) + ' ' + r2(b[0]) + ' ' + r2(b[1]);
        pen = true;
      }
      rings.push(d);
      if (j === 1 || j === m) for (k = 0; k < n; k += 2) nodes.push(pts[k]);
    }
    return { spokes: spokes, rings: rings, nodes: nodes };
  }

  /** Connected web nodes: a sparse constellation with nearest-neighbour strands. */
  function network(o) {
    var rand = rng(o.seed || 11), pts = [], k, j, d = '';
    for (k = 0; k < o.count; k++) pts.push([6 + rand() * 88, 6 + rand() * 88]);
    for (k = 0; k < pts.length; k++) {
      var near = pts.map(function (p, i) { return [i, Math.hypot(p[0] - pts[k][0], p[1] - pts[k][1])]; })
        .filter(function (x) { return x[0] !== k; }).sort(function (a, b) { return a[1] - b[1]; }).slice(0, 2);
      for (j = 0; j < near.length; j++) if (near[j][0] > k) d += 'M' + r2(pts[k][0]) + ' ' + r2(pts[k][1]) + 'L' + r2(pts[near[j][0]][0]) + ' ' + r2(pts[near[j][0]][1]);
    }
    return { spokes: d, rings: [], nodes: pts };
  }

  var SHAPES = {
    'radial':    function () { return radial({ cx: 50, cy: 50, r: 49, spokes: 12, rings: 5, sag: 0.16, seed: 3 }); },
    'partial':   function () { return radial({ cx: 50, cy: 50, r: 49, spokes: 10, rings: 4, from: 200, to: 430, sag: 0.2, seed: 5, gap: 0.18 }); },
    'corner-tl': function () { return radial({ cx: 0, cy: 0, r: 100, spokes: 7, rings: 5, from: 0, to: 90, sag: 0.22, seed: 9 }); },
    'corner-tr': function () { return radial({ cx: 100, cy: 0, r: 100, spokes: 7, rings: 5, from: 90, to: 180, sag: 0.22, seed: 13 }); },
    'corner-bl': function () { return radial({ cx: 0, cy: 100, r: 100, spokes: 7, rings: 5, from: 270, to: 360, sag: 0.22, seed: 17 }); },
    'corner-br': function () { return radial({ cx: 100, cy: 100, r: 100, spokes: 7, rings: 5, from: 180, to: 270, sag: 0.22, seed: 19 }); },
    'edge-top':  function () { return radial({ cx: 50, cy: 0, r: 60, spokes: 11, rings: 3, from: 0, to: 180, sag: 0.24, seed: 23 }); },
    'edge-bottom': function () { return radial({ cx: 50, cy: 100, r: 60, spokes: 11, rings: 3, from: 180, to: 360, sag: 0.24, seed: 29 }); },
    'edge-left': function () { return radial({ cx: 0, cy: 50, r: 60, spokes: 11, rings: 3, from: -90, to: 90, sag: 0.24, seed: 31 }); },
    'edge-right': function () { return radial({ cx: 100, cy: 50, r: 60, spokes: 11, rings: 3, from: 90, to: 270, sag: 0.24, seed: 37 }); },
    'nodes':     function () { return network({ count: 14, seed: 41 }); },
    'background': function () { return radial({ cx: 82, cy: 12, r: 96, spokes: 16, rings: 7, sag: 0.14, seed: 43, gap: 0.08 }); }
  };
  function geometry(name) { return memo('g:' + name, function () { return (SHAPES[name] || SHAPES.radial)(); }); }

  /** Inline SVG markup for a shape. Strokes stay hairline at any size (non-scaling-stroke). */
  function svg(name, cls) {
    return memo('s:' + name + ':' + (cls || ''), function () {
      var g = geometry(name), out = '<svg class="azy-web-svg' + (cls ? ' ' + cls : '') + '" viewBox="0 0 100 100" preserveAspectRatio="' + aspect(name) + '" aria-hidden="true" focusable="false">';
      out += '<path class="azy-web-spokes" pathLength="1" d="' + g.spokes + '"/>';
      for (var i = 0; i < g.rings.length; i++) out += '<path class="azy-web-ring" pathLength="1" style="--i:' + i + '" d="' + g.rings[i] + '"/>';
      for (var k = 0; k < g.nodes.length; k++) out += '<circle class="azy-web-node" cx="' + r2(g.nodes[k][0]) + '" cy="' + r2(g.nodes[k][1]) + '" r="0.9"/>';
      return out + '</svg>';
    });
  }
  function aspect(name) {
    if (name === 'corner-tl') return 'xMinYMin meet';
    if (name === 'corner-tr') return 'xMaxYMin meet';
    if (name === 'corner-bl') return 'xMinYMax meet';
    if (name === 'corner-br') return 'xMaxYMax meet';
    if (name.indexOf('edge-') === 0) return 'none';
    return 'xMidYMid meet';
  }

  /** Data-URI mask for CSS (black strokes on transparent; the element's background shows through). */
  function mask(name, strokeW) {
    return memo('m:' + name + ':' + (strokeW || ''), function () {
      var g = geometry(name), w = strokeW || 0.35;
      var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="' + aspect(name) + '">' +
        '<g fill="none" stroke="#000" stroke-width="' + w + '" stroke-linecap="round">' +
        '<path d="' + g.spokes + '"/>' + g.rings.map(function (d) { return '<path d="' + d + '"/>'; }).join('') + '</g>' +
        '<g fill="#000">' + g.nodes.map(function (p) { return '<circle cx="' + r2(p[0]) + '" cy="' + r2(p[1]) + '" r="' + (w * 2.2).toFixed(2) + '"/>'; }).join('') + '</g></svg>';
      return 'url("data:image/svg+xml;utf8,' + encodeURIComponent(s).replace(/'/g, '%27') + '")';
    });
  }

  /* ─── AZY SIGIL ────────────────────────────────────────────────────────────────────
   * Original mark: an elongated hexagonal abdomen carrying the Azy "A", a diamond head,
   * eight straight two-segment legs with sharp knees, and an octagonal web ring joining the
   * leg tips. Angular and geometric on purpose — it reads as "spider + web + Azy", not as
   * any existing emblem. 64-unit grid, strokes in currentColor so it follows the accent. */
  var LEGS_R = [[35, 23, 42, 14, 46, 5], [36, 27.5, 47.5, 22, 58.5, 17], [36.5, 33.5, 48, 37.5, 59, 45.5], [35, 40, 43, 48.5, 47, 58.5]];
  function sigilMarkup(cls) {
    return memo('sigil:' + (cls || ''), function () {
      var legs = '', tips = [], knees = [];
      LEGS_R.forEach(function (l, i) {
        var mirror = [64 - l[0], l[1], 64 - l[2], l[3], 64 - l[4], l[5]];
        [l, mirror].forEach(function (p, side) {
          legs += '<path class="azy-sigil-leg" style="--leg:' + (i + side * 4) + '" d="M' + p[0] + ' ' + p[1] + 'L' + p[2] + ' ' + p[3] + 'L' + p[4] + ' ' + p[5] + '"/>';
          tips.push([p[4], p[5], side, i]);
          knees.push([p[2], p[3], side, i]);
        });
      });
      // Order tips clockwise around the centre for the octagon ring.
      var order = function (arr) { return arr.slice().sort(function (a, b) { return Math.atan2(a[1] - 32, a[0] - 32) - Math.atan2(b[1] - 32, b[0] - 32); }); };
      var ring = function (arr, sag) {
        var o = order(arr), d = 'M' + o[0][0] + ' ' + o[0][1];
        for (var k = 1; k <= o.length; k++) {
          var a = o[k - 1], b = o[k % o.length], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
          d += 'Q' + r2(mx + (32 - mx) * sag) + ' ' + r2(my + (32 - my) * sag) + ' ' + b[0] + ' ' + b[1];
        }
        return d;
      };
      return '<svg class="azy-sigil' + (cls ? ' ' + cls : '') + '" viewBox="0 0 64 64" aria-hidden="true" focusable="false">' +
        '<path class="azy-sigil-web" pathLength="1" d="' + ring(tips, 0.16) + '"/>' +
        '<path class="azy-sigil-web azy-sigil-web--inner" pathLength="1" d="' + ring(knees, 0.1) + '"/>' +
        '<g class="azy-sigil-legs">' + legs + '</g>' +
        '<g class="azy-sigil-body">' +
          '<path class="azy-sigil-head" d="M32 16.5 35 20.8 32 25 29 20.8Z"/>' +
          '<path class="azy-sigil-abdomen" d="M32 26.5 37.2 31.2 36.2 42.2 32 47.5 27.8 42.2 26.8 31.2Z"/>' +
          '<path class="azy-sigil-a" d="M29.6 41.2 32 31.6 34.4 41.2M30.5 38h3"/>' +
        '</g>' +
        '<circle class="azy-sigil-core" cx="32" cy="36.5" r="1.3"/>' +
      '</svg>';
    });
  }
  var SIGIL_STATES = ['idle', 'appear', 'active', 'success', 'loading', 'dissolve'];
  /** Mount (or re-state) the sigil inside host. Returns the <svg>. */
  function sigil(host, state) {
    if (!host) return null;
    var el = host.querySelector(':scope > .azy-sigil');
    if (!el) { host.insertAdjacentHTML('beforeend', sigilMarkup()); el = host.lastElementChild; }
    setSigilState(el, state || 'idle');
    return el;
  }
  function setSigilState(el, state) {
    if (!el) return;
    var next = 'is-' + (SIGIL_STATES.indexOf(state) >= 0 ? state : 'idle');
    var same = el.classList.contains(next);
    for (var i = 0; i < SIGIL_STATES.length; i++) el.classList.remove('is-' + SIGIL_STATES[i]);
    if (same && el.getBoundingClientRect) el.getBoundingClientRect(); // replaying the same state: restart its animation
    el.classList.add(next);
  }

  // ─── publishing + hydration ─────────────────────────────────────────────────────────
  var MASKS = ['radial', 'partial', 'corner-tl', 'corner-tr', 'corner-bl', 'corner-br', 'edge-top', 'edge-bottom', 'nodes', 'background'];
  var api = {
    radial: radial, network: network, geometry: geometry, svg: svg, mask: mask,
    sigilMarkup: sigilMarkup, sigil: sigil, setSigilState: setSigilState, SIGIL_STATES: SIGIL_STATES,
    SHAPES: Object.keys(SHAPES), FX: ['draw', 'pulse', 'ripple', 'snap', 'sweep', 'connect', 'dissolve', 'break']
  };
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (!root || !root.document) return;
  var doc = root.document;

  /* Background webs for large containers are baked as real images (painted behind content,
     not over it). Re-baked only when the accent or quality mode changes — never per frame. */
  var bakedKey = '';
  function bake() {
    var html = doc.documentElement, cs = root.getComputedStyle ? root.getComputedStyle(html) : null;
    var hue = cs ? (cs.getPropertyValue('--hue').trim() || '#d6283f') : '#d6283f';
    // --azy-deco-k is calc(quality × user web opacity); unregistered custom properties come back
    // as that unevaluated string, so the two factors are read and multiplied here.
    var num = function (n, d) { var v = cs ? parseFloat(cs.getPropertyValue(n)) : d; return isFinite(v) ? v : d; };
    var k = num('--azy-deco-perf', 1) * num('--azy-web-user', 1);
    var density = html.getAttribute('data-web-density') || 'normal';
    var a = cs ? parseFloat(cs.getPropertyValue('--azy-web-a-bg')) : 0.05; if (!isFinite(a)) a = 0.05;
    var fa0 = cs ? cs.getPropertyValue('--azy-web-a-frame').trim() : '', gl0 = cs ? cs.getPropertyValue('--azy-web-glow').trim() : '';
    var key = hue + '|' + k + '|' + a + '|' + fa0 + '|' + gl0 + '|' + density;
    if (key === bakedKey) return;
    bakedKey = key;
    var paint = function (name, alpha) {
      var g = geometry(name);
      var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="' + aspect(name) + '">' +
        '<g fill="none" stroke="' + hue + '" stroke-opacity="' + alpha.toFixed(3) + '" stroke-width="0.3" stroke-linecap="round">' +
        '<path d="' + g.spokes + '"/>' + g.rings.map(function (d) { return '<path d="' + d + '"/>'; }).join('') + '</g>' +
        '<g fill="' + hue + '" fill-opacity="' + Math.min(1, alpha * 2).toFixed(3) + '">' + g.nodes.map(function (p) { return '<circle cx="' + r2(p[0]) + '" cy="' + r2(p[1]) + '" r="0.6"/>'; }).join('') + '</g></svg>';
      return 'url("data:image/svg+xml;utf8,' + encodeURIComponent(s).replace(/'/g, '%27') + '")';
    };
    var fa = cs ? parseFloat(cs.getPropertyValue('--azy-web-a-frame')) : 0; if (!isFinite(fa)) fa = 0;
    var glow = cs ? cs.getPropertyValue('--azy-web-glow').trim() === '1' : false;
    if (k <= 0) { ['corner', 'corner-bl', 'frame', 'tex'].forEach(function (n) { html.style.setProperty('--azy-web-bg-' + n, 'none'); }); dropFrame(key); return; }
    html.style.setProperty('--azy-web-bg-corner', paint('corner-tr', a * 1.2 * k));
    html.style.setProperty('--azy-web-bg-corner-bl', paint('corner-bl', a * k));
    var fr = fa > 0 ? frame(hue, Math.min(1, fa * k), glow, density) : 'none';
    html.style.setProperty('--azy-web-bg-frame', fr);
    if (fr !== 'none') bitmap(fr, key); else dropFrame(key);
    html.style.setProperty('--azy-web-bg-tex', fa > 0 ? texture(hue, Math.min(1, fa * 0.55 * k)) : 'none');
  }
  /* The frame is a full-window SVG (hundreds of paths + a gradient mask). As a CSS background it
     is re-rasterised on every repaint of whatever layer it lands in — hover, toast, toggle — which
     was the single biggest source of long frames under the glow skin. So it is drawn ONCE into a
     bitmap at the window's device size and swapped in; blitting a bitmap costs next to nothing.
     The SVG stays as the instant fallback until the bitmap is ready (and wherever canvas isn't).
     Re-drawn only when the accent/quality key or the window size changes. */
  var bmpKey = '', bmpTimer = 0, lastFrameUri = '', lastFrameKey = '';
  /* Web layer off (toggle, opacity 0, Performance mode): forget the last frame. Before v1.16 the old
     key/uri survived, so a bitmap still decoding — or the next window resize — painted the web
     back while the toggle said off, and switching back on skipped the bitmap (stale bmpKey) and
     left the heavy SVG in place. That was the "web toggle sometimes glitches" report. */
  function dropFrame(key) { lastFrameUri = ''; lastFrameKey = key; bmpKey = ''; clearTimeout(bmpTimer); }
  function bitmap(svgUri, key) {
    lastFrameUri = svgUri; lastFrameKey = key;
    var w = root.innerWidth || 0, h = root.innerHeight || 0;
    var dpr = Math.min(2, root.devicePixelRatio || 1);
    var W = Math.min(2560, Math.round(w * dpr)), H = Math.min(2560, Math.round(h * dpr));
    if (!W || !H || !doc.createElement || typeof root.Image !== 'function') return;
    var want = key + '@' + W + 'x' + H;
    if (want === bmpKey) return;
    var cv = doc.createElement('canvas');
    if (!cv || !cv.getContext) return;
    var ctx = null; try { ctx = cv.getContext('2d'); } catch (e) { ctx = null; }
    if (!ctx) return;
    var img = new root.Image();
    img.onload = function () {
      if (lastFrameKey !== key) return;               // accent changed meanwhile — a newer bake wins
      try {
        cv.width = W; cv.height = H;
        ctx.drawImage(img, 0, 0, W, H);
        doc.documentElement.style.setProperty('--azy-web-bg-frame', 'url("' + cv.toDataURL('image/png') + '")');
        bmpKey = want;
      } catch (e) { /* keep the SVG */ }
    };
    img.src = svgUri.slice(5, -2);                    // url("…") → …
  }
  if (root.addEventListener) root.addEventListener('resize', function () {
    if (!lastFrameUri) return;
    clearTimeout(bmpTimer);
    bmpTimer = setTimeout(function () { bitmap(lastFrameUri, lastFrameKey); }, 250);
  });
  var uri = function (s) { return 'url("data:image/svg+xml;utf8,' + encodeURIComponent(s).replace(/'/g, '%27') + '")'; };
  /* "Spider glow" frame: four spun corner webs + long strands along the edges, faded out toward
     the centre so the workspace stays calm. One image, stretched; strokes stay hairline. */
  var DENSITY = { light: [30, 16], normal: [60, 34], dense: [104, 60] };
  function frame(hue, alpha, glow, density) {
    var dn = DENSITY[density] || DENSITY.normal;
    return memo('frame:' + hue + alpha.toFixed(3) + glow + dn[0], function () {
      var nse = ' vector-effect="non-scaling-stroke"';
      var part = function (name, tx, ty, sc) {
        var g = geometry(name);
        return '<g transform="translate(' + tx + ' ' + ty + ') scale(' + sc + ')"><path' + nse + ' d="' + g.spokes + '"/>' + g.rings.map(function (d) { return '<path' + nse + ' d="' + d + '"/>'; }).join('') + '</g>';
      };
      var e1 = edgeNet(dn[0], 131), e2 = edgeNet(dn[1], 149);
      var body = part('corner-tl', 0, 0, 0.2) + part('corner-tr', 80, 0, 0.2) + part('corner-bl', 0, 82, 0.18) + part('corner-br', 82, 82, 0.18) +
        '<path' + nse + ' d="' + e1 + '"/><path' + nse + ' stroke-opacity="0.55" d="' + e2 + '"/>';
      var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><defs>' +
        '<radialGradient id="f" cx="50%" cy="50%" r="71%"><stop offset="45%" stop-color="#000"/><stop offset="72%" stop-color="#fff" stop-opacity="0.75"/><stop offset="100%" stop-color="#fff"/></radialGradient>' +
        '<mask id="m"><rect width="100" height="100" fill="url(#f)"/></mask>' +
        '</defs>' +
        '<g mask="url(#m)" fill="none" stroke="' + hue + '" stroke-linecap="round">' +
        // Glow pass = one wide faint stroke under the hairline. No SVG filter: filters in a CSS
        // background image are re-run on every raster of every tile they touch.
        (glow ? '<g stroke-width="2.6" stroke-opacity="' + (alpha * 0.28).toFixed(3) + '">' + body + '</g>' : '') +
        '<g stroke-width="0.7" stroke-opacity="' + alpha.toFixed(3) + '">' + body + '</g></g></svg>';
      return uri(s);
    });
  }
  /* Edge-hugging tangle: nodes crowd the four edges (depth falls off fast), each joined to its
     nearest neighbours, plus long corner-cutting chords — the "spun around the frame" look. */
  function edgeNet(count, seed) {
    return memo('edge:' + count + ':' + seed, function () {
      var rand = rng(seed), pts = [], k, d = '';
      for (k = 0; k < count; k++) {
        var side = Math.floor(rand() * 4), t = rand() * 100, depth = 0.5 + Math.pow(rand(), 2.4) * 24;
        pts.push(side === 0 ? [t, depth] : side === 1 ? [100 - depth, t] : side === 2 ? [t, 100 - depth] : [depth, t]);
      }
      for (k = 0; k < pts.length; k++) {
        var near = pts.map(function (p, i) { return [i, Math.hypot(p[0] - pts[k][0], p[1] - pts[k][1])]; })
          .filter(function (x) { return x[0] !== k; }).sort(function (a, b) { return a[1] - b[1]; }).slice(0, 3);
        for (var j = 0; j < near.length; j++) if (near[j][0] > k || near[j][1] > 14) d += 'M' + r2(pts[k][0]) + ' ' + r2(pts[k][1]) + 'L' + r2(pts[near[j][0]][0]) + ' ' + r2(pts[near[j][0]][1]);
      }
      for (k = 0; k < 14; k++) {                                   // corner chords
        var c = Math.floor(rand() * 4), a = 4 + rand() * 38, b = 4 + rand() * 38;
        var p1 = c === 0 ? [a, 0] : c === 1 ? [100 - a, 0] : c === 2 ? [100, 100 - a] : [0, 100 - a];
        var p2 = c === 0 ? [0, b] : c === 1 ? [100, b] : c === 2 ? [100 - b, 100] : [b, 100];
        d += 'M' + r2(p1[0]) + ' ' + r2(p1[1]) + 'L' + r2(p2[0]) + ' ' + r2(p2[1]);
      }
      return d;
    });
  }
  /* Fine web texture for cards / tiles (the faint lattice inside the reference cards). */
  function texture(hue, alpha) {
    return memo('tex:' + hue + alpha.toFixed(3), function () {
      var g = network({ count: 16, seed: 97 }), c = radial({ cx: 100, cy: 0, r: 70, spokes: 6, rings: 3, from: 90, to: 180, sag: 0.22, seed: 101 });
      var nse = ' vector-effect="non-scaling-stroke"';
      var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><g fill="none" stroke="' + hue + '" stroke-width="0.7" stroke-linecap="round">' +
        '<path' + nse + ' stroke-opacity="' + (alpha * 0.55).toFixed(3) + '" d="' + g.spokes + '"/>' +
        '<g stroke-opacity="' + alpha.toFixed(3) + '"><path' + nse + ' d="' + c.spokes + '"/>' + c.rings.map(function (d) { return '<path' + nse + ' d="' + d + '"/>'; }).join('') + '</g></g></svg>';
      return uri(s);
    });
  }

  function publish() {
    var html = doc.documentElement;
    bake();
    for (var i = 0; i < MASKS.length; i++) html.style.setProperty('--azy-web-mask-' + MASKS[i], mask(MASKS[i]));
    // Sigil as a mask too — for CSS-only placements (empty states, brand spots).
    var sg = sigilMarkup().replace('class="azy-sigil"', 'xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#000" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"');
    html.style.setProperty('--azy-sigil-mask', 'url("data:image/svg+xml;utf8,' + encodeURIComponent(sg).replace(/'/g, '%27') + '")');
  }

  /** Fill `<i class="azy-web" data-web="…">` and `[data-azy-sigil]` placeholders under scope. */
  function hydrate(scope) {
    var host = scope || doc;
    var webs = host.querySelectorAll('.azy-web[data-web]:not([data-web-ready])');
    for (var i = 0; i < webs.length; i++) { webs[i].innerHTML = svg(webs[i].getAttribute('data-web')); webs[i].setAttribute('data-web-ready', ''); }
    var sg = host.querySelectorAll('[data-azy-sigil]:not([data-sigil-ready])');
    for (var k = 0; k < sg.length; k++) { sigil(sg[k], sg[k].getAttribute('data-azy-sigil') || 'idle'); sg[k].setAttribute('data-sigil-ready', ''); }
  }

  // ─── FX: one shared layer, one layout read per event, auto-cleanup ─────────────────
  var layer = null;
  function fxLayer() {
    if (layer && layer.isConnected) return layer;
    layer = doc.createElement('div');
    layer.className = 'azy-fx-layer';
    layer.setAttribute('aria-hidden', 'true');
    (doc.body || doc.documentElement).appendChild(layer);
    return layer;
  }
  var FX_SHAPE = { draw: 'radial', pulse: 'radial', ripple: 'radial', snap: 'partial', sweep: 'edge-bottom', connect: 'nodes', connection: 'nodes', dissolve: 'radial', 'break': 'partial' };
  var FX_MS = { draw: 320, pulse: 260, ripple: 300, snap: 160, sweep: 280, connect: 300, connection: 300, dissolve: 240, 'break': 220 };
  var FUNCTIONAL = { pulse: 1, ripple: 1, 'break': 1 }; // success / error feedback: kept (simplified) in reduced motion
  var live = 0;

  /**
   * Play one web animation over `target` (element or {x, y}). Fire-and-forget; never awaited.
   * opts: { size (px), at: 'center' | 'pointer' | 'rect', x, y, tone: 'accent' | 'ok' | 'err' }
   */
  function fx(target, kind, opts) {
    opts = opts || {};
    kind = FX_SHAPE[kind] ? kind : 'pulse';
    var T = root.azyTheme;
    var decorative = !T || T.decorative();
    if (!decorative && !FUNCTIONAL[kind]) return null;            // performance / reduced: decoration off
    if (!FUNCTIONAL[kind] && doc.documentElement.hasAttribute('data-busy')) return null; // main thread busy: skip decoration
    if (kind === 'connection') kind = 'connect';
    if (live > 6) return null;                                      // never pile up during rapid clicks
    var rect = null, x = opts.x, y = opts.y;
    if (target && target.getBoundingClientRect) rect = target.getBoundingClientRect();
    else if (target && typeof target.x === 'number') { x = target.x; y = target.y; }
    var size = opts.size || (rect ? Math.max(48, Math.min(260, Math.max(rect.width, rect.height) * 1.25)) : 120);
    var el = doc.createElement('span');
    el.className = 'azy-fx azy-fx--' + kind + (opts.tone ? ' azy-fx--' + opts.tone : '') + (decorative ? '' : ' azy-fx--static');
    el.innerHTML = svg(FX_SHAPE[kind], 'azy-fx-svg');
    if (opts.at === 'rect' && rect) {
      el.style.left = rect.left + 'px'; el.style.top = rect.top + 'px';
      el.style.width = rect.width + 'px'; el.style.height = rect.height + 'px';
    } else {
      if (x === undefined && rect) { x = rect.left + rect.width / 2; y = rect.top + rect.height / 2; }
      el.style.left = ((x || 0) - size / 2) + 'px'; el.style.top = ((y || 0) - size / 2) + 'px';
      el.style.width = size + 'px'; el.style.height = size + 'px';
    }
    fxLayer().appendChild(el);
    live++;
    var done = false;
    var end = function () { if (done) return; done = true; live--; if (el.parentNode) el.parentNode.removeChild(el); };
    el.addEventListener('animationend', function (e) { if (e.target === el) end(); });
    setTimeout(end, (FX_MS[kind] || 300) + 120);                   // hard cap even if animations are disabled
    return el;
  }

  /* Where the frame web's threads actually are (v1.15) — node points of the four corner webs in
     viewport %, plus their hubs, so the living-web layer (azy-motion.js) can hang dew, drops and
     the spider ON the strands instead of guessing. Same transforms as frame(). */
  function anchors() {
    return memo('anchors', function () {
      var parts = [['corner-tl', 0, 0, 0.2], ['corner-tr', 80, 0, 0.2], ['corner-bl', 0, 82, 0.18], ['corner-br', 82, 82, 0.18]];
      var hubs = [[0, 0], [100, 0], [0, 100], [100, 100]], nodes = [];
      parts.forEach(function (p, i) {
        geometry(p[0]).nodes.forEach(function (n) { nodes.push({ x: r2(p[1] + n[0] * p[3]), y: r2(p[2] + n[1] * p[3]), c: i }); });
      });
      return { hubs: hubs, nodes: nodes };
    });
  }
  api.anchors = anchors;
  api.hydrate = hydrate;
  api.fx = fx;
  api.publish = publish;
  api.bake = bake;
  root.azyWeb = api;

  publish();
  /* Theme changes re-bake at most every 160 ms (trailing): dragging a Customise slider fires many
     changes and each bake re-encodes a window-sized bitmap. */
  var bakeAt = 0, bakeTimer = 0;
  doc.addEventListener('azy:themechange', function () {
    var now = Date.now();
    clearTimeout(bakeTimer);
    if (now - bakeAt > 160) { bakeAt = now; bake(); }
    else bakeTimer = setTimeout(function () { bakeAt = Date.now(); bake(); }, 160);
  });
  var go = function () { hydrate(doc); };
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', go, { once: true }); else go();
})(typeof window !== 'undefined' ? window : null);

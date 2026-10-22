/* Azy Artwork — the original spider-inspired art universe, as one inline SVG sprite.
 *
 * Six hand-drawn vector artworks (no bitmaps, no external files, nothing to fetch):
 *   art-web-core    — the Azy emblem inside an intricate digital web, holographic rings
 *   art-dagger      — the floating Azy Dagger wrapped in thin web strands and UI fragments
 *   art-spider      — the Digital Spider: an abstract geometric entity, the universe mascot
 *   art-matrix      — the ecosystem web: seven labelled hubs around the Azy core
 *   art-creator     — the cinematic editing desk: monitor, holo panels, web in the corners
 *   art-void        — near-black restraint: the emblem, a few fading strands, two particles
 *
 * Rules this file lives by (see azy-artwork.css for placement + motion):
 *  - every artwork is 100% original geometry — abstract webs, polygons and light. No
 *    existing character, costume, logo or comic artwork is referenced anywhere.
 *  - everything paints with currentColor so each piece inherits the active theme accent;
 *    the only shared gradient also uses currentColor stops.
 *  - decorative only: injected hidden, aria-hidden, and every placement sets
 *    pointer-events:none. Artwork can never intercept a click, drag, drop or shortcut.
 *  - animations are CSS-only and compositor-friendly (opacity / transform / dashoffset),
 *    defined in azy-artwork.css — this file is pure markup.
 */
(function () {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';

  /* Shared defs: a soft radial glow built from currentColor so it themes automatically. */
  var DEFS =
    '<defs>' +
      '<radialGradient id="azyArtGlow">' +
        '<stop offset="0%" stop-color="currentColor" stop-opacity="0.5"/>' +
        '<stop offset="55%" stop-color="currentColor" stop-opacity="0.12"/>' +
        '<stop offset="100%" stop-color="currentColor" stop-opacity="0"/>' +
      '</radialGradient>' +
      '<clipPath id="azyArtBlade"><path d="M120 24 L133 96 L120 190 L107 96 Z"/></clipPath>' +
    '</defs>';

  /* The Azy "A" mark, drawn on a 24-unit grid and placed with a transform by each piece. */
  var AZY_MARK =
    '<path d="M6.2 18.4 10.1 5.7h3.8l3.9 12.7M8 13.1h8" fill="none" stroke="currentColor" ' +
    'stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>';

  /* ── 1. AZY WEB CORE ─────────────────────────────────────────────────────────────
   * A huge intricate web: 16 spokes, four catenary rings, glowing nodes at the
   * intersections, one strand carrying travelling light, two holographic rings and
   * the Azy emblem on a glowing core. Draw-once strand formation via dashoffset. */
  var WEB_CORE =
    '<symbol id="art-web-core" viewBox="0 0 240 240">' +
      '<g class="azy-art-spokes" stroke="currentColor" stroke-width="0.6" opacity="0.3" fill="none">' +
        '<path d="M120 120 L236 120 M120 120 L220 178 M120 120 L178 220 M120 120 L120 236 ' +
        'M120 120 L62 220 M120 120 L20 178 M120 120 L4 120 M120 120 L20 62 ' +
        'M120 120 L62 20 M120 120 L120 4 M120 120 L178 20 M120 120 L220 62 ' +
        'M120 120 L231 150 M120 120 L231 90 M120 120 L150 231 M120 120 L90 231 ' +
        'M120 120 L9 150 M120 120 L9 90 M120 120 L90 9 M120 120 L150 9"/>' +
      '</g>' +
      '<g class="azy-art-rings" stroke="currentColor" fill="none" stroke-width="0.7">' +
        '<path class="azy-art-draw" opacity="0.42" d="M154 120 Q148 133 144 134 Q137 145 134 144 Q128 152 120 154 Q112 152 106 144 Q97 146 96 134 Q86 130 86 120 Q86 110 96 106 Q97 94 106 96 Q112 88 120 86 Q128 88 134 96 Q144 95 144 106 Q152 112 154 120 Z"/>' +
        '<path class="azy-art-draw azy-art-draw-2" opacity="0.3" d="M184 120 Q176 137 170 140 Q164 158 158 158 Q146 172 140 170 Q130 182 120 184 Q110 182 100 170 Q88 173 82 158 Q68 156 62 140 Q52 132 56 120 Q52 108 62 100 Q68 84 82 82 Q88 67 100 70 Q110 58 120 56 Q130 58 140 70 Q154 68 158 82 Q172 86 170 100 Q180 110 184 120 Z"/>' +
        '<path class="azy-art-draw azy-art-draw-3" opacity="0.2" d="M212 120 Q202 142 194 146 Q188 168 178 172 Q168 190 156 190 Q142 204 130 202 Q124 212 120 212 Q108 210 96 200 Q82 204 72 190 Q58 188 50 172 Q38 164 34 146 Q24 134 28 120 Q24 106 34 94 Q38 76 50 68 Q58 52 72 50 Q82 36 96 40 Q108 30 120 28 Q132 30 144 40 Q158 37 168 50 Q182 54 190 68 Q202 78 206 94 Q214 108 212 120 Z"/>' +
      '</g>' +
      '<path class="azy-art-travel" d="M120 120 L220 178" stroke="currentColor" stroke-width="1.1" fill="none" opacity="0.75" stroke-linecap="round" stroke-dasharray="14 200"/>' +
      '<path class="azy-art-travel azy-art-travel-2" d="M120 120 L20 62" stroke="currentColor" stroke-width="1" fill="none" opacity="0.5" stroke-linecap="round" stroke-dasharray="10 200"/>' +
      '<g class="azy-art-nodes" fill="currentColor">' +
        '<circle cx="154" cy="120" r="1.5" opacity="0.65"/>' +
        '<circle class="azy-art-node-b" cx="96" cy="106" r="1.7" opacity="0.6"/>' +
        '<circle cx="144" cy="134" r="1.3" opacity="0.5"/>' +
        '<circle cx="106" cy="144" r="1.3" opacity="0.5"/>' +
        '<circle class="azy-art-node-b azy-art-node-b2" cx="184" cy="120" r="1.8" opacity="0.55"/>' +
        '<circle cx="62" cy="140" r="1.4" opacity="0.45"/>' +
        '<circle cx="158" cy="82" r="1.4" opacity="0.45"/>' +
        '<circle class="azy-art-node-b azy-art-node-b3" cx="82" cy="158" r="1.6" opacity="0.5"/>' +
        '<circle cx="194" cy="146" r="1.2" opacity="0.35"/>' +
        '<circle cx="50" cy="94" r="1.2" opacity="0.35"/>' +
        '<circle cx="140" cy="42" r="1.2" opacity="0.3"/>' +
        '<circle cx="96" cy="200" r="1.2" opacity="0.3"/>' +
      '</g>' +
      '<g class="azy-art-holo" fill="none" stroke="currentColor">' +
        '<ellipse cx="120" cy="120" rx="58" ry="17" stroke-width="0.7" opacity="0.22" transform="rotate(-16 120 120)"/>' +
        '<ellipse class="azy-art-breathe" cx="120" cy="120" rx="72" ry="21" stroke-width="0.55" opacity="0.13" transform="rotate(11 120 120)"/>' +
      '</g>' +
      '<g class="azy-art-particles" fill="currentColor">' +
        '<circle class="azy-art-tw" cx="205" cy="40" r="1.1" opacity="0.5"/>' +
        '<circle class="azy-art-tw azy-art-tw-2" cx="32" cy="200" r="1" opacity="0.4"/>' +
        '<circle class="azy-art-tw azy-art-tw-3" cx="215" cy="196" r="0.9" opacity="0.35"/>' +
        '<circle class="azy-art-tw azy-art-tw-2" cx="26" cy="34" r="0.9" opacity="0.3"/>' +
      '</g>' +
      '<circle cx="120" cy="120" r="34" fill="url(#azyArtGlow)" class="azy-art-breathe"/>' +
      '<circle cx="120" cy="120" r="21" fill="none" stroke="currentColor" stroke-width="0.9" opacity="0.55"/>' +
      '<g transform="translate(105.6 105.6) scale(1.2)"><g opacity="0.95">' + AZY_MARK + '</g></g>' +
    '</symbol>';

  /* ── 2. AZY DAGGER ───────────────────────────────────────────────────────────────
   * The iconic tool: a slim geometric blade with a fuller line, crossguard and core
   * gem, floating over a breathing glow. Thin web strands reach in from the corners,
   * two holo UI fragments hover nearby, a light sweep travels the blade on a long
   * calm loop, and particles drift around it. */
  var DAGGER =
    '<symbol id="art-dagger" viewBox="0 0 240 240">' +
      '<g class="azy-art-strands" stroke="currentColor" stroke-width="0.6" fill="none" opacity="0.32">' +
        '<path class="azy-art-draw" d="M8 14 Q46 36 68 60 Q84 78 98 92"/>' +
        '<path class="azy-art-draw azy-art-draw-2" d="M232 20 Q192 44 168 68 Q152 84 142 94"/>' +
        '<path class="azy-art-draw azy-art-draw-3" d="M14 226 Q52 202 76 180 Q92 164 102 152"/>' +
        '<path class="azy-art-draw" d="M228 224 Q190 200 166 178 Q150 162 140 150"/>' +
        '<path d="M52 42 Q64 58 62 74 M186 48 Q176 62 180 78" opacity="0.6"/>' +
        '<circle cx="68" cy="60" r="1.3" fill="currentColor" stroke="none" opacity="0.7"/>' +
        '<circle cx="168" cy="68" r="1.3" fill="currentColor" stroke="none" opacity="0.7"/>' +
        '<circle cx="76" cy="180" r="1.3" fill="currentColor" stroke="none" opacity="0.6"/>' +
        '<circle cx="166" cy="178" r="1.3" fill="currentColor" stroke="none" opacity="0.6"/>' +
      '</g>' +
      '<g class="azy-art-fragments" stroke="currentColor" fill="none" stroke-width="0.8" opacity="0.4">' +
        '<path d="M36 96 h16 M36 96 v16"/>' +
        '<path d="M204 144 h-16 M204 144 v-16"/>' +
        '<rect x="176" y="70" width="26" height="18" rx="2" stroke-dasharray="3 3" opacity="0.7"/>' +
        '<path d="M180 80 h8 M190 80 h8 M180 84 h14" stroke-width="0.6" opacity="0.8"/>' +
        '<rect x="40" y="150" width="24" height="16" rx="2" stroke-dasharray="3 3" opacity="0.6"/>' +
        '<path d="M44 160 q3 -6 6 0 q3 5 6 -1" stroke-width="0.7" opacity="0.8"/>' +
      '</g>' +
      '<ellipse class="azy-art-breathe" cx="120" cy="112" rx="52" ry="66" fill="url(#azyArtGlow)" opacity="0.5"/>' +
      '<g class="azy-art-float">' +
        '<path d="M120 24 L133 96 L120 190 L107 96 Z" fill="currentColor" opacity="0.14"/>' +
        '<path d="M120 24 L133 96 L120 190 L107 96 Z" fill="none" stroke="currentColor" stroke-width="1.1" opacity="0.85" stroke-linejoin="round"/>' +
        '<path d="M120 32 L120 182" stroke="currentColor" stroke-width="0.6" opacity="0.5"/>' +
        '<path d="M96 96 H144" stroke="currentColor" stroke-width="1.4" opacity="0.8" stroke-linecap="round"/>' +
        '<path d="M100 92 Q120 86 140 92" fill="none" stroke="currentColor" stroke-width="0.6" opacity="0.4"/>' +
        '<circle cx="120" cy="96" r="3" fill="currentColor" opacity="0.9"/>' +
        '<circle class="azy-art-node-b" cx="120" cy="96" r="5.5" fill="none" stroke="currentColor" stroke-width="0.6" opacity="0.5"/>' +
        '<path d="M116 190 h8 M118 196 h4" stroke="currentColor" stroke-width="1" opacity="0.6" stroke-linecap="round"/>' +
        '<g clip-path="url(#azyArtBlade)"><rect class="azy-art-sweep" x="86" y="-40" width="68" height="26" fill="currentColor" opacity="0.16" transform="skewY(-18)"/></g>' +
      '</g>' +
      '<g class="azy-art-particles" fill="currentColor">' +
        '<circle class="azy-art-tw" cx="84" cy="52" r="1" opacity="0.5"/>' +
        '<circle class="azy-art-tw azy-art-tw-2" cx="158" cy="120" r="1" opacity="0.45"/>' +
        '<circle class="azy-art-tw azy-art-tw-3" cx="92" cy="168" r="0.9" opacity="0.4"/>' +
        '<circle class="azy-art-tw" cx="164" cy="196" r="0.9" opacity="0.35"/>' +
      '</g>' +
    '</symbol>';

  /* ── 3. DIGITAL SPIDER ───────────────────────────────────────────────────────────
   * The mascot: a purely abstract geometric entity. Hexagonal body, glowing sensor
   * slits, eight angular legs with joint + tip nodes, hanging from a web arc with a
   * single anchor thread. Legs draw themselves once; the body hovers on a very slow,
   * tiny transform loop. No face, no character — structure and light only. */
  var SPIDER =
    '<symbol id="art-spider" viewBox="0 0 240 240">' +
      '<path class="azy-art-draw" d="M120 6 V44" stroke="currentColor" stroke-width="0.7" opacity="0.4" fill="none"/>' +
      '<path class="azy-art-draw azy-art-draw-2" d="M20 58 Q70 84 120 86 Q170 84 220 58" stroke="currentColor" stroke-width="0.7" opacity="0.35" fill="none"/>' +
      '<path d="M52 74 V92 M80 82 V104 M160 82 V104 M188 74 V92" stroke="currentColor" stroke-width="0.5" opacity="0.22" fill="none"/>' +
      '<g class="azy-art-spider-body">' +
        '<g class="azy-art-legs" stroke="currentColor" stroke-width="1" fill="none" opacity="0.75" stroke-linecap="round" stroke-linejoin="round">' +
          '<path class="azy-art-draw" d="M106 92 L68 64 L42 84 L30 110"/>' +
          '<path class="azy-art-draw azy-art-draw-2" d="M104 100 L60 90 L34 118 L28 146"/>' +
          '<path class="azy-art-draw azy-art-draw-3" d="M106 110 L66 122 L48 156 L50 184"/>' +
          '<path class="azy-art-draw" d="M110 118 L86 146 L78 180 L84 202"/>' +
          '<path class="azy-art-draw azy-art-draw-2" d="M134 92 L172 64 L198 84 L210 110"/>' +
          '<path class="azy-art-draw azy-art-draw-3" d="M136 100 L180 90 L206 118 L212 146"/>' +
          '<path class="azy-art-draw" d="M134 110 L174 122 L192 156 L190 184"/>' +
          '<path class="azy-art-draw azy-art-draw-2" d="M130 118 L154 146 L162 180 L156 202"/>' +
        '</g>' +
        '<g class="azy-art-joints" fill="currentColor">' +
          '<circle cx="68" cy="64" r="1.4" opacity="0.7"/><circle cx="60" cy="90" r="1.4" opacity="0.7"/>' +
          '<circle cx="66" cy="122" r="1.4" opacity="0.7"/><circle cx="86" cy="146" r="1.4" opacity="0.7"/>' +
          '<circle cx="172" cy="64" r="1.4" opacity="0.7"/><circle cx="180" cy="90" r="1.4" opacity="0.7"/>' +
          '<circle cx="174" cy="122" r="1.4" opacity="0.7"/><circle cx="154" cy="146" r="1.4" opacity="0.7"/>' +
        '</g>' +
        '<circle class="azy-art-tw" cx="30" cy="110" r="1.6" fill="currentColor" opacity="0.55"/>' +
        '<circle class="azy-art-tw azy-art-tw-3" cx="28" cy="146" r="1.6" fill="currentColor" opacity="0.5"/>' +
        '<circle class="azy-art-tw azy-art-tw-2" cx="50" cy="184" r="1.6" fill="currentColor" opacity="0.5"/>' +
        '<circle class="azy-art-tw" cx="84" cy="202" r="1.6" fill="currentColor" opacity="0.45"/>' +
        '<circle class="azy-art-tw azy-art-tw-2" cx="210" cy="110" r="1.6" fill="currentColor" opacity="0.55"/>' +
        '<circle class="azy-art-tw" cx="212" cy="146" r="1.6" fill="currentColor" opacity="0.5"/>' +
        '<circle class="azy-art-tw azy-art-tw-3" cx="190" cy="184" r="1.6" fill="currentColor" opacity="0.5"/>' +
        '<circle class="azy-art-tw azy-art-tw-2" cx="156" cy="202" r="1.6" fill="currentColor" opacity="0.45"/>' +
        '<path d="M120 74 L140 86 L140 110 L120 122 L100 110 L100 86 Z" fill="currentColor" opacity="0.12"/>' +
        '<path d="M120 74 L140 86 L140 110 L120 122 L100 110 L100 86 Z" fill="none" stroke="currentColor" stroke-width="1.1" opacity="0.85" stroke-linejoin="round"/>' +
        '<path d="M120 82 L133 90 L133 106 L120 114 L107 106 L107 90 Z" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.35"/>' +
        '<path class="azy-art-breathe" d="M108 88 L116 93 M132 88 L124 93" stroke="currentColor" stroke-width="2" opacity="0.9" stroke-linecap="round"/>' +
        '<circle cx="120" cy="103" r="2.2" fill="currentColor" opacity="0.8"/>' +
        '<circle class="azy-art-node-b" cx="120" cy="103" r="5" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.4"/>' +
      '</g>' +
      '<g class="azy-art-particles" fill="currentColor">' +
        '<circle class="azy-art-tw azy-art-tw-2" cx="46" cy="44" r="0.9" opacity="0.35"/>' +
        '<circle class="azy-art-tw" cx="196" cy="40" r="0.9" opacity="0.35"/>' +
        '<circle class="azy-art-tw azy-art-tw-3" cx="120" cy="216" r="0.9" opacity="0.3"/>' +
      '</g>' +
    '</symbol>';

  /* ── 4. WEB MATRIX ───────────────────────────────────────────────────────────────
   * The ecosystem: seven hub nodes — Files, Presets, Flow, Speed, Dagger, SFX and
   * Premiere Pro — wired to the Azy core with thin links. Two links carry travelling
   * light, hubs breathe on staggered loops, faint rings keep it cinematic. */
  var MATRIX =
    '<symbol id="art-matrix" viewBox="0 0 240 240">' +
      '<g class="azy-art-links" stroke="currentColor" stroke-width="0.6" opacity="0.3" fill="none">' +
        '<path d="M120 120 L120 38 M120 120 L192 76 M120 120 L204 148 M120 120 L160 204 M120 120 L80 204 M120 120 L36 148 M120 120 L48 76"/>' +
        '<path d="M120 38 L192 76 L204 148 L160 204 L80 204 L36 148 L48 76 Z" opacity="0.55"/>' +
      '</g>' +
      '<path class="azy-art-travel" d="M120 120 L192 76" stroke="currentColor" stroke-width="1" fill="none" opacity="0.6" stroke-linecap="round" stroke-dasharray="12 200"/>' +
      '<path class="azy-art-travel azy-art-travel-2" d="M120 120 L36 148" stroke="currentColor" stroke-width="1" fill="none" opacity="0.5" stroke-linecap="round" stroke-dasharray="12 200"/>' +
      '<g fill="none" stroke="currentColor" opacity="0.14">' +
        '<circle cx="120" cy="120" r="58" stroke-width="0.5" stroke-dasharray="2 5"/>' +
        '<circle class="azy-art-breathe" cx="120" cy="120" r="92" stroke-width="0.5" stroke-dasharray="1 7"/>' +
      '</g>' +
      '<g class="azy-art-hubs">' +
        '<g><circle cx="120" cy="38" r="7" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55"/><circle class="azy-art-node-b" cx="120" cy="38" r="2.4" fill="currentColor" opacity="0.8"/><text x="120" y="26" text-anchor="middle" font-size="7" fill="currentColor" opacity="0.5" font-family="inherit" letter-spacing="0.08em">FILES</text></g>' +
        '<g><circle cx="192" cy="76" r="7" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55"/><circle class="azy-art-node-b azy-art-node-b2" cx="192" cy="76" r="2.4" fill="currentColor" opacity="0.8"/><text x="203" y="66" text-anchor="middle" font-size="7" fill="currentColor" opacity="0.5" font-family="inherit" letter-spacing="0.08em">PRESETS</text></g>' +
        '<g><circle cx="204" cy="148" r="7" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55"/><circle class="azy-art-node-b azy-art-node-b3" cx="204" cy="148" r="2.4" fill="currentColor" opacity="0.8"/><text x="212" y="164" text-anchor="middle" font-size="7" fill="currentColor" opacity="0.5" font-family="inherit" letter-spacing="0.08em">FLOW</text></g>' +
        '<g><circle cx="160" cy="204" r="7" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55"/><circle class="azy-art-node-b" cx="160" cy="204" r="2.4" fill="currentColor" opacity="0.8"/><text x="164" y="220" text-anchor="middle" font-size="7" fill="currentColor" opacity="0.5" font-family="inherit" letter-spacing="0.08em">SPEED</text></g>' +
        '<g><circle cx="80" cy="204" r="7" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55"/><circle class="azy-art-node-b azy-art-node-b2" cx="80" cy="204" r="2.4" fill="currentColor" opacity="0.8"/><text x="76" y="220" text-anchor="middle" font-size="7" fill="currentColor" opacity="0.5" font-family="inherit" letter-spacing="0.08em">DAGGER</text></g>' +
        '<g><circle cx="36" cy="148" r="7" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55"/><circle class="azy-art-node-b azy-art-node-b3" cx="36" cy="148" r="2.4" fill="currentColor" opacity="0.8"/><text x="30" y="164" text-anchor="middle" font-size="7" fill="currentColor" opacity="0.5" font-family="inherit" letter-spacing="0.08em">SFX</text></g>' +
        '<g><circle cx="48" cy="76" r="7" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55"/><circle class="azy-art-node-b" cx="48" cy="76" r="2.4" fill="currentColor" opacity="0.8"/><text x="40" y="64" text-anchor="middle" font-size="7" fill="currentColor" opacity="0.5" font-family="inherit" letter-spacing="0.08em">PREMIERE</text></g>' +
      '</g>' +
      '<circle cx="120" cy="120" r="26" fill="url(#azyArtGlow)" class="azy-art-breathe"/>' +
      '<circle cx="120" cy="120" r="15" fill="none" stroke="currentColor" stroke-width="0.9" opacity="0.6"/>' +
      '<g transform="translate(110.4 110.4) scale(0.8)"><g opacity="0.95">' + AZY_MARK + '</g></g>' +
      '<g class="azy-art-particles" fill="currentColor">' +
        '<circle class="azy-art-tw" cx="156" cy="56" r="0.9" opacity="0.4"/>' +
        '<circle class="azy-art-tw azy-art-tw-3" cx="64" cy="176" r="0.9" opacity="0.35"/>' +
        '<circle class="azy-art-tw azy-art-tw-2" cx="184" cy="180" r="0.9" opacity="0.35"/>' +
      '</g>' +
    '</symbol>';

  /* ── 5. AZY CREATOR ──────────────────────────────────────────────────────────────
   * The cinematic desk, wide format: a main monitor with timeline tracks and a
   * playhead that crosses once in a while, two angled holographic side panels
   * (waveform + effect grid), a desk line, web fragments in the top corners and a
   * horizon glow. The editor is absent — the machine and the web tell the story. */
  var CREATOR =
    '<symbol id="art-creator" viewBox="0 0 320 200">' +
      '<ellipse cx="160" cy="186" rx="150" ry="34" fill="url(#azyArtGlow)" opacity="0.4"/>' +
      '<g class="azy-art-strands" stroke="currentColor" stroke-width="0.6" fill="none" opacity="0.26">' +
        '<path class="azy-art-draw" d="M4 8 Q34 26 52 46 Q64 60 72 74"/>' +
        '<path class="azy-art-draw azy-art-draw-2" d="M316 8 Q286 26 268 46 Q256 60 248 74"/>' +
        '<path d="M24 18 Q34 30 32 42 M296 18 Q286 30 288 42" opacity="0.7"/>' +
        '<circle cx="52" cy="46" r="1.1" fill="currentColor" stroke="none" opacity="0.6"/>' +
        '<circle cx="268" cy="46" r="1.1" fill="currentColor" stroke="none" opacity="0.6"/>' +
      '</g>' +
      '<g class="azy-art-panels" opacity="0.5">' +
        '<g transform="rotate(-7 66 92)">' +
          '<rect x="36" y="66" width="58" height="46" rx="3" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.7"/>' +
          '<path d="M42 96 q5 -12 10 0 q5 11 10 -2 q5 -10 10 1 q5 8 10 -3" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.9"/>' +
          '<path d="M42 74 h20 M42 79 h12" stroke="currentColor" stroke-width="0.6" opacity="0.5"/>' +
        '</g>' +
        '<g transform="rotate(7 254 92)">' +
          '<rect x="226" y="66" width="58" height="46" rx="3" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.7"/>' +
          '<g fill="currentColor" opacity="0.55"><rect x="233" y="74" width="9" height="7" rx="1"/><rect x="246" y="74" width="9" height="7" rx="1"/><rect x="259" y="74" width="9" height="7" rx="1"/><rect x="233" y="85" width="9" height="7" rx="1"/><rect x="246" y="85" width="9" height="7" rx="1"/><rect x="259" y="85" width="9" height="7" rx="1"/></g>' +
          '<path d="M233 100 h38" stroke="currentColor" stroke-width="0.6" opacity="0.5"/>' +
        '</g>' +
      '</g>' +
      '<g class="azy-art-monitor">' +
        '<rect x="102" y="42" width="116" height="76" rx="4" fill="currentColor" opacity="0.06"/>' +
        '<rect x="102" y="42" width="116" height="76" rx="4" fill="none" stroke="currentColor" stroke-width="1" opacity="0.7"/>' +
        '<path d="M110 52 h64 M110 57 h40" stroke="currentColor" stroke-width="0.6" opacity="0.35"/>' +
        '<g stroke="currentColor" stroke-width="0.7" opacity="0.5">' +
          '<path d="M110 66 h88"/><rect x="116" y="63" width="22" height="6" rx="1.5" fill="currentColor" opacity="0.5" stroke="none"/><rect x="146" y="63" width="34" height="6" rx="1.5" fill="currentColor" opacity="0.3" stroke="none"/>' +
          '<path d="M110 76 h88"/><rect x="126" y="73" width="30" height="6" rx="1.5" fill="currentColor" opacity="0.4" stroke="none"/><rect x="164" y="73" width="18" height="6" rx="1.5" fill="currentColor" opacity="0.28" stroke="none"/>' +
          '<path d="M110 86 h88"/><rect x="112" y="83" width="40" height="6" rx="1.5" fill="currentColor" opacity="0.34" stroke="none"/>' +
          '<path d="M110 96 h88"/><rect x="140" y="93" width="26" height="6" rx="1.5" fill="currentColor" opacity="0.3" stroke="none"/>' +
        '</g>' +
        '<path d="M110 106 h88" stroke="currentColor" stroke-width="0.6" opacity="0.4"/>' +
        '<g fill="currentColor" opacity="0.5"><rect x="112" y="103" width="3" height="6" rx="0.5"/><rect x="117" y="103" width="3" height="6" rx="0.5"/><rect x="122" y="103" width="3" height="6" rx="0.5"/><rect x="127" y="103" width="3" height="6" rx="0.5"/></g>' +
        '<g class="azy-art-playhead"><path d="M118 48 V112" stroke="currentColor" stroke-width="0.9" opacity="0.8"/><path d="M115 46 h6 l-3 4 z" fill="currentColor" opacity="0.9"/></g>' +
        '<path d="M150 118 L160 130 L170 118" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.4"/>' +
      '</g>' +
      '<path d="M60 148 H260" stroke="currentColor" stroke-width="0.8" opacity="0.3"/>' +
      '<path d="M60 148 Q160 156 260 148" stroke="currentColor" stroke-width="0.5" opacity="0.18" fill="none"/>' +
      '<g class="azy-art-particles" fill="currentColor">' +
        '<circle class="azy-art-tw" cx="92" cy="36" r="0.9" opacity="0.4"/>' +
        '<circle class="azy-art-tw azy-art-tw-2" cx="232" cy="32" r="0.9" opacity="0.4"/>' +
        '<circle class="azy-art-tw azy-art-tw-3" cx="284" cy="128" r="0.9" opacity="0.3"/>' +
        '<circle class="azy-art-tw" cx="34" cy="124" r="0.9" opacity="0.3"/>' +
      '</g>' +
    '</symbol>';

  /* ── 6. VOID AZY ─────────────────────────────────────────────────────────────────
   * The restrained piece: near-black canvas, the emblem alone on a whisper of glow,
   * three strands that fade out before they reach the edge, two slow particles.
   * Used where the UI must stay quiet — narrow windows, dense panes. */
  var VOID =
    '<symbol id="art-void" viewBox="0 0 240 240">' +
      '<g class="azy-art-strands" stroke="currentColor" fill="none" stroke-width="0.6">' +
        '<path class="azy-art-draw" d="M120 120 Q154 108 186 112" opacity="0.16"/>' +
        '<path class="azy-art-draw azy-art-draw-2" d="M120 120 Q96 146 78 172" opacity="0.13"/>' +
        '<path class="azy-art-draw azy-art-draw-3" d="M120 120 Q104 92 96 62" opacity="0.11"/>' +
      '</g>' +
      '<circle cx="120" cy="120" r="30" fill="url(#azyArtGlow)" opacity="0.35" class="azy-art-breathe-slow"/>' +
      '<circle cx="120" cy="120" r="19" fill="none" stroke="currentColor" stroke-width="0.7" opacity="0.3"/>' +
      '<g transform="translate(106.8 106.8) scale(1.1)" opacity="0.8">' + AZY_MARK + '</g>' +
      '<circle class="azy-art-tw" cx="186" cy="112" r="1" fill="currentColor" opacity="0.25"/>' +
      '<circle class="azy-art-tw azy-art-tw-3" cx="78" cy="172" r="0.9" fill="currentColor" opacity="0.2"/>' +
    '</symbol>';

  var SPRITE =
    '<svg id="azyArtSprite" aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden">' +
    DEFS + WEB_CORE + DAGGER + SPIDER + MATRIX + CREATOR + VOID +
    '</svg>';

  /* The art ids this build ships — exposed so tests and future surfaces share one list. */
  var ARTWORK_IDS = ['art-web-core', 'art-dagger', 'art-spider', 'art-matrix', 'art-creator', 'art-void'];

  function inject(doc) {
    doc = doc || (typeof document !== 'undefined' ? document : null);
    if (!doc || !doc.body || doc.getElementById('azyArtSprite')) return false;
    var host = doc.createElement('div');
    host.id = 'azyArtSpriteHost';
    host.setAttribute('aria-hidden', 'true');
    host.innerHTML = SPRITE;
    // First child of body: the sprite paints nothing (0×0, hidden) and every <use>
    // reference resolves no matter where it sits in the document.
    doc.body.insertBefore(host, doc.body.firstChild);
    return true;
  }

  // Markup for one artwork instance. Always aria-hidden + pointer-events:none (CSS).
  function markup(id, cls) {
    return '<svg class="azy-art' + (cls ? ' ' + cls : '') + '" aria-hidden="true" focusable="false">' +
      '<use href="#' + id + '"/></svg>';
  }

  /* Idle = zero frames. Every artwork instance is a <use> of the hidden sprite, so the sprite's
     ~56 looping animations ran — and made the whole window render 60 frames a second — even when
     no artwork was on screen (and it shares a renderer with Dagger). The sprite is paused by CSS
     (azy-foundation.css) unless <html> carries .azy-art-live, which is set only while at least one
     artwork is actually rendered and the window is visible. Performance mode never animates it. */
  function watchLive(doc) {
    var html = doc.documentElement, timer = 0;
    function scan() {
      timer = 0;
      var live = false;
      if (doc.visibilityState !== 'hidden') {
        var arts = doc.querySelectorAll('svg.azy-art');
        for (var i = 0; i < arts.length && !live; i++) {
          var r = arts[i].getBoundingClientRect();
          live = r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < (doc.defaultView.innerHeight || 1e4);
        }
      }
      if (html.classList.contains('azy-art-live') !== live) html.classList.toggle('azy-art-live', live);
    }
    function soon() { if (!timer) timer = setTimeout(scan, 120); }
    // Cheap triggers only: DOM changes (panes/empty states/dialogs), clicks/keys (tab switches),
    // scroll settle, resize and visibility. No polling, no per-frame work.
    if (typeof MutationObserver === 'function') new MutationObserver(soon).observe(doc.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'class'] });
    ['click', 'keyup', 'scroll', 'transitionend', 'animationend'].forEach(function (t) { doc.addEventListener(t, soon, { capture: true, passive: true }); });
    doc.addEventListener('visibilitychange', soon);
    if (doc.defaultView) doc.defaultView.addEventListener('resize', soon);
    soon();
  }
  if (typeof document !== 'undefined') {
    var boot = function () { inject(document); try { watchLive(document); } catch (e) { /* art simply stays paused */ } };
    if (document.body) boot();
    else document.addEventListener('DOMContentLoaded', boot, { once: true });
  }

  if (typeof window !== 'undefined') {
    window.azyArt = { inject: inject, markup: markup, ids: ARTWORK_IDS.slice() };
  }
})();

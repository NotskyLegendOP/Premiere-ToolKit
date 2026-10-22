/*
 * Azy — Premiere host runtime (ExtendScript, runs inside Premiere Pro's scripting engine).
 *
 * This is the CEP counterpart of the UXP `premierepro` module: everything Azy needs from the
 * timeline — reading state / selection / clips / component chains / keyframes, and writing
 * effects, keyframes, interpolation modes and transitions — is exposed as ONE JSON entry point:
 *
 *     AZY.call('{"op":"getState","args":{}}')  →  '{"ok":true,"result":{...}}'
 *
 * The panel (TypeScript, see src/cep/host.ts) never builds ExtendScript strings beyond that call,
 * so the whole host surface is auditable in this single file. Rules:
 *   • Only documented ExtendScript DOM calls plus the QE DOM where the DOM has no equivalent
 *     (adding effects / transitions — exactly what Adobe's own PProPanel sample uses).
 *   • Never executes preset contents; values arrive as plain JSON numbers / {x,y} / booleans.
 *   • Time is exchanged as TICK STRINGS (254016000000 ticks per second) end to end so the
 *     TypeScript side keeps the same bigint math as the UXP runtime.
 *   • Every op is wrapped: an error is returned as {ok:false,error:{code,message}} — never thrown
 *     into CEP (evalScript would swallow it as "EvalScript error.").
 *
 * ExtendScript is ES3: no JSON, no Array.prototype.map, no let/const. Keep it that way.
 */

/* ---------------------------------------------------------------- JSON (ES3) --------------- */
// Array test that survives the ExtendScript ↔ host-object boundary (instanceof fails across engines).
function AZY_isArr(v) { return !!v && typeof v === 'object' && typeof v.length === 'number' && typeof v.splice === 'function'; }
var AZY_JSON = (function () {
  var esc = { '\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r', '"': '\\"', '\\': '\\\\' };
  function q(s) {
    var out = '"';
    for (var i = 0; i < s.length; i++) {
      var c = s.charAt(i), code = s.charCodeAt(i);
      if (esc[c]) out += esc[c];
      else if (code < 0x20) out += '\\u' + ('000' + code.toString(16)).slice(-4);
      else out += c;
    }
    return out + '"';
  }
  function str(v) {
    var t = typeof v;
    if (v === null || v === undefined) return 'null';
    if (t === 'number') return isFinite(v) ? String(v) : 'null';
    if (t === 'boolean') return v ? 'true' : 'false';
    if (t === 'string') return q(v);
    if (AZY_isArr(v)) {
      var a = [];
      for (var i = 0; i < v.length; i++) a.push(str(v[i]));
      return '[' + a.join(',') + ']';
    }
    if (t === 'object') {
      var o = [];
      for (var k in v) if (v.hasOwnProperty(k) && typeof v[k] !== 'function' && v[k] !== undefined) o.push(q(k) + ':' + str(v[k]));
      return '{' + o.join(',') + '}';
    }
    return 'null';
  }
  // Minimal, strict recursive-descent parser (input is produced by our own JSON.stringify).
  function parse(text) {
    var at = 0, ch = text.charAt(0);
    function err(m) { throw new Error('JSON: ' + m + ' at ' + at); }
    function next(c) { if (c && c !== ch) err('expected ' + c + ' got ' + ch); ch = text.charAt(++at); return ch; }
    function white() { while (ch && ch <= ' ') next(); }
    function number() {
      var s = '';
      if (ch === '-') { s = '-'; next('-'); }
      while (ch >= '0' && ch <= '9') { s += ch; next(); }
      if (ch === '.') { s += '.'; while (next() && ch >= '0' && ch <= '9') s += ch; }
      if (ch === 'e' || ch === 'E') { s += ch; next(); if (ch === '-' || ch === '+') { s += ch; next(); } while (ch >= '0' && ch <= '9') { s += ch; next(); } }
      var n = +s; if (!isFinite(n)) err('bad number'); return n;
    }
    function string() {
      var s = '';
      if (ch !== '"') err('bad string');
      while (next()) {
        if (ch === '"') { next(); return s; }
        if (ch === '\\') {
          next();
          if (ch === 'u') { var u = 0; for (var i = 0; i < 4; i++) { u = u * 16 + parseInt(next(), 16); } s += String.fromCharCode(u); }
          else { var m = { '"': '"', '\\': '\\', '/': '/', b: '\b', f: '\f', n: '\n', r: '\r', t: '\t' }; if (m[ch] === undefined) err('bad escape'); s += m[ch]; }
        } else s += ch;
      }
      err('unterminated string');
    }
    function word() {
      if (ch === 't') { next('t'); next('r'); next('u'); next('e'); return true; }
      if (ch === 'f') { next('f'); next('a'); next('l'); next('s'); next('e'); return false; }
      if (ch === 'n') { next('n'); next('u'); next('l'); next('l'); return null; }
      err('unexpected ' + ch);
    }
    function array() {
      var a = []; next('['); white();
      if (ch === ']') { next(']'); return a; }
      while (ch) { a.push(value()); white(); if (ch === ']') { next(']'); return a; } next(','); white(); }
      err('bad array');
    }
    function object() {
      var o = {}; next('{'); white();
      if (ch === '}') { next('}'); return o; }
      while (ch) { var k = string(); white(); next(':'); o[k] = value(); white(); if (ch === '}') { next('}'); return o; } next(','); white(); }
      err('bad object');
    }
    function value() {
      white();
      switch (ch) {
        case '{': return object();
        case '[': return array();
        case '"': return string();
        case '-': return number();
        default: return ch >= '0' && ch <= '9' ? number() : word();
      }
    }
    var v = value(); white();
    if (ch) err('trailing');
    return v;
  }
  return { stringify: str, parse: parse };
})();

/* ---------------------------------------------------------------- runtime ------------------- */
var AZY = (function () {
  var TICKS_PER_SECOND = 254016000000;
  var AUDIO_SPAN = {}; // media path -> audio tracks its linked audio really occupies (learned on placement)
  var VERSION = '1.7.0';

  // ---- refs: opaque ids for track items within one Premiere session -------------------------
  // The DOM hands out fresh wrapper objects on every access, so identity is by nodeId (stable
  // for the life of the sequence). ref → { nodeId, seqId, track, media }.
  var refs = {}, refSeq = 0, refByNode = {};

  function fail(code, message, data) {
    var e = new Error(message || code); e.azyCode = code; e.azyData = data; return e;
  }
  function msg(e) { return e && e.message ? String(e.message) : String(e); }
  function ticksOf(t) { // Time | number(seconds) | string(ticks) → tick string
    if (t === null || t === undefined) return '0';
    if (typeof t === 'string') return t;
    if (typeof t === 'number') return String(Math.round(t * TICKS_PER_SECOND));
    if (t.ticks !== undefined) return String(t.ticks);
    if (t.seconds !== undefined) return String(Math.round(t.seconds * TICKS_PER_SECOND));
    return '0';
  }
  function timeFromTicks(ticks) { var t = new Time(); t.ticks = String(ticks); return t; }
  function secondsFromTicks(ticks) { return parseFloat(ticks) / TICKS_PER_SECOND; }

  function activeSequence() {
    var seq = app.project && app.project.activeSequence;
    if (!seq) throw fail('NO_ACTIVE_SEQUENCE', 'Open a sequence in Premiere first.');
    return seq;
  }
  function tracksOf(seq, media) {
    return media === 'audio' ? seq.audioTracks : seq.videoTracks;
  }
  function eachClip(seq, media, fn) { // fn(clip, trackIndex, clipIndex, media)
    var kinds = media === 'both' || !media ? ['video', 'audio'] : [media];
    for (var k = 0; k < kinds.length; k++) {
      var tracks = tracksOf(seq, kinds[k]);
      for (var i = 0; i < tracks.numTracks; i++) {
        var clips = tracks[i].clips;
        for (var j = 0; j < clips.numItems; j++) if (fn(clips[j], i, j, kinds[k]) === false) return;
      }
    }
  }
  function refFor(clip, track, media, seqId) {
    var node = String(clip.nodeId);
    var key = seqId + '|' + node;
    if (refByNode[key]) return refByNode[key];
    var id = 'ti-' + (++refSeq);
    refs[id] = { nodeId: node, seqId: seqId, track: track, media: media };
    refByNode[key] = id;
    return id;
  }
  function resolveRef(seq, ref) {
    var r = refs[ref];
    if (!r) return null;
    var hit = null;
    var tracks = tracksOf(seq, r.media);
    if (tracks && r.track < tracks.numTracks) { // fast path: same track
      var clips = tracks[r.track].clips;
      for (var j = 0; j < clips.numItems; j++) if (String(clips[j].nodeId) === r.nodeId) return { clip: clips[j], track: r.track, media: r.media };
    }
    eachClip(seq, r.media, function (c, t) { if (String(c.nodeId) === r.nodeId) { hit = { clip: c, track: t, media: r.media }; return false; } });
    return hit;
  }
  function describe(clip, track, media, seqId) {
    var name = ''; try { name = String(clip.name); } catch (e) {}
    var adj = false; try { adj = !!clip.isAdjustmentLayer(); } catch (e2) {}
    var matchName = ''; try { matchName = clip.projectItem ? String(clip.projectItem.name) : ''; } catch (e3) {}
    return {
      ref: refFor(clip, track, media, seqId),
      name: name,
      mediaKind: media,
      trackIndex: track,
      startTicks: ticksOf(clip.start),
      endTicks: ticksOf(clip.end),
      inPointTicks: ticksOf(clip.inPoint),
      outPointTicks: ticksOf(clip.outPoint),
      isAdjustmentLayer: adj,
      matchName: matchName
    };
  }
  function selectedClips(seq) {
    var out = [];
    eachClip(seq, 'both', function (c, t, j, media) { var s = false; try { s = !!c.isSelected(); } catch (e) {} if (s) out.push({ clip: c, track: t, media: media }); });
    return out;
  }
  function clipsUnderPlayhead(seq, which, media) {
    var pos = ticksOf(seq.getPlayerPosition());
    var found = [];
    eachClip(seq, media || 'both', function (c, t, j, m) {
      var s = ticksOf(c.start), e = ticksOf(c.end);
      if (cmpTicks(s, pos) <= 0 && cmpTicks(pos, e) < 0) found.push({ clip: c, track: t, media: m });
    });
    if (which === 'all') return found;
    var out = [];
    var kinds = ['video', 'audio'];
    for (var k = 0; k < kinds.length; k++) {
      var arr = [];
      for (var i = 0; i < found.length; i++) if (found[i].media === kinds[k]) arr.push(found[i]);
      if (!arr.length) continue;
      arr.sort(function (a, b) { return a.track - b.track; });
      out.push(which === 'topmost' ? arr[arr.length - 1] : arr[0]);
    }
    return out;
  }
  // Tick strings can exceed 2^53; compare as digit strings.
  function cmpTicks(a, b) {
    a = String(a); b = String(b);
    var na = a.charAt(0) === '-', nb = b.charAt(0) === '-';
    if (na !== nb) return na ? -1 : 1;
    if (na) { var t = a; a = b.slice(1); b = t.slice(1); }
    if (a.length !== b.length) return a.length < b.length ? -1 : 1;
    return a < b ? -1 : a > b ? 1 : 0;
  }
  function resolveTargets(seq, target, media) {
    var mode = target && target.mode || 'selection';
    if (mode === 'refs') {
      var out = [];
      for (var i = 0; i < target.refs.length; i++) { var r = resolveRef(seq, target.refs[i]); if (r) out.push(r); }
      return out;
    }
    if (mode === 'selection') return selectedClips(seq);
    if (mode === 'playhead') return clipsUnderPlayhead(seq, target.tracks || 'topmost', media);
    var sel = selectedClips(seq);
    if (sel.length) return sel;
    return clipsUnderPlayhead(seq, target.tracks || 'topmost', media);
  }

  // ---- values --------------------------------------------------------------------------------
  function readValue(param, timeTicks) {
    var v;
    try { v = timeTicks === undefined ? param.getValue() : param.getValueAtTime(timeFromTicks(timeTicks)); } catch (e) { return undefined; }
    return normalise(v);
  }
  function normalise(v) {
    if (v === null || v === undefined) return undefined;
    if (typeof v === 'number') return v;
    if (typeof v === 'boolean') return v;
    if (typeof v === 'string') {
      var m = /^\s*(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)\s*$/.exec(v);
      if (m) return { x: parseFloat(m[1]), y: parseFloat(m[2]) };
      if (v !== '' && isFinite(+v)) return +v;
      return v;
    }
    if (AZY_isArr(v)) {
      if (v.length === 2 && typeof v[0] === 'number' && typeof v[1] === 'number') return { x: v[0], y: v[1] };
      if (v.length === 4 && typeof v[0] === 'number') return { a: v[0], r: v[1], g: v[2], b: v[3] };
      return v;
    }
    if (typeof v === 'object') {
      if (typeof v.x === 'number' && typeof v.y === 'number') return { x: v.x, y: v.y };
      return String(v);
    }
    return v;
  }
  // JSON value → what setValue/setValueAtKey accept. Points are [x, y] arrays in ExtendScript.
  function toHost(v) {
    if (v === null || v === undefined) return undefined;
    if (typeof v === 'object' && !AZY_isArr(v)) {
      if (typeof v.x === 'number' && typeof v.y === 'number') return [v.x, v.y];
      if (typeof v.r === 'number' && typeof v.g === 'number' && typeof v.b === 'number') return v; // colour: handled by setColor
      return undefined;
    }
    return v;
  }
  function isColor(v) { return v && typeof v === 'object' && typeof v.r === 'number' && typeof v.g === 'number' && typeof v.b === 'number'; }

  function componentAt(clip, index) {
    var comps = clip.components;
    if (!comps || index < 0 || index >= comps.numItems) throw fail('PRESET_APPLICATION_FAILED', 'component ' + index + ' not on clip');
    return comps[index];
  }
  function paramAt(clip, ci, pi) {
    var c = componentAt(clip, ci);
    var props = c.properties;
    if (!props || pi < 0 || pi >= props.numItems) throw fail('PRESET_APPLICATION_FAILED', 'param ' + pi + ' not on component ' + ci);
    return props[pi];
  }
  function keyTicks(param) {
    var keys = null;
    try { keys = param.getKeys(); } catch (e) { keys = null; }
    var out = [];
    if (keys && keys.length) for (var i = 0; i < keys.length; i++) out.push(ticksOf(keys[i]));
    out.sort(cmpTicks);
    return out;
  }

  // ---- instance identity (no ids in the DOM → structural diff + fingerprints) ---------------
  var FP_MAX_PARAMS = 64, FP_MAX_KEYS = 256;
  /** Everything observable about one component instance, as one comparable string. */
  function fingerprint(comp) {
    var parts = [String(comp.matchName)];
    var props = null;
    try { props = comp.properties; } catch (e0) { props = null; }
    var n = props ? props.numItems : 0;
    if (n > FP_MAX_PARAMS) n = FP_MAX_PARAMS;
    for (var j = 0; j < n; j++) {
      var p = props[j], tv = false, ticks = [];
      try { tv = !!p.isTimeVarying(); } catch (e1) {}
      try { ticks = keyTicks(p); } catch (e2) { ticks = []; }
      var entry = [tv ? 1 : 0];
      if (ticks.length) {
        for (var k = 0; k < ticks.length && k < FP_MAX_KEYS; k++) {
          var t = timeFromTicks(ticks[k]), v, it;
          try { v = normalise(p.getValueAtKey(t)); } catch (e3) { v = undefined; }
          try { it = p.getInterpolationTypeAtKey(t); } catch (e4) { it = null; }
          entry.push([ticks[k], v === undefined ? null : v, it === undefined ? null : it]);
        }
        entry.push(ticks.length);
      } else {
        var sv = readValue(p);
        entry.push(sv === undefined ? null : sv);
      }
      parts.push(entry);
    }
    return AZY_JSON.stringify(parts);
  }
  function chainSnapshot(clip) {
    var comps = clip.components, out = [];
    var n = comps ? comps.numItems : 0;
    for (var i = 0; i < n; i++) out.push({ matchName: String(comps[i].matchName), fp: fingerprint(comps[i]) });
    return out;
  }
  /**
   * Find the ONE component added since `prev` (a chainSnapshot) in the live collection `comps`.
   * Returns { index, snap } (snap = the new snapshot, old entries keep their pre-add fingerprint)
   * or null. A position j qualifies only if removing it leaves every other component identical,
   * in order, to `prev`: matchNames first (cheap), and — only when several positions qualify,
   * i.e. inside a run of the same effect — per-instance fingerprints, so an old instance can
   * never be mistaken for the new one. Still several = the new instance is indistinguishable
   * from its neighbours (fresh defaults); QE appends, so the last is taken — either choice
   * leaves every old instance's state untouched.
   */
  function locateInsert(prev, comps) {
    var n = comps ? comps.numItems : 0;
    if (n !== prev.length + 1) return null;
    var names = [], i;
    for (i = 0; i < n; i++) names.push(String(comps[i].matchName));
    var a = 0, b = 0;
    while (a < prev.length && names[a] === prev[a].matchName) a++;
    while (b < prev.length && names[n - 1 - b] === prev[prev.length - 1 - b].matchName) b++;
    var lo = n - 1 - b, hi = a;
    if (lo < 0) lo = 0;
    if (hi > n - 1) hi = n - 1;
    if (lo > hi) return null;
    var j = hi, nowFp = {};
    if (lo < hi) {
      for (i = lo; i <= hi; i++) nowFp[i] = fingerprint(comps[i]);
      j = -1;
      for (var c = hi; c >= lo && j < 0; c--) {
        var same = true;
        for (i = lo; i <= hi && same; i++) if (i !== c && nowFp[i] !== prev[i < c ? i : i - 1].fp) same = false;
        if (same) j = c;
      }
      if (j < 0) return null;
    }
    var snap = [];
    for (i = 0; i < n; i++) snap.push(i === j ? { matchName: names[j], fp: nowFp[j] !== undefined ? nowFp[j] : fingerprint(comps[j]) } : prev[i < j ? i : i - 1]);
    return { index: j, snap: snap };
  }

  // ---- QE (effects + transitions) ------------------------------------------------------------
  function qeSequence() {
    app.enableQE();
    var s = qe.project.getActiveSequence();
    if (!s) throw fail('NO_ACTIVE_SEQUENCE');
    return s;
  }
  // The QE track lists gaps as items too; find the QE item whose start matches the DOM clip.
  function qeClipFor(seq, entry) {
    var qs = qeSequence();
    var qtrack = entry.media === 'audio' ? qs.getAudioTrackAt(entry.track) : qs.getVideoTrackAt(entry.track);
    if (!qtrack) throw fail('PRESET_APPLICATION_FAILED', 'QE track ' + entry.track + ' missing');
    var wantStart = ticksOf(entry.clip.start), wantName = '';
    try { wantName = String(entry.clip.name); } catch (e) {}
    var n = qtrack.numItems, best = null;
    for (var i = 0; i < n; i++) {
      var it = qtrack.getItemAt(i);
      if (!it || String(it.type) === 'Empty') continue;
      var st = '0';
      try { st = String(it.start.ticks); } catch (e2) { try { st = ticksOf(it.start.secs); } catch (e3) {} }
      if (st === wantStart) return it;
      if (!best && wantName && String(it.name) === wantName) best = it;
    }
    if (best) return best;
    throw fail('PRESET_APPLICATION_FAILED', 'clip not found in QE track (start ' + wantStart + ')');
  }
  var fxNameCache = null;
  function videoEffectNames() {
    if (fxNameCache) return fxNameCache;
    app.enableQE();
    var list = qe.project.getVideoEffectList();
    fxNameCache = [];
    for (var i = 0; i < list.length; i++) fxNameCache.push(String(list[i]));
    return fxNameCache;
  }

  // ---- ops -----------------------------------------------------------------------------------
  var ops = {
    hostInfo: function () {
      var os = 'unknown';
      try { os = $.os && /win/i.test($.os) ? 'win32' : 'darwin'; } catch (e) {}
      return { app: 'premierepro', version: String(app.version), buildNumber: String(app.build || ''), applicationPath: String(app.path || ''), locale: String($.locale || ''), os: { platform: os }, runtime: VERSION };
    },

    probe: function () {
      // Feature detection against THIS host: what the ExtendScript DOM + QE really expose.
      var missing = [];
      function has(obj, name) { try { if (obj && (typeof obj[name] === 'function' || obj[name] !== undefined)) return true; } catch (e) {} missing.push(name); return false; }
      var seqOk = !!(app.project);
      var qeOk = false;
      try { app.enableQE(); qeOk = !!(qe && qe.project && typeof qe.project.getVideoEffectByName === 'function'); } catch (e) { missing.push('qe'); }
      var p = null;
      try {
        var s = app.project.activeSequence;
        if (s && s.videoTracks.numTracks && s.videoTracks[0].clips.numItems) p = s.videoTracks[0].clips[0].components[1].properties[0];
      } catch (e2) { p = null; }
      var kf = p ? has(p, 'addKey') && has(p, 'setValueAtKey') && has(p, 'setInterpolationTypeAtKey') && has(p, 'getKeys') : true;
      return { qe: qeOk, sequence: seqOk, keyframes: kf, transitions: qeOk, missing: missing };
    },

    getState: function () {
      var proj = app.project;
      if (!proj) return { hasProject: false, hasSequence: false, selectionCount: 0 };
      var info = { hasProject: true, project: { name: String(proj.name), path: String(proj.path), guid: String(proj.documentID || proj.name) }, hasSequence: false, selectionCount: 0 };
      var seq = proj.activeSequence;
      if (!seq) return info;
      info.hasSequence = true;
      info.sequence = { name: String(seq.name), guid: String(seq.sequenceID), videoTracks: seq.videoTracks.numTracks, audioTracks: seq.audioTracks.numTracks };
      info.selectionCount = selectedClips(seq).length;
      try { info.playheadTicks = ticksOf(seq.getPlayerPosition()); } catch (e) {}
      return info;
    },

    getSelection: function () {
      var seq = activeSequence(), id = String(seq.sequenceID);
      var sel = selectedClips(seq), items = [];
      for (var i = 0; i < sel.length; i++) items.push(describe(sel[i].clip, sel[i].track, sel[i].media, id));
      return { sequenceGuid: id, items: items };
    },

    /** target policy → described items (used by the executor before it plans anything). */
    resolveTargets: function (a) {
      var seq = activeSequence(), id = String(seq.sequenceID);
      var list = resolveTargets(seq, a.target, a.media || 'both'), items = [];
      for (var i = 0; i < list.length; i++) items.push(describe(list[i].clip, list[i].track, list[i].media, id));
      return { sequenceGuid: id, items: items };
    },

    /** Same-track neighbours (touching edges) per ref — decides single vs double sided transitions. */
    neighbours: function (a) {
      var seq = activeSequence(), out = {};
      for (var i = 0; i < a.refs.length; i++) {
        var r = resolveRef(seq, a.refs[i]);
        if (!r) continue;
        var s = ticksOf(r.clip.start), e = ticksOf(r.clip.end), before = false, after = false;
        var clips = tracksOf(seq, r.media)[r.track].clips;
        for (var j = 0; j < clips.numItems; j++) {
          if (ticksOf(clips[j].end) === s) before = true;
          if (ticksOf(clips[j].start) === e) after = true;
        }
        out[a.refs[i]] = { before: before, after: after };
      }
      return out;
    },

    sequenceFrameTicks: function () {
      var seq = activeSequence();
      try { var t = seq.getSettings().videoFrameRate; if (t && t.ticks) return { ticks: String(t.ticks) }; } catch (e) {}
      try { if (seq.timebase) return { ticks: String(seq.timebase) }; } catch (e2) {}
      return { ticks: '0' };
    },

    listEffects: function (a) {
      app.enableQE();
      if (a.kind === 'audio') {
        var al = qe.project.getAudioEffectList(), names = [];
        for (var i = 0; i < al.length; i++) names.push(String(al[i]));
        return { matchNames: [], displayNames: names };
      }
      var vl = videoEffectNames();
      // CEP has display names only; the match name slot carries the same string so the rest of
      // Azy (favourites, Snap ids) keeps one identifier per effect.
      return { matchNames: vl.slice(0), displayNames: vl.slice(0) };
    },

    listTransitions: function () {
      app.enableQE();
      var tl = qe.project.getVideoTransitionList(), names = [];
      for (var i = 0; i < tl.length; i++) names.push(String(tl[i]));
      return { matchNames: names };
    },

    /** Component chain of one clip: [{index, matchName, displayName, params:[{index, displayName, timeVarying, keyframeTicks}]}] */
    components: function (a) {
      var seq = activeSequence();
      var r = resolveRef(seq, a.ref);
      if (!r) throw fail('NO_TARGET_CLIP', 'clip is no longer in the sequence');
      var comps = r.clip.components, out = [];
      if (!comps) return { components: out };
      for (var i = 0; i < comps.numItems; i++) {
        var c = comps[i], params = [];
        var props = c.properties;
        var pn = props ? props.numItems : 0;
        if (a.maxParams && pn > a.maxParams) pn = a.maxParams;
        for (var j = 0; j < pn; j++) {
          var p = props[j], tv = false, ticks = [];
          try { tv = !!p.isTimeVarying(); } catch (e) {}
          if (a.withKeyframes !== false) { try { ticks = keyTicks(p); } catch (e2) { ticks = []; } }
          var entry = { index: j, displayName: String(p.displayName), timeVarying: tv, keyframeTicks: ticks };
          if (a.withValues && !ticks.length) entry.value = readValue(p);
          params.push(entry);
        }
        out.push({ index: i, matchName: String(c.matchName), displayName: String(c.displayName), params: params });
      }
      return { components: out };
    },

    /** Values at the given keyframe ticks for one param → [value|undefined]. */
    valuesAt: function (a) {
      var seq = activeSequence();
      var r = resolveRef(seq, a.ref);
      if (!r) throw fail('NO_TARGET_CLIP', 'clip is no longer in the sequence');
      var p = paramAt(r.clip, a.component, a.param), out = [];
      for (var i = 0; i < a.ticks.length; i++) {
        // Exact keyframe value first (what Flow re-anchors on), sampled value as fallback.
        var v;
        try { v = normalise(p.getValueAtKey(timeFromTicks(a.ticks[i]))); } catch (e) { v = undefined; }
        if (v === undefined) v = readValue(p, a.ticks[i]);
        out.push(v === undefined ? null : v);
      }
      return { values: out };
    },

    /**
     * Append effects to a clip (QE) and return the EXACT component index of every new instance.
     *
     * Premiere components carry no id, and QE does not promise where a new effect lands in the
     * stack, so "first match at index >= old length" can silently pick a PRE-EXISTING instance
     * of the same effect (e.g. an animated Transform) once the stack shifts. Instead each effect
     * is added one at a time and the stack is diffed against a snapshot taken just before:
     *   1. the only positions whose removal restores the old matchName sequence are candidates;
     *   2. if several (a run of the same effect), per-instance fingerprints (params, key times,
     *      key values, interpolation) decide which positions are the untouched old instances;
     *   3. still tied = the instances are indistinguishable, so the append position (last) wins.
     * Earlier created indices are shifted when a later insert lands before them. Pre-existing
     * components come back as `preserved` (new index + fingerprint) so the connector can verify
     * after writing that none of them changed. index -1 = could not identify → caller must not
     * write anything for that effect (never fall back to a name search).
     */
    addEffects: function (a) {
      var seq = activeSequence();
      var r = resolveRef(seq, a.ref);
      if (!r) throw fail('NO_TARGET_CLIP', 'clip is no longer in the sequence');
      var snap = chainSnapshot(r.clip);
      var before = snap.length;
      var origin = []; // origin[i] = original index of current component i, or -1 for created
      for (var o = 0; o < before; o++) origin.push(o);
      var qclip = qeClipFor(seq, r);
      var results = [];
      for (var i = 0; i < a.names.length; i++) {
        var name = a.names[i], ok = false, err = '', idx = -1, mn = '';
        try {
          var fx = r.media === 'audio' ? qe.project.getAudioEffectByName(name) : qe.project.getVideoEffectByName(name);
          if (!fx) err = 'effect "' + name + '" is not installed in this Premiere';
          else ok = r.media === 'audio' ? !!qclip.addAudioEffect(fx) : !!qclip.addVideoEffect(fx);
          if (!ok && !err) err = 'Premiere refused to add "' + name + '"';
        } catch (e) { err = msg(e); }
        if (ok) {
          var fresh = resolveRef(seq, a.ref);
          var found = fresh ? locateInsert(snap, fresh.clip.components) : null;
          if (!found) { err = 'added "' + name + '" but could not identify the new instance'; ok = false; origin = null; if (fresh) snap = chainSnapshot(fresh.clip); }
          else {
            var j = found.index;
            for (var k = 0; k < results.length; k++) if (results[k].index >= j) results[k].index++;
            if (origin) origin.splice(j, 0, -1);
            idx = j; mn = found.snap[j].matchName; snap = found.snap;
          }
        }
        results.push({ name: name, ok: ok, error: err, index: idx, matchName: mn });
      }
      var preserved = [];
      if (origin) for (var q = 0; q < origin.length; q++) if (origin[q] >= 0) preserved.push({ index: q, was: origin[q], matchName: snap[q].matchName, fp: snap[q].fp });
      return { before: before, after: snap.length, results: results, preserved: origin ? preserved : null };
    },

    /** Current fingerprint of the given component indices (post-apply verification). */
    fingerprints: function (a) {
      var seq = activeSequence();
      var r = resolveRef(seq, a.ref);
      if (!r) throw fail('NO_TARGET_CLIP', 'clip is no longer in the sequence');
      var comps = r.clip.components, n = comps ? comps.numItems : 0, out = [];
      for (var i = 0; i < a.indices.length; i++) {
        var ix = a.indices[i];
        out.push(ix >= 0 && ix < n ? { index: ix, matchName: String(comps[ix].matchName), fp: fingerprint(comps[ix]) } : { index: ix, missing: true });
      }
      return { items: out };
    },

    /** Set a static value. */
    setValue: function (a) {
      var seq = activeSequence();
      var r = resolveRef(seq, a.ref);
      if (!r) throw fail('NO_TARGET_CLIP');
      var p = paramAt(r.clip, a.component, a.param);
      // Motion reuse (v1.17): the clip's own Motion is shared with the user's animation. A static
      // preset value must never wipe keyframes there (setTimeVarying(false) deletes them all), so
      // an animated property is left exactly as it is and the caller is told it was kept.
      if (a.preserveKeys) { var tvk = false; try { tvk = !!p.isTimeVarying(); } catch (ek) {} if (tvk) return { ok: true, skipped: true }; }
      try { if (p.isTimeVarying()) p.setTimeVarying(false); } catch (e) {}
      if (isColor(a.value)) { p.setColorValue(Math.round((a.value.a === undefined ? 1 : a.value.a) * 255), Math.round(a.value.r * 255), Math.round(a.value.g * 255), Math.round(a.value.b * 255), true); return { ok: true }; }
      var hv = toHost(a.value);
      if (hv === undefined) throw fail('PRESET_APPLICATION_FAILED', 'value kind not settable');
      p.setValue(hv, true);
      return { ok: true };
    },

    /**
     * Keyframe writes for one param, in order: clears (ranges) → removes → adds (ticks+value) →
     * interpolation sets. This is one "transaction" from Azy's point of view; ExtendScript has no
     * grouping, so the panel batches calls and Premiere records one undo step per call-site batch.
     */
    writeKeyframes: function (a) {
      var seq = activeSequence();
      var r = resolveRef(seq, a.ref);
      if (!r) throw fail('NO_TARGET_CLIP', 'clip is no longer in the sequence');
      var p = paramAt(r.clip, a.component, a.param);
      var res = { cleared: 0, removed: 0, added: 0, interp: 0, failed: [] };
      var i;
      if (a.timeVarying) { try { if (!p.isTimeVarying()) p.setTimeVarying(true); } catch (e0) { throw fail('PRESET_APPLICATION_FAILED', 'could not make parameter time-varying: ' + msg(e0)); } }
      var ui = a.updateUI !== false;
      if (a.clears) for (i = 0; i < a.clears.length; i++) {
        try { p.removeKeyRange(timeFromTicks(a.clears[i].from), timeFromTicks(a.clears[i].to), ui); res.cleared++; } catch (e1) { res.failed.push('clear@' + a.clears[i].from + '-' + a.clears[i].to + ': ' + msg(e1)); }
      }
      if (a.removes) for (i = 0; i < a.removes.length; i++) {
        try { p.removeKey(timeFromTicks(a.removes[i]), ui); res.removed++; } catch (e2) { res.failed.push('remove@' + a.removes[i] + ': ' + msg(e2)); }
      }
      if (a.adds) for (i = 0; i < a.adds.length; i++) {
        var k = a.adds[i];
        try {
          var t = timeFromTicks(k.ticks);
          var exists = false; try { exists = !!p.keyExistsAtTime(t); } catch (e3) {}
          if (!exists) p.addKey(t);
          if (isColor(k.value)) { /* colour keyframes: value set via setColorValue is static-only in the DOM */ res.failed.push('add@' + k.ticks + ': colour keyframes not writable'); continue; }
          var hv = toHost(k.value);
          if (hv === undefined) { res.failed.push('add@' + k.ticks + ': value kind not settable'); continue; }
          p.setValueAtKey(t, hv, ui);
          res.added++;
        } catch (e4) { res.failed.push('add@' + k.ticks + ': ' + msg(e4)); }
      }
      if (a.interp) for (i = 0; i < a.interp.length; i++) {
        try { p.setInterpolationTypeAtKey(timeFromTicks(a.interp[i].ticks), a.interp[i].mode, ui); res.interp++; } catch (e5) { res.failed.push('interp@' + a.interp[i].ticks + ': ' + msg(e5)); }
      }
      return res;
    },

    /**
     * Move the given keyframes to new times, preserving each key's value and temporal
     * interpolation type. One op = one ExtendScript call, so Premiere records the whole
     * movement as one undo step (same "call-site batch" guarantee as writeKeyframes).
     *
     * a.groups = [{ ref, component, param, moves: [{ from, to }] }] — the connector has
     * already computed the single offset (BigInt) and turned it into explicit from/to pairs.
     *
     * Two phases, so a collision or unreadable key can never leave a half-moved selection:
     *   1. resolve + read every key's value and interpolation + validate (no key already
     *      sits at a target time unless it is one of the keys being moved away);
     *   2. only when everything is safe: remove old keys, add the new ones, set values and
     *      interpolation back. If anything fails in phase 1 nothing is written at all.
     */
    moveKeys: function (a) {
      var seq = activeSequence();
      var res = { moved: 0, removed: 0, added: 0, interp: 0, failed: [] };
      var plan = [], i, j, g, r, p, item, allOk = true;
      for (i = 0; i < a.groups.length; i++) {
        g = a.groups[i];
        r = resolveRef(seq, g.ref);
        if (!r) { allOk = false; res.failed.push('clip is no longer in the sequence'); continue; }
        var locked = false;
        try { var trk = tracksOf(seq, r.media)[r.track]; if (trk && trk.isLocked) locked = !!trk.isLocked(); } catch (e0) {}
        if (locked) { allOk = false; res.failed.push('the clip\u2019s track is locked'); continue; }
        try { p = paramAt(r.clip, g.component, g.param); } catch (e) { allOk = false; res.failed.push('param ' + g.component + '/' + g.param + ' missing'); continue; }
        var fromSet = {};
        for (j = 0; j < g.moves.length; j++) fromSet[String(g.moves[j].from)] = true;
        var items = [];
        for (j = 0; j < g.moves.length; j++) {
          var m = g.moves[j], value, interp = 0, ok = true;
          try { value = normalise(p.getValueAtKey(timeFromTicks(m.from))); } catch (e) { value = undefined; }
          try { interp = p.getInterpolationTypeAtKey(timeFromTicks(m.from)); } catch (e) { interp = 0; }
          if (value === undefined || isColor(value)) { ok = false; res.failed.push('move@' + m.from + ': value not readable/writable'); }
          var exists = false; try { exists = !!p.keyExistsAtTime(timeFromTicks(m.to)); } catch (e2) {}
          if (exists && !fromSet[String(m.to)]) { ok = false; res.failed.push('move@' + m.from + '\u2192' + m.to + ': another keyframe already sits there'); }
          items.push({ from: m.from, to: m.to, value: value, interp: interp, ok: ok });
          if (!ok) allOk = false;
        }
        plan.push({ p: p, items: items });
      }
      if (!allOk) return res; // refuse to partially move the selection
      // Phase 2. Remove every source key of a param first (keys moving onto each other's old
      // slots must not collide), then add the targets. addKey can silently no-op (e.g. a time
      // Premiere won't accept), so every add is verified; on ANY failure the whole move is
      // rolled back to the original keys, values and interpolation — never a half-moved group.
      var broken = false, done = [];
      for (i = 0; i < plan.length && !broken; i++) {
        var prm = plan[i];
        for (j = 0; j < prm.items.length; j++) {
          item = prm.items[j];
          try { prm.p.removeKey(timeFromTicks(item.from), false); res.removed++; } catch (e3) { res.failed.push('remove@' + item.from + ': ' + msg(e3)); broken = true; break; }
        }
        done.push(prm);
        for (j = 0; j < prm.items.length && !broken; j++) {
          item = prm.items[j];
          try {
            var tT = timeFromTicks(item.to);
            var ex = false; try { ex = !!prm.p.keyExistsAtTime(tT); } catch (e4) {}
            if (!ex) prm.p.addKey(tT);
            ex = false; try { ex = !!prm.p.keyExistsAtTime(tT); } catch (e6) { ex = true; }
            if (!ex) { res.failed.push('add@' + item.to + ': Premiere did not create the keyframe'); broken = true; break; }
            item.added = true;
            prm.p.setValueAtKey(tT, toHost(item.value), false);
            res.added++;
            try { prm.p.setInterpolationTypeAtKey(tT, item.interp, false); res.interp++; } catch (e7) {}
            res.moved++;
          } catch (e5) { res.failed.push('add@' + item.to + ': ' + msg(e5)); broken = true; }
        }
      }
      if (broken) {
        for (i = 0; i < done.length; i++) {
          var rp = done[i], fromSet2 = {};
          for (j = 0; j < rp.items.length; j++) fromSet2[String(rp.items[j].from)] = true;
          for (j = 0; j < rp.items.length; j++) {
            item = rp.items[j];
            if (item.added && !fromSet2[String(item.to)]) { try { rp.p.removeKey(timeFromTicks(item.to), false); } catch (e8) {} }
          }
          for (j = 0; j < rp.items.length; j++) {
            item = rp.items[j];
            try {
              var tF = timeFromTicks(item.from);
              var had = false; try { had = !!rp.p.keyExistsAtTime(tF); } catch (e9) {}
              if (!had) rp.p.addKey(tF);
              rp.p.setValueAtKey(tF, toHost(item.value), false);
              try { rp.p.setInterpolationTypeAtKey(tF, item.interp, false); } catch (e10) {}
            } catch (e11) { res.failed.push('rollback@' + item.from + ': ' + msg(e11)); }
          }
        }
        res.moved = 0; res.rolledBack = true;
      }
      // One UI refresh at the end instead of one per key.
      try { if (plan.length && plan[0].items.length) { var last = plan[0]; last.p.setValueAtKey(timeFromTicks(broken ? last.items[0].from : last.items[0].to), toHost(last.items[0].value), true); } } catch (e12) {}
      return res;
    },

    /** Transition on a clip edge (QE). */
    addTransition: function (a) {
      var seq = activeSequence();
      var r = resolveRef(seq, a.ref);
      if (!r) throw fail('NO_TARGET_CLIP');
      if (r.media !== 'video') throw fail('NO_TARGET_CLIP', 'Select a video clip for a transition.');
      app.enableQE();
      var tr = qe.project.getVideoTransitionByName(a.name);
      if (!tr) throw fail('INVALID_PRESET', 'Premiere couldn\'t create the transition "' + a.name + '".');
      var qclip = qeClipFor(seq, r);
      // Duration as frames of the sequence timebase ("30"), alignment 0.5 = centred on the cut.
      var fps = 25;
      try { var fr = seq.getSettings().videoFrameRate; if (fr && fr.ticks) fps = TICKS_PER_SECOND / parseFloat(fr.ticks); } catch (e) {}
      var frames = Math.max(1, Math.round((a.seconds || 1) * fps));
      var out = { start: null, end: null };
      if (a.start !== undefined) {
        // addTransition(transition, addToStart, duration, offset, alignment, singleSided, alignToVideo)
        out.start = !!qclip.addTransition(tr, true, String(frames), '0', a.start.hasNeighbour ? 0.5 : 0, !a.start.hasNeighbour, true);
      }
      if (a.end !== undefined) {
        out.end = !!qclip.addTransition(tr, false, String(frames), '0', a.end.hasNeighbour ? 0.5 : 1, !a.end.hasNeighbour, true);
      }
      return out;
    },

    /**
     * SFX dagger. Import (or reuse) an audio file, then place it at the playhead on the first
     * audio track that is completely free for the clip's whole duration; add a track if none is.
     * "Free" = no clip whose [start,end) intersects [playhead, playhead + duration).
     */
    placeAudio: function (a) {
      var seq = activeSequence();
      var proj = app.project;
      var pos = seq.getPlayerPosition();
      var startTicks = ticksOf(pos);
      // 1. Project item: reuse one with the same media path, else import.
      var item = null;
      function findByPath(bin) {
        for (var i = 0; i < bin.children.numItems; i++) {
          var c = bin.children[i];
          if (c.type === ProjectItemType.BIN) { var r = findByPath(c); if (r) return r; }
          else { try { if (String(c.getMediaPath()) === a.path) return c; } catch (e) {} }
        }
        return null;
      }
      item = findByPath(proj.rootItem);
      if (!item) {
        var before = proj.rootItem.children.numItems;
        var ok = proj.importFiles([a.path], true, proj.rootItem, false);
        if (!ok) throw fail('PRESET_APPLICATION_FAILED', 'Premiere could not import "' + a.name + '".');
        item = findByPath(proj.rootItem);
        if (!item && proj.rootItem.children.numItems > before) item = proj.rootItem.children[proj.rootItem.children.numItems - 1];
        if (!item) throw fail('PRESET_APPLICATION_FAILED', 'Imported "' + a.name + '" but could not find it in the project.');
      }
      // 2. Duration of the clip (ticks). Fall back to 1 s if the item has none yet.
      var durTicks = 0;
      try { var oi = item.getOutPoint(); var ii = item.getInPoint(); durTicks = parseFloat(ticksOf(oi)) - parseFloat(ticksOf(ii)); } catch (e2) {}
      if (!(durTicks > 0)) durTicks = TICKS_PER_SECOND;
      var s0 = parseFloat(startTicks), s1 = s0 + durTicks;
      // 3. First audio track with no clip intersecting [s0, s1).
      var tracks = seq.audioTracks, chosen = -1;
      for (var t = 0; t < tracks.numTracks && chosen < 0; t++) {
        var tr = tracks[t], free = true;
        try { if (tr.isLocked && tr.isLocked()) continue; } catch (e3) {}
        for (var c2 = 0; c2 < tr.clips.numItems; c2++) {
          var cl = tr.clips[c2];
          var cs = parseFloat(ticksOf(cl.start)), ce = parseFloat(ticksOf(cl.end));
          if (cs < s1 && ce > s0) { free = false; break; }
        }
        if (free) chosen = t;
      }
      var created = false;
      if (chosen < 0) {
        // Add one stereo audio track after the last one.
        var n = tracks.numTracks;
        try {
          app.enableQE();
          var qs = qe.project.getActiveSequence();
          qs.addTracks(0, 0, 1, 1, n, 0, 0); // (numVideo, videoIndex, numAudio, audioKind(1=stereo), audioIndex, numSubmix, submixKind)
        } catch (e4) {
          throw fail('PRESET_APPLICATION_FAILED', 'No free audio track at the playhead and Premiere refused to add one: ' + msg(e4));
        }
        tracks = seq.audioTracks;
        if (tracks.numTracks <= n) throw fail('PRESET_APPLICATION_FAILED', 'No free audio track at the playhead and a new one could not be added.');
        chosen = n; created = true;
      }
      // 4. Place. insertClip on an audio track puts the audio there and never ripples other tracks
      //    when the target region is empty (which we just verified).
      var track = tracks[chosen];
      var placed = false, err = '';
      try { placed = !!track.insertClip(item, timeFromTicks(startTicks)); } catch (e5) { err = msg(e5); }
      if (!placed) { try { placed = !!track.overwriteClip(item, timeFromTicks(startTicks)); } catch (e6) { err = err || msg(e6); } }
      if (!placed) throw fail('PRESET_APPLICATION_FAILED', 'Premiere refused to place "' + a.name + '" on A' + (chosen + 1) + (err ? ': ' + err : ''));
      return { trackIndex: chosen, trackCreated: created, startTicks: startTicks, durationTicks: String(Math.round(durTicks)) };
    },

    /**
     * Files → Apply (v1.17). Import (or reuse) a video / image file and place it at the playhead on
     * the lowest video track that is completely free for the clip's whole duration — and, for video,
     * whose audio track with the same index is free too (linked audio lands there). Tracks are added
     * only when no free pair exists. Nothing else on the timeline is touched, and that is VERIFIED:
     * every pre-existing clip on every track is snapshotted before and compared after.
     *
     * Optional Auto-Cut (v1.18, a.keepSeconds > 0): only the FIRST keepSeconds of the media are laid
     * down, as one section. The source's out mark is set to in + keepSeconds and read back BEFORE a
     * track is chosen, so the free-range check uses the real placed length — and when Premiere won't
     * take the mark, the check uses the full length, so a fallback can never overwrite neighbours.
     * If the placed clip still came out full length, only that new clip (and its linked audio) is
     * trimmed via TrackItem.end; if even that is refused the full clip stays, with a clear warning.
     * The project item's own in/out marks are always restored (the source is never changed). No QE
     * razor (it would cut every clip on the track). Shorter media are placed whole.
     */
    placeMedia: function (a) {
      var seq = activeSequence();
      var proj = app.project;
      var warnings = [];
      var startTicks = ticksOf(seq.getPlayerPosition());
      function findByPath(bin) {
        for (var i = 0; i < bin.children.numItems; i++) {
          var c = bin.children[i];
          if (c.type === ProjectItemType.BIN) { var r = findByPath(c); if (r) return r; }
          else { try { if (String(c.getMediaPath()) === a.path) return c; } catch (e) {} }
        }
        return null;
      }
      var item = findByPath(proj.rootItem);
      if (!item) {
        var before0 = proj.rootItem.children.numItems;
        if (!proj.importFiles([a.path], true, proj.rootItem, false)) throw fail('PRESET_APPLICATION_FAILED', 'Premiere could not import "' + a.name + '".');
        item = findByPath(proj.rootItem);
        if (!item && proj.rootItem.children.numItems > before0) item = proj.rootItem.children[proj.rootItem.children.numItems - 1];
        if (!item) throw fail('PRESET_APPLICATION_FAILED', 'Imported "' + a.name + '" but could not find it in the project.');
      }
      var TPS = TICKS_PER_SECOND;
      var frame = parseFloat(seq.timebase) || (TPS / 30);
      // v1.21: read the source length (all media, then video-only). When Premiere can't tell yet
      // (freshly imported media can report 0), the length is UNKNOWN — never guessed: a track then
      // only counts as free if nothing at all sits after the playhead, so no neighbour is overwritten.
      var inT = 0, outT = 0, lenKnown = false;
      var mtForms = [undefined, 4, 1];
      for (var mf = 0; mf < mtForms.length && !lenKnown; mf++) {
        try {
          var i1 = parseFloat(ticksOf(mtForms[mf] === undefined ? item.getInPoint() : item.getInPoint(mtForms[mf])));
          var o1 = parseFloat(ticksOf(mtForms[mf] === undefined ? item.getOutPoint() : item.getOutPoint(mtForms[mf])));
          if (o1 - i1 > 0) { inT = i1; outT = o1; lenKnown = true; }
        } catch (e1) {}
      }
      var durTicks = lenKnown ? outT - inT : 0;
      var s0 = parseFloat(startTicks), s1 = lenKnown ? s0 + durTicks : Infinity;
      var needAudio = a.kind !== 'image';
      // v1.21: media with several audio channels lands on A(n), A(n+1)…; remember the real span per file.
      var audioSpan = needAudio ? Math.max(1, AUDIO_SPAN[a.path] || 1) : 0;

      function clipAt(tr, ticks) {
        for (var c = 0; c < tr.clips.numItems; c++) { var cl = tr.clips[c]; if (Math.abs(parseFloat(ticksOf(cl.start)) - ticks) <= frame / 2) return cl; }
        return null;
      }
      var markMode = null; // which argument form setInPoint/setOutPoint honour in this Premiere
      function setMark(which, ticks) {
        var forms = markMode ? [markMode] : ['seconds', 'ticks', 'time'];
        for (var f = 0; f < forms.length; f++) {
          try {
            var arg = forms[f] === 'seconds' ? ticks / TPS : forms[f] === 'ticks' ? String(Math.round(ticks)) : (function () { var tt = new Time(); tt.ticks = String(Math.round(ticks)); return tt; })();
            if (which === 'in') item.setInPoint(arg, 4); else item.setOutPoint(arg, 4);
            var got = parseFloat(ticksOf(which === 'in' ? item.getInPoint() : item.getOutPoint()));
            if (Math.abs(got - ticks) <= frame) { markMode = forms[f]; return true; }
          } catch (e3) {}
        }
        return false;
      }
      var marksTouched = false;
      function restoreMarks() {
        if (!marksTouched) return;
        marksTouched = false;
        var ok = true;
        try {
          if (setMark('out', outT) === false) ok = false;
          if (setMark('in', inT) === false) ok = false;
        } catch (e4) { ok = false; }
        if (!ok) warnings.push('Azy could not restore the source clip\u2019s in/out marks in the Project panel \u2014 check them once.');
      }

      // ---- Auto-Cut plan: keep the first keepSeconds as ONE section ----
      var keep = Math.max(0, Number(a.keepSeconds) || 0) * TPS;
      var wantKeep = keep > 0 && (!lenKnown || durTicks > keep + frame / 2);
      var marked = false;
      if (keep > 0 && !wantKeep) warnings.push('note: the media is already ' + (durTicks / TPS).toFixed(2) + 's or shorter, so it was placed whole.');
      if (wantKeep) {
        marksTouched = true;
        marked = setMark('out', inT + keep);
        if (!marked) restoreMarks();
      }
      if (marked) s1 = s0 + keep; // verified: the placement will be keepSeconds long

      function trackFree(tr) {
        try { if (tr.isLocked && tr.isLocked()) return false; } catch (e) {}
        for (var c = 0; c < tr.clips.numItems; c++) {
          var cl = tr.clips[c];
          if (parseFloat(ticksOf(cl.start)) < s1 && parseFloat(ticksOf(cl.end)) > s0) return false;
        }
        return true;
      }
      function snap() {
        var out = [], kinds = [seq.videoTracks, seq.audioTracks];
        for (var k = 0; k < 2; k++) for (var t = 0; t < kinds[k].numTracks; t++) {
          var tr = kinds[k][t], row = [];
          for (var c = 0; c < tr.clips.numItems; c++) { var cl = tr.clips[c]; row.push(ticksOf(cl.start) + '|' + ticksOf(cl.end) + '|' + cl.name); }
          out.push((k ? 'A' : 'V') + t + ':' + row.join(';'));
        }
        return out;
      }
      var before = snap();
      var chosen = -1, created = false;
      for (var t = 0; t < seq.videoTracks.numTracks && chosen < 0; t++) {
        if (!trackFree(seq.videoTracks[t])) continue;
        if (needAudio) {
          var audOk = t + audioSpan <= seq.audioTracks.numTracks;
          for (var ak = 0; audOk && ak < audioSpan; ak++) if (!trackFree(seq.audioTracks[t + ak])) audOk = false;
          if (!audOk) continue;
        }
        chosen = t;
      }
      if (chosen < 0) {
        // Add tracks so a free video track and (for video) an audio track share one new index.
        var vN = seq.videoTracks.numTracks, aN = seq.audioTracks.numTracks;
        var idx = needAudio ? Math.max(vN, aN) : vN;
        try {
          app.enableQE();
          var qs = qe.project.getActiveSequence();
          qs.addTracks(idx - vN + 1, vN, needAudio ? idx - aN + audioSpan : 0, 1, aN, 0, 0);
        } catch (e2) { throw fail('PRESET_APPLICATION_FAILED', 'No free track at the playhead and Premiere refused to add one: ' + msg(e2)); }
        if (seq.videoTracks.numTracks <= idx || (needAudio && seq.audioTracks.numTracks < idx + audioSpan)) throw fail('PRESET_APPLICATION_FAILED', 'No free track at the playhead and a new one could not be added.');
        chosen = idx; created = true;
        before = snap(); // the new empty tracks are not "changes" to existing clips
      }
      var track = seq.videoTracks[chosen];

      var placedErr = '', steps = 0, kept = false, trimmedVia = '';
      try {
        var placed = false;
        try { placed = !!track.overwriteClip(item, timeFromTicks(String(Math.round(s0)))); } catch (e7) { placedErr = msg(e7); }
        if (!placed) throw fail('PRESET_APPLICATION_FAILED', 'Premiere refused to place "' + a.name + '" on V' + (chosen + 1) + (placedErr ? ': ' + placedErr : ''));
        steps = 1;
        var mine0 = clipAt(track, s0);
        if (!lenKnown && mine0) durTicks = parseFloat(ticksOf(mine0.end)) - parseFloat(ticksOf(mine0.start));
        if (needAudio) { // learn how many audio tracks this file really uses (new clips at the playhead)
          var span = 0;
          for (var ak2 = chosen; ak2 < seq.audioTracks.numTracks; ak2++) {
            var au0 = clipAt(seq.audioTracks[ak2], s0);
            if (!au0 || String(au0.name) !== String(mine0 ? mine0.name : au0.name)) break;
            var wasThere = false, pre = before[seq.videoTracks.numTracks + ak2] || '';
            if (pre.indexOf(ticksOf(au0.start) + '|') >= 0) wasThere = true;
            if (wasThere) break;
            span++;
          }
          if (span > 0) AUDIO_SPAN[a.path] = span;
        }
        if (wantKeep) {
          var mine = clipAt(track, s0);
          var len = mine ? parseFloat(ticksOf(mine.end)) - parseFloat(ticksOf(mine.start)) : 0;
          if (mine && Math.abs(len - keep) <= frame) { kept = true; trimmedVia = 'marks'; }
          else if (mine) {
            // Marks ignored: trim ONLY the clip we just placed (and its linked audio on the same index).
            var endT = new Time(); endT.ticks = String(Math.round(s0 + keep));
            try { mine.end = endT; } catch (e8) {}
            var len2 = parseFloat(ticksOf(mine.end)) - parseFloat(ticksOf(mine.start));
            if (Math.abs(len2 - keep) <= frame) {
              kept = true; trimmedVia = 'trim'; steps++;
              if (needAudio && chosen < seq.audioTracks.numTracks) {
                var au = clipAt(seq.audioTracks[chosen], s0);
                if (au) { try { var endA = new Time(); endA.ticks = String(Math.round(s0 + keep)); au.end = endA; } catch (e9) {} steps++; }
              }
            } else warnings.push('Premiere would not shorten the clip here, so the full media was placed (Ctrl+Z removes it).');
          }
        }
      } finally {
        restoreMarks();
      }
      var pieces = 1, cutDone = kept;

      // ---- Auto Scale (v1.18): Motion ▸ Scale on the NEW clip only. Never adds a Motion effect
      // (every clip has exactly one intrinsic Motion), never touches keyframed Scale, verified. ----
      // v1.19: video only — a still (by kind OR by file extension) always keeps its normal scale.
      var isStill = a.kind !== 'video' || /\.(jpe?g|png|gif|bmp|webp|tiff?|psd|ai|heic|svg|tga|exr|dpx)$/i.test(String(a.path || ''));
      var scaled = false, want = isStill ? 0 : (Number(a.scale) || 0);
      if (want > 0) {
        var target = clipAt(track, s0), motion = null, sp = null, why = '';
        try {
          var comps = target ? target.components : null;
          for (var ci = 0; comps && ci < comps.numItems; ci++) if (String(comps[ci].matchName) === 'AE.ADBE Motion') { motion = comps[ci]; break; }
        } catch (eM) { motion = null; }
        if (motion) {
          var props = motion.properties, SCALE_NAMES = { 'Scale': 1, 'Skalierung': 1, '\u00c9chelle': 1, 'Escala': 1, 'Scala': 1, '\u30b9\u30b1\u30fc\u30eb': 1, '\u7f29\u653e': 1 };
          for (var pi = 0; pi < props.numItems; pi++) { var dn = ''; try { dn = String(props[pi].displayName); } catch (eD) {} if (SCALE_NAMES[dn] === 1) { sp = props[pi]; break; } }
          if (!sp && props.numItems > 1) sp = props[1]; // Motion's fixed layout: Position, Scale, …
        }
        if (!sp) why = 'Premiere did not expose Motion \u25b8 Scale on the new clip';
        else {
          var tvS = false; try { tvS = !!sp.isTimeVarying(); } catch (eT) {}
          if (tvS) why = 'Scale already has keyframes, so it was left unchanged';
          else {
            try { sp.setValue(want, true); } catch (eS) { why = msg(eS); }
            var gotS = NaN; try { gotS = Number(sp.getValue()); } catch (eG) {}
            if (!why && Math.abs(gotS - want) < 0.01) { scaled = true; steps++; }
            else if (!why) why = 'Premiere did not take the new Scale';
          }
        }
        if (!scaled) warnings.push('Auto Scale skipped: ' + why + '.');
      }

      // ---- isolation proof: every clip that existed before is still exactly where it was ----
      var after = snap(), changed = 0;
      for (var i = 0; i < before.length; i++) {
        var b = before[i], tag = b.split(':')[0], rowB = b.slice(tag.length + 1), rowA = null;
        for (var j = 0; j < after.length; j++) if (after[j].split(':')[0] === tag) { rowA = after[j].slice(tag.length + 1); break; }
        if (rowA === null) { changed++; continue; }
        var prevClips = rowB ? rowB.split(';') : [], nowClips = rowA ? rowA.split(';') : [];
        for (var q = 0; q < prevClips.length; q++) {
          var found = false;
          for (var w = 0; w < nowClips.length; w++) if (nowClips[w] === prevClips[q]) { found = true; break; }
          if (!found) changed++;
        }
      }
      if (changed) warnings.push('Premiere changed ' + changed + ' existing clip' + (changed === 1 ? '' : 's') + ' while placing — press Ctrl+Z ' + steps + '\u00d7 in Premiere to revert.');
      return { trackIndex: chosen, trackCreated: created, pieces: pieces, cut: cutDone, kept: kept, keptSeconds: kept ? keep / TPS : 0, scaled: scaled,
        keepRequested: keep > 0, trimmedVia: trimmedVia, steps: steps, isolated: !changed,
        startTicks: startTicks, durationTicks: String(Math.round(kept ? keep : durTicks)), warnings: warnings };
    },

    /**
     * Timeline guard for the Flow "Selected" probe (v1.19). A compact fingerprint of everything a
     * stray Delete could remove: every clip on every video/audio track (start, end, name) plus the
     * number of project items. The probe compares it before/after its Delete keystroke; any change
     * means the key reached the timeline or Project panel instead of Effect Controls, and the probe
     * undoes it at once and refuses.
     */
    timelineSignature: function () {
      var seq = activeSequence(), h = 5381, clips = 0, items = 0;
      function mix(s) { s = String(s); for (var i = 0; i < s.length; i++) { h = ((h << 5) + h + s.charCodeAt(i)) | 0; } }
      var kinds = [seq.videoTracks, seq.audioTracks];
      for (var k = 0; k < 2; k++) {
        mix(k ? 'A' : 'V'); mix(kinds[k].numTracks);
        for (var t = 0; t < kinds[k].numTracks; t++) {
          var cl = kinds[k][t].clips; mix('#' + t + ':' + cl.numItems);
          for (var c = 0; c < cl.numItems; c++) { var it = cl[c]; clips++; mix(ticksOf(it.start) + '|' + ticksOf(it.end) + '|' + it.name); }
        }
      }
      function count(bin, depth) {
        var n = bin.children.numItems; items += n;
        if (depth > 2 || items > 3000) return; // bounded: the guard must stay cheap on huge projects
        for (var i = 0; i < n; i++) { var ch = bin.children[i]; if (ch.type === ProjectItemType.BIN) count(ch, depth + 1); }
      }
      try { count(app.project.rootItem, 0); } catch (e) {}
      mix('P' + items);
      return { hash: String(h), clips: clips, projectItems: items };
    },

    ping: function () { return { t: new Date().getTime() }; }
  };

  function call(json) {
    var req;
    try { req = AZY_JSON.parse(json); } catch (e) { return AZY_JSON.stringify({ ok: false, error: { code: 'INVALID_REQUEST', message: msg(e) } }); }
    var fn = ops[req.op];
    if (!fn) return AZY_JSON.stringify({ ok: false, error: { code: 'INVALID_REQUEST', message: 'unknown op ' + req.op } });
    try {
      return AZY_JSON.stringify({ ok: true, result: fn(req.args || {}) });
    } catch (e2) {
      return AZY_JSON.stringify({ ok: false, error: { code: e2.azyCode || 'PRESET_APPLICATION_FAILED', message: msg(e2), data: e2.azyData } });
    }
  }
  return { call: call, version: VERSION };
})();

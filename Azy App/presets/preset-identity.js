'use strict';
/* v1.21 — stable preset identity at apply time.

   Presets that live inside Premiere have ids like "ppro_<source>#<index>": the index is the preset's
   POSITION in Premiere's presets file. Premiere rewrites that file whenever a preset is added,
   deleted or moved in its Effects panel, so an id held by a Dagger pin, a favourite, a Snap row or a
   card that is already on screen can silently point at a DIFFERENT preset afterwards.

   Every apply therefore carries the preset's expected identity (name, and bin when known — from the
   caller, the Dagger pin or the favourite's fingerprint). Before anything reaches Premiere:
     • the preset at that id is the expected one        → apply it (the normal case, no extra work);
     • it moved                                         → apply it at its new id, and re-link the
                                                          Dagger pin / favourite so it stays correct;
     • several presets share that name (no bin to tell) → refuse, never guess;
     • a different preset now sits at that id and the
       expected one is nowhere to be found              → refuse with a clear message.
   Azy never applies a preset other than the one the user picked. */

const isPremiereId = (id) => typeof id === 'string' && id.startsWith('ppro_') && id.includes('#');
const binOf = (v) => (v && Array.isArray(v.binPath) ? v.binPath.join('/') : '');

function identityError(message, code = 'INVALID_PRESET') { return Object.assign(new Error(message), { code }); }

/**
 * opts: {
 *   pins():  [{ id, name, bin? }]           Dagger preset pins
 *   relink(from, to, name)                  move pins / favourites from a stale id to the right one
 *   savedName(id) → string|null             name of the local saved copy for id (v1.20), if any
 *   log(level, msg)
 * }
 */
function createPresetIdentity(rt, opts = {}) {
  const ppro = rt.premierePresets, meta = rt.library && rt.library.meta;
  const log = opts.log || (() => {});
  const live = (id) => { const v = ppro.get(id); return v && !v.savedCopy ? v : null; };

  function expectationFor(id, given) {
    if (given && typeof given.name === 'string' && given.name) return { name: given.name, bin: typeof given.bin === 'string' ? given.bin : null };
    let pins = [];
    try { pins = (opts.pins && opts.pins()) || []; } catch { pins = []; }
    const pin = pins.find((p) => p && p.id === id);
    if (pin && pin.name && pin.name !== id) return { name: pin.name, bin: typeof pin.bin === 'string' ? pin.bin : null };
    const m = meta && meta.get ? meta.get(id) : null;
    if (m && m.fp && m.fp.name) return { name: m.fp.name, bin: typeof m.fp.bin === 'string' ? m.fp.bin : null };
    return null;
  }
  function find(id, exp) {
    const source = id.slice(0, id.indexOf('#'));
    let hits = [];
    try { hits = (ppro.search(exp.name, source, 5000) || []).filter((p) => p && p.name === exp.name && !p.savedCopy); } catch { hits = []; }
    if (exp.bin != null) {
      const same = hits.filter((p) => binOf(p) === exp.bin);
      if (same.length === 1) return same[0];
      if (same.length > 1) return 'ambiguous';
      return null; // a same-named preset in ANOTHER bin is a different preset
    }
    if (hits.length === 1) return hits[0];
    return hits.length > 1 ? 'ambiguous' : null;
  }

  /** The id to apply for `id` (possibly re-linked), or throws — never a different preset. */
  function resolve(id, given) {
    if (!isPremiereId(id)) return id; // file presets (p_<hash of path>), effects, transitions: already stable
    const exp = expectationFor(id, given);
    if (!exp) return id; // nothing known to verify against: unchanged behaviour
    const v = live(id);
    if (v && v.name === exp.name && (exp.bin == null || binOf(v) === exp.bin)) return id;
    const m = find(id, exp);
    if (m && m !== 'ambiguous') {
      log('info', `"${exp.name}" moved in Premiere's presets (${id} → ${m.id}); applying it there and re-linking`);
      try { if (opts.relink) opts.relink(id, m.id, m.name); } catch { /* the apply is still correct */ }
      return m.id;
    }
    if (m === 'ambiguous') throw identityError(`Several presets in Premiere are called \u201c${exp.name}\u201d, so Azy didn\u2019t guess \u2014 nothing was applied. Apply it from the Presets list (or rename one of them in Premiere).`, 'AMBIGUOUS_PRESET');
    if (!v) {
      // Gone from Premiere entirely: the v1.20 saved copy may apply it — but only if it IS that preset.
      const saved = opts.savedName ? opts.savedName(id) : null;
      if (saved && saved !== exp.name) throw identityError(`\u201c${exp.name}\u201d is no longer in Premiere\u2019s presets \u2014 nothing was applied.`);
      return id;
    }
    throw identityError(`\u201c${exp.name}\u201d moved or was removed in Premiere\u2019s presets, and Azy never applies a different preset \u2014 nothing was applied. Star or pin it again from the Presets list.`);
  }

  /** Re-link every Dagger pin whose id now points at another preset (after Premiere rewrote its file). */
  function relinkPins() {
    let pins = [];
    try { pins = (opts.pins && opts.pins()) || []; } catch { return 0; }
    let n = 0;
    for (const p of pins.slice()) {
      if (!p || !isPremiereId(p.id)) continue;
      try { if (resolve(p.id) !== p.id) n++; } catch { /* stays as is; applying it will explain */ }
    }
    return n;
  }
  return { resolve, relinkPins, expectationFor };
}

/** Re-register the apply channels so every caller (Presets, Snap, Dagger, the Premiere panel) is checked. */
function guardApplyChannels(ipcMain, rt, identity) {
  const { PremierePresetsSource } = rt.__engine || {};
  const isP = (id) => (PremierePresetsSource ? PremierePresetsSource.isPremiereId(id) : isPremiereId(id));
  const split = (options) => {
    const o = options && typeof options === 'object' ? options : {};
    const { expectName, expectBin, ...rest } = o;
    return { given: expectName ? { name: String(expectName), bin: typeof expectBin === 'string' ? expectBin : null } : null, rest };
  };
  ipcMain.removeHandler('azy:presets:applyPreset');
  ipcMain.handle('azy:presets:applyPreset', async (_e, presetId, target = { mode: 'selection' }, options = {}) => {
    const { given, rest } = split(options);
    const id = identity.resolve(presetId, given);
    const plan = isP(id) ? rt.premierePresets.getPlan(id) : await rt.library.getPlan(id);
    if (!plan) throw identityError("Preset no longer exists in Premiere's presets file");
    const { operationId, ...more } = rest;
    const res = await rt.connector.applyPreset(plan, target, more, operationId || undefined);
    if (res && (res.state === 'SUCCESS' || res.state === 'PARTIAL')) {
      if (isP(id)) rt.library.meta.markUsed(id); else rt.library.markUsed(id);
    }
    return res;
  });
  ipcMain.removeHandler('azy:presets:snap:apply');
  ipcMain.handle('azy:presets:snap:apply', async (_e, id, target, options) => {
    const { given, rest } = split(options);
    return rt.snap.apply(identity.resolve(id, given), target, undefined, Object.keys(rest).length ? rest : undefined);
  });
}

module.exports = { createPresetIdentity, guardApplyChannels, isPremiereId };

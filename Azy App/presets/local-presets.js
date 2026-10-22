'use strict';
/* v1.20 — local copies of favourite + Dagger-pinned presets.
   Applying a preset only needs its "plan" (parsed effects + parameter values). Premiere's own
   presets live in ONE file Premiere can reset or rewrite, and pinned .prfpset folders can move —
   so for every preset that is starred or pinned to Dagger, Azy keeps a copy of the plan (and the
   card's last view) in userData/presets/local-presets.json.

   Rules:
     • the live preset always wins; the copy is used ONLY when the original can't be found;
     • copies follow the user's intent — unstar AND unpin a preset and its copy is removed;
     • writes are atomic (tmp + rename, previous good file kept as .bak); a corrupt file is
       recovered from .bak, never thrown at the UI;
     • nothing here talks to Premiere. */
const fs = require('fs');
const path = require('path');

const SCHEMA = 'azy.local-presets';
const MAX = 400; // generous; a plan is a few KB

function readJson(file) { try { const d = JSON.parse(fs.readFileSync(file, 'utf8')); return d && d.schema === SCHEMA && d.presets && typeof d.presets === 'object' ? d : null; } catch { return null; } }

function createLocalStore(dir) {
  const file = path.join(dir, 'local-presets.json');
  let data = readJson(file) || readJson(file + '.bak') || { schema: SCHEMA, version: 1, presets: {} };
  // Async on purpose: a background backup must never block Azy's main process (antivirus scanning
  // on Windows can make each file operation slow). Writes are serialised; the last state wins.
  const fsp = fs.promises;
  let writing = Promise.resolve();
  function save() {
    const snapshot = JSON.stringify(data);
    writing = writing.then(async () => {
      const tmp = file + '.tmp';
      try {
        await fsp.mkdir(dir, { recursive: true });
        await fsp.writeFile(tmp, snapshot);
        try { JSON.parse(await fsp.readFile(file, 'utf8')); await fsp.copyFile(file, file + '.bak'); } catch { /* no good previous copy */ }
        await fsp.rename(tmp, file);
      } catch { try { await fsp.unlink(tmp); } catch { /* nothing */ } }
    });
    return writing;
  }
  return {
    file,
    get: (id) => (Object.prototype.hasOwnProperty.call(data.presets, id) ? data.presets[id] : null),
    ids: () => Object.keys(data.presets),
    /** Make the store hold exactly `wanted` (id → { plan, view } or null = keep the existing copy). */
    sync(wanted) {
      let changed = false;
      const next = {};
      for (const [id, live] of wanted) {
        if (Object.keys(next).length >= MAX) break;
        const old = data.presets[id];
        if (live && live.plan) {
          const rec = { name: (live.view && live.view.name) || (old && old.name) || id, plan: live.plan, view: live.view || (old && old.view) || null, savedAt: old && old.savedAt };
          const same = old && JSON.stringify(old.plan) === JSON.stringify(rec.plan) && JSON.stringify(old.view) === JSON.stringify(rec.view);
          if (!same) { rec.savedAt = Date.now(); changed = true; }
          next[id] = rec;
        } else if (old) next[id] = old; // original missing right now → keep the copy we have
      }
      for (const id of Object.keys(data.presets)) if (!next[id]) changed = true;
      if (changed) { data = { schema: SCHEMA, version: 1, presets: next }; save(); }
      return changed;
    },
    flush: () => writing
  };
}

const isPresetId = (id) => typeof id === 'string' && (/^p_[0-9a-f]{20}$/.test(id) || (/^ppro_/.test(id) && id.includes('#')));

/**
 * Attach the store to a presets runtime: copies stay in sync with favourites + Dagger pins,
 * and library / Premiere plan lookups fall back to the copy when the original is gone.
 * `pinnedIds()` returns the Dagger preset pin ids. Returns { store, syncNow, schedule }.
 */
function attachLocalPresets(rt, dir, pinnedIds, log, verify) {
  const store = createLocalStore(dir);
  const lib = rt.library, ppro = rt.premierePresets;

  const libGetPlan = lib.getPlan.bind(lib);
  lib.getPlan = async (id) => {
    try { return await libGetPlan(id); } catch (err) {
      const c = store.get(id);
      if (c && c.plan) { if (log) log('info', `using the saved copy of "${c.name}" (original file not found)`); return c.plan; }
      throw err;
    }
  };
  const pproGetPlan = ppro.getPlan.bind(ppro);
  ppro.getPlan = (id) => {
    const live = pproGetPlan(id);
    if (live) return live;
    const c = store.get(id);
    if (c && c.plan) { if (log) log('info', `using the saved copy of "${c.name}" (gone from Premiere's presets file)`); return c.plan; }
    return live;
  };
  // Favourites lists: a starred preset whose original vanished still shows (as a saved copy).
  const libFavs = lib.favorites.bind(lib);
  lib.favorites = () => {
    const out = libFavs();
    const have = new Set(out.map((v) => v.id));
    for (const id of lib.meta.favorites()) {
      if (have.has(id) || !/^p_/.test(id)) continue;
      const c = store.get(id);
      if (c && c.view) out.push({ ...c.view, savedCopy: true });
    }
    return out;
  };
  const pproGet = ppro.get.bind(ppro);
  ppro.get = (id) => {
    const v = pproGet(id);
    if (v) return v;
    const c = store.get(id);
    return c && c.view && lib.meta.isFavorite && lib.meta.isFavorite(id) ? { ...c.view, savedCopy: true } : v;
  };

  async function liveCopy(id) {
    try {
      if (/^ppro_/.test(id)) {
        const v = pproGet(id) || null;
        if (v && verify && !verify(id, v)) return null; // that slot now holds ANOTHER preset: keep the old copy (v1.21)
        const plan = pproGetPlan(id); return plan ? { plan, view: v } : null;
      }
      const rec = lib.index && lib.index.get(id);
      if (!rec) return null;
      const plan = await libGetPlan(id);
      return plan ? { plan, view: lib.view ? lib.view(rec) : { id, name: rec.name } } : null;
    } catch { return null; }
  }
  let running = null, again = false;
  async function syncNow() {
    if (running) { again = true; return running; }
    running = (async () => {
      do {
        again = false;
        let pins = [];
        try { pins = pinnedIds() || []; } catch { pins = []; }
        const ids = [...new Set([...lib.meta.favorites(), ...pins].filter(isPresetId))];
        const wanted = [];
        for (const id of ids) { wanted.push([id, await liveCopy(id)]); await new Promise((r) => setImmediate(r)); } // yield between presets
        try { store.sync(wanted); await store.flush(); } catch (err) { if (log) log('warn', 'local copies: ' + err.message); }
      } while (again);
    })().finally(() => { running = null; });
    return running;
  }
  let timer = null;
  const schedule = (ms = 400) => { clearTimeout(timer); timer = setTimeout(() => { syncNow().catch(() => {}); }, ms); if (timer.unref) timer.unref(); };
  const metaSet = lib.meta.setFavorite.bind(lib.meta);
  lib.meta.setFavorite = (...a) => { const r = metaSet(...a); schedule(); return r; };
  return { store, syncNow, schedule };
}

module.exports = { createLocalStore, attachLocalPresets, isPresetId, SCHEMA };

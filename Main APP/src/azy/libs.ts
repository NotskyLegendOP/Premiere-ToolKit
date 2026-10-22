import { useEffect, useState } from "react";
import { DEFAULT_LIBS, type Lib } from "../Assets";

/* Pinned media folders ("pins" in Azy, "sections" in the Toolbox). Kept in the same localStorage
 * key the rest of the app already used, so existing sections survive the new layout. */

const KEY = "libs";
const ACTIVE = "activeLib";
const SUBS = new Set<(n: Lib[]) => void>();

export const loadLibs = (): Lib[] => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null");
    if (Array.isArray(v) && v.length) return v as Lib[];
  } catch { /* fall through to defaults */ }
  return DEFAULT_LIBS;
};

export const saveLibs = (n: Lib[]) => {
  localStorage.setItem(KEY, JSON.stringify(n));
  SUBS.forEach(f => f(n));
};

export const loadActive = (libs: Lib[]) => {
  const a = localStorage.getItem(ACTIVE);
  return a && libs.some(l => l.id === a) ? a : libs[0]?.id ?? "";
};
export const saveActive = (id: string) => {
  localStorage.setItem(ACTIVE, id);
  window.dispatchEvent(new CustomEvent("azy-active", { detail: id }));
};

export function useLibs(): [Lib[], {
  add: (name: string, path?: string) => Lib;
  rename: (id: string, name: string) => void;
  remove: (id: string) => void;
  setPath: (id: string, path: string) => void;
  move: (from: number, to: number) => void;
  active: string;
  select: (id: string) => void;
  set: (n: Lib[]) => void;
}] {
  const [libs, setLocal] = useState<Lib[]>(loadLibs);
  const [active, setActive] = useState<string>(() => loadActive(loadLibs()));

  useEffect(() => {
    const f = (n: Lib[]) => setLocal(n);
    SUBS.add(f);
    const a = (e: Event) => setActive((e as CustomEvent<string>).detail);
    window.addEventListener("azy-active", a);
    return () => { SUBS.delete(f); window.removeEventListener("azy-active", a); };
  }, []);

  const set = (n: Lib[]) => { saveLibs(n); setLocal(n); };

  const select = (id: string) => { setActive(id); saveActive(id); };

  return [libs, {
    active: libs.some(l => l.id === active) ? active : libs[0]?.id ?? "",
    set,
    select,
    add: (name: string, path = "") => {
      const base = name.trim() || "New folder";
      let n = base, k = 2;
      while (libs.some(l => l.name === n)) n = `${base} ${k++}`;
      const l: Lib = { id: n + Date.now(), name: n, path };
      set([...libs, l]);
      select(l.id);
      return l;
    },
    rename: (id, name) => {
      const n = name.trim();
      if (!n) return;
      set(libs.map(l => (l.id === id ? { ...l, name: n } : l)));
    },
    remove: (id) => {
      if (libs.length < 2) return;
      const rest = libs.filter(l => l.id !== id);
      set(rest);
      if (active === id) select(rest[0].id);
    },
    setPath: (id, path) => set(libs.map(l => (l.id === id ? { ...l, path } : l))),
    move: (from, to) => {
      if (from === to || from < 0 || to < 0 || from >= libs.length || to >= libs.length) return;
      const n = [...libs];
      const [it] = n.splice(from, 1);
      n.splice(to, 0, it);
      set(n);
    },
  }];
}

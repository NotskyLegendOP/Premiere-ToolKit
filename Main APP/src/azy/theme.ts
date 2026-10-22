import { useEffect, useState } from "react";
import { applyTheme, DEFAULT, loadTheme, type Theme } from "../Settings";

/* The Toolbox theme (colours, radius, glass, sizes) stays the single source of visual truth.
 * Azy only reads and writes it through this hook, so a change made in any panel shows up in all. */

export function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, setLocal] = useState<Theme>(loadTheme);
  useEffect(() => {
    const f = () => setLocal(loadTheme());
    window.addEventListener("ptb-theme", f);
    return () => window.removeEventListener("ptb-theme", f);
  }, []);
  const set = (t: Theme) => { applyTheme(t); setLocal(t); };
  return [theme, set];
}

export { DEFAULT as DEFAULT_THEME, applyTheme, loadTheme };
export type { Theme };

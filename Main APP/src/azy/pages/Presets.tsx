import React, { useEffect, useMemo, useState } from "react";
import { Search, X, Plus, Star, StarOff, FolderPlus, Boxes, Gauge, Check, CornerUpLeft, Info } from "lucide-react";
import { useAzy, holdDown, useStars } from "../state";
import { useTheme } from "../theme";
import { QuickStyle } from "../../QuickStyle";
import { applyPreset, listPresets, pickFolder, IS_TAURI, type PresetItem, type Status } from "../api";
import { Btn, Ib, Chip, Empty, toast, cx, useEscape, Busy } from "../ui";

/* ------------------------------------------------------------------------------------------------
 * Presets — pinned .prfpset folders plus Premiere's own starred presets.
 * Click = apply to the selection. Holding the hold modifier asks for a speed first.
 * A preset is always identified by name + bin, never by its position in Premiere's file.
 * ---------------------------------------------------------------------------------------------- */

const PINS = "azy.presetPins.v1";
const loadPins = (): string[] => { try { return JSON.parse(localStorage.getItem(PINS) || "[]"); } catch { return []; } };

const glyph = (p: PresetItem) => (p.kind === "transition" ? "T" : p.kind === "effect" ? "fx" : "{}");

export default function Presets({ active, onContext, status }: { active: boolean; onContext: (s: string) => void; status: Status }) {
  const [azy] = useAzy();
  const [theme, setTheme] = useTheme();
  const [stars, setStars] = useStars();
  const [items, setItems] = useState<PresetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pins, setPins] = useState<string[]>(loadPins);
  const [bin, setBin] = useState<string>("__all");
  const [starredOnly, setStarredOnly] = useState(false);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [speedFor, setSpeedFor] = useState<PresetItem | null>(null);
  const [pct, setPct] = useState(100);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    listPresets(pins)
      .then(r => { if (alive) setItems(r); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [pins]);

  const bins = useMemo(() => Array.from(new Set(items.map(i => i.bin))), [items]);
  useEffect(() => { onContext(bin === "__all" ? "All presets" : bin); }, [bin]);

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return items.filter(i =>
      (bin === "__all" || i.bin === bin) &&
      (!starredOnly || stars.includes(i.id) || i.starred) &&
      (!t || i.name.toLowerCase().includes(t) || i.bin.toLowerCase().includes(t))
    );
  }, [items, bin, starredOnly, stars, q]);

  const run = async (p: PresetItem, speed?: number) => {
    if (busy) return;
    if (status.connected && !status.clip) {
      toast("Nothing is selected", `“${p.name}” needs a clip selected in Premiere — nothing was applied.`, "err");
      return;
    }
    setBusy(p.id);
    const r = await applyPreset(p, speed);
    setBusy(null);
    if (r.ok) toast(`Applied “${p.name}”`, r.msg || `${p.bin} · one undoable change in Premiere.`, "ok");
    else toast(`“${p.name}” was not applied`, r.msg, "err");
  };

  const click = (p: PresetItem, e: React.MouseEvent) => {
    if (holdDown(e, azy.holdMod) && azy.holdMod !== "off") { setPct(100); setSpeedFor(p); return; }
    run(p);
  };

  const pinFolder = async () => {
    const path = await pickFolder();
    if (path === null) return;
    const n = [...new Set([...pins, path])];
    setPins(n); localStorage.setItem(PINS, JSON.stringify(n));
    toast("Preset folder pinned", path, "ok", 2200);
  };
  const unpin = (p: string) => {
    const n = pins.filter(x => x !== p);
    setPins(n); localStorage.setItem(PINS, JSON.stringify(n));
    toast("Preset folder unpinned", "The folder itself was not touched.", "info", 1800);
  };

  useEscape(() => {
    if (!active) return false;
    if (speedFor) { setSpeedFor(null); return true; }
    if (q) { setQ(""); return true; }
    return false;
  }, [active, speedFor, q]);

  return (
    <>
      {/* pin / bin chips */}
      <div className="az-pins">
        <Chip className="dash" onClick={pinFolder} title="Pin a folder of .prfpset files"><Plus size={11} />Pin folder</Chip>
        {pins.map(p => (
          <Chip key={p} title={`${p}\nClick to unpin`} onClick={() => unpin(p)}>
            <FolderPlus size={10} />{p.split(/[\\/]/).filter(Boolean).pop()}
            <X size={9} style={{ opacity: .55 }} />
          </Chip>
        ))}
        <span style={{ width: 1, height: 14, background: "var(--az-line)", margin: "0 2px" }} />
        <Chip on={bin === "__all"} onClick={() => setBin("__all")}>All presets</Chip>
        {bins.map(b => <Chip key={b} on={bin === b} onClick={() => setBin(b)}>{b}</Chip>)}
      </div>

      <div className="az-pathrow">
        <Boxes size={12} style={{ opacity: .6 }} />
        <span>All presets</span>
        <span style={{ opacity: .4 }}>/</span>
        <b>{bin === "__all" ? "Everything" : bin}</b>
        <span className="az-grow" />
        <span className="az-count">{shown.length} item{shown.length === 1 ? "" : "s"}</span>
        <Chip on={starredOnly} onClick={() => setStarredOnly(v => !v)} style={{ height: 20 }} title="Only starred presets">
          <Star size={10} />Starred
        </Chip>
      </div>

      <div className="az-bar">
        <div className="az-search">
          <Search />
          <input value={q} placeholder="Filter presets…" onChange={e => setQ(e.target.value)} />
          {q && <Ib label="Clear search" onClick={() => setQ("")} style={{ width: 20, height: 20 }}><X size={11} /></Ib>}
        </div>
        <QuickStyle theme={theme} setTheme={setTheme} mode="general" />
      </div>

      <div className="az-subbar">
        <span className="az-hint">
          {status.demo ? "demo presets · the real list comes from Premiere" : `${status.connected ? "Connected" : "Offline"} · name + bin checked on every apply`}
        </span>
        <span className="az-grow" />
        {loading ? <Busy text="Reading presets…" /> : <span className="az-hint">Hold {azy.holdMod === "alt" ? "Alt" : "Shift"} while clicking for speed</span>}
      </div>

      {!loading && items.length === 0 ? (
        <Empty
          icon={<Info />}
          title="No preset list in this build"
          hint="The .prfpset index lives in the preset engine. Until it is wired to the new UI, point a pin at your presets folder and the list will fill in."
          action={<Btn variant="accent" onClick={pinFolder} icon={<FolderPlus size={12} />}>Pin a preset folder</Btn>}
        />
      ) : (
        <div className="az-scroll">
          <div className="az-cards">
            {shown.map(p => {
              const starred = stars.includes(p.id) || p.starred;
              return (
                <div key={p.id} className="az-preset" onClick={e => click(p, e)}
                  title={`${p.name}\n${p.bin} · click to apply${azy.holdMod !== "off" ? `\nhold ${azy.holdMod === "alt" ? "Alt" : "Shift"} for speed` : ""}`}>
                  <div className="tile">{busy === p.id ? "…" : glyph(p)}</div>
                  <b>{p.name}</b>
                  <span>{p.bin}</span>
                  <button className={cx("az-star", starred && "on")} title={starred ? "Unstar" : "Star"}
                    onClick={e => { e.stopPropagation(); setStars(starred ? stars.filter(x => x !== p.id) : [...stars, p.id]); }}>
                    <Star size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* apply-with-speed — the small prompt from the Azy spec */}
      {speedFor && (
        <div className="az-popup" role="dialog" aria-label="Apply with speed">
          <div className="az-mhead">
            <span className="tile"><Gauge size={14} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <b>Apply with speed</b>
              <small>{speedFor.name} · {speedFor.bin}</small>
            </div>
            <Ib label="Cancel" onClick={() => setSpeedFor(null)}><X size={13} /></Ib>
          </div>
          <div className="az-row" style={{ gap: 5 }}>
            <input type="number" min={1} max={1000} value={pct} style={{ flex: 1 }}
              onChange={e => setPct(Number(e.target.value))}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); run(speedFor, pct); setSpeedFor(null); } }}
              aria-label="Speed percentage" />
            <span style={{ color: "var(--az-text-3)", fontSize: 12 }}>%</span>
          </div>
          <div className="az-row" style={{ gap: 3 }}>
            {[50, 100, 150, 200].map(v => <Btn key={v} small on={pct === v} onClick={() => setPct(v)}>{v}%</Btn>)}
          </div>
          <div className="az-mfoot">
            <Btn onClick={() => { run(speedFor); setSpeedFor(null); }} title="Apply at 100 %">Plain apply</Btn>
            <Btn variant="accent" onClick={() => { run(speedFor, pct); setSpeedFor(null); }}><Check size={12} />Apply {pct} %</Btn>
          </div>
        </div>
      )}
    </>
  );
}

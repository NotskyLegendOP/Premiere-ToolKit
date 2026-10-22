import React, { useEffect, useMemo, useRef, useState } from "react";
import { Command, Search, Star, CornerDownLeft } from "lucide-react";
import { Modal, Btn, Ib, toast, cx, Busy } from "./ui";
import { demoPresets, listPresets, snapApply, IS_TAURI, type SnapItem, type Status } from "./api";
import { useAzy, useStars } from "./state";

/* ------------------------------------------------------------------------------------------------
 * Azy · Snap Action — quick-apply palette (Shift+Space).
 * Searches effects, presets and transitions; ⏎ applies to the selection, Esc closes.
 * ---------------------------------------------------------------------------------------------- */

const groupOf = (kind: string) => (kind === "transition" ? "Transitions" : kind === "effect" ? "Effects" : "Presets");

export default function SnapPalette({ onClose, status }: { onClose: () => void; status: Status }) {
  const [azy, set] = useAzy();
  const [stars] = useStars();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const [busy, setBusy] = useState(false);
  const box = useRef<HTMLInputElement>(null);

  const [source, setSource] = useState<SnapItem[]>(() =>
    (IS_TAURI ? [] : demoPresets()).map(p => ({ ...p, group: groupOf(p.kind), starred: p.starred || stars.includes(p.id) }))
  );

  useEffect(() => {
    let alive = true;
    listPresets().then(r => {
      if (!alive || !r.length) return;
      setSource(r.map(p => ({ ...p, group: groupOf(p.kind) })));
    }).catch(() => { /* the palette stays usable with whatever it has */ });
    return () => { alive = false; };
  }, []);

  const all: SnapItem[] = useMemo(
    () => source.map(p => ({ ...p, starred: p.starred || stars.includes(p.id) })),
    [source, stars]
  );

  const items = useMemo(() => {
    const t = q.trim().toLowerCase();
    return all
      .filter(i => !azy.snapStarredOnly || i.starred)
      .filter(i => !t || i.name.toLowerCase().includes(t) || i.bin.toLowerCase().includes(t) || i.group.toLowerCase().includes(t))
      .slice(0, 40);
  }, [all, q, azy.snapStarredOnly]);

  useEffect(() => { setSel(0); }, [q]);
  useEffect(() => { const t = setTimeout(() => box.current?.focus(), 40); return () => clearTimeout(t); }, []);

  const run = async (i?: SnapItem) => {
    const item = i ?? items[sel];
    if (!item) return;
    if (azy.snapNeedsSelection && status.connected && !status.clip) {
      toast("Nothing is selected", "Snap only applies to a clip you selected in Premiere — nothing was changed.", "err");
      return;
    }
    setBusy(true);
    const r = await snapApply(item);
    setBusy(false);
    if (r.ok) {
      toast(`Applied “${item.name}”`, r.msg || item.bin, "ok");
      if (azy.snapHideAfter) onClose();       // Snap closes instantly after apply
    } else {
      toast(`“${item.name}” was not applied`, r.msg, "err");
    }
  };

  return (
    <Modal
      title="Snap Action"
      subtitle="Effects · presets · transitions — ⏎ applies to the selection"
      icon={<Command size={16} />}
      onClose={onClose}
      wide
      footer={
        <>
          <Btn small onClick={() => set({ snapStarredOnly: !azy.snapStarredOnly })} on={azy.snapStarredOnly} icon={<Star size={11} />}>Starred only</Btn>
          <Btn small onClick={() => set({ snapNeedsSelection: !azy.snapNeedsSelection })} on={azy.snapNeedsSelection}>Only with a selection</Btn>
          <Btn small onClick={() => set({ snapHideAfter: !azy.snapHideAfter })} on={azy.snapHideAfter}>Hide after apply</Btn>
          <span className="az-grow" />
          {busy ? <Busy text="Applying…" /> : <span className="az-hint"><CornerDownLeft size={11} /> apply</span>}
        </>
      }
    >
      <div className="az-snap">
        <div className="az-search">
          <Search size={14} />
          <input
            ref={box}
            value={q}
            placeholder="Search effects, presets and transitions…"
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => {
              if (e.key === "ArrowDown") { e.preventDefault(); setSel(s => Math.min(items.length - 1, s + 1)); }
              else if (e.key === "ArrowUp") { e.preventDefault(); setSel(s => Math.max(0, s - 1)); }
              else if (e.key === "Enter") { e.preventDefault(); run(); }
            }}
            aria-label="Search"
          />
          {q && <Ib label="Clear" onClick={() => setQ("")}>×</Ib>}
        </div>

        <div className="results">
          {items.length === 0 && <div className="empty">Nothing matches “{q}”.</div>}
          {items.map((i, n) => (
            <button key={i.id} className={cx("res", n === sel && "sel")} onMouseEnter={() => setSel(n)} onClick={() => run(i)}>
              <span className="tile">{i.kind === "transition" ? "T" : i.kind === "effect" ? "fx" : "{}"}</span>
              <span className="txt"><b>{i.name}</b><span>{i.group} · {i.bin}</span></span>
              {i.starred && <Star size={11} style={{ color: "var(--az-accent)", fill: "currentColor" }} />}
            </button>
          ))}
        </div>
        <span className="az-hint">
          {items.length} result{items.length === 1 ? "" : "s"} · Shift+Space opens Snap from anywhere in the app.
        </span>
      </div>
    </Modal>
  );
}

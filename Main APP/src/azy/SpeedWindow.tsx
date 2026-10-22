import React, { useEffect, useMemo, useRef, useState } from "react";
import { Gauge, RotateCcw } from "lucide-react";
import { Modal, Btn, Seg, toast, Busy } from "./ui";
import { applySpeed } from "./api";

/* ------------------------------------------------------------------------------------------------
 * Azy · Speed window
 *
 * Always opens at 100 % (the rule from the Azy spec). Selected speed only affects the keys the user
 * actually selected in Premiere — the UI never claims more than that. The end calculation is
 * always visible as a two-line hint.
 * ---------------------------------------------------------------------------------------------- */

const QUICK = [25, 50, 75, 100, 150, 200];

export default function SpeedWindow({ onClose }: { onClose: () => void }) {
  const [pct, setPct] = useState(100);           // always 100 on open
  const [scope, setScope] = useState<"selected" | "clip">("selected");
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => { input.current?.focus(); input.current?.select(); }, 60);
    return () => clearTimeout(t);
  }, []);

  const p = Math.min(1000, Math.max(1, Number(pct) || 100));
  const factor = p / 100;
  const hint = useMemo(() => {
    if (factor === 1) return ["100 % leaves every keyframe where it is."];
    return [
      `Every selected key moves ${factor < 1 ? "closer together" : "further apart"} by ${Math.abs(100 - p).toFixed(0)} %.`,
      `Heading ${factor < 1 ? "slower" : "faster"}: the end of the animation lands at ${factor < 1 ? "a shorter" : "a longer"} time — the value of each key never changes.`,
    ];
  }, [p, factor]);

  const apply = async () => {
    setBusy(true);
    const r = await applySpeed(p, scope);
    setBusy(false);
    if (r.ok) {
      toast(`Speed ${p} % applied`, r.msg || "One undoable change in Premiere.", "ok");
      onClose();                       // closes instantly, the toast carries the result
    } else {
      toast("Speed was not applied", r.msg, "err");
    }
  };

  return (
    <Modal
      title="Azy Speed"
      subtitle="Retimes keyframe animation in Premiere"
      icon={<Gauge size={16} />}
      onClose={onClose}
      footer={
        <>
          <Btn onClick={() => { setPct(100); toast("Regenerated", "Back to 100 % — nothing was sent to Premiere.", "info", 1600); }} icon={<RotateCcw size={12} />}>
            Regenerate
          </Btn>
          <Btn variant="accent" onClick={apply} disabled={busy}>{busy ? <Busy text="Applying…" /> : `Apply ${p} %`}</Btn>
        </>
      }
    >
      <div className="az-speed">
        <div className="az-row" style={{ justifyContent: "space-between" }}>
          <Seg
            value={scope}
            items={[{ id: "selected", label: "Selected keys" }, { id: "clip", label: "Whole clip" }]}
            onChange={v => setScope(v)}
          />
          <span className="az-hint">{scope === "selected" ? "Effect Controls selection" : "every key in the clip"}</span>
        </div>

        <div className="big">
          <input
            ref={input}
            type="number"
            min={1}
            max={1000}
            value={pct}
            onChange={e => setPct(e.target.value as unknown as number)}
            onKeyDown={e => {
              if (e.key === "Enter") { e.preventDefault(); apply(); }
              if (e.key === "ArrowUp") { e.preventDefault(); setPct(x => Math.min(1000, Number(x) + 5)); }
              if (e.key === "ArrowDown") { e.preventDefault(); setPct(x => Math.max(1, Number(x) - 5)); }
            }}
            aria-label="Speed percentage"
          />
          <em>%</em>
        </div>

        <div className="quick">
          {QUICK.map(q => <Btn key={q} small on={p === q} onClick={() => setPct(q)}>{q}%</Btn>)}
        </div>

        <div className="lines">
          {hint.map((l, i) => <span key={i}><b>{i === 0 ? "Now" : "Result"}</b> · {l}</span>)}
        </div>

        <span className="az-hint">Enter applies · Esc closes · the window always reopens at 100 %.</span>
      </div>
    </Modal>
  );
}

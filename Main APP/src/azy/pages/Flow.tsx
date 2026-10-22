import React, { useState } from "react";
import { Spline, MoveRight, Play, CornerDownRight, Gauge, Info } from "lucide-react";
import { useAzy } from "../state";
import { applyFlow, moveKeys, EASING_LIST } from "../api";
import { Btn, Chip, Seg, toast, cx, EaseCurve, useKey } from "../ui";

/* ------------------------------------------------------------------------------------------------
 * Flow — easing presets applied to keyframes in one undoable transaction, plus the small
 * "Move selected keyframes → playhead" pill that must stay small.
 * ---------------------------------------------------------------------------------------------- */

type Scope = "clip" | "playhead" | "selected";

export default function Flow({ active, onContext, onOpenSpeed }: { active: boolean; onContext: (s: string) => void; onOpenSpeed: () => void }) {
  const [azy, set] = useAzy();
  const [easing, setEasing] = useState("Smooth");
  const [busy, setBusy] = useState(false);
  const [moving, setMoving] = useState(false);

  React.useEffect(() => { onContext(`${EASING_LIST.length} easings`); }, []);

  const scope = azy.flowScope as Scope;
  const setScope = (v: Scope) => set({ flowScope: v });

  const run = async () => {
    setBusy(true);
    const r = await applyFlow(scope, easing);
    setBusy(false);
    if (r.ok) toast(`“${easing}” applied`, r.msg || `Scope: ${scope}. One undoable change in Premiere.`, "ok");
    else toast("Easing was not applied", r.msg, "err");
  };

  const move = async () => {
    setMoving(true);
    const r = await moveKeys(azy.moveKeysMode);
    setMoving(false);
    if (r.ok) toast("Keyframes moved", r.msg || `To the ${azy.moveKeysMode} of the playhead — values and easing unchanged.`, "ok");
    else toast("Keyframes were not moved", r.msg, "err");
  };

  useKey(e => {
    if (!active) return;
    if (e.key === "Enter" && !e.ctrlKey && !e.metaKey) {
      const t = (e.target as HTMLElement)?.tagName;
      if (!/INPUT|TEXTAREA|SELECT/.test(t)) { e.preventDefault(); run(); }
    }
  }, [active, easing, scope]);

  const SCOPES = [
    { id: "clip" as const, label: "Clip" },
    { id: "playhead" as const, label: "Playhead" },
    { id: "selected" as const, label: "Selected" },
  ];

  return (
    <div className="az-flow">
      <div className="az-flowhead">
        <Seg value={scope} items={SCOPES} onChange={setScope} />
        <span className="az-grow" />
        <button className="az-pilltiny" onClick={move} disabled={moving}
          title="Move the keyframes you selected in Effect Controls to the playhead (Ctrl+Alt+P)">
          <MoveRight size={10} />Keys → playhead
        </button>
        <button className="az-pilltiny" onClick={() => set({ moveKeysMode: azy.moveKeysMode === "start" ? "end" : "start" })}
          title="Where the keys land">
          {azy.moveKeysMode === "start" ? "Start" : "End"}
        </button>
      </div>

      <div className="az-subbar">
        <span className="az-hint">
          {scope === "clip" && "Every keyframe of the selected clips."}
          {scope === "playhead" && "Only the key pair around the playhead, per property."}
          {scope === "selected" && "The keys highlighted in Effect Controls — ambiguous results are blocked, never guessed."}
        </span>
        <span className="az-grow" />
        <span className="az-hint">{moving ? "Moving…" : "Ctrl+Alt+P moves keys"}</span>
      </div>

      <div className="az-easings">
        {EASING_LIST.map(n => (
          <button key={n} className={cx("az-ease", easing === n && "on")} onClick={() => setEasing(n)} title={`${n} easing`}>
            <EaseCurve name={n} />
            {n}
          </button>
        ))}
      </div>

      <div className="az-row" style={{ gap: 6 }}>
        <Btn variant="accent" onClick={run} disabled={busy} icon={<Spline size={12} />} style={{ flex: 1, height: 30 }}>
          {busy ? "Applying…" : `Apply “${easing}” to ${scope === "selected" ? "selected keys" : scope === "playhead" ? "the playhead pair" : "the clip"}`}
        </Btn>
        <Btn onClick={onOpenSpeed} icon={<Gauge size={12} />} title="Open the Speed window (Shift+Alt+S)">Speed</Btn>
      </div>

      <span className="az-hint" style={{ display: "flex", gap: 5, alignItems: "center" }}>
        <Info size={11} /> One undoable step in Premiere. Values, spacing and unselected keys are never changed.
      </span>
    </div>
  );
}

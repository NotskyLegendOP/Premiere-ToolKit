import React, { useEffect, useState } from "react";
import { Captions as CapIcon, Download, Activity } from "lucide-react";
import General from "../../General";
import Downloader from "../../Downloader";
import Graph from "../../Graph";
import { useTheme } from "../theme";
import { Busy } from "../ui";

/* ------------------------------------------------------------------------------------------------
 * The Toolbox's own tools, kept exactly as they were and simply framed by the Azy shell.
 * Nothing inside these panes was rewritten — only the surrounding layout changed.
 * ---------------------------------------------------------------------------------------------- */

const META = {
  captions: { title: "Captions & Basic", hint: "Word captions from a voice-over · the Basic actions the panel already had", icon: <CapIcon size={11} /> },
  download: { title: "Downloader", hint: "yt-dlp + ffmpeg · auto-import into the open Premiere project", icon: <Download size={11} /> },
  graph: { title: "Graph", hint: "Easing curve editor and keyframe tools", icon: <Activity size={11} /> },
} as const;

export default function Tools({ which, onContext }: { which: keyof typeof META; onContext: (s: string) => void }) {
  const [theme, setTheme] = useTheme();
  const [busy, setBusy] = useState(false);
  const m = META[which];

  useEffect(() => { onContext(m.hint); }, [which]);

  return (
    <>
      <div className="az-subbar" style={{ flex: "none" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--az-text-2)", fontWeight: 650 }}>
          {m.icon}{m.title}
        </span>
        <span className="az-grow" />
        {busy ? <Busy text="Working…" /> : <span className="az-hint" title={m.hint}>{m.hint}</span>}
      </div>
      <div className="az-legacy">
        {which === "captions" && <General theme={theme} setTheme={setTheme} />}
        {which === "download" && <Downloader onBusy={setBusy} />}
        {which === "graph" && <Graph />}
      </div>
    </>
  );
}

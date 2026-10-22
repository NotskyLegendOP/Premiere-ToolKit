import React, { useState } from "react";
import Captions from "./Captions";
import Basic from "./Basic";
import { QuickStyle } from "./QuickStyle";
import type { Theme } from "./Settings";
type Tab = "caption" | "basic";
export default function General({ theme, setTheme }: { theme: Theme; setTheme: (t: Theme) => void }) {
  const [tab, setTab] = useState<Tab>(() => (localStorage.getItem("gen.tab") === "basic" ? "basic" : "caption"));
  const go = (t: Tab) => { setTab(t); localStorage.setItem("gen.tab", t); };
  return (
    <div className="gen"><div className="genin">
      <div className="gtop">
        <div className="gtabs">{([["caption", "Caption"], ["basic", "Basic"]] as [Tab, string][]).map(([id, n]) => <button key={id} className={tab === id ? "on" : ""} onClick={() => go(id)}>{n}</button>)}</div>
        <QuickStyle theme={theme} setTheme={setTheme} mode="general" />
      </div>
      {/* Both stay mounted so a half-made caption is not lost when you switch tabs. */}
      <div style={{ display: tab === "caption" ? undefined : "none" }}><Captions /></div>
      <div style={{ display: tab === "basic" ? undefined : "none" }}><Basic /></div>
    </div></div>
  );
}

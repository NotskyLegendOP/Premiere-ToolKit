import React from "react";
// Flat monochrome icon tile (no colours). `hue` is accepted only so old call sites keep working.
export function Ico3D({ s = 30, children }: { hue?: number; s?: number; children: React.ReactNode }) {
  return <span className="i3" style={{ width: s, height: s }}>{children}</span>;
}

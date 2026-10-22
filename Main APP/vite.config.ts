import { defineConfig } from "vite";

/*
 * The Azy layout is reviewed in a browser (demo media) and in the packaged Tauri app.
 * The dev/preview server therefore binds all interfaces and accepts the sandbox preview host,
 * so the workspace can be opened from the preview URL as well as from localhost.
 */
export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: false,
    allowedHosts: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
    allowedHosts: true,
  },
  clearScreen: false,
});

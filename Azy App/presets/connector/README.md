# Azy for Premiere Pro — Connector

This folder is the complete deployable **Azy Premiere CEP Connector** bundled with **Azy v1.0.0**. It is included so the connector can be inspected, recovered, or copied manually if Azy's normal installer/Repair action reports a problem.

## Normal installation

Use `Azy-Setup-v1.0.exe` whenever possible. It copies this exact folder to the current user's Adobe CEP extensions directory and enables the per-user Adobe CEP debug flag required for the bundled connector. Starting Azy also checks and repairs the copy when needed.

No separate Node.js install, cloud account, or network service is needed. The Connector communicates only with the local Azy bridge on the same computer.

## Manual recovery

1. Close Adobe Premiere Pro.
2. Copy this **entire folder**, retaining its name, to:

   ```text
   %APPDATA%\Adobe\CEP\extensions\com.azy.premiere.connector\
   ```

   The installed folder must contain `CSXS\manifest.xml`, `host\azy.jsx`, `index.html`, and `index.js` directly beneath it.
3. Start Azy once and use its Premiere module **Repair** action if it is offered. That verifies the files and sets the per-user `PlayerDebugMode` setting for compatible Adobe CEP runtimes.
4. Restart Premiere Pro, then open **Window → Extensions → Azy**.

If Azy does not appear, see the main Azy v1.0 README for the full troubleshooting sequence. Do not copy this folder into a system-wide Adobe location or overwrite unrelated extensions.

## Contents

- `CSXS/manifest.xml` — Adobe CEP registration and Premiere compatibility declaration.
- `index.html` and `index.js` — panel user interface and local authenticated bridge client.
- `host/azy.jsx` — Premiere ExtendScript host bridge.
- `icons/` — panel icons.

The connector supports Premiere Pro 2023 (23.0) and later according to its manifest. Its files are part of the Azy v1.0.0 release and should be kept together.

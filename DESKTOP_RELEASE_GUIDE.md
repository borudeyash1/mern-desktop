# Desktop Release Guide

This repository packages any MERN (or generic web) application located under `Project/` into a desktop build plus a professional Windows installer. Follow the steps below whenever you want to ship a new desktop release.

## 1. Prerequisites

1. **Runtime tooling**
   - Node.js 18+ and npm
   - Git (to clone/copy your web application)
2. **Packaging utilities**
   - [Inno Setup 6](https://jrsoftware.org/isinfo.php) (installed to the default location so `ISCC.exe` is available)
   - Windows PowerShell (built-in) for ZIP extraction
3. **This repository cloned on your machine**

## 2. Add or replace the web application

1. Copy or clone your web app into `Project/<YourAppName>`.
2. Ensure the app can build its production bundle into a folder (e.g., `build/`).
3. Note the relative path from the repo root to the project you just added; you will reference it in the config.

## 3. Configure `saarthi.config.json`

Update the JSON file so the metadata matches the app you are packaging.

| Field | Description |
| --- | --- |
| `name` | Product name used in ZIP/installer filenames and shortcut labels. |
| `version` | Semantic version (`major.minor.patch`). This drives `*-Setup-<version>.exe`. |
| `description` | Human-readable summary shown in installers/logs. |
| `author` | Publisher name used by Inno Setup. |
| `frontend.dir` | Relative path to your web project directory (e.g., `"Project/Project-Management"`). |
| `frontend.buildCommand` (optional) | Command to run if you enable `--build-frontend`. |
| `frontend.outputDir` | Directory where the web build emits static assets (default `build`). |
| `frontend.deployedUrl` | Public URL fallback if you are serving a hosted build instead of local files. |
| `platforms` / `architectures` | Targets you want to build (default: `windows`, `macos`, `linux` / `x64`). |
| `desktop.*` | Electron entry points and window sizing (keep defaults unless you change Electron files). |
| `build.outputDir` | Destination folder for generated artifacts (default `dist`). |

> Tip: you can maintain multiple config files (e.g., `clientA.config.json`, `clientB.config.json`) and pass the desired one via `--config` when building.

## 4. Build the portable desktop package

From the repo root, run:

```powershell
node .\bin\mernpkg.js build --config .\saarthi.config.json --platforms windows --arch x64 --ci-mode
```

- The CLI reads the config via `loadConfig` and produces a portable ZIP in `dist/<name>-<version>-win-x64-portable.zip`.
- Include `--build-frontend` if you want the tool to run your frontend build script first.

## 5. Create the professional Windows installer

Run the bundled automation script:

```powershell
.\create-exe-installer.bat
```

What the script does automatically:

1. Loads `name`, `version`, `author`, `frontend.dir`, and `frontend.deployedUrl` from `saarthi.config.json`.
2. Runs the build command above (so you can skip step 4 if you start here).
3. Extracts the portable ZIP into a staging folder and wires up launchers/icon files.
4. Calls Inno Setup with dynamic `/dMyApp*` overrides so the installer metadata matches your config values.
5. Outputs `%name%-Setup-%version%.exe` to `dist/`.

If you change the config, simply rerun the BAT file and it will rebuild with the new metadata.

## 6. Distribute the artifacts

- **Portable ZIP:** `dist/<name>-<version>-win-x64-portable.zip`
- **Installer:** `dist/<name>-Setup-<version>.exe`
- **Manifest:** `dist/release.json` (created by the orchestrator)

Share either artifact with end users. The installer registers Start Menu/desktop shortcuts, while the portable ZIP can run without installation.

## 7. Reusing the pipeline for another web app

1. Replace/clone the new web app into `Project/<NewApp>`.
2. Update `saarthi.config.json` (or create a new config) with:
   - `name`, `version`, `author`, `description`
   - `frontend.dir` pointing to `Project/<NewApp>`
   - `frontend.outputDir` pointing to that app’s production build folder
3. Run the build + installer commands shown above.

Because the automation pulls everything from the JSON config, no script edits are needed when you switch apps—just update the config (and optionally your icon assets) before running the commands.

## 8. Troubleshooting

| Symptom | Fix |
| --- | --- |
| `Config must include name and version` | Ensure `name` and `version` exist in the JSON file. |
| `Portable build not found` | Confirm the `node bin/mernpkg.js build ...` step succeeded and `build.outputDir` points to `dist`. |
| Inno Setup not found | Install Inno Setup 6 or update `create-exe-installer.bat` with your custom path. |

## 9. Optional enhancements

- Add custom icons to `logo_only.ico` / `saarthi-icon.ico` before running the installer script.
- Provide per-app config files and pass them to both the build command and the BAT script (`node ... --config myapp.config.json` and edit the BAT default path or duplicate the BAT file).
- Extend `create-exe-installer.bat` to run `npm install && npm run build` inside the frontend directory for completely automated builds.

With these steps, any web application dropped into `Project/` can be turned into a desktop app plus a Windows installer in minutes.

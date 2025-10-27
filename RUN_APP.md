# How to Run Your Packaged Saarthi Desktop App

## Quick Start

### 1. Extract the Package

```powershell
cd d:\YASH\mernpkg\dist
Expand-Archive saarthi-1.0.0-win-x64-portable.zip -DestinationPath saarthi-app -Force
```

### 2. Navigate to the App

```powershell
cd saarthi-app\saarthi
```

### 3. Install Electron (First Time Only)

```powershell
npm install electron --save-dev
```

### 4. Run the App

```powershell
npx electron .
```

## One-Line Commands

### Extract and Run (PowerShell)

```powershell
cd d:\YASH\mernpkg\dist
Expand-Archive saarthi-1.0.0-win-x64-portable.zip -DestinationPath saarthi-app -Force
cd saarthi-app\saarthi
npm install electron --save-dev
npx electron .
```

## Create a Shortcut

### Option 1: Create a Batch File

Create `run-saarthi.bat` in the extracted folder:

```batch
@echo off
cd /d "%~dp0"
npx electron .
```

Then double-click `run-saarthi.bat` to run the app.

### Option 2: Create a PowerShell Script

Create `run-saarthi.ps1`:

```powershell
Set-Location $PSScriptRoot
npx electron .
```

Run with: `powershell -ExecutionPolicy Bypass -File run-saarthi.ps1`

## What's Inside the Package

```
saarthi/
├── main.js              # Electron main process (window management)
├── preload.js           # Electron preload script (security bridge)
├── package.json         # App metadata
├── build/               # Your React app
│   ├── index.html       # Entry point
│   ├── static/
│   │   ├── css/         # Stylesheets
│   │   └── js/          # JavaScript bundles
│   └── asset-manifest.json
└── node_modules/        # Electron (after npm install)
```

## Troubleshooting

### "Cannot find module 'electron'"

**Solution**: Install Electron in the app directory:
```powershell
cd saarthi-app\saarthi
npm install electron --save-dev
```

### "ERR_FILE_NOT_FOUND" when loading

**Solution**: The main.js file has the correct path now. If you extracted an old version, rebuild:
```powershell
cd d:\YASH\mernpkg
node bin/mernpkg.js build --config saarthi.config.json --platforms windows --arch x64
```

### Window opens but shows blank screen

**Possible causes**:
1. Frontend build is missing - rebuild your React app first
2. Check Electron DevTools (press F12 in the app window) for errors

### Cache errors in console

These are normal and can be ignored:
```
ERROR:disk_cache.cc - Unable to create cache
```

## Distribution

To distribute your app to others:

1. **Give them the ZIP file**: `saarthi-1.0.0-win-x64-portable.zip`

2. **Include instructions**:
   - Extract the ZIP
   - Run `npm install electron --save-dev` (first time only)
   - Run `npx electron .`

3. **Or create a ready-to-run package**:
   - Extract the ZIP
   - Run `npm install electron --save-dev`
   - Include the `node_modules` folder
   - Create a `run.bat` file
   - Zip everything back up

## Advanced: Create Desktop Shortcut

1. Right-click on Desktop → New → Shortcut
2. Location: `C:\Windows\System32\cmd.exe /c "cd /d D:\YASH\mernpkg\dist\saarthi-app\saarthi && npx electron ."`
3. Name: `Saarthi`
4. Change icon (optional): Right-click → Properties → Change Icon

## Next Steps

### Add an Application Icon

1. Create an icon file (`.ico` for Windows)
2. Update `saarthi.config.json`:
   ```json
   {
     "desktop": {
       "icon": "./assets/icon.ico"
     }
   }
   ```
3. Rebuild the package

### Create an Installer (Phase 3)

For a professional installer (.exe), you'll need to:
1. Install Visual Studio Build Tools
2. Use electron-builder (full version)
3. This creates a one-click installer

But the portable ZIP works great for now! 🎉

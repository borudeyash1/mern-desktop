# Saarthi Desktop App - Complete Guide

## 🎯 Two Ways to Run Your Desktop App

### Option 1: Web Version (Recommended - Works Now!)

This loads your web app (localhost:3000) in a professional desktop window.

#### Step 1: Start Your Web Server

```powershell
cd "d:\YASH\Project Management\server"
npm start
```

Keep this running in one terminal.

#### Step 2: Start Your React App

```powershell
cd "d:\YASH\Project Management\client"
npm start
```

This should open at `http://localhost:3000`. Keep this running too.

#### Step 3: Build Desktop App

```powershell
cd d:\YASH\mernpkg
node bin/mernpkg.js build --config saarthi-web.config.json --platforms windows --arch x64
```

#### Step 4: Extract and Run

```powershell
cd dist
Expand-Archive saarthi-1.0.0-win-x64-portable.zip -DestinationPath saarthi-desktop -Force
cd saarthi-desktop\saarthi
npm install electron --save-dev
npx electron .
```

**Result**: Beautiful desktop window with your full Saarthi app! 🎉

---

### Option 2: Standalone Version (For Distribution)

This bundles your React build into the app (no server needed).

#### Prerequisites

Your React app needs to be built with relative paths. Update `client/package.json`:

```json
{
  "homepage": ".",
  "build": {
    "...": "..."
  }
}
```

Then rebuild:

```powershell
cd "d:\YASH\Project Management\client"
npm run build
```

#### Build Desktop App

```powershell
cd d:\YASH\mernpkg
node bin/mernpkg.js build --config saarthi.config.json --platforms windows --arch x64
```

---

## 🎨 Features of Your Desktop App

### Professional UI (Like Asana/Notion)

✅ **Native Menus**
- File menu with Refresh and Exit
- Edit menu with Undo, Redo, Cut, Copy, Paste
- View menu with Zoom, DevTools, Fullscreen
- Window menu with Minimize, Maximize, Close
- Help menu

✅ **Window Management**
- Minimum size: 1000x600
- Default size: 1400x900
- Resizable and maximizable
- Smooth show animation

✅ **External Link Handling**
- Opens external links in default browser
- Keeps app secure

✅ **Keyboard Shortcuts**
- `Ctrl+R` - Refresh
- `Ctrl+Q` - Quit
- `Ctrl+Z` - Undo
- `Ctrl+C` - Copy
- `Ctrl+V` - Paste
- `F11` - Fullscreen
- `Ctrl+Plus` - Zoom in
- `Ctrl+Minus` - Zoom out

✅ **Developer Tools**
- Press `F12` to open DevTools
- Debug your app easily

### Electron APIs Available

Your React app can access these via `window.electronAPI`:

```javascript
// Check if running in Electron
if (window.electronAPI?.isElectron) {
  console.log('Running in desktop app!');
}

// Get app version
const version = await window.electronAPI.getAppVersion();

// Get app data path
const dataPath = await window.electronAPI.getAppPath();

// Show notification
window.electronAPI.showNotification('Hello', 'Desktop app is ready!');

// Platform info
console.log('Platform:', window.electronAPI.platform);
console.log('Versions:', window.electronAPI.versions);
```

---

## 📦 Quick Commands

### Build Web Version (Fastest)

```powershell
# Make sure your web app is running on localhost:3000
node bin/mernpkg.js build --config saarthi-web.config.json --platforms windows --arch x64
```

### Build Standalone Version

```powershell
node bin/mernpkg.js build --config saarthi.config.json --platforms windows --arch x64
```

### Build for All Platforms

```powershell
node bin/mernpkg.js build --config saarthi-web.config.json
```

### Extract and Run

```powershell
cd dist
Expand-Archive saarthi-1.0.0-win-x64-portable.zip -DestinationPath app -Force
cd app\saarthi
npm install electron --save-dev
npx electron .
```

---

## 🚀 Distribution

### For Internal Use (Web Version)

1. Give users the ZIP file
2. Tell them to:
   - Extract it
   - Run `npm install electron --save-dev`
   - Run `npx electron .`
3. They need your server running (localhost:3000)

### For External Distribution (Standalone)

1. Build with `saarthi.config.json`
2. Make sure React build uses relative paths
3. Give users the ZIP file
4. No server needed!

---

## 🎨 Customization

### Change Window Size

Edit `saarthi-web.config.json`:

```json
{
  "desktop": {
    "width": 1600,
    "height": 1000
  }
}
```

### Add App Icon

1. Create an icon file: `icon.png` (256x256 or larger)
2. Place it in your project root
3. Update config:

```json
{
  "desktop": {
    "icon": "./icon.png"
  }
}
```

### Change Deployed URL

Edit `saarthi-web.config.json`:

```json
{
  "frontend": {
    "deployedUrl": "https://your-production-url.com"
  }
}
```

### Customize Menus

Edit `src/orchestrator.js` in the `createMenu()` function to add your own menu items.

---

## 🐛 Troubleshooting

### Blank Window

**Cause**: Web server not running or wrong URL

**Solution**:
1. Make sure your React app is running on `http://localhost:3000`
2. Check the URL in `saarthi-web.config.json`
3. Press `F12` in the app to see console errors

### "Cannot find module 'electron'"

**Solution**:
```powershell
cd saarthi-desktop\saarthi
npm install electron --save-dev
```

### App Won't Start

**Solution**:
1. Check if port 3000 is in use
2. Try rebuilding: `node bin/mernpkg.js build --config saarthi-web.config.json --platforms windows --arch x64`
3. Check console for errors

### External Links Don't Work

**Solution**: They should open in your default browser. If not, check the `setWindowOpenHandler` in main.js.

---

## 📊 Comparison: Web vs Standalone

| Feature | Web Version | Standalone Version |
|---------|-------------|-------------------|
| Setup | Easy | Requires React build config |
| Server needed | Yes (localhost:3000) | No |
| File size | ~2 KB | ~600 KB |
| Updates | Automatic (refresh) | Need to rebuild |
| Distribution | Internal only | Can distribute anywhere |
| Best for | Development & internal use | Production & external users |

---

## 🎯 Recommended Workflow

### During Development

Use **Web Version**:
```powershell
node bin/mernpkg.js build --config saarthi-web.config.json --platforms windows --arch x64
```

Benefits:
- Instant updates (just refresh)
- Full hot-reload
- Easy debugging

### For Production

Use **Standalone Version**:
```powershell
node bin/mernpkg.js build --config saarthi.config.json --platforms windows --arch x64
```

Benefits:
- No server needed
- Can distribute to anyone
- Fully offline

---

## 🎉 Your Desktop App Features

✅ Professional native menus
✅ Keyboard shortcuts
✅ Window management
✅ External link handling
✅ Developer tools
✅ Smooth animations
✅ Secure by default
✅ Cross-platform ready

**Your Saarthi app now looks and feels like Asana, Notion, or Slack!** 🚀

---

## Next Steps

1. **Try the web version first** (easiest)
2. **Customize the menus** to match your app
3. **Add an app icon** for branding
4. **Test on different platforms** (macOS, Linux)
5. **Create installers** (Phase 3 - optional)

Need help? Check the console (F12) for errors or review the main.js file for customization options.

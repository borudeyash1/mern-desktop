# 🚀 Quick Run - Saarthi Desktop App

## Fastest Way to Run (3 Steps)

### 1️⃣ Start Your Web App

Open **TWO** terminals:

**Terminal 1 - Server:**
```powershell
cd "d:\YASH\Project Management\server"
npm start
```

**Terminal 2 - Client:**
```powershell
cd "d:\YASH\Project Management\client"
npm start
```

Wait until you see: `Compiled successfully!` and browser opens at `http://localhost:3000`

### 2️⃣ Build Desktop App (If Not Already Built)

```powershell
cd d:\YASH\mernpkg
node bin/mernpkg.js build --config saarthi-web.config.json --platforms windows --arch x64
```

### 3️⃣ Run Desktop App

**Option A: Use Batch File (Easiest)**
```powershell
cd d:\YASH\mernpkg
.\run-saarthi-desktop.bat
```

**Option B: Manual**
```powershell
cd d:\YASH\mernpkg\dist
Expand-Archive saarthi-1.0.0-win-x64-portable.zip -DestinationPath saarthi-web -Force
cd saarthi-web\saarthi
npm install electron --save-dev
npx electron .
```

---

## ✨ What You'll See

A professional desktop window with:
- ✅ Native menus (File, Edit, View, Window, Help)
- ✅ Your full Saarthi app loaded
- ✅ Keyboard shortcuts (Ctrl+R to refresh, etc.)
- ✅ Smooth window management
- ✅ Professional look like Asana/Notion

---

## 🎯 Features

### Menus
- **File**: Refresh, Exit
- **Edit**: Undo, Redo, Cut, Copy, Paste, Select All
- **View**: Reload, DevTools, Zoom, Fullscreen
- **Window**: Minimize, Maximize, Close
- **Help**: Learn More

### Keyboard Shortcuts
- `Ctrl+R` - Refresh app
- `Ctrl+Q` - Quit
- `F12` - Open DevTools
- `F11` - Fullscreen
- `Ctrl+Plus/Minus` - Zoom

### Window Features
- Minimum size: 1000x600
- Default size: 1400x900
- Resizable and maximizable
- Opens external links in browser

---

## 🐛 Troubleshooting

### Blank Window?

**Check:**
1. Is your React app running on `http://localhost:3000`?
2. Open DevTools (F12) to see errors
3. Try refreshing (Ctrl+R)

**Fix:**
```powershell
# Make sure both are running:
cd "d:\YASH\Project Management\server"
npm start

# In another terminal:
cd "d:\YASH\Project Management\client"
npm start
```

### Can't Find Electron?

```powershell
cd d:\YASH\mernpkg\dist\saarthi-web\saarthi
npm install electron --save-dev
```

### Port Already in Use?

Change the port in `saarthi-web.config.json`:
```json
{
  "frontend": {
    "deployedUrl": "http://localhost:3001"
  }
}
```

Then rebuild and run.

---

## 📝 Notes

- **Keep web server running** while using the desktop app
- The app is just a wrapper around your web app
- All changes in your React code will show up after refresh (Ctrl+R)
- Perfect for development and internal use!

---

## 🎉 Success!

If you see your Saarthi app in a desktop window with menus, **you're done!** 

The app now works exactly like Asana, Notion, or Slack desktop apps! 🚀

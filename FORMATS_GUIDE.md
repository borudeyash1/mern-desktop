# mernpkg Formats Guide

## 📦 Two Build Formats

### 1. Portable Format (Default)
**Creates:** ZIP/TAR.GZ archives

```powershell
node bin/mernpkg.js build --config ./mernpkg.config.json
# or explicitly:
node bin/mernpkg.js build --config ./mernpkg.config.json --formats portable
```

**Output:**
- Windows: `app-1.0.0-win-x64-portable.zip`
- macOS: `app-1.0.0-mac-x64.zip`
- Linux: `app-1.0.0-linux-x64.tar.gz`

**Requirements:**
- ✅ Node.js 18+
- ✅ npm
- ✅ That's it!

**Best for:**
- Development
- Testing
- Internal distribution
- Quick iterations

### 2. Installer Format
**Creates:** Professional installers

```powershell
node bin/mernpkg.js build --config ./mernpkg.config.json --formats installer
```

**Output:**
- Windows: `app-Setup-1.0.0.exe` (NSIS installer)
- macOS: `app-1.0.0.dmg` (DMG image)
- Linux: `app-1.0.0.AppImage` + `app_1.0.0_amd64.deb`

**Requirements:**

**Windows:**
- Node.js 18+
- Visual Studio Build Tools 2022
  - Download: https://visualstudio.microsoft.com/downloads/
  - Select: "Desktop development with C++"

**macOS:**
- Node.js 18+
- Xcode Command Line Tools: `xcode-select --install`

**Linux:**
- Node.js 18+
- dpkg: `sudo apt install dpkg`

**Best for:**
- Production
- External distribution
- Professional deployment
- End users

---

## 🎯 Quick Commands

### Portable (ZIP)

```powershell
# All platforms
node bin/mernpkg.js build --config ./mernpkg.config.json

# Windows only
node bin/mernpkg.js build --config ./mernpkg.config.json --platforms windows

# Test first (dry-run)
node bin/mernpkg.js build --config ./mernpkg.config.json --dry-run
```

### Installer (EXE/DMG/DEB)

```powershell
# All platforms (requires build tools!)
node bin/mernpkg.js build --config ./mernpkg.config.json --formats installer

# Windows installer only
node bin/mernpkg.js build --config ./mernpkg.config.json --formats installer --platforms windows

# Test first (dry-run)
node bin/mernpkg.js build --config ./mernpkg.config.json --formats installer --dry-run
```

---

## 📊 Detailed Comparison

| Feature | Portable | Installer |
|---------|----------|-----------|
| **Build Time** | 5-10 seconds | 2-5 minutes |
| **File Size** | 2-3 KB | 60-70 MB |
| **Build Tools** | None | Required |
| **Installation** | Extract ZIP | One-click install |
| **Desktop Shortcut** | No | Yes |
| **Start Menu** | No | Yes (Windows) |
| **Uninstaller** | No | Yes |
| **Auto-Update** | No | Yes (future) |
| **Code Signing** | No | Yes |
| **Professional Look** | No | Yes |
| **User Experience** | Manual | Automatic |

---

## 🚀 For Saarthi Project

### Development (Portable)

```powershell
cd d:\YASH\mernpkg
node bin/mernpkg.js build --config saarthi-web.config.json
```

**Output:** `saarthi-1.0.0-win-x64-portable.zip` (~3KB)

**To run:**
1. Extract ZIP
2. `npm install electron --save-dev`
3. `npx electron .`

### Production (Installer)

```powershell
cd d:\YASH\mernpkg
node bin/mernpkg.js build --config saarthi-web.config.json --formats installer --platforms windows
```

**Output:** `saarthi-Setup-1.0.0.exe` (~60MB)

**To run:**
1. Double-click installer
2. Follow installation wizard
3. Launch from Start Menu or Desktop

---

## 🛠️ Installing Build Tools

### Windows - Visual Studio Build Tools

**Option 1: Visual Studio 2022 (Recommended)**
1. Download: https://visualstudio.microsoft.com/downloads/
2. Run installer
3. Select "Desktop development with C++"
4. Install (requires ~7GB)

**Option 2: Build Tools Only**
1. Download: https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022
2. Run installer
3. Select "Desktop development with C++"
4. Install (requires ~4GB)

**Verify:**
```powershell
# Should show VS version
where cl
```

### macOS - Xcode Tools

```bash
# Install
xcode-select --install

# Verify
xcode-select -p
# Should show: /Library/Developer/CommandLineTools
```

### Linux - Build Tools

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install dpkg rpm build-essential

# Fedora/RHEL
sudo yum install dpkg rpm-build gcc-c++

# Verify
which dpkg
which rpmbuild
```

---

## 🎯 Recommended Workflow

### Phase 1: Development
```powershell
# Use portable for fast iterations
node bin/mernpkg.js build --config ./mernpkg.config.json
```

### Phase 2: Testing
```powershell
# Test installer build (dry-run first)
node bin/mernpkg.js build --config ./mernpkg.config.json --formats installer --dry-run

# If dry-run succeeds, build for real
node bin/mernpkg.js build --config ./mernpkg.config.json --formats installer --platforms windows
```

### Phase 3: Production
```powershell
# Build installers for all platforms
node bin/mernpkg.js build --config ./mernpkg.config.json --formats installer

# With code signing
node bin/mernpkg.js build --config ./mernpkg.config.json --formats installer --sign
```

---

## 🐛 Troubleshooting

### Installer Build Fails

**Error:** "Visual Studio Build Tools not found"

**Solution 1:** Install build tools (see above)

**Solution 2:** Use portable mode instead:
```powershell
node bin/mernpkg.js build --config ./mernpkg.config.json --formats portable
```

**Note:** mernpkg automatically falls back to portable if installer build fails!

### Build is Slow

**Cause:** Installer builds are slower (2-5 minutes)

**Solution:** Use portable mode for development:
```powershell
node bin/mernpkg.js build --config ./mernpkg.config.json
```

### Large File Size

**Cause:** Installers include Electron runtime (~60MB)

**This is normal!** All Electron apps are this size:
- VS Code: ~85MB
- Slack: ~75MB
- Discord: ~70MB

---

## 📦 What Gets Created

### Portable Build

```
dist/
├── saarthi-1.0.0-win-x64-portable.zip    (3 KB)
└── release.json                           (442 bytes)
```

**Inside ZIP:**
```
saarthi/
├── main.js
├── preload.js
├── package.json
└── build/
    └── (your React app)
```

### Installer Build

```
dist/
├── saarthi-Setup-1.0.0.exe               (60 MB)
├── saarthi-Setup-1.0.0.exe.blockmap      (metadata)
└── release.json                           (442 bytes)
```

**Installer includes:**
- Electron runtime
- Your app files
- Installation wizard
- Uninstaller
- Desktop shortcut
- Start menu entry

---

## ✅ Quick Decision Guide

**Use Portable if:**
- ✅ You're developing
- ✅ You want fast builds
- ✅ You don't have build tools
- ✅ You're distributing internally
- ✅ File size matters

**Use Installer if:**
- ✅ You're deploying to production
- ✅ You want professional installers
- ✅ You have build tools installed
- ✅ You're distributing externally
- ✅ User experience matters

---

## 🎉 Summary

**For Saarthi:**
- **Development:** Use portable
- **Production:** Use installer

**Commands:**
```powershell
# Development (fast, no tools needed)
node bin/mernpkg.js build --config saarthi-web.config.json

# Production (professional, requires VS Build Tools)
node bin/mernpkg.js build --config saarthi-web.config.json --formats installer
```

Both formats work perfectly - choose based on your needs! 🚀

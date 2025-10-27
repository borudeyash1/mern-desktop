# mernpkg - Complete Guide for Any MERN Project

## 🎯 Overview

**mernpkg** is a standalone tool that converts any MERN web application into professional desktop applications for Windows, macOS, and Linux.

## 📦 Two Build Modes

### 1. Portable Mode (Default)
- Creates ZIP/TAR.GZ archives
- No installation required
- Extract and run
- **No build tools needed**
- Perfect for development

### 2. Installer Mode
- Creates professional installers
- NSIS (.exe) for Windows
- DMG for macOS
- AppImage + DEB for Linux
- **Requires build tools**
- Perfect for distribution

---

## 🚀 Quick Start for New Projects

### Step 1: Install mernpkg

```powershell
# Clone or copy mernpkg to your machine
cd d:\YASH\mernpkg
npm install
```

### Step 2: Create Configuration

```powershell
# Navigate to your MERN project
cd d:\your-mern-project

# Create config
node d:\YASH\mernpkg\bin\mernpkg.js init
```

Answer the prompts:
- **App name**: my-app
- **Version**: 1.0.0
- **Description**: My MERN Desktop App
- **Platforms**: windows,macos,linux
- **Architectures**: x64
- **Frontend directory**: ./client
- **Build command**: npm run build
- **Output directory**: ./build

This creates `mernpkg.config.json` in your project.

### Step 3: Build Desktop App

#### Option A: Portable (ZIP) - Recommended First

```powershell
node d:\YASH\mernpkg\bin\mernpkg.js build --config d:\your-mern-project\mernpkg.config.json
```

#### Option B: Installer (EXE/DMG/DEB)

```powershell
node d:\YASH\mernpkg\bin\mernpkg.js build --config d:\your-mern-project\mernpkg.config.json --formats installer
```

---

## 📋 Configuration File

### Basic Configuration

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "description": "My MERN Desktop Application",
  "author": "Your Name",
  "platforms": ["windows", "macos", "linux"],
  "architectures": ["x64"],
  "frontend": {
    "dir": "./client",
    "buildCommand": "npm run build",
    "outputDir": "./build"
  },
  "desktop": {
    "width": 1400,
    "height": 900
  },
  "build": {
    "outputDir": "./dist"
  }
}
```

### Web Version (No Local Build)

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "platforms": ["windows"],
  "architectures": ["x64"],
  "frontend": {
    "deployedUrl": "http://localhost:3000"
  },
  "desktop": {
    "width": 1400,
    "height": 900
  }
}
```

### Production Configuration

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "description": "Professional Desktop App",
  "author": "Your Company",
  "platforms": ["windows", "macos", "linux"],
  "architectures": ["x64", "arm64"],
  "frontend": {
    "dir": "./client",
    "buildCommand": "npm run build",
    "outputDir": "./build"
  },
  "desktop": {
    "main": "electron/main.js",
    "preload": "electron/preload.js",
    "icon": "./assets/icon.png",
    "width": 1600,
    "height": 1000
  },
  "build": {
    "outputDir": "./dist",
    "compression": "maximum"
  },
  "signing": {
    "windows": {
      "certificateFile": "./certs/cert.pfx",
      "certificatePassword": "${WINDOWS_CERT_PASSWORD}"
    }
  }
}
```

---

## 🎨 Build Commands

### Basic Commands

```powershell
# Portable ZIP (default)
node d:\YASH\mernpkg\bin\mernpkg.js build --config ./mernpkg.config.json

# Professional installers
node d:\YASH\mernpkg\bin\mernpkg.js build --config ./mernpkg.config.json --formats installer

# Dry run (test without building)
node d:\YASH\mernpkg\bin\mernpkg.js build --config ./mernpkg.config.json --dry-run

# Verbose output
node d:\YASH\mernpkg\bin\mernpkg.js build --config ./mernpkg.config.json --verbose
```

### Platform-Specific

```powershell
# Windows only
node d:\YASH\mernpkg\bin\mernpkg.js build --config ./mernpkg.config.json --platforms windows

# macOS only
node d:\YASH\mernpkg\bin\mernpkg.js build --config ./mernpkg.config.json --platforms macos

# Linux only
node d:\YASH\mernpkg\bin\mernpkg.js build --config ./mernpkg.config.json --platforms linux

# Multiple platforms
node d:\YASH\mernpkg\bin\mernpkg.js build --config ./mernpkg.config.json --platforms windows,macos
```

### Architecture-Specific

```powershell
# x64 only
node d:\YASH\mernpkg\bin\mernpkg.js build --config ./mernpkg.config.json --arch x64

# arm64 only (for Apple Silicon)
node d:\YASH\mernpkg\bin\mernpkg.js build --config ./mernpkg.config.json --arch arm64

# Both
node d:\YASH\mernpkg\bin\mernpkg.js build --config ./mernpkg.config.json --arch x64,arm64
```

---

## 📦 Output Formats

### Portable Mode (Default)

| Platform | Format | File Name | Size |
|----------|--------|-----------|------|
| Windows | ZIP | `app-1.0.0-win-x64-portable.zip` | ~3KB |
| macOS | ZIP | `app-1.0.0-mac-x64.zip` | ~3KB |
| Linux | TAR.GZ | `app-1.0.0-linux-x64.tar.gz` | ~3KB |

**Pros:**
- ✅ No build tools required
- ✅ Fast builds
- ✅ Small file size
- ✅ Works immediately

**Cons:**
- ❌ User needs to extract
- ❌ User needs to install Electron
- ❌ Not professional looking

### Installer Mode

| Platform | Format | File Name | Size |
|----------|--------|-----------|------|
| Windows | NSIS | `app-Setup-1.0.0.exe` | ~60MB |
| macOS | DMG | `app-1.0.0.dmg` | ~65MB |
| Linux | AppImage | `app-1.0.0.AppImage` | ~70MB |
| Linux | DEB | `app_1.0.0_amd64.deb` | ~60MB |

**Pros:**
- ✅ Professional installers
- ✅ One-click install
- ✅ Desktop shortcuts
- ✅ Start menu integration
- ✅ Uninstaller included

**Cons:**
- ❌ Requires build tools
- ❌ Slower builds
- ❌ Larger file size

---

## 🛠️ Build Tool Requirements

### For Portable Mode
- ✅ Node.js 18+
- ✅ npm
- ✅ That's it!

### For Installer Mode

#### Windows
- Node.js 18+
- **Visual Studio Build Tools** or Visual Studio 2022
  - Install from: https://visualstudio.microsoft.com/downloads/
  - Select "Desktop development with C++"

#### macOS
- Node.js 18+
- **Xcode Command Line Tools**
  ```bash
  xcode-select --install
  ```

#### Linux
- Node.js 18+
- **dpkg** (for .deb)
- **rpmbuild** (for .rpm)
  ```bash
  sudo apt install dpkg rpm
  ```

---

## 🎯 Real-World Examples

### Example 1: E-Commerce App

```json
{
  "name": "my-shop",
  "version": "2.1.0",
  "description": "My E-Commerce Desktop App",
  "platforms": ["windows"],
  "architectures": ["x64"],
  "frontend": {
    "deployedUrl": "https://myshop.com"
  },
  "desktop": {
    "icon": "./assets/shop-icon.png",
    "width": 1600,
    "height": 1000
  }
}
```

**Build:**
```powershell
node d:\YASH\mernpkg\bin\mernpkg.js build --config ./mernpkg.config.json --formats installer
```

### Example 2: Internal Tool

```json
{
  "name": "company-tool",
  "version": "1.0.0",
  "platforms": ["windows"],
  "architectures": ["x64"],
  "frontend": {
    "deployedUrl": "http://internal-server:3000"
  }
}
```

**Build:**
```powershell
node d:\YASH\mernpkg\bin\mernpkg.js build --config ./mernpkg.config.json
```

### Example 3: Offline App

```json
{
  "name": "offline-app",
  "version": "1.0.0",
  "platforms": ["windows", "macos", "linux"],
  "architectures": ["x64"],
  "frontend": {
    "dir": "./client",
    "buildCommand": "npm run build",
    "outputDir": "./build"
  }
}
```

**Build:**
```powershell
# First build your React app
cd client
npm run build
cd ..

# Then build desktop app
node d:\YASH\mernpkg\bin\mernpkg.js build --config ./mernpkg.config.json --formats installer
```

---

## 🔧 Advanced Features

### Custom Electron Files

Create custom `electron/main.js` and `electron/preload.js` in your project:

```javascript
// electron/main.js
const { app, BrowserWindow } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  
  win.loadURL('http://localhost:3000');
}

app.whenReady().then(createWindow);
```

Then in config:
```json
{
  "desktop": {
    "main": "electron/main.js",
    "preload": "electron/preload.js"
  }
}
```

### Code Signing

#### Windows
```json
{
  "signing": {
    "windows": {
      "certificateFile": "./certs/cert.pfx",
      "certificatePassword": "${WINDOWS_CERT_PASSWORD}"
    }
  }
}
```

Build with:
```powershell
$env:WINDOWS_CERT_PASSWORD="your-password"
node d:\YASH\mernpkg\bin\mernpkg.js build --config ./mernpkg.config.json --formats installer --sign
```

#### macOS
```json
{
  "signing": {
    "macos": {
      "identity": "Developer ID Application: Your Name",
      "teamId": "ABCDE12345",
      "notarize": true
    }
  }
}
```

---

## 📊 Comparison Table

| Feature | Portable | Installer |
|---------|----------|-----------|
| Build time | ~5 seconds | ~2-5 minutes |
| File size | ~3KB | ~60MB |
| Build tools | None | Required |
| Installation | Manual extract | One-click |
| Desktop shortcut | No | Yes |
| Uninstaller | No | Yes |
| Professional | No | Yes |
| Best for | Development | Production |

---

## 🐛 Troubleshooting

### "Cannot find module 'electron-builder'"

**Solution:**
```powershell
cd d:\YASH\mernpkg
npm install
```

### "Visual Studio Build Tools not found"

**Solution:** Install Visual Studio Build Tools or use portable mode:
```powershell
node d:\YASH\mernpkg\bin\mernpkg.js build --config ./mernpkg.config.json --formats portable
```

### "Frontend build not found"

**Solution:** Build your React app first:
```powershell
cd your-project/client
npm run build
cd ../..
node d:\YASH\mernpkg\bin\mernpkg.js build --config ./your-project/mernpkg.config.json
```

### Installer build fails, falls back to ZIP

This is normal! If electron-builder fails, mernpkg automatically creates a portable ZIP instead.

---

## 🎉 Success Checklist

For any new MERN project:

- [ ] Create `mernpkg.config.json`
- [ ] Test with dry-run
- [ ] Build portable version first
- [ ] Test the portable app
- [ ] If needed, install build tools
- [ ] Build installer version
- [ ] Test the installer
- [ ] Distribute!

---

## 📚 Next Steps

1. **Start with portable mode** - fastest and easiest
2. **Test thoroughly** - make sure your app works
3. **Add custom icon** - make it professional
4. **Install build tools** - for installers
5. **Build installers** - for distribution
6. **Add code signing** - for production

---

## 🚀 You're Ready!

You can now package **any MERN web app** as a desktop application!

**Questions?** Check the other documentation files:
- `README.md` - Full documentation
- `QUICK_START.md` - Quick reference
- `OAUTH_FIX.md` - OAuth integration
- `DESKTOP_APP_GUIDE.md` - Desktop features

Happy packaging! 🎊

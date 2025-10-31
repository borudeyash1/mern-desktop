# 📦 Installing Inno Setup for .exe Creation

## What is Inno Setup?

Inno Setup is the FREE tool used by:
- Microsoft (VS Code)
- Python
- Node.js
- Many professional Windows apps

It creates professional `.exe` installers with:
- ✅ "Next, Next, Finish" wizard
- ✅ Program Files installation
- ✅ Desktop shortcuts
- ✅ Start Menu entries
- ✅ Uninstaller
- ✅ Custom branding

## Installation Steps

### Option 1: Direct Download (Recommended)

1. **Download Inno Setup:**
   - Visit: https://jrsoftware.org/isdl.php
   - Download: `innosetup-6.x.x.exe` (latest version)
   - Size: ~2 MB

2. **Install:**
   - Run the downloaded `.exe`
   - Click "Next, Next, Install"
   - Takes 30 seconds

3. **Verify:**
   - Inno Setup should be in: `C:\Program Files (x86)\Inno Setup 6\`

### Option 2: Using Chocolatey (If you have it)

```powershell
# Run as Administrator
choco install innosetup
```

## After Installation

Come back and run:
```powershell
cd "D:\YASH\MERN DESKTOP"
.\create-exe-installer.bat
```

This will create: `Saarthi-Setup-1.0.0.exe`

## What Users Will Get

1. Download `Saarthi-Setup-1.0.0.exe` (one file)
2. Double-click
3. See professional installer wizard
4. Click "Next, Next, Install"
5. App installs to `C:\Program Files\Saarthi\`
6. Desktop shortcut created
7. Start Menu entry created
8. Launch → Login screen appears!

Just like Microsoft apps! 🚀

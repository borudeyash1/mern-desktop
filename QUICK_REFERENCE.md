# Saarthi Desktop - Quick Reference Guide

## 🚀 Building the Desktop App

### Standard Build Process
```bash
# 1. Build the desktop app
node .\bin\mernpkg.js build --config .\saarthi.config.json --platforms windows --arch x64 --ci-mode

# 2. Apply subdomain authentication fix
node electron-session-fix.patch.cjs

# 3. Create installer
.\create-exe-installer.bat
```

Or simply run all commands from `commands.txt`:
```bash
node .\bin\mernpkg.js build --config .\saarthi.config.json --platforms windows --arch x64 --ci-mode
node electron-session-fix.patch.cjs
.\create-exe-installer.bat
```

---

## 🔒 Removing "Windows Protected Your PC" Warning

### The Problem
Windows shows a SmartScreen warning because the installer is not digitally signed.

### Solutions

#### Option 1: Self-Signed Certificate (Testing Only)
**Quick setup for testing:**
```powershell
# Run as Administrator
powershell -ExecutionPolicy Bypass -File create-test-certificate.ps1
```

This creates `saarthi-cert.pfx` which the build script will automatically use.

⚠️ **Warning**: Self-signed certificates still show warnings on other computers!

#### Option 2: Real Code Signing Certificate (Production)
**For public release, buy a certificate:**

1. **Purchase** from a trusted CA:
   - DigiCert: $474/year - https://www.digicert.com
   - Sectigo: $474/year - https://sectigo.com
   - SSL.com: $249/year - https://www.ssl.com

2. **Verify** your identity (takes 1-7 days)

3. **Receive** certificate file (.pfx)

4. **Save** as `saarthi-cert.pfx` in the mern-desktop folder

5. **Update** password in `create-exe-installer.bat` (line ~187):
   ```batch
   set "CERT_PASSWORD=YourActualPassword"
   ```

6. **Build** - the installer will be automatically signed!

---

## 📦 What Gets Created

After building, you'll find in `dist/`:

1. **saarthi-1.0.2-win-x64-portable.zip** - Portable version (no install needed)
2. **saarthi-Setup-1.0.2.exe** - Professional Windows installer
3. **saarthi-app/** - Extracted app files (with subdomain fix applied)

---

## 🔧 Key Files

| File | Purpose |
|------|---------|
| `saarthi.config.json` | App configuration (version, URLs, etc.) |
| `electron-session-fix.patch.cjs` | Fixes subdomain authentication |
| `create-exe-installer.bat` | Builds Windows installer |
| `create-test-certificate.ps1` | Creates test signing certificate |
| `saarthi-cert.pfx` | Code signing certificate (if exists) |
| `CODE_SIGNING_GUIDE.md` | Detailed signing instructions |

---

## 🐛 Troubleshooting

### "Config must include name and version"
- Delete `saarthi.config.json`
- Run: `node create-config.cjs`

### "Installer is UNSIGNED"
- Create test certificate: `powershell -ExecutionPolicy Bypass -File create-test-certificate.ps1`
- Or buy a real certificate for production

### Subdomain authentication not working
- Make sure you ran: `node electron-session-fix.patch.cjs`
- Check that `dist/saarthi-app/main.js` contains `partition: 'persist:saarthi'`

### Build fails
- Ensure Inno Setup is installed
- Check that Node.js is in PATH
- Verify `saarthi.config.json` has no BOM

---

## 📝 Version Updates

To release a new version:

1. Update version in `saarthi.config.json`:
   ```json
   "version": "1.0.3"
   ```

2. Rebuild:
   ```bash
   node .\bin\mernpkg.js build --config .\saarthi.config.json --platforms windows --arch x64 --ci-mode
   node electron-session-fix.patch.cjs
   .\create-exe-installer.bat
   ```

3. Distribute `dist/saarthi-Setup-1.0.3.exe`

---

## 🌐 Environment Switching

Switch between local and production:

```bash
# Switch to production (sartthi.com)
.\set-env-prod.bat

# Switch to local development (localhost)
.\set-env-local.bat
```

---

## ✅ What's Fixed

### Subdomain Authentication ✓
- Mail.sartthi.com works
- Calendar.sartthi.com works  
- Vault.sartthi.com works
- Session cookies shared across all subdomains

### Professional Installer ✓
- Installs to Program Files
- Creates desktop shortcut
- Adds to Start Menu
- Uninstaller included

### Code Signing (Optional) ⚠️
- Self-signed: For testing only
- Real certificate: Removes all warnings

---

## 📞 Support

For issues:
1. Check `CODE_SIGNING_GUIDE.md` for detailed signing help
2. Verify all files in this guide exist
3. Ensure you ran all build steps in order

---

## 🎯 Production Checklist

Before public release:

- [ ] Buy code signing certificate
- [ ] Update certificate password in build script
- [ ] Test on clean Windows machine
- [ ] Verify subdomain authentication works
- [ ] Check installer shows your company name
- [ ] No SmartScreen warnings
- [ ] Update version number
- [ ] Build and sign installer
- [ ] Test installation on multiple Windows versions

---

**Last Updated**: 2025-11-29
**Current Version**: 1.0.2

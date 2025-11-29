# FREE Solution: Self-Signed Certificate Setup

## For You (Developer)

### Step 1: Create Certificate (One-time)
```powershell
powershell -ExecutionPolicy Bypass -File create-test-certificate.ps1
```

This creates `saarthi-cert.pfx` that will be used to sign your installer.

### Step 2: Export Public Certificate
After creating the certificate, export the public part:

```powershell
# Run this to create the public certificate file
powershell -Command "$cert = Get-ChildItem -Path Cert:\CurrentUser\My | Where-Object {$_.Subject -eq 'CN=Saarthi Desktop'}; Export-Certificate -Cert $cert -FilePath 'saarthi-public-cert.cer'"
```

### Step 3: Build Signed Installer
```bash
node .\bin\mernpkg.js build --config .\saarthi.config.json --platforms windows --arch x64 --ci-mode
node electron-session-fix.patch.cjs
.\create-exe-installer.bat
```

The installer will be automatically signed!

### Step 4: Distribute Both Files
Give users:
1. `saarthi-Setup-1.0.2.exe` (signed installer)
2. `saarthi-public-cert.cer` (certificate to trust)
3. `INSTALL_INSTRUCTIONS.txt` (see below)

---

## For Users (Simple Instructions)

### Option A: Trust the Certificate (Recommended)

**Before installing Saarthi, do this once:**

1. **Right-click** `saarthi-public-cert.cer`
2. Click **"Install Certificate"**
3. Choose **"Local Machine"** → Click **"Next"**
4. Click **"Yes"** when Windows asks for permission
5. Select **"Place all certificates in the following store"**
6. Click **"Browse"** → Choose **"Trusted Root Certification Authorities"**
7. Click **"Next"** → **"Finish"**
8. Click **"OK"**

**Now install Saarthi:**
- Double-click `saarthi-Setup-1.0.2.exe`
- No warnings! ✓

---

### Option B: Just Click "More Info" (Easier, but shows warning)

1. Double-click `saarthi-Setup-1.0.2.exe`
2. Windows shows "Windows protected your PC"
3. Click **"More info"**
4. Click **"Run anyway"**
5. Done!

---

## Why This Works

- **Self-signed certificate** = Free but not trusted by default
- **Installing certificate** = Tells Windows to trust Saarthi
- **One-time setup** = Users only do this once, all future updates work

---

## Limitations

- Users need to either:
  - Install certificate (one-time, removes all warnings)
  - OR click "Run anyway" each time
- Not as seamless as a real certificate
- But 100% FREE!

---

## Alternative: Just Accept the Warning

Many successful apps distribute unsigned installers:
- Users are used to clicking "More info" → "Run anyway"
- After enough downloads, SmartScreen builds reputation
- Eventually warnings reduce automatically

**This is the simplest free solution!**

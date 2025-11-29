# Code Signing Guide for Saarthi Desktop

## Why Code Signing?

Without code signing, Windows shows a "Windows protected your PC" warning because the installer is from an "unknown publisher". Code signing proves the software comes from a verified source.

## Option 1: Purchase a Code Signing Certificate (Production)

### Step 1: Buy a Certificate
Purchase from a trusted Certificate Authority (CA):
- **DigiCert** (Recommended): $474/year - https://www.digicert.com/signing/code-signing-certificates
- **Sectigo**: $474/year - https://sectigo.com/ssl-certificates-tls/code-signing
- **SSL.com**: $249/year - https://www.ssl.com/certificates/code-signing/

### Step 2: Verify Your Identity
The CA will require:
- Company registration documents (if company)
- Government-issued ID
- Phone verification
- Business verification (takes 1-7 days)

### Step 3: Receive Certificate
You'll get a `.pfx` or `.p12` file with a password.

### Step 4: Sign Your Installer

#### Install SignTool (comes with Windows SDK)
Download from: https://developer.microsoft.com/en-us/windows/downloads/windows-sdk/

#### Sign the installer:
```batch
"C:\Program Files (x86)\Windows Kits\10\bin\10.0.22621.0\x64\signtool.exe" sign ^
  /f "path\to\your-certificate.pfx" ^
  /p "certificate-password" ^
  /t http://timestamp.digicert.com ^
  /fd SHA256 ^
  /v ^
  "dist\saarthi-Setup-1.0.2.exe"
```

### Step 5: Verify Signature
```batch
signtool verify /pa /v "dist\saarthi-Setup-1.0.2.exe"
```

---

## Option 2: Self-Signed Certificate (Testing Only)

⚠️ **WARNING**: Self-signed certificates still show warnings on other computers. Only use for internal testing.

### Create Self-Signed Certificate:
```powershell
# Run PowerShell as Administrator
$cert = New-SelfSignedCertificate -Type CodeSigningCert -Subject "CN=Saarthi Desktop" -CertStoreLocation Cert:\CurrentUser\My

# Export certificate
$password = ConvertTo-SecureString -String "YourPassword123" -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath "saarthi-cert.pfx" -Password $password

# Sign the installer
& "C:\Program Files (x86)\Windows Kits\10\bin\10.0.22621.0\x64\signtool.exe" sign `
  /f "saarthi-cert.pfx" `
  /p "YourPassword123" `
  /fd SHA256 `
  /v `
  "dist\saarthi-Setup-1.0.2.exe"
```

---

## Option 3: Automated Signing in Build Script

Add this to `create-exe-installer.bat` after the installer is built:

```batch
REM Step 6: Sign the installer (if certificate exists)
if exist "saarthi-cert.pfx" (
    echo.
    echo [*] Signing installer...
    "C:\Program Files (x86)\Windows Kits\10\bin\10.0.22621.0\x64\signtool.exe" sign ^
      /f "saarthi-cert.pfx" ^
      /p "%CERT_PASSWORD%" ^
      /t http://timestamp.digicert.com ^
      /fd SHA256 ^
      /v ^
      "%PROJECT_DIST%\saarthi-Setup-%APP_VERSION%.exe"
    
    if %ERRORLEVEL% EQU 0 (
        echo [OK] Installer signed successfully!
    ) else (
        echo [WARNING] Signing failed, but installer was created
    )
) else (
    echo.
    echo [INFO] No certificate found, installer is unsigned
    echo       Users will see a Windows SmartScreen warning
)
```

---

## Option 4: Build Reputation with Microsoft SmartScreen

Even without signing, you can build reputation:
1. Submit your app to Microsoft for SmartScreen reputation
2. After enough users download and run it safely, warnings reduce
3. Takes weeks/months and requires many downloads

**Not recommended** - Get a certificate instead.

---

## Recommended Approach

### For Production (Public Release):
1. **Buy a code signing certificate** from DigiCert or Sectigo ($474/year)
2. **Sign all releases** before distribution
3. Users will see "Verified Publisher: Yash Borude" (or your company name)
4. No warnings!

### For Internal/Testing:
1. Use self-signed certificate
2. Distribute certificate to test users
3. They install it in their Trusted Root store
4. Still shows warnings for external users

---

## Quick Start: Self-Signed for Testing

Run this PowerShell script to create and use a self-signed certificate:

```powershell
# create-test-certificate.ps1
$certName = "Saarthi Desktop"
$password = "Saarthi2025!"

# Create certificate
$cert = New-SelfSignedCertificate -Type CodeSigningCert -Subject "CN=$certName" -CertStoreLocation Cert:\CurrentUser\My

# Export
$securePassword = ConvertTo-SecureString -String $password -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath "saarthi-cert.pfx" -Password $securePassword

Write-Host "Certificate created: saarthi-cert.pfx"
Write-Host "Password: $password"
Write-Host ""
Write-Host "To sign your installer, run:"
Write-Host 'signtool sign /f "saarthi-cert.pfx" /p "' + $password + '" /fd SHA256 /v "dist\saarthi-Setup-1.0.2.exe"'
```

---

## Cost Comparison

| Option | Cost | Trust Level | Best For |
|--------|------|-------------|----------|
| DigiCert/Sectigo | $474/year | Full trust | Production |
| SSL.com | $249/year | Full trust | Budget production |
| Self-signed | Free | No trust | Internal testing |
| No signing | Free | Warnings | Not recommended |

---

## Next Steps

1. **Immediate**: Create self-signed cert for testing
2. **Before public release**: Purchase real certificate
3. **Automate**: Add signing to build script
4. **Verify**: Test on clean Windows machine

---

## Support

For questions about code signing:
- DigiCert Support: https://www.digicert.com/support
- Microsoft SignTool Docs: https://docs.microsoft.com/en-us/windows/win32/seccrypto/signtool

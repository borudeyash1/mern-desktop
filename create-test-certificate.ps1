# Create Self-Signed Code Signing Certificate for Testing
# WARNING: This is for TESTING ONLY. Users will still see warnings.
# For production, buy a real certificate from DigiCert or Sectigo.

$certName = "Saarthi Desktop"
$password = "Saarthi2025!"
$certFile = "saarthi-cert.pfx"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Creating Test Code Signing Certificate" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if certificate already exists
if (Test-Path $certFile) {
    Write-Host "[WARNING] Certificate file already exists: $certFile" -ForegroundColor Yellow
    $response = Read-Host "Do you want to recreate it? (y/n)"
    if ($response -ne "y") {
        Write-Host "Aborted." -ForegroundColor Red
        exit
    }
    Remove-Item $certFile
}

Write-Host "[*] Creating self-signed certificate..." -ForegroundColor Green

try {
    # Create certificate
    $cert = New-SelfSignedCertificate `
        -Type CodeSigningCert `
        -Subject "CN=$certName" `
        -CertStoreLocation Cert:\CurrentUser\My `
        -NotAfter (Get-Date).AddYears(3)

    Write-Host "[OK] Certificate created in certificate store" -ForegroundColor Green

    # Export to PFX file
    $securePassword = ConvertTo-SecureString -String $password -Force -AsPlainText
    Export-PfxCertificate -Cert $cert -FilePath $certFile -Password $securePassword | Out-Null

    Write-Host "[OK] Certificate exported to: $certFile" -ForegroundColor Green
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Certificate Created Successfully!" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Certificate File: $certFile" -ForegroundColor White
    Write-Host "Password: $password" -ForegroundColor White
    Write-Host ""
    Write-Host "IMPORTANT NOTES:" -ForegroundColor Yellow
    Write-Host "1. This is a SELF-SIGNED certificate for TESTING ONLY" -ForegroundColor Yellow
    Write-Host "2. Users will STILL see SmartScreen warnings" -ForegroundColor Yellow
    Write-Host "3. For production, buy a real certificate from:" -ForegroundColor Yellow
    Write-Host "   - DigiCert: https://www.digicert.com" -ForegroundColor Yellow
    Write-Host "   - Sectigo: https://sectigo.com" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To sign your installer, the build script will automatically use this certificate." -ForegroundColor Green
    Write-Host ""
    Write-Host "Or manually sign with:" -ForegroundColor Cyan
    Write-Host 'signtool sign /f "saarthi-cert.pfx" /p "Saarthi2025!" /fd SHA256 /v "dist\saarthi-Setup-1.0.2.exe"' -ForegroundColor Gray
    Write-Host ""

} catch {
    Write-Host "[ERROR] Failed to create certificate: $_" -ForegroundColor Red
    exit 1
}

# Export Public Certificate for Distribution
# Run this AFTER creating the self-signed certificate

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Exporting Public Certificate" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Find the certificate
$cert = Get-ChildItem -Path Cert:\CurrentUser\My | Where-Object {$_.Subject -eq 'CN=Saarthi Desktop'}

if ($cert) {
    Write-Host "[*] Certificate found!" -ForegroundColor Green
    Write-Host "    Subject: $($cert.Subject)" -ForegroundColor Gray
    Write-Host "    Thumbprint: $($cert.Thumbprint)" -ForegroundColor Gray
    Write-Host ""
    
    # Export public certificate
    $outputFile = "saarthi-public-cert.cer"
    Export-Certificate -Cert $cert -FilePath $outputFile | Out-Null
    
    Write-Host "[OK] Public certificate exported to: $outputFile" -ForegroundColor Green
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Distribution Package Ready!" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Distribute these files to users:" -ForegroundColor White
    Write-Host "  1. dist\saarthi-Setup-1.0.2.exe (installer)" -ForegroundColor Yellow
    Write-Host "  2. saarthi-public-cert.cer (certificate)" -ForegroundColor Yellow
    Write-Host "  3. INSTALL_INSTRUCTIONS.txt (instructions)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Users can:" -ForegroundColor White
    Write-Host "  - Install certificate once = No warnings ever" -ForegroundColor Green
    Write-Host "  - OR just click 'Run anyway' = Quick but shows warning" -ForegroundColor Yellow
    Write-Host ""
    
} else {
    Write-Host "[ERROR] Certificate not found!" -ForegroundColor Red
    Write-Host "Please run create-test-certificate.ps1 first" -ForegroundColor Yellow
    exit 1
}

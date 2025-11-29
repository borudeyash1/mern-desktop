# Script to fix console window issue in already-built app
# Run this after building but before creating installer

Write-Host "Fixing console window visibility..." -ForegroundColor Cyan

$appDir = "dist\saarthi-app"

if (!(Test-Path $appDir)) {
    Write-Host "[ERROR] App directory not found: $appDir" -ForegroundColor Red
    Write-Host "Please build the app first!" -ForegroundColor Yellow
    exit 1
}

# Fix batch file
$batFile = Join-Path $appDir "saarthi.bat"
$batContent = @'
@echo off
cd "%~dp0"
if not exist "node_modules\electron" (
    start /min cmd /c "npm install electron --save-dev --silent"
    timeout /t 5 /nobreak >nul
)
start /B "" "%~dp0node_modules\.bin\electron.cmd" .
exit
'@

[System.IO.File]::WriteAllText($batFile, $batContent)
Write-Host "[OK] Fixed saarthi.bat" -ForegroundColor Green

# Fix VBS file
$vbsFile = Join-Path $appDir "saarthi.vbs"
$vbsContent = @'
Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
batFile = scriptDir & "\saarthi.bat"
WshShell.Run Chr(34) & batFile & Chr(34), 0, False
Set WshShell = Nothing
Set fso = Nothing
'@

[System.IO.File]::WriteAllText($vbsFile, $vbsContent)
Write-Host "[OK] Fixed saarthi.vbs" -ForegroundColor Green

Write-Host ""
Write-Host "Console window fix applied successfully!" -ForegroundColor Green
Write-Host "The app will now run silently without showing terminal windows." -ForegroundColor Green

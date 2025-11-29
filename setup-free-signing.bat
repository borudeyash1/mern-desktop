@echo off
echo ========================================
echo   FREE Code Signing Setup
echo   (One-time setup)
echo ========================================
echo.

echo [Step 1/3] Creating self-signed certificate...
powershell -ExecutionPolicy Bypass -File create-test-certificate.ps1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Certificate creation failed!
    pause
    exit /b 1
)

echo.
echo [Step 2/3] Exporting public certificate...
powershell -ExecutionPolicy Bypass -File export-public-cert.ps1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Certificate export failed!
    pause
    exit /b 1
)

echo.
echo [Step 3/3] Building signed installer...
call create-exe-installer.bat

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Your distribution package is ready:
echo   - dist\saarthi-Setup-1.0.2.exe
echo   - saarthi-public-cert.cer
echo   - INSTALL_INSTRUCTIONS.txt
echo.
echo Give all three files to users!
echo.
pause

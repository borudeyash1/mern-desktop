@echo off
echo ========================================
echo   Saarthi Desktop App Launcher
echo ========================================
echo.

REM Always extract latest version
echo [*] Extracting latest app version...
powershell -Command "Expand-Archive -Path 'dist\saarthi-1.0.0-win-x64-portable.zip' -DestinationPath 'dist\saarthi-web' -Force"
echo [OK] Extraction complete

echo.
echo [*] Checking Electron installation...
cd dist\saarthi-web\saarthi

REM Check if electron is installed
if exist "node_modules\electron" (
    echo [OK] Electron already installed
) else (
    echo [*] Installing Electron ^(first time only^)...
    call npm install electron --save-dev --silent
    echo [OK] Electron installed
)

echo.
echo ========================================
echo   Starting Saarthi Desktop App...
echo ========================================
echo.
echo IMPORTANT: Make sure your web server is running!
echo   - Server: http://localhost:5000
echo   - Client: http://localhost:3000
echo.
echo Press Ctrl+C to close this window after closing the app.
echo.

REM Run the app
npx electron .

echo.
echo App closed. Press any key to exit...
pause > nul

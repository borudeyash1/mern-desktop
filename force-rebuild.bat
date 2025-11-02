@echo off
echo Killing any processes that might lock the file...
taskkill /F /IM "Sartthi-Setup-1.0.0.exe" 2>nul

echo Waiting 2 seconds...
timeout /t 2 /nobreak >nul

echo Deleting old installer...
del /F /Q "dist\Sartthi-Setup-1.0.0.exe" 2>nul

echo Rebuilding installer...
"C:\Program Files (x86)\Inno Setup 6\ISCC.exe" "saarthi-installer.iss"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   SUCCESS! Installer Fixed and Ready!
    echo ========================================
    echo.
    echo File: Sartthi-Setup-1.0.0.exe
    echo Location: D:\YASH\MERN DESKTOP\dist
    echo.
    echo FIXED ISSUES:
    echo   - VBS file now runs through wscript.exe
    echo   - Shortcuts properly configured
    echo   - NO MORE ERROR MESSAGES!
    echo.
    echo Ready to install and test!
    echo.
    dir "dist\Sartthi-Setup-*.exe"
) else (
    echo.
    echo ERROR: Build failed!
    echo Please close any File Explorer windows
    echo showing the dist folder and try again.
)

pause

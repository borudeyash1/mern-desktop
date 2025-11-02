@echo off
echo Deleting old installer...
del /F "dist\Sartthi-Setup-1.0.0.exe" 2>nul

echo Rebuilding installer...
"C:\Program Files (x86)\Inno Setup 6\ISCC.exe" "saarthi-installer.iss"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo SUCCESS! New installer created!
    echo.
    dir "dist\Sartthi-Setup-*.exe"
) else (
    echo ERROR: Build failed!
)

pause

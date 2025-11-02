@echo off
echo Rebuilding Sartthi installer...

cd /d "D:\YASH\MERN DESKTOP"

"C:\Program Files (x86)\Inno Setup 6\ISCC.exe" "saarthi-installer.iss"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo SUCCESS! Installer rebuilt!
    echo File: dist\Sartthi-Setup-1.0.0.exe
    echo.
    dir "dist\Sartthi-Setup-*.exe"
) else (
    echo ERROR: Build failed!
)

pause

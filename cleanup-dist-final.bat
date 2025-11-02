@echo off
echo Cleaning dist folder...

cd "D:\YASH\MERN DESKTOP\dist"

REM Delete old files
del /Q "Saarthi-Desktop-Installer-v1.0.0.zip"
del /Q "Saarthi-Setup-1.0.0.exe"
del /Q "create-desktop-shortcut.ps1"
del /Q "create-shortcuts.bat"
del /Q "create-startmenu-shortcut.ps1"
del /Q "release.json"
del /Q "saarthi-1.0.0-win-x64-portable.zip"

REM Delete folders
if exist "Saarthi-Installer" rd /s /q "Saarthi-Installer"
if exist "saarthi-app" rd /s /q "saarthi-app"

echo.
echo Cleaned! Only keeping: Sartthi-Setup-1.0.0.exe
echo.
dir
pause

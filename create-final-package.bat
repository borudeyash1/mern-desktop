@echo off
echo ========================================
echo   Creating Final Saarthi Package
echo ========================================
echo.

cd "C:\Users\student\Downloads\mern-desktop"

REM Step 1: Build the app
echo [*] Building Saarthi desktop app...
node bin\mernpkg.js build --config saarthi.config.json --platforms windows --arch x64

REM Step 2: Create installer files in dist
echo.
echo [*] Creating installer files...

REM Main installer
copy /Y "Install-Saarthi-FINAL.bat" "dist\Install-Saarthi.bat"

REM Shortcut helper script
> "dist\create-shortcuts.bat" (
echo @echo off
echo REM Create Desktop Shortcut
echo powershell -ExecutionPolicy Bypass -File "%%~dp0create-desktop-shortcut.ps1"
echo.
echo REM Create Start Menu Shortcut
echo if not exist "%%APPDATA%%\Microsoft\Windows\Start Menu\Programs\Saarthi" mkdir "%%APPDATA%%\Microsoft\Windows\Start Menu\Programs\Saarthi"
echo powershell -ExecutionPolicy Bypass -File "%%~dp0create-startmenu-shortcut.ps1"
)

REM Desktop shortcut PowerShell script
> "dist\create-desktop-shortcut.ps1" (
echo $WshShell = New-Object -ComObject WScript.Shell
echo $Shortcut = $WshShell.CreateShortcut^("$env:USERPROFILE\Desktop\Saarthi.lnk"^)
echo $Shortcut.TargetPath = "$env:LOCALAPPDATA\Saarthi\saarthi\node_modules\.bin\electron.cmd"
echo $Shortcut.Arguments = "."
echo $Shortcut.WorkingDirectory = "$env:LOCALAPPDATA\Saarthi\saarthi"
echo $Shortcut.Save^(^)
)

REM Start Menu shortcut PowerShell script
> "dist\create-startmenu-shortcut.ps1" (
echo $WshShell = New-Object -ComObject WScript.Shell
echo $Shortcut = $WshShell.CreateShortcut^("$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Saarthi\Saarthi.lnk"^)
echo $Shortcut.TargetPath = "$env:LOCALAPPDATA\Saarthi\saarthi\node_modules\.bin\electron.cmd"
echo $Shortcut.Arguments = "."
echo $Shortcut.WorkingDirectory = "$env:LOCALAPPDATA\Saarthi\saarthi"
echo $Shortcut.Save^(^)
)

REM Step 3: Package everything
echo.
echo [*] Creating distribution package...

cd dist

REM Clean old package
if exist "Saarthi-Installer" rd /s /q "Saarthi-Installer"
if exist "Saarthi-Desktop-Installer-v1.0.0.zip" del "Saarthi-Desktop-Installer-v1.0.0.zip"

REM Create package folder
mkdir "Saarthi-Installer"

REM Copy all files
copy "Install-Saarthi.bat" "Saarthi-Installer\"
copy "create-shortcuts.bat" "Saarthi-Installer\"
copy "create-desktop-shortcut.ps1" "Saarthi-Installer\"
copy "create-startmenu-shortcut.ps1" "Saarthi-Installer\"
copy "saarthi-1.0.0-win-x64-portable.zip" "Saarthi-Installer\"

REM Create README
> "Saarthi-Installer\README.txt" (
echo ========================================
echo   Saarthi Desktop App - Installation
echo ========================================
echo.
echo INSTALLATION:
echo 1. Double-click "Install-Saarthi.bat"
echo 2. Wait 1-2 minutes
echo 3. Launch from Desktop or Start Menu
echo.
echo REQUIREMENTS:
echo - Windows 10/11
echo - Internet connection
echo - Node.js ^(will use if installed^)
echo.
echo SUPPORT: borudeyash1@gmail.com
)

REM Create ZIP
powershell -Command "Compress-Archive -Path 'Saarthi-Installer\*' -DestinationPath 'Saarthi-Desktop-Installer-v1.0.0.zip' -Force"

echo.
echo ========================================
echo   Package Created!
echo ========================================
echo.
echo File: Saarthi-Desktop-Installer-v1.0.0.zip
echo Location: C:\Users\student\Downloads\mern-desktop\dist
echo.
dir "Saarthi-Desktop-Installer-v1.0.0.zip"
echo.
pause

@echo off
echo ========================================
echo   Creating Saarthi .exe Installer
echo   (Professional Windows Installer)
echo ========================================
echo.

cd "D:\YASH\MERN DESKTOP"

REM Step 1: Check if Inno Setup is installed
echo [*] Checking for Inno Setup...
if exist "C:\Program Files (x86)\Inno Setup 6\ISCC.exe" (
    set INNO_PATH=C:\Program Files (x86)\Inno Setup 6\ISCC.exe
    echo [OK] Inno Setup found!
) else if exist "C:\Program Files\Inno Setup 6\ISCC.exe" (
    set INNO_PATH=C:\Program Files\Inno Setup 6\ISCC.exe
    echo [OK] Inno Setup found!
) else (
    echo [ERROR] Inno Setup not found!
    echo.
    echo Please install Inno Setup first:
    echo 1. Download from: https://jrsoftware.org/isdl.php
    echo 2. Install it (takes 30 seconds)
    echo 3. Run this script again
    echo.
    pause
    exit /b 1
)

REM Step 2: Build the portable app
echo.
echo [*] Building Saarthi desktop app...
node bin\mernpkg.js build --config saarthi.config.json --platforms windows --arch x64

REM Step 3: Prepare app folder for installer
echo.
echo [*] Preparing app files for installer...
if exist "dist\saarthi-app" rd /s /q "dist\saarthi-app"
mkdir "dist\saarthi-app"

REM Extract portable ZIP
powershell -Command "Expand-Archive -Path 'dist\saarthi-1.0.0-win-x64-portable.zip' -DestinationPath 'dist\saarthi-app-temp' -Force"

REM Copy app files
xcopy /E /I /Y "dist\saarthi-app-temp\saarthi\*" "dist\saarthi-app\"

REM Create launcher executable wrapper
echo.
echo [*] Creating launcher executable...

REM Create a Node.js launcher script
> "dist\saarthi-app\launch.js" (
echo const { spawn } = require('child_process'^);
echo const path = require('path'^);
echo.
echo // Launch Electron
echo const electronPath = path.join(__dirname, 'node_modules', '.bin', 'electron.cmd'^);
echo const appPath = __dirname;
echo.
echo const child = spawn(electronPath, [appPath], {
echo   detached: true,
echo   stdio: 'ignore'
echo }^);
echo.
echo child.unref(^);
)

REM Create batch launcher
> "dist\saarthi-app\Saarthi.bat" (
echo @echo off
echo cd "%%~dp0"
echo if not exist "node_modules\electron" ^(
echo     echo Installing dependencies...
echo     call npm install electron --save-dev --silent
echo ^)
echo start "" "%%~dp0node_modules\.bin\electron.cmd" .
)

REM Create VBS launcher to hide console
> "dist\saarthi-app\Saarthi.vbs" (
echo Set WshShell = CreateObject("WScript.Shell"^)
echo WshShell.Run chr(34^) ^& WScript.ScriptFullName ^& "\..\Saarthi.bat" ^& Chr(34^), 0
echo Set WshShell = Nothing
)

REM Create final EXE launcher using IExpress (built into Windows)
echo.
echo [*] Creating Saarthi.exe launcher...

> "dist\saarthi-app\launcher.sed" (
echo [Version]
echo Class=IEXPRESS
echo SEDVersion=3
echo [Options]
echo PackagePurpose=InstallApp
echo ShowInstallProgramWindow=0
echo HideExtractAnimation=1
echo UseLongFileName=1
echo InsideCompressed=0
echo CAB_FixedSize=0
echo CAB_ResvCodeSigning=0
echo RebootMode=N
echo InstallPrompt=
echo DisplayLicense=
echo FinishMessage=
echo TargetName=%%TEMP%%\Saarthi.exe
echo FriendlyName=Saarthi
echo AppLaunched=cmd /c Saarthi.bat
echo PostInstallCmd=^<None^>
echo AdminQuietInstCmd=
echo UserQuietInstCmd=
echo SourceFiles=.
echo [Strings]
echo FILE0="Saarthi.bat"
echo [SourceFiles]
echo SourceFiles0=.
echo [SourceFiles0]
echo %%FILE0%%=
)

REM Use IExpress to create launcher (this creates a self-extracting exe)
REM Note: This is a workaround. The Inno Setup installer will handle the real installation

REM Step 4: Create app icon (if not exists)
if not exist "saarthi-icon.ico" (
    echo [*] Creating default icon...
    REM Copy a default icon or create one
    REM For now, we'll skip this - Inno Setup will use default
)

REM Step 5: Build the installer with Inno Setup
echo.
echo [*] Building professional .exe installer...
echo     This creates: Saarthi-Setup-1.0.0.exe
echo.

"%INNO_PATH%" "saarthi-installer.iss"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   SUCCESS! .exe Installer Created!
    echo ========================================
    echo.
    echo File: Saarthi-Setup-1.0.0.exe
    echo Location: D:\YASH\MERN DESKTOP\dist
    echo.
    echo This is a professional Windows installer!
    echo.
    echo Users can:
    echo   1. Download Saarthi-Setup-1.0.0.exe
    echo   2. Double-click it
    echo   3. Click "Next, Next, Install"
    echo   4. App installs to Program Files
    echo   5. Desktop shortcut created
    echo   6. Launch from Start Menu or Desktop
    echo.
    echo Just like Microsoft apps! 
    echo.
    dir "dist\Saarthi-Setup-*.exe"
) else (
    echo.
    echo [ERROR] Installer build failed!
    echo Check the error messages above.
)

echo.
pause

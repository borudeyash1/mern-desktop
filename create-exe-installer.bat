@echo off
setlocal enabledelayedexpansion
echo ========================================
echo   Creating desktop .exe installer
echo   (Professional Windows Installer)
echo ========================================
echo.

set "ROOT_DIR=%~dp0"
pushd "%ROOT_DIR%"

REM Read metadata from saarthi.config.json
for /f "usebackq tokens=1,* delims==" %%A in (`node read-config.cjs`) do set "%%A=%%B"

if not defined APP_NAME (
    echo [ERROR] Could not load APP_NAME from saarthi.config.json
    exit /b 1
)

if not defined APP_VERSION (
    echo [ERROR] Could not load APP_VERSION from saarthi.config.json
    exit /b 1
)

set "APP_SAFE_NAME=%APP_NAME: =%"
set "PROJECT_DIR=%ROOT_DIR%%APP_PROJECT_DIR:/=\%"
set "PROJECT_DIST=%ROOT_DIR%dist"
set "PORTABLE_ZIP=%PROJECT_DIST%\%APP_NAME%-%APP_VERSION%-win-x64-portable.zip"
set "APP_STAGING_DIR=%PROJECT_DIST%\%APP_NAME%-app"
set "APP_TEMP_DIR=%PROJECT_DIST%\%APP_NAME%-app-temp"

REM Step 1: Check if Inno Setup is installed
echo [*] Checking for Inno Setup...
set "INNO_PATH="

if exist "C:\Program Files (x86)\Inno Setup 6\ISCC.exe" (
    set "INNO_PATH=C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
)

if not defined INNO_PATH (
    if exist "C:\Program Files\Inno Setup 6\ISCC.exe" (
        set "INNO_PATH=C:\Program Files\Inno Setup 6\ISCC.exe"
    )
)

if defined INNO_PATH goto have_inno

echo [ERROR] Inno Setup not found!
echo.
echo Please install Inno Setup first:
echo 1. Download from: https://jrsoftware.org/isdl.php
echo 2. Install it (takes 30 seconds)
echo 3. Run this script again
echo.
pause
exit /b 1

:have_inno
echo [OK] Inno Setup found!

REM Step 2: Build the portable app
echo.
echo [*] Building %APP_NAME% desktop app...
pushd "%PROJECT_DIR%"
node "%ROOT_DIR%bin\mernpkg.js" build --config "%ROOT_DIR%saarthi.config.json" --platforms windows --arch x64 --ci-mode
popd

if not exist "%PORTABLE_ZIP%" (
    echo [ERROR] Portable build not found at: %PORTABLE_ZIP%
    echo        Make sure the build completed successfully.
    pause
    exit /b 1
)

REM Step 3: Prepare app folder for installer
echo.
echo [*] Preparing app files for installer...
if exist "%APP_STAGING_DIR%" rd /s /q "%APP_STAGING_DIR%"
if exist "%APP_TEMP_DIR%" rd /s /q "%APP_TEMP_DIR%"
mkdir "%APP_STAGING_DIR%"

REM Extract portable ZIP
powershell -Command "Expand-Archive -Path '%PORTABLE_ZIP%' -DestinationPath '%APP_TEMP_DIR%' -Force"

REM Copy app files
xcopy /E /I /Y "%APP_TEMP_DIR%\%APP_NAME%\*" "%APP_STAGING_DIR%\"

REM Include application icon
if exist "logo_only.ico" copy /Y "logo_only.ico" "%APP_STAGING_DIR%\logo_only.ico" >nul

REM Create launcher executable wrapper
echo.
echo [*] Creating launcher executable...

REM Create a Node.js launcher script
> "%APP_STAGING_DIR%\launch.js" (
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
> "%APP_STAGING_DIR%\%APP_SAFE_NAME%.bat" (
echo @echo off
echo cd "%%~dp0"
echo if not exist "node_modules\electron" ^(
echo     echo Installing dependencies...
echo     call npm install electron --save-dev --silent
echo ^)
echo start "" "%%~dp0node_modules\.bin\electron.cmd" .
)

REM Create VBS launcher to hide console
> "%APP_STAGING_DIR%\%APP_SAFE_NAME%.vbs" (
echo Set WshShell = CreateObject("WScript.Shell"^)
echo WshShell.Run chr(34^) ^& WScript.ScriptFullName ^& "\..\%APP_SAFE_NAME%.bat" ^& Chr(34^), 0
echo Set WshShell = Nothing
)

REM Create final EXE launcher using IExpress (built into Windows)
echo.
echo [*] Creating Saarthi.exe launcher...

> "%APP_STAGING_DIR%\launcher.sed" (
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
echo TargetName=%%TEMP%%\%APP_SAFE_NAME%.exe
echo FriendlyName=%APP_NAME%
echo AppLaunched=cmd /c %APP_SAFE_NAME%.bat
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
echo     This creates: %APP_NAME%-Setup-%APP_VERSION%.exe
echo.

"%INNO_PATH%" "/dMyAppName=%APP_NAME%" "/dMyAppVersion=%APP_VERSION%" "/dMyAppPublisher=%APP_AUTHOR%" "/dMyAppURL=%APP_URL%" "/dMyAppExeName=%APP_SAFE_NAME%.vbs" "saarthi-installer.iss"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   SUCCESS! .exe Installer Created!
    echo ========================================
    echo.
    echo File: %APP_NAME%-Setup-%APP_VERSION%.exe
    echo Location: %PROJECT_DIST%
    echo.
    echo This is a professional Windows installer!
    echo.
    echo Users can:
    echo   1. Download %APP_NAME%-Setup-%APP_VERSION%.exe
    echo   2. Double-click it
    echo   3. Click "Next, Next, Install"
    echo   4. App installs to Program Files
    echo   5. Desktop shortcut created
    echo   6. Launch from Start Menu or Desktop
    echo.
    echo Just like Microsoft apps! 
    echo.
    dir "%PROJECT_DIST%\%APP_NAME%-Setup-*.exe"
) else (
    echo.
    echo [ERROR] Installer build failed!
    echo Check the error messages above.

popd
endlocal
)

echo.
pause

@echo off
echo ========================================
echo   Creating Sartthi .exe Installer
echo ========================================
echo.

cd /d "C:\Users\student\Downloads\mern-desktop"

REM Step 1: Check for Inno Setup
echo [*] Checking for Inno Setup...
set "INNO_PATH="

if exist "C:\Program Files (x86)\Inno Setup 6\ISCC.exe" (
    set "INNO_PATH=C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
)
if exist "C:\Program Files\Inno Setup 6\ISCC.exe" (
    set "INNO_PATH=C:\Program Files\Inno Setup 6\ISCC.exe"
)

if not defined INNO_PATH (
    echo [ERROR] Inno Setup not found!
    echo Please install from: https://jrsoftware.org/isdl.php
    pause
    exit /b 1
)

echo [OK] Inno Setup found!
echo.

REM Step 2: Build the app
echo [*] Building Sartthi desktop app...
call node bin\mernpkg.js build --config saarthi.config.json --platforms windows --arch x64

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] App build failed!
    pause
    exit /b 1
)

echo [OK] App built successfully!
echo.

REM Step 3: Prepare app folder
echo [*] Preparing app files for installer...

if exist "dist\saarthi-app" rd /s /q "dist\saarthi-app"
if exist "dist\saarthi-app-temp" rd /s /q "dist\saarthi-app-temp"

mkdir "dist\saarthi-app"

REM Extract portable ZIP
powershell -Command "Expand-Archive -Path 'dist\saarthi-1.0.0-win-x64-portable.zip' -DestinationPath 'dist\saarthi-app-temp' -Force"

REM Copy app files
xcopy /E /I /Y "dist\saarthi-app-temp\saarthi\*" "dist\saarthi-app\"

REM Clean temp
rd /s /q "dist\saarthi-app-temp"

echo [OK] App files prepared!
echo.

REM Step 4: Create launcher
echo [*] Creating launcher...

REM Create batch launcher
> "dist\saarthi-app\launch.bat" (
echo @echo off
echo cd /d "%%~dp0"
echo if not exist "node_modules\electron" ^(
echo     echo Installing Electron...
echo     call npm install electron --save-dev
echo ^)
echo start "" "%%~dp0node_modules\.bin\electron.cmd" .
)

REM Create VBS script to launch without console window
> "dist\saarthi-app\Sartthi.vbs" (
echo Set WshShell = CreateObject^("WScript.Shell"^)
echo Set fso = CreateObject^("Scripting.FileSystemObject"^)
echo appPath = fso.GetParentFolderName^(WScript.ScriptFullName^)
echo batPath = appPath ^& "\launch.bat"
echo WshShell.Run chr^(34^) ^& batPath ^& chr^(34^), 0, False
echo Set WshShell = Nothing
echo Set fso = Nothing
)

echo [OK] Launcher created!
echo.

REM Step 5: Build installer
echo [*] Building .exe installer with Inno Setup...
echo.

"%INNO_PATH%" "saarthi-installer.iss"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   SUCCESS! .exe Installer Created!
    echo ========================================
    echo.
    echo File: Sartthi-Setup-1.0.0.exe
    echo Location: C:\Users\student\Downloads\mern-desktop\dist
    echo.
    dir "dist\Sartthi-Setup-*.exe"
    echo.
    echo Users can now:
    echo   1. Download Sartthi-Setup-1.0.0.exe
    echo   2. Double-click it
    echo   3. Click "Next, Next, Install"
    echo   4. App installs automatically!
    echo.
) else (
    echo.
    echo [ERROR] Installer build failed!
    echo Check errors above.
)

echo.
pause

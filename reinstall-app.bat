@echo off
echo ========================================
echo   Reinstalling Sartthi with OAuth Fix
echo ========================================
echo.

echo [1/3] Uninstalling old version...
echo.
echo Please uninstall Sartthi from:
echo Settings -^> Apps -^> Sartthi -^> Uninstall
echo.
echo Press any key after uninstalling...
pause

echo.
echo [2/3] Installing new version...
echo.
cd "D:\YASH\MERN DESKTOP\dist"
start /wait Sartthi-Setup-1.0.0-FIXED.exe

echo.
echo [3/3] Installation complete!
echo.
echo ========================================
echo   OAuth should now work properly!
echo ========================================
echo.
echo The new version will:
echo - Allow OAuth popup within the app
echo - Let Google SDK handle everything
echo - No more premature closing!
echo.
echo Test it now:
echo 1. Make sure backend and frontend are running
echo 2. Launch Sartthi
echo 3. Click "Sign in with Google"
echo 4. Select your account
echo 5. Should work!
echo.
pause

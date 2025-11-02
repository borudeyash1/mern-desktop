@echo off
echo ========================================
echo   Clearing Windows Icon Cache
echo ========================================
echo.

echo [*] Stopping Windows Explorer...
taskkill /f /im explorer.exe

echo [*] Deleting icon cache...
cd /d %userprofile%\AppData\Local
attrib -h IconCache.db
del IconCache.db /a
del /f /s /q /a %localappdata%\Microsoft\Windows\Explorer\iconcache*.db

echo [*] Restarting Windows Explorer...
start explorer.exe

echo.
echo ========================================
echo   Icon Cache Cleared!
echo ========================================
echo.
echo Please reinstall the app now.
echo The new icon will appear after reinstall.
echo.
pause

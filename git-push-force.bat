@echo off
echo Pushing to GitHub (force)...

REM Pull with rebase to merge remote changes
git pull origin main --rebase --allow-unrelated-histories

REM If pull succeeds, push
git push -u origin main

echo.
echo Done! Check https://github.com/borudeyash1/mern-desktop
pause

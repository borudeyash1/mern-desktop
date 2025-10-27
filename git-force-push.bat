@echo off
echo Force pushing to GitHub...

REM Abort any ongoing rebase
git rebase --abort

REM Force push (overwrites remote)
git push -u origin main --force

echo.
echo Done! Repository pushed to https://github.com/borudeyash1/mern-desktop
pause

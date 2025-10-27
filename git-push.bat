@echo off
echo Setting up Git repository...

REM Configure Git user
git config user.name "Yash Borude"
git config user.email "borudeyash1@gmail.com"

REM Commit
git commit -m "Initial commit: mern-desktop packager"

REM Set branch to main
git branch -M main

REM Push to GitHub
git push -u origin main

echo.
echo Done! Repository pushed to GitHub.
pause

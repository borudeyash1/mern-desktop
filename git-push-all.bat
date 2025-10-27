@echo off
echo Committing and pushing all GitHub setup files...

git add .
git commit -m "Add GitHub setup: LICENSE, CONTRIBUTING, issue templates, CI/CD workflows, badges"
git push origin main

echo.
echo Done! Check https://github.com/borudeyash1/mern-desktop
echo.
echo Next steps:
echo 1. Go to GitHub repository settings
echo 2. Add description: "Convert any MERN web application into professional desktop apps for Windows, macOS, and Linux. One command to create installers and portable packages."
echo 3. Add topics: mern, electron, desktop-app, packager, cross-platform, react, nodejs, mongodb, express
echo.
pause

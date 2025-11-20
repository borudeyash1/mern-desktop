@echo off
cd "%~dp0"
if not exist "node_modules\electron" (
    echo Installing dependencies...
    call npm install electron --save-dev --silent
)
start "" "%~dp0node_modules\.bin\electron.cmd" .

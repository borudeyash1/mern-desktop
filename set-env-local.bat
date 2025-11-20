@echo off
powershell -ExecutionPolicy Bypass -File "%~dp0scripts\switch-env.ps1" -Environment local

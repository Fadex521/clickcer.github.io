@echo off
cd /d %~dp0
echo Iniciando servidor Node.js...
start /B node index.js
timeout /t 2 >nul
start http://localhost:3000
pause
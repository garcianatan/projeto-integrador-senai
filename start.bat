@echo off
title Projeto Integrador SENAI

echo Iniciando Backend...

start "BACKEND" cmd /k "cd /d %~dp0backend\src && node server.js"

timeout /t 5 /nobreak > nul
start http://localhost:3001

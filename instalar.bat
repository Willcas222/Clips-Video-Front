@echo off
setlocal
cd /d "%~dp0"
echo === Dependencias de Node ===
call npm install || goto :error
echo.
echo Frontend instalado. Ejecuta iniciar.bat (con el backend en marcha).
exit /b 0

:error
echo.
echo ERROR durante la instalacion. Revisa el mensaje anterior.
exit /b 1

@echo off
echo 🔍 DIAGNÓSTICO DE SUPABASE
echo ===========================
echo.

echo 📋 Verificando Docker...
docker --version
docker info
echo.

echo 📋 Verificando Supabase CLI...
supabase --version
echo.

echo 📋 Estado actual de Supabase...
supabase status
echo.

echo 📋 Contenedores Docker corriendo...
docker ps
echo.

echo 📋 Puertos en uso...
netstat -ano | findstr :54321
netstat -ano | findstr :54323
echo.

echo 📋 Archivos de configuración...
if exist "supabase\config.toml" (
    echo ✅ config.toml existe
) else (
    echo ❌ config.toml NO existe
)

if exist "supabase\migrations" (
    echo ✅ Carpeta migrations existe
    dir supabase\migrations
) else (
    echo ❌ Carpeta migrations NO existe
)
echo.

echo 📋 Intentando iniciar Supabase...
supabase start
echo.

echo 🔍 Diagnóstico completado
pause


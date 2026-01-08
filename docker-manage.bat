@echo off
REM ============================================================
REM PlutusGrip Docker Management Script for Windows
REM ============================================================
REM Supports unified docker-compose.yml with profiles
REM Usage: docker-manage.bat [command] [environment]
REM ============================================================

setlocal enabledelayedexpansion
cd /d "%~dp0"

REM Colors (using ANSI escape codes for Windows 10+)
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

REM Default environment
set "ENVIRONMENT=dev"

REM ==================== PARSE ARGUMENTS ====================

if "%1"=="" (
    call :show_header
    call :show_usage
    exit /b 0
)

set "COMMAND=%1"
if not "%2"=="" set "ENVIRONMENT=%2"

REM Validate environment
if not "%ENVIRONMENT%"=="dev" if not "%ENVIRONMENT%"=="prod" (
    echo %RED%Error: Invalid environment '%ENVIRONMENT%' ^(use 'dev' or 'prod'^)%NC%
    exit /b 1
)

call :show_header

REM ==================== EXECUTE COMMAND ====================

if "%COMMAND%"=="up" (
    call :cmd_up %ENVIRONMENT%
) else if "%COMMAND%"=="down" (
    call :cmd_down %ENVIRONMENT%
) else if "%COMMAND%"=="restart" (
    call :cmd_restart %ENVIRONMENT%
) else if "%COMMAND%"=="logs" (
    call :cmd_logs %ENVIRONMENT%
) else if "%COMMAND%"=="logs-api" (
    call :cmd_logs_api %ENVIRONMENT%
) else if "%COMMAND%"=="logs-frontend" (
    call :cmd_logs_frontend %ENVIRONMENT%
) else if "%COMMAND%"=="logs-db" (
    call :cmd_logs_db %ENVIRONMENT%
) else if "%COMMAND%"=="shell" (
    call :cmd_shell %ENVIRONMENT%
) else if "%COMMAND%"=="shell-db" (
    call :cmd_shell_db %ENVIRONMENT%
) else if "%COMMAND%"=="build" (
    call :cmd_build %ENVIRONMENT%
) else if "%COMMAND%"=="clean" (
    call :cmd_clean %ENVIRONMENT%
) else if "%COMMAND%"=="status" (
    call :cmd_status %ENVIRONMENT%
) else if "%COMMAND%"=="test" (
    call :cmd_test %ENVIRONMENT%
) else if "%COMMAND%"=="pgadmin" (
    call :cmd_pgadmin %ENVIRONMENT%
) else if "%COMMAND%"=="help" (
    call :show_usage
) else (
    echo %RED%Error: Unknown command '%COMMAND%'%NC%
    call :show_usage
    exit /b 1
)

exit /b 0

REM ==================== HELPER FUNCTIONS ====================

:show_header
echo %BLUE%════════════════════════════════════════%NC%
echo %BLUE% PlutusGrip Docker Management%NC%
echo %BLUE%════════════════════════════════════════%NC%
echo.
goto :eof

:show_usage
echo %BLUE%Usage:%NC% docker-manage.bat [command] [environment]
echo.
echo %BLUE%Commands:%NC%
echo   up              Start all containers
echo   down            Stop all containers
echo   restart         Restart all containers
echo   logs            View container logs
echo   logs-api        View API logs only
echo   logs-frontend   View Frontend logs only
echo   logs-db         View Database logs only ^(dev only^)
echo   shell           Access API container shell
echo   shell-db        Access database container shell ^(dev only^)
echo   build           Build/rebuild containers
echo   clean           Remove containers and volumes ^(WARNING!^)
echo   status          Show container status
echo   test            Run tests ^(dev only^)
echo   pgadmin         Start pgAdmin ^(dev only^)
echo   help            Show this help message
echo.
echo %BLUE%Environments:%NC%
echo   dev             Development ^(default^) - includes postgres + pgAdmin
echo   prod            Production - uses external database + Nginx
echo.
echo %BLUE%Examples:%NC%
echo   docker-manage.bat up dev
echo   docker-manage.bat logs prod
echo   docker-manage.bat shell dev
echo   docker-manage.bat pgadmin dev
echo   docker-manage.bat down
echo.
echo %BLUE%Notes:%NC%
echo   - Dev environment includes: API, Frontend, PostgreSQL, pgAdmin
echo   - Prod environment includes: API, Frontend, Nginx ^(no database^)
echo   - Prod requires external database configured in .env.prod
echo.
goto :eof

:get_compose_command
set "COMPOSE_CMD=docker compose --profile %1 --env-file .env.%1"
goto :eof

REM ==================== DOCKER COMMANDS ====================

:cmd_up
call :get_compose_command %1
echo %BLUE%ℹ Starting containers in %1 environment ^(profile: %1^)...%NC%
%COMPOSE_CMD% up -d

timeout /t 2 /nobreak >nul
call :cmd_status %1

echo.
echo %GREEN%✓ All services started!%NC%
echo %BLUE%ℹ Available at:%NC%

if "%1"=="dev" (
    echo   Frontend: %BLUE%http://localhost:5173%NC%
    echo   API:      %BLUE%http://localhost:8000%NC%
    echo   Docs:     %BLUE%http://localhost:8000/docs%NC%
    echo   pgAdmin:  %BLUE%http://localhost:5050%NC% ^(admin@plutusgrip.com / admin123^)
    echo   Database: %BLUE%localhost:5432%NC%
) else (
    echo   Application: %BLUE%http://localhost%NC%
    echo   API:         %BLUE%http://localhost/api%NC%
    echo   Docs:        %BLUE%http://localhost/docs%NC%
    echo   %YELLOW%Note: Using external database ^(no postgres container^)%NC%
)
goto :eof

:cmd_down
call :get_compose_command %1
echo %YELLOW%⚠ Stopping containers in %1 environment...%NC%
%COMPOSE_CMD% down
echo %GREEN%✓ All services stopped!%NC%
goto :eof

:cmd_restart
call :cmd_down %1
timeout /t 1 /nobreak >nul
call :cmd_up %1
goto :eof

:cmd_logs
call :get_compose_command %1
%COMPOSE_CMD% logs -f
goto :eof

:cmd_logs_api
call :get_compose_command %1
%COMPOSE_CMD% logs -f api
goto :eof

:cmd_logs_frontend
call :get_compose_command %1
%COMPOSE_CMD% logs -f frontend
goto :eof

:cmd_logs_db
if not "%1"=="dev" (
    echo %RED%✗ Database container only available in dev environment!%NC%
    exit /b 1
)
call :get_compose_command %1
%COMPOSE_CMD% logs -f postgres
goto :eof

:cmd_shell
call :get_compose_command %1
%COMPOSE_CMD% exec api bash
goto :eof

:cmd_shell_db
if not "%1"=="dev" (
    echo %RED%✗ Database container only available in dev environment!%NC%
    exit /b 1
)
call :get_compose_command %1
%COMPOSE_CMD% exec postgres bash
goto :eof

:cmd_build
call :get_compose_command %1
echo %BLUE%ℹ Building images for %1 environment...%NC%
%COMPOSE_CMD% build --no-cache
echo %GREEN%✓ Images built successfully!%NC%
goto :eof

:cmd_clean
call :get_compose_command %1
echo %YELLOW%⚠ This will remove all containers and volumes for %1!%NC%
set /p CONFIRM="Are you sure? (yes/no): "
if /i "%CONFIRM%"=="yes" (
    %COMPOSE_CMD% down -v --rmi local
    echo %GREEN%✓ Cleaned up successfully!%NC%
) else (
    echo %BLUE%ℹ Cleanup cancelled%NC%
)
goto :eof

:cmd_status
call :get_compose_command %1
echo.
echo %BLUE%ℹ Container Status ^(%1^):%NC%
%COMPOSE_CMD% ps
goto :eof

:cmd_test
if not "%1"=="dev" (
    echo %RED%✗ Tests can only run in dev environment!%NC%
    exit /b 1
)
call :get_compose_command %1
echo %BLUE%ℹ Running tests...%NC%
%COMPOSE_CMD% exec api pytest -v
goto :eof

:cmd_pgadmin
if not "%1"=="dev" (
    echo %RED%✗ pgAdmin only available in dev environment!%NC%
    exit /b 1
)
call :get_compose_command dev
echo %BLUE%ℹ Starting pgAdmin...%NC%
%COMPOSE_CMD% up -d pgadmin
echo %GREEN%✓ pgAdmin started!%NC%
echo   Access: %BLUE%http://localhost:5050%NC%
echo   Email: %BLUE%admin@plutusgrip.com%NC%
echo   Password: %BLUE%admin123%NC%
goto :eof

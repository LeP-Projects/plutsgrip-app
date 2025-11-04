@echo off
REM PlutusGrip Docker Management Script for Windows
REM Usage: docker-manage.bat [command] [environment]

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

REM Parse arguments
if "%1"=="" (
    call :show_header
    call :show_usage
    exit /b 0
)

set "COMMAND=%1"
if not "%2"=="" set "ENVIRONMENT=%2"

REM Validate environment
if not "%ENVIRONMENT%"=="dev" if not "%ENVIRONMENT%"=="prod" (
    echo %RED%Error: Invalid environment '%ENVIRONMENT%' (use 'dev' or 'prod')%NC%
    exit /b 1
)

call :show_header

REM Execute command
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
echo %BLUE%=====================================
echo  PlutusGrip Docker Management
echo =====================================%NC%
exit /b 0

:show_usage
echo.
echo %BLUE%Usage:%NC% docker-manage.bat [command] [environment]
echo.
echo %BLUE%Commands:%NC%
echo   up              Start all containers
echo   down            Stop all containers
echo   restart         Restart all containers
echo   logs            View container logs
echo   logs-api        View API logs only
echo   logs-frontend   View Frontend logs only
echo   logs-db         View Database logs only
echo   shell           Access API container shell
echo   shell-db        Access database container shell
echo   build           Build/rebuild containers
echo   clean           Remove containers and volumes (WARNING!)
echo   status          Show container status
echo   test            Run tests (dev only)
echo   help            Show this help message
echo.
echo %BLUE%Environments:%NC%
echo   dev             Development (default)
echo   prod            Production
echo.
echo %BLUE%Examples:%NC%
echo   docker-manage.bat up dev
echo   docker-manage.bat logs prod
echo   docker-manage.bat shell dev
echo.
exit /b 0

REM ==================== COMMANDS ====================

:cmd_up
echo.
echo Starting containers in %~1 environment...
docker-compose -f docker-compose.%~1.yml up -d
if errorlevel 1 exit /b 1
timeout /t 2 /nobreak > nul
call :cmd_status %~1
echo.
echo %GREEN%All services started!%NC%
echo %BLUE%Available at:%NC%
if "%~1"=="dev" (
    echo   Frontend: http://localhost:5173
    echo   API:      http://localhost:8000
    echo   Docs:     http://localhost:8000/docs
    echo   Database: localhost:5432
) else (
    echo   Frontend: http://localhost
    echo   API:      http://localhost/api
    echo   Docs:     http://localhost/docs
)
exit /b 0

:cmd_down
echo.
echo Stopping containers in %~1 environment...
docker-compose -f docker-compose.%~1.yml down
echo %GREEN%All services stopped!%NC%
exit /b 0

:cmd_restart
echo.
echo Restarting containers in %~1 environment...
call :cmd_down %~1
timeout /t 1 /nobreak > nul
call :cmd_up %~1
exit /b 0

:cmd_logs
docker-compose -f docker-compose.%~1.yml logs -f
exit /b 0

:cmd_logs_api
docker-compose -f docker-compose.%~1.yml logs -f api
exit /b 0

:cmd_logs_frontend
docker-compose -f docker-compose.%~1.yml logs -f frontend
exit /b 0

:cmd_logs_db
docker-compose -f docker-compose.%~1.yml logs -f postgres
exit /b 0

:cmd_shell
docker-compose -f docker-compose.%~1.yml exec api bash
exit /b 0

:cmd_shell_db
docker-compose -f docker-compose.%~1.yml exec postgres bash
exit /b 0

:cmd_build
echo.
echo Building images for %~1 environment...
docker-compose -f docker-compose.%~1.yml build
echo %GREEN%Images built successfully!%NC%
exit /b 0

:cmd_clean
echo.
echo %YELLOW%This will remove all containers and volumes for %~1!%NC%
set /p confirm="Are you sure? (yes/no): "
if /i "%confirm%"=="yes" (
    docker-compose -f docker-compose.%~1.yml down -v
    echo %GREEN%Cleaned up successfully!%NC%
) else (
    echo Cleanup cancelled
)
exit /b 0

:cmd_status
echo.
echo %BLUE%Container Status (%~1):%NC%
docker-compose -f docker-compose.%~1.yml ps
exit /b 0

:cmd_test
if not "%~1"=="dev" (
    echo %RED%Error: Tests can only run in dev environment!%NC%
    exit /b 1
)
echo.
echo Running tests...
docker-compose -f docker-compose.%~1.yml exec api pytest -v
exit /b 0

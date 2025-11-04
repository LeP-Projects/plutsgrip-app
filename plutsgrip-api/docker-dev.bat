@echo off
REM PlutusGrip API - Development Docker Management Script (Windows)
REM Usage: docker-dev.bat [command]

setlocal enabledelayedexpansion

REM Check if docker-compose is available
where docker-compose >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: docker-compose is not installed or not in PATH
    exit /b 1
)

set "ENV_FILE=.env.development"
set "COMPOSE_FILE=docker-compose.development.yml"

if not exist "%ENV_FILE%" (
    echo Error: %ENV_FILE% not found!
    exit /b 1
)

REM Parse command
set "COMMAND=%1"
if "%COMMAND%"=="" set "COMMAND=help"

goto %COMMAND% 2>nul || (
    echo Unknown command: %COMMAND%
    echo.
    goto help
)

:start
echo.
echo ========================================
echo Starting Development Environment
echo ========================================
echo.
docker-compose -f %COMPOSE_FILE% --env-file %ENV_FILE% down 2>nul
timeout /t 1 /nobreak >nul
docker-compose -f %COMPOSE_FILE% --env-file %ENV_FILE% up -d
if %errorlevel% equ 0 (
    echo.
    echo Development environment started!
    echo.
    echo API:     http://localhost:8000
    echo Docs:    http://localhost:8000/docs
    echo PgAdmin: http://localhost:5050
    echo.
    echo View logs with: docker-dev.bat logs
) else (
    echo Failed to start environment
    exit /b 1
)
exit /b 0

:stop
echo.
echo ========================================
echo Stopping Development Environment
echo ========================================
echo.
docker-compose -f %COMPOSE_FILE% --env-file %ENV_FILE% down
exit /b 0

:restart
call :stop
timeout /t 2 /nobreak >nul
call :start
exit /b 0

:logs
echo.
echo ========================================
echo Development Logs (Press Ctrl+C to exit)
echo ========================================
echo.
docker-compose -f %COMPOSE_FILE% --env-file %ENV_FILE% logs -f
exit /b 0

:shell-api
echo.
echo ========================================
echo Entering API Container Shell
echo ========================================
echo.
docker-compose -f %COMPOSE_FILE% --env-file %ENV_FILE% exec api bash
exit /b 0

:shell-db
echo.
echo ========================================
echo Entering Database Container Shell
echo ========================================
echo.
docker-compose -f %COMPOSE_FILE% --env-file %ENV_FILE% exec postgres bash
exit /b 0

:test
echo.
echo ========================================
echo Running Tests
echo ========================================
echo.
docker-compose -f %COMPOSE_FILE% --env-file %ENV_FILE% exec api pytest -v %2 %3 %4 %5
exit /b 0

:migrate
echo.
echo ========================================
echo Running Database Migrations
echo ========================================
echo.
docker-compose -f %COMPOSE_FILE% --env-file %ENV_FILE% exec api alembic upgrade head
if %errorlevel% equ 0 (
    echo.
    echo Migrations completed
)
exit /b 0

:reset-db
echo.
echo ========================================
echo Resetting Development Database
echo ========================================
echo.
set /p CONFIRM="Are you sure? This will delete all data! (yes/no): "
if /i "%CONFIRM%"=="yes" (
    docker-compose -f %COMPOSE_FILE% --env-file %ENV_FILE% down -v
    echo.
    echo Database reset. Run 'docker-dev.bat start' to initialize fresh.
) else (
    echo Reset cancelled
)
exit /b 0

:format
echo.
echo ========================================
echo Formatting Code with Black
echo ========================================
echo.
docker-compose -f %COMPOSE_FILE% --env-file %ENV_FILE% exec api black app main.py
if %errorlevel% equ 0 (
    echo.
    echo Code formatted
)
exit /b 0

:lint
echo.
echo ========================================
echo Running Linters
echo ========================================
echo.
docker-compose -f %COMPOSE_FILE% --env-file %ENV_FILE% exec api bash -c "flake8 app ^&^& mypy app"
if %errorlevel% equ 0 (
    echo.
    echo Linting completed
)
exit /b 0

:status
echo.
echo ========================================
echo Development Container Status
echo ========================================
echo.
docker-compose -f %COMPOSE_FILE% --env-file %ENV_FILE% ps
exit /b 0

:help
echo.
echo PlutusGrip API - Docker Development Management
echo.
echo Usage:
echo   docker-dev.bat [command]
echo.
echo Commands:
echo   start              Start development environment
echo   stop               Stop development environment
echo   restart            Restart development environment
echo   logs               View development logs (follow mode)
echo   shell-api          Open bash shell in API container
echo   shell-db           Open bash shell in database container
echo   test               Run tests (pass additional args: docker-dev.bat test -v)
echo   migrate            Run database migrations
echo   reset-db           Reset development database (WARNING: deletes data)
echo   format             Format code with black
echo   lint               Run linters (flake8, mypy)
echo   status             Show container status
echo   help               Show this help message
echo.
echo Examples:
echo   docker-dev.bat start              # Start environment
echo   docker-dev.bat logs               # View logs
echo   docker-dev.bat test -v            # Run tests with options
echo   docker-dev.bat shell-api          # Open API container shell
echo.
exit /b 0

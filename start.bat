@echo off
REM Task Manager Backend & Frontend Startup Script for Windows

echo.
echo ========================================
echo  Task Manager - Quick Start
echo ========================================
echo.

REM Check if PostgreSQL is running
echo [1/3] Checking PostgreSQL connection...
sqlcmd -S localhost -U postgres -Q "SELECT 1" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ PostgreSQL is running
) else (
    echo ✗ PostgreSQL is NOT running. Please start PostgreSQL first.
    echo   Start PostgreSQL: Windows Services or pgAdmin
    pause
    exit /b 1
)

echo.
echo [2/3] Starting Backend (Spring Boot on port 8081)...
echo        Opening new window...
cd /d "%~dp0task-manager-backend"
start "Task Manager Backend" cmd /k "mvnw.cmd spring-boot:run"

echo        Backend is starting... waiting 10 seconds
timeout /t 10 /nobreak

echo.
echo [3/3] Starting Frontend (React Vite on port 5173)...
echo        Opening new window...
cd /d "%~dp0task-manager-frontend"
start "Task Manager Frontend" cmd /k "npm install && npm run dev"

echo.
echo ========================================
echo ✓ Both services are starting!
echo ========================================
echo.
echo Backend:  http://localhost:8081
echo Frontend: http://localhost:5173
echo.
echo Press any key to close this window...
pause >nul

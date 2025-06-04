@echo off
REM Authentication API Test Script Runner for Windows
REM This batch file helps run the test_auth_api.py script with proper arguments

echo JobTicketInvoice Authentication API Test Runner
echo ==============================================

if "%1"=="" (
    echo Usage: test_auth.bat [command] [options]
    echo.
    echo Available commands:
    echo   register    Test user registration
    echo   login       Test user login
    echo   profile     Test profile retrieval
    echo   logo        Test logo upload
    echo.
    echo For more information, run: test_auth.bat help [command]
    exit /b
)

if "%1"=="help" (
    if "%2"=="register" (
        echo Register command usage:
        echo test_auth.bat register --name "User Name" --email "user@example.com" --password "Password123!" --role "tech" --job-type "pump_service_technician"
        echo test_auth.bat register --name "Manager Name" --email "manager@example.com" --password "Password123!" --role "manager" --company-name "Company Name"
    ) else if "%2"=="login" (
        echo Login command usage:
        echo test_auth.bat login --email "user@example.com" --password "Password123!"
    ) else if "%2"=="profile" (
        echo Profile command usage:
        echo test_auth.bat profile
    ) else if "%2"=="logo" (
        echo Logo upload command usage:
        echo test_auth.bat logo --logo-file "path\to\logo.png"
    ) else (
        echo Unknown command: %2
        echo Run test_auth.bat without arguments to see available commands
    )
    exit /b
)

REM Execute the Python script with all arguments
python test_auth_api.py %*

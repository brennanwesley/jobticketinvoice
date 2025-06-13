@echo off
echo 🔧 Switching to LOCAL development environment...
copy "frontend\.env.development" "frontend\.env" >nul
echo ✅ Frontend will connect to: http://localhost:8000/api/v1
echo 📝 Make sure your local backend is running on port 8000
echo.
echo 🔄 Restart your frontend development server to apply changes:
echo    cd frontend && npm start
echo.
echo 📋 Current environment configuration:
type "frontend\.env"

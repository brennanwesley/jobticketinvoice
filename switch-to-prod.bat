@echo off
echo 🌐 Switching to PRODUCTION environment...
copy "frontend\.env.production" "frontend\.env" >nul
echo ✅ Frontend will connect to: https://jobticketinvoice-backend.onrender.com/api/v1
echo 📝 Testing with real user accounts and production data
echo.
echo 🔄 Restart your frontend development server to apply changes:
echo    cd frontend && npm start
echo.
echo 📋 Current environment configuration:
type "frontend\.env"

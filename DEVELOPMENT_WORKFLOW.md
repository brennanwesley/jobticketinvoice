# Development Workflow Guide

## 🎯 Dual Environment Setup

You now have the perfect setup for both local development and production testing!

### 🔧 Local Development Environment
**Purpose**: Code development, debugging, database improvements, safe experimentation
- **Backend**: `http://localhost:8000` (FastAPI with SQLite)
- **Frontend**: `http://localhost:3002` 
- **Database**: `backend/app.db` (local SQLite file)
- **Use Cases**:
  - Testing new features before deployment
  - Database schema changes and improvements
  - Performance optimization testing
  - Safe experimentation with test data

### 🌐 Production Environment  
**Purpose**: Real user testing, integration testing, user acceptance
- **Backend**: `https://jobticketinvoice-backend.onrender.com` (Render deployment)
- **Frontend**: `https://jobticketinvoice.vercel.app` (Vercel deployment)
- **Database**: Production PostgreSQL on Render
- **Use Cases**:
  - Testing with real user accounts
  - User acceptance testing
  - Integration testing with production data
  - Performance testing under real conditions

## 🔄 Quick Environment Switching

### Switch to Local Development:
```powershell
.\switch-environment.ps1 local
cd frontend && npm start
```

### Switch to Production Testing:
```powershell
.\switch-environment.ps1 prod
cd frontend && npm start
```

## 📋 Recommended Workflow

### 1. **Feature Development** (Local)
```powershell
# Switch to local environment
.\switch-environment.ps1 local

# Start local backend
cd backend && uvicorn main:app --reload --port 8000

# Start frontend (in new terminal)
cd frontend && npm start

# Develop and test locally
```

### 2. **Production Testing** (Production)
```powershell
# Deploy your changes to production first
git add . && git commit -m "Your changes" && git push

# Switch to production environment
.\switch-environment.ps1 prod

# Start frontend pointing to production
cd frontend && npm start

# Test with real users and data
```

### 3. **Database Improvements** (Local First)
```powershell
# Always test database changes locally first
.\switch-environment.ps1 local

# Run your database improvement scripts
python add_missing_indexes.py
python database_audit_final_report.py

# Test the improvements locally
# Then deploy to production when satisfied
```

## 🎯 Best Practices

### ✅ **Do This:**
- **Develop locally first** - test all changes in local environment
- **Use production for user testing** - real accounts and data
- **Test database changes locally** before applying to production
- **Switch environments as needed** for different testing phases
- **Keep both environments in sync** with your latest code

### ❌ **Avoid This:**
- Don't test experimental features directly in production
- Don't make database schema changes in production without local testing
- Don't assume local behavior matches production behavior
- Don't forget to deploy changes before production testing

## 🔍 Environment Status Check

### Check Current Environment:
```powershell
# See which environment you're currently using
Get-Content .\frontend\.env
```

### Verify Backend Connection:
```powershell
# Test local backend
curl http://localhost:8000/api/v1/health

# Test production backend  
curl https://jobticketinvoice-backend.onrender.com/api/v1/health
```

## 📊 User Account Management

### Local Environment Users:
- `manager@test.com` / `TempPassword123!` (requires reset)
- `test@email.com` / `testpassword123` (newly created)

### Production Environment Users:
- Multiple real user accounts from your onboarding tests
- Use production frontend to see all accounts
- Create new test accounts as needed

## 🚀 Deployment Pipeline

1. **Develop** → Local environment
2. **Test** → Local environment  
3. **Deploy** → Git push (auto-deploys to Render/Vercel)
4. **Validate** → Production environment
5. **User Test** → Production environment with real users

This workflow gives you the best of both worlds: safe local development and real-world production testing!

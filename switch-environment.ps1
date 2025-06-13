# Environment Switcher Script
# Usage: .\switch-environment.ps1 local    (for local backend)
#        .\switch-environment.ps1 prod     (for production backend)

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("local", "prod", "production")]
    [string]$Environment
)

$frontendDir = ".\frontend"
$envFile = "$frontendDir\.env"

# Remove existing .env file if it exists
if (Test-Path $envFile) {
    Remove-Item $envFile
}

switch ($Environment.ToLower()) {
    "local" {
        Write-Host "🔧 Switching to LOCAL development environment..." -ForegroundColor Green
        Copy-Item "$frontendDir\.env.development" $envFile
        Write-Host "✅ Frontend will connect to: http://localhost:8000/api/v1" -ForegroundColor Green
        Write-Host "📝 Make sure your local backend is running on port 8000" -ForegroundColor Yellow
    }
    { $_ -in "prod", "production" } {
        Write-Host "🌐 Switching to PRODUCTION environment..." -ForegroundColor Blue
        Copy-Item "$frontendDir\.env.production" $envFile
        Write-Host "✅ Frontend will connect to: https://jobticketinvoice-backend.onrender.com/api/v1" -ForegroundColor Blue
        Write-Host "📝 Testing with real user accounts and production data" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🔄 Restart your frontend development server to apply changes:" -ForegroundColor Cyan
Write-Host "   cd frontend && npm start" -ForegroundColor White
Write-Host ""

# Show current environment
if (Test-Path $envFile) {
    Write-Host "📋 Current environment configuration:" -ForegroundColor Magenta
    Get-Content $envFile | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
}

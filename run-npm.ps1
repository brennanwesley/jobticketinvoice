# Script to run npm commands with full path
param(
    [Parameter(Mandatory=$true)]
    [string]$Command,
    
    [Parameter(Mandatory=$false)]
    [string]$WorkingDirectory = (Get-Location).Path
)

# Set working directory
Set-Location $WorkingDirectory

# Define the path to npm
$npmPath = "C:\Program Files\nodejs\npm.cmd"

# Check if npm exists at the specified path
if (-not (Test-Path $npmPath)) {
    Write-Error "npm not found at $npmPath"
    exit 1
}

# Run the npm command
Write-Host "Running: $npmPath $Command"
& $npmPath $Command.Split(" ")

# Return the exit code
exit $LASTEXITCODE

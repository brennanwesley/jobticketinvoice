# Component Migration Script

# Auth Components
$authComponents = @(
    "LoginForm.js",
    "LoginPage.js",
    "ManagerSignupForm.js",
    "TechSignupForm.js",
    "SignupPage.js",
    "RoleSelection.js",
    "ProtectedRoute.js",
    "AuthTestPage.js"
)

# Tickets Components
$ticketComponents = @(
    "JobTicketForm.js",
    "JobTicketFormSelector.js",
    "DraftTicketList.js",
    "DraftTicketView.js",
    "SubmittedTicketList.js",
    "VoiceRecorder.js",
    "ManualForm.js"
)

# Layout Components
$layoutComponents = @(
    "Sidebar.js",
    "AppDashboard.js",
    "AppRoutes.js",
    "LandingPage.js",
    "PublicLandingPage.js"
)

# Profile Components
$profileComponents = @(
    "UserProfile.js",
    "UserProfilePage.js"
)

# UI Components
$uiComponents = @(
    "LanguageToggle.js"
)

# Source and destination paths
$srcPath = "frontend\src\components"
$authPath = "frontend\src\components\auth"
$ticketsPath = "frontend\src\components\tickets"
$layoutPath = "frontend\src\components\layout"
$profilePath = "frontend\src\components\profile"
$uiPath = "frontend\src\components\ui"

# Function to copy files to destination
function Copy-Components {
    param (
        [string[]]$components,
        [string]$destination
    )
    
    foreach ($component in $components) {
        $sourcePath = Join-Path -Path $srcPath -ChildPath $component
        $destPath = Join-Path -Path $destination -ChildPath $component
        
        if (Test-Path $sourcePath) {
            Write-Host "Copying $component to $destination"
            Copy-Item -Path $sourcePath -Destination $destPath -Force
        } else {
            Write-Host "Warning: $component not found in source directory"
        }
    }
}

# Copy components to their respective directories
Write-Host "Moving Auth Components..."
Copy-Components -components $authComponents -destination $authPath

Write-Host "Moving Ticket Components..."
Copy-Components -components $ticketComponents -destination $ticketsPath

Write-Host "Moving Layout Components..."
Copy-Components -components $layoutComponents -destination $layoutPath

Write-Host "Moving Profile Components..."
Copy-Components -components $profileComponents -destination $profilePath

Write-Host "Moving UI Components..."
Copy-Components -components $uiComponents -destination $uiPath

# Move jobTicketForms to tickets/forms
$jobTicketFormsPath = "frontend\src\components\jobTicketForms"
$ticketFormsPath = "frontend\src\components\tickets\forms"

if (Test-Path $jobTicketFormsPath) {
    Write-Host "Moving Job Ticket Forms..."
    $formFiles = Get-ChildItem -Path $jobTicketFormsPath -File
    foreach ($file in $formFiles) {
        $destPath = Join-Path -Path $ticketFormsPath -ChildPath $file.Name
        Write-Host "Copying $($file.Name) to $ticketFormsPath"
        Copy-Item -Path $file.FullName -Destination $destPath -Force
    }
}

Write-Host "Component migration completed!"

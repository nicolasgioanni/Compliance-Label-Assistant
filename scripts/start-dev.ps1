[CmdletBinding()]
param(
    [int]$BackendPort = 8000,
    [int]$FrontendPort = 5173,
    [switch]$SkipSetup,
    [switch]$NoEnvFile
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

. (Join-Path $PSScriptRoot "lib\local-dev.ps1")

Assert-DevPort -Port $BackendPort -Name "BackendPort"
Assert-DevPort -Port $FrontendPort -Name "FrontendPort"

$repoRoot = Find-RepoRoot
$backendDir = Join-Path $repoRoot "backend"
$frontendDir = Join-Path $repoRoot "frontend"
$venvPython = Get-BackendVenvPython -RepoRoot $repoRoot
$nodeModules = Join-Path $frontendDir "node_modules"

if (-not $SkipSetup) {
    Write-Host "Running local setup before starting dev servers..."
    Initialize-EnvFiles -RepoRoot $repoRoot -NoEnvFile:$NoEnvFile
    Ensure-BackendDependencies -RepoRoot $repoRoot
    Ensure-FrontendDependencies -RepoRoot $repoRoot
}
else {
    if (-not (Test-Path -LiteralPath $venvPython)) {
        throw "backend\.venv is missing. Run .\scripts\setup-local.ps1, or rerun without -SkipSetup."
    }

    if (-not (Test-Path -LiteralPath $nodeModules)) {
        throw "frontend\node_modules is missing. Run .\scripts\setup-local.ps1, or rerun without -SkipSetup."
    }
}

Import-DotEnvFile -Path (Join-Path $backendDir ".env") -NoEnvFile:$NoEnvFile
Set-LocalDevEnvironment -BackendPort $BackendPort -FrontendPort $FrontendPort

Write-Host ""
Write-Host "Starting local dev servers in one terminal."
Write-Host "Backend:  http://127.0.0.1:$BackendPort"
Write-Host "Frontend: http://localhost:$FrontendPort"
Write-Host "Press Ctrl+C to stop both servers."
Write-Host ""

$backendProcess = Start-ManagedProcess `
    -Name "backend" `
    -FilePath $venvPython `
    -Arguments @("-m", "uvicorn", "app.main:app", "--reload", "--host", "127.0.0.1", "--port", "$BackendPort") `
    -WorkingDirectory $backendDir

$frontendProcess = Start-ManagedProcess `
    -Name "frontend" `
    -FilePath "cmd.exe" `
    -Arguments @("/d", "/c", "npm", "run", "dev", "--", "--host", "localhost", "--port", "$FrontendPort") `
    -WorkingDirectory $frontendDir

Wait-ManagedProcesses -ManagedProcesses @($backendProcess, $frontendProcess)

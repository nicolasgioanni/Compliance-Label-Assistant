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
$frontendDir = Join-Path $repoRoot "frontend"
$nodeModules = Join-Path $frontendDir "node_modules"

if (-not $SkipSetup) {
    Initialize-EnvFiles -RepoRoot $repoRoot -NoEnvFile:$NoEnvFile
    Ensure-FrontendDependencies -RepoRoot $repoRoot
}
elseif (-not (Test-Path -LiteralPath $nodeModules)) {
    throw "frontend\node_modules is missing. Run .\scripts\setup-local.ps1, or rerun without -SkipSetup."
}

Set-LocalDevEnvironment -BackendPort $BackendPort -FrontendPort $FrontendPort

Write-Host "Starting frontend on http://localhost:$FrontendPort"
Write-Host "Frontend API base URL: $env:VITE_API_BASE_URL"

Invoke-CheckedCommand `
    -FilePath "cmd.exe" `
    -Arguments @("/d", "/c", "npm", "run", "dev", "--", "--host", "localhost", "--port", "$FrontendPort") `
    -WorkingDirectory $frontendDir `
    -FailureMessage "Frontend dev server failed."

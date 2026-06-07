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
$venvPython = Get-BackendVenvPython -RepoRoot $repoRoot

if (-not $SkipSetup) {
    Initialize-EnvFiles -RepoRoot $repoRoot -NoEnvFile:$NoEnvFile
    Ensure-BackendDependencies -RepoRoot $repoRoot
}
elseif (-not (Test-Path -LiteralPath $venvPython)) {
    throw "backend\.venv is missing. Run .\scripts\setup-local.ps1, or rerun without -SkipSetup."
}

Import-DotEnvFile -Path (Join-Path $backendDir ".env") -NoEnvFile:$NoEnvFile
Set-LocalDevEnvironment -BackendPort $BackendPort -FrontendPort $FrontendPort

Write-Host "Starting backend on http://127.0.0.1:$BackendPort"
Write-Host "Health check: http://127.0.0.1:$BackendPort/health"

Push-Location -LiteralPath $backendDir
try {
    & $venvPython -m uvicorn app.main:app --reload --host 127.0.0.1 --port $BackendPort
    exit $LASTEXITCODE
}
finally {
    Pop-Location
}

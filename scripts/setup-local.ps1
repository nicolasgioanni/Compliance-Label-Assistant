[CmdletBinding()]
param(
    [int]$BackendPort = 8000,
    [int]$FrontendPort = 5173,
    [switch]$NoEnvFile
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

. (Join-Path $PSScriptRoot "lib\local-dev.ps1")

Assert-DevPort -Port $BackendPort -Name "BackendPort"
Assert-DevPort -Port $FrontendPort -Name "FrontendPort"

$repoRoot = Find-RepoRoot

Write-Host "Setting up local development from: $repoRoot"
Initialize-EnvFiles -RepoRoot $repoRoot -NoEnvFile:$NoEnvFile
Ensure-BackendDependencies -RepoRoot $repoRoot
Ensure-FrontendDependencies -RepoRoot $repoRoot

Write-Host ""
Write-Host "Local setup complete."
Write-Host "Backend URL:  http://127.0.0.1:$BackendPort"
Write-Host "Frontend URL: http://localhost:$FrontendPort"
Write-Host "Put your OpenAI key in backend\.env as OPENAI_API_KEY before running label verification."

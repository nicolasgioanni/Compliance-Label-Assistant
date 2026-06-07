Set-StrictMode -Version Latest

$LocalDevLibRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

function Find-RepoRoot {
    [CmdletBinding()]
    param(
        [string]$StartPath = (Get-Location).Path
    )

    $resolvedPath = Resolve-Path -LiteralPath $StartPath -ErrorAction SilentlyContinue
    if ($resolvedPath) {
        $currentPath = $resolvedPath.Path
    }
    else {
        $currentPath = $StartPath
    }

    if (Test-Path -LiteralPath $currentPath -PathType Leaf) {
        $currentPath = Split-Path -Parent $currentPath
    }

    $current = [System.IO.DirectoryInfo]::new($currentPath)
    while ($null -ne $current) {
        $backendRequirements = Join-Path $current.FullName "backend\requirements.txt"
        $frontendPackage = Join-Path $current.FullName "frontend\package.json"
        if ((Test-Path -LiteralPath $backendRequirements) -and (Test-Path -LiteralPath $frontendPackage)) {
            return $current.FullName
        }

        $current = $current.Parent
    }

    throw "Could not find the repository root. Run this from somewhere inside the label-compliance-verifier project."
}

function Assert-DevPort {
    [CmdletBinding()]
    param(
        [int]$Port,
        [string]$Name
    )

    if ($Port -lt 1 -or $Port -gt 65535) {
        throw "$Name must be between 1 and 65535. Received: $Port"
    }
}

function Assert-ExternalCommand {
    [CmdletBinding()]
    param(
        [string]$Name,
        [string]$InstallHint
    )

    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Missing required command '$Name'. $InstallHint"
    }
}

function Get-PythonLauncher {
    [CmdletBinding()]
    param()

    if (Get-Command py -ErrorAction SilentlyContinue) {
        return [pscustomobject]@{
            FilePath = "py"
            PrefixArgs = @("-3")
        }
    }

    if (Get-Command python -ErrorAction SilentlyContinue) {
        return [pscustomobject]@{
            FilePath = "python"
            PrefixArgs = @()
        }
    }

    throw "Missing Python. Install Python 3, then restart PowerShell so 'py' or 'python' is available."
}

function Get-BackendVenvPython {
    [CmdletBinding()]
    param(
        [string]$RepoRoot
    )

    return Join-Path $RepoRoot "backend\.venv\Scripts\python.exe"
}

function Get-FileSha256 {
    [CmdletBinding()]
    param(
        [string]$Path
    )

    return (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash
}

function Get-BackendRequirementsMarker {
    [CmdletBinding()]
    param(
        [string]$RepoRoot
    )

    return Join-Path $RepoRoot "backend\.venv\.requirements.sha256"
}

function Test-BackendRequirementsInstalled {
    [CmdletBinding()]
    param(
        [string]$VenvPython,
        [string]$RequirementsPath
    )

    $scriptPath = Join-Path $LocalDevLibRoot "check_requirements.py"

    $previousErrorActionPreference = $ErrorActionPreference
    $exitCode = 1
    try {
        $ErrorActionPreference = "Continue"
        $output = & $VenvPython $scriptPath $RequirementsPath 2>&1
        $exitCode = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }

    if ($exitCode -eq 0) {
        return $true
    }

    if ($output) {
        Write-Host "Backend dependency check found missing or outdated packages:"
        $output | ForEach-Object { Write-Host "  $_" }
    }

    return $false
}

function Invoke-CheckedCommand {
    [CmdletBinding()]
    param(
        [string]$FilePath,
        [string[]]$Arguments = @(),
        [string]$WorkingDirectory,
        [string]$FailureMessage
    )

    Push-Location -LiteralPath $WorkingDirectory
    try {
        & $FilePath @Arguments
        if ($LASTEXITCODE -ne 0) {
            throw "$FailureMessage Exit code: $LASTEXITCODE"
        }
    }
    finally {
        Pop-Location
    }
}

function Ensure-BackendDependencies {
    [CmdletBinding()]
    param(
        [string]$RepoRoot
    )

    $backendDir = Join-Path $RepoRoot "backend"
    $venvDir = Join-Path $backendDir ".venv"
    $venvPython = Get-BackendVenvPython -RepoRoot $RepoRoot
    $requirements = Join-Path $backendDir "requirements.txt"
    $requirementsMarker = Get-BackendRequirementsMarker -RepoRoot $RepoRoot
    $requirementsHash = Get-FileSha256 -Path $requirements

    if (-not (Test-Path -LiteralPath $venvPython)) {
        Write-Host "Creating backend virtual environment at backend\.venv..."
        $pythonLauncher = Get-PythonLauncher
        $venvArgs = @($pythonLauncher.PrefixArgs) + @("-m", "venv", $venvDir)
        Invoke-CheckedCommand `
            -FilePath $pythonLauncher.FilePath `
            -Arguments $venvArgs `
            -WorkingDirectory $RepoRoot `
            -FailureMessage "Failed to create backend virtual environment."
    }
    else {
        Write-Host "Using existing backend virtual environment at backend\.venv."
    }

    if (Test-Path -LiteralPath $requirementsMarker) {
        $cachedHash = (Get-Content -LiteralPath $requirementsMarker -Raw).Trim()
        if ($cachedHash -eq $requirementsHash) {
            Write-Host "Backend Python dependencies are up to date."
            return
        }
    }

    if (Test-BackendRequirementsInstalled -VenvPython $venvPython -RequirementsPath $requirements) {
        Set-Content -LiteralPath $requirementsMarker -Value $requirementsHash -Encoding ASCII
        Write-Host "Backend Python dependencies already satisfy requirements."
        return
    }

    Write-Host "Installing backend Python dependencies..."
    Invoke-CheckedCommand `
        -FilePath $venvPython `
        -Arguments @("-m", "pip", "install", "-r", $requirements) `
        -WorkingDirectory $backendDir `
        -FailureMessage "Failed to install backend Python dependencies."

    Set-Content -LiteralPath $requirementsMarker -Value $requirementsHash -Encoding ASCII
}

function Ensure-FrontendDependencies {
    [CmdletBinding()]
    param(
        [string]$RepoRoot
    )

    Assert-ExternalCommand -Name "npm" -InstallHint "Install Node.js LTS from https://nodejs.org/."

    $frontendDir = Join-Path $RepoRoot "frontend"
    $nodeModules = Join-Path $frontendDir "node_modules"

    if (Test-Path -LiteralPath $nodeModules) {
        Write-Host "Using existing frontend dependencies at frontend\node_modules."
        return
    }

    Write-Host "Installing frontend npm dependencies..."
    Invoke-CheckedCommand `
        -FilePath "cmd.exe" `
        -Arguments @("/d", "/c", "npm", "install") `
        -WorkingDirectory $frontendDir `
        -FailureMessage "Failed to install frontend npm dependencies."
}

function Initialize-EnvFiles {
    [CmdletBinding()]
    param(
        [string]$RepoRoot,
        [switch]$NoEnvFile
    )

    if ($NoEnvFile) {
        Write-Host "Skipping .env file creation because -NoEnvFile was supplied."
        return
    }

    $envPairs = @(
        @{ Example = "backend\.env.example"; Target = "backend\.env" },
        @{ Example = "frontend\.env.example"; Target = "frontend\.env" }
    )

    foreach ($pair in $envPairs) {
        $examplePath = Join-Path $RepoRoot $pair["Example"]
        $targetPath = Join-Path $RepoRoot $pair["Target"]

        if ((Test-Path -LiteralPath $examplePath) -and (-not (Test-Path -LiteralPath $targetPath))) {
            Copy-Item -LiteralPath $examplePath -Destination $targetPath
            Write-Host "Created $($pair["Target"]) from $($pair["Example"])."
        }
    }
}

function Import-DotEnvFile {
    [CmdletBinding()]
    param(
        [string]$Path,
        [switch]$NoEnvFile
    )

    if ($NoEnvFile) {
        return
    }

    if (-not (Test-Path -LiteralPath $Path)) {
        return
    }

    # Load key=value pairs into this PowerShell process without echoing secret values.
    foreach ($line in Get-Content -LiteralPath $Path) {
        $trimmed = $line.Trim()
        if ($trimmed.Length -eq 0 -or $trimmed.StartsWith("#")) {
            continue
        }

        $separatorIndex = $line.IndexOf("=")
        if ($separatorIndex -lt 1) {
            continue
        }

        $name = $line.Substring(0, $separatorIndex).Trim()
        $value = $line.Substring($separatorIndex + 1).Trim()

        if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
            $value = $value.Substring(1, $value.Length - 2)
        }

        if ($name -match "^[A-Za-z_][A-Za-z0-9_]*$") {
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }

    Write-Host "Loaded backend environment from backend\.env. Values are hidden."
}

function Set-LocalDevEnvironment {
    [CmdletBinding()]
    param(
        [int]$BackendPort,
        [int]$FrontendPort
    )

    if ([string]::IsNullOrWhiteSpace($env:ALLOWED_ORIGINS)) {
        $env:ALLOWED_ORIGINS = "http://localhost:$FrontendPort"
    }

    $env:VITE_API_BASE_URL = "http://127.0.0.1:$BackendPort"
}

function ConvertTo-ProcessArgumentString {
    [CmdletBinding()]
    param(
        [string[]]$Arguments
    )

    $quoted = foreach ($argument in $Arguments) {
        if ($argument -match '[\s"]') {
            '"' + ($argument -replace '"', '\"') + '"'
        }
        else {
            $argument
        }
    }

    return ($quoted -join " ")
}

function Start-ManagedProcess {
    [CmdletBinding()]
    param(
        [string]$Name,
        [string]$FilePath,
        [string[]]$Arguments,
        [string]$WorkingDirectory
    )

    $startInfo = [System.Diagnostics.ProcessStartInfo]::new()
    $startInfo.FileName = $FilePath
    $startInfo.Arguments = ConvertTo-ProcessArgumentString -Arguments $Arguments
    $startInfo.WorkingDirectory = $WorkingDirectory
    $startInfo.UseShellExecute = $false
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    $startInfo.CreateNoWindow = $true

    $process = [System.Diagnostics.Process]::new()
    $process.StartInfo = $startInfo

    if (-not $process.Start()) {
        throw "Failed to start $Name."
    }

    return [pscustomobject]@{
        Name = $Name
        Process = $process
        StdOut = $process.StandardOutput
        StdErr = $process.StandardError
        StdOutTask = $process.StandardOutput.ReadLineAsync()
        StdErrTask = $process.StandardError.ReadLineAsync()
    }
}

function Receive-ManagedProcessOutput {
    [CmdletBinding()]
    param(
        [object[]]$ManagedProcesses
    )

    foreach ($managed in $ManagedProcesses) {
        if ($null -ne $managed.StdOutTask -and $managed.StdOutTask.IsCompleted) {
            $line = $managed.StdOutTask.Result
            if ($null -eq $line) {
                $managed.StdOutTask = $null
            }
            else {
                Write-Host "[$($managed.Name)] $line"
                $managed.StdOutTask = $managed.StdOut.ReadLineAsync()
            }
        }

        if ($null -ne $managed.StdErrTask -and $managed.StdErrTask.IsCompleted) {
            $line = $managed.StdErrTask.Result
            if ($null -eq $line) {
                $managed.StdErrTask = $null
            }
            else {
                Write-Host "[$($managed.Name)] $line" -ForegroundColor Yellow
                $managed.StdErrTask = $managed.StdErr.ReadLineAsync()
            }
        }
    }
}

function Stop-ManagedProcess {
    [CmdletBinding()]
    param(
        [object]$ManagedProcess
    )

    if ($null -eq $ManagedProcess -or $ManagedProcess.Process.HasExited) {
        return
    }

    # Uvicorn reload and npm can create children; taskkill /T keeps cleanup predictable on Windows.
    if ($env:OS -eq "Windows_NT" -and (Get-Command taskkill.exe -ErrorAction SilentlyContinue)) {
        & taskkill.exe /PID $ManagedProcess.Process.Id /T /F 2>$null | Out-Null
    }
    else {
        $ManagedProcess.Process.Kill($true)
    }
}

function Wait-ManagedProcesses {
    [CmdletBinding()]
    param(
        [object[]]$ManagedProcesses
    )

    try {
        while ($true) {
            Receive-ManagedProcessOutput -ManagedProcesses $ManagedProcesses

            $exited = @($ManagedProcesses | Where-Object { $_.Process.HasExited })
            if ($exited.Count -gt 0) {
                Start-Sleep -Milliseconds 200
                Receive-ManagedProcessOutput -ManagedProcesses $ManagedProcesses

                foreach ($managed in $exited) {
                    if ($managed.Process.ExitCode -ne 0) {
                        throw "$($managed.Name) exited with code $($managed.Process.ExitCode)."
                    }

                    Write-Host "$($managed.Name) exited."
                }

                return
            }

            Start-Sleep -Milliseconds 100
        }
    }
    finally {
        foreach ($managed in $ManagedProcesses) {
            Stop-ManagedProcess -ManagedProcess $managed
        }
    }
}

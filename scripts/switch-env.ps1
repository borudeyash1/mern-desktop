param(
    [ValidateSet('local', 'prod')]
    [string]$Environment = 'prod'
)

# Get the repository root (parent of scripts directory)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDir

$clientEnvPath = Join-Path $repoRoot 'Project\Project-Management\client\.env'
$serverEnvPath = Join-Path $repoRoot 'Project\Project-Management\server\.env'
$configPath = Join-Path $repoRoot 'saarthi.config.json'

$settings = @{
    prod = @{
        FrontendUrl      = 'https://sartthi.com'
        ApiBase          = 'https://sartthi.com/api'
        ApiFallbacks     = @('https://api.sartthi.com/api', 'http://localhost:5000/api')
        ReactApiUrl      = '/api'
        ServerNodeEnv    = 'production'
        ServerFrontend   = 'https://sartthi.com'
    }
    local = @{
        FrontendUrl      = 'http://localhost:3000'
        ApiBase          = 'http://localhost:5000/api'
        ApiFallbacks     = @('https://sartthi.com/api')
        ReactApiUrl      = 'http://localhost:5000/api'
        ServerNodeEnv    = 'development'
        ServerFrontend   = 'http://localhost:3000'
    }
}

$selected = $settings[$Environment]
if (-not $selected) {
    Write-Error "Unknown environment '$Environment'."
    exit 1
}

function Set-EnvValues {
    param(
        [string]$Path,
        [hashtable]$Pairs
    )

    if (-not (Test-Path $Path)) {
        Write-Host "[skip] $Path not found, leaving untouched." -ForegroundColor Yellow
        return
    }

    $lines = [System.Collections.Generic.List[string]]::new()
    $lines.AddRange([string[]](Get-Content $Path))

    foreach ($key in $Pairs.Keys) {
        $value = $Pairs[$key]
        $pattern = "^\s*$key\s*="
        $updated = $false
        for ($i = 0; $i -lt $lines.Count; $i++) {
            if ($lines[$i] -match $pattern) {
                $lines[$i] = "$key=$value"
                $updated = $true
            }
        }
        if (-not $updated) {
            $lines.Add("$key=$value")
        }
    }

    Set-Content -Path $Path -Value $lines -Encoding UTF8
    Write-Host "[ok] Updated $Path" -ForegroundColor Green
}

if (Test-Path $configPath) {
    $config = Get-Content $configPath -Raw | ConvertFrom-Json
    if (-not $config.frontend) {
        $config | Add-Member -NotePropertyName 'frontend' -NotePropertyValue (@{})
    }
    $config.frontend.deployedUrl = $selected.FrontendUrl
    $config.apiBase = $selected.ApiBase
    $config.apiFallbacks = $selected.ApiFallbacks
    $config | ConvertTo-Json -Depth 10 | Set-Content $configPath -Encoding UTF8
    Write-Host "[ok] Updated saarthi.config.json" -ForegroundColor Green
} else {
    Write-Host "[skip] saarthi.config.json not found" -ForegroundColor Yellow
}

Set-EnvValues -Path $clientEnvPath -Pairs @{ 'REACT_APP_API_URL' = $selected.ReactApiUrl }
Set-EnvValues -Path $serverEnvPath -Pairs @{
    'NODE_ENV'    = $selected.ServerNodeEnv
    'FRONTEND_URL' = $selected.ServerFrontend
}

Write-Host "Environment switched to $Environment" -ForegroundColor Cyan

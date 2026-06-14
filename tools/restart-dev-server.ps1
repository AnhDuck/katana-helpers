param(
  [switch]$Foreground
)

$ErrorActionPreference = "Stop"

$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$Port = 5174
$HealthUrl = "http://127.0.0.1:$Port/health"
$StatusPath = Join-Path $Root ".dev-server-status.json"

function Stop-ExistingDevServer {
  if (Test-Path -LiteralPath $StatusPath) {
    try {
      $status = Get-Content -LiteralPath $StatusPath -Raw | ConvertFrom-Json
      if ($status.pid) {
        $process = Get-Process -Id $status.pid -ErrorAction SilentlyContinue
        if ($process) {
          Write-Host "Stopping existing dev server process $($process.Id) from status file..."
          Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        }
      }
    } catch {
      Write-Host "Could not read existing status file: $($_.Exception.Message)"
    }
  }

  try {
    $listeners = Get-NetTCPConnection -LocalAddress 127.0.0.1 -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    foreach ($listener in $listeners) {
      if ($listener.OwningProcess) {
        Write-Host "Stopping process $($listener.OwningProcess) listening on port $Port..."
        Stop-Process -Id $listener.OwningProcess -Force -ErrorAction SilentlyContinue
      }
    }
  } catch {
    Write-Host "Could not inspect port $Port listeners: $($_.Exception.Message)"
  }
}

function Wait-ForHealth {
  for ($attempt = 1; $attempt -le 25; $attempt += 1) {
    try {
      $response = Invoke-WebRequest -UseBasicParsing $HealthUrl -TimeoutSec 2
      if ($response.StatusCode -eq 200) {
        Write-Host "Dev server is healthy: $HealthUrl"
        return
      }
    } catch {
      Start-Sleep -Milliseconds 200
    }
  }

  throw "Dev server did not become healthy at $HealthUrl."
}

Set-Location $Root

Stop-ExistingDevServer

Write-Host "Building Katana Helpers userscripts..."
& node "tools\build-release.js"
if ($LASTEXITCODE -ne 0) {
  throw "Build failed with exit code $LASTEXITCODE."
}

if ($Foreground) {
  Write-Host ""
  Write-Host "Starting Katana Helpers dev server in this window..."
  Write-Host "Install or update Tampermonkey from:"
  Write-Host "  http://127.0.0.1:$Port/userscript/katana-helpers.dev.user.js"
  Write-Host ""
  Write-Host "Leave this window open. Press Ctrl+C to stop the server."
  Write-Host ""
  & node "tools\dev-server.js"
  exit $LASTEXITCODE
}

Write-Host "Starting Katana Helpers dev server in the background..."
$process = Start-Process -FilePath "node" -ArgumentList "tools\dev-server.js" -WorkingDirectory $Root -WindowStyle Hidden -PassThru
Write-Host "Started process $($process.Id)."

Wait-ForHealth
$status = [ordered]@{
  pid = $process.Id
  url = "http://127.0.0.1:$Port"
  healthUrl = $HealthUrl
  devUserscriptUrl = "http://127.0.0.1:$Port/userscript/katana-helpers.dev.user.js"
  startedAt = (Get-Date).ToString("o")
}
$status | ConvertTo-Json | Set-Content -LiteralPath $StatusPath -Encoding UTF8
Write-Host "Dev userscript URL: http://127.0.0.1:$Port/userscript/katana-helpers.dev.user.js"
Write-Host "Status file: $StatusPath"

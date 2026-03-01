$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path.ToLowerInvariant()
$projectPattern = [regex]::Escape($projectRoot)

$targets = Get-CimInstance Win32_Process |
  Where-Object {
    $_.CommandLine -and (
      (
        $_.Name -eq "node.exe" -and
        $_.CommandLine.ToLowerInvariant() -match "vite"
      ) -or (
        $_.Name -eq "esbuild.exe"
      )
    ) -and $_.CommandLine.ToLowerInvariant() -match $projectPattern
  }

if (-not $targets) {
  Write-Output "[kill:vite] no matching vite process"
  exit 0
}

foreach ($proc in $targets) {
  try {
    Stop-Process -Id $proc.ProcessId -Force -ErrorAction Stop
    Write-Output "[kill:vite] stopped PID $($proc.ProcessId)"
  }
  catch {
    Write-Output "[kill:vite] failed PID $($proc.ProcessId): $($_.Exception.Message)"
  }
}

Start-Sleep -Milliseconds 200

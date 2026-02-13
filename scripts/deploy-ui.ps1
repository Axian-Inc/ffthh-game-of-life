Param(
  [string]$Bucket,
  [switch]$Confirm
)

$ErrorActionPreference = "Stop"

if (-not $Bucket -and $env:UI_BUCKET) {
  $Bucket = $env:UI_BUCKET
}

if (-not $Bucket) {
  Write-Error "UI bucket must be set via UI_BUCKET or -Bucket."
}

$syncCmd = "aws s3 sync src/ui/dist \"s3://$Bucket\" --delete"

if (-not $Confirm) {
  Write-Host "Dry run: no changes made. To deploy, re-run with -Confirm."
  Write-Host "Would run: $syncCmd"
  exit 0
}

& "$PSScriptRoot/build-ui.sh"
Invoke-Expression $syncCmd

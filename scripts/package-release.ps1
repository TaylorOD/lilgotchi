param([string]$OutputDirectory = (Join-Path $env:TEMP 'lilgotchi-releases'))
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
Push-Location $projectRoot
try {
  $changes = git status --porcelain
  if ($LASTEXITCODE -ne 0 -or $changes) { throw 'Commit the reviewed source before packaging a named release' }
  node scripts/build.mjs
  if ($LASTEXITCODE -ne 0) { throw 'Build failed' }
  $version = (Get-Content -LiteralPath (Join-Path $projectRoot 'package.json') -Raw | ConvertFrom-Json).version
  $revision = (git rev-parse --short HEAD).Trim()
  if ($LASTEXITCODE -ne 0) { throw 'Could not identify source revision' }
  New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
  $archive = Join-Path $OutputDirectory "lilgotchi-$version-$revision.zip"
  if (Test-Path -LiteralPath $archive) { throw "Archive already exists: $archive" }
  Compress-Archive -Path (Join-Path $projectRoot 'dist/*') -DestinationPath $archive
  Write-Output $archive
} finally { Pop-Location }

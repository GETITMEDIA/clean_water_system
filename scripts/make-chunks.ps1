param(
  [string]$Root = "d:\xampfolder\htdocs\CleanWater",
  [string]$OutDir = "d:\xampfolder\htdocs\CleanWater\dist_chunks",
  [double]$TargetMB = 8.0
)

if (Test-Path $OutDir) { Remove-Item $OutDir -Recurse -Force }
New-Item -ItemType Directory -Path $OutDir | Out-Null

Set-Location $Root

# Collect all files that belong in the deployment (relative paths), excluding dev-only stuff
$includeRoots = @("api", "assets", "components", "data", "styles")
$files = @()
foreach ($r in $includeRoots) {
  $files += Get-ChildItem -Recurse -File -Path $r | Where-Object { $_.FullName -notmatch '\\_files\\' }
}
$files += Get-ChildItem -File -Filter "*.html"
$files += Get-Item "style.css", "script.js", ".htaccess"

$targetBytes = $TargetMB * 1MB

# Separate out any single file bigger than target - it gets its own zip (best effort)
$bins = New-Object System.Collections.Generic.List[System.Object]
$currentBin = New-Object System.Collections.Generic.List[System.Object]
$currentSize = 0

foreach ($f in ($files | Sort-Object FullName)) {
  $relPath = $f.FullName.Substring($Root.Length).TrimStart('\')
  $len = $f.Length
  if ($len -ge $targetBytes) {
    # oversized single file -> its own bin
    $bins.Add(@(@{Path=$f.FullName; Rel=$relPath}))
    continue
  }
  if (($currentSize + $len) -gt $targetBytes -and $currentBin.Count -gt 0) {
    $bins.Add($currentBin)
    $currentBin = New-Object System.Collections.Generic.List[System.Object]
    $currentSize = 0
  }
  $currentBin.Add(@{Path=$f.FullName; Rel=$relPath})
  $currentSize += $len
}
if ($currentBin.Count -gt 0) { $bins.Add($currentBin) }

$i = 1
foreach ($bin in $bins) {
  $zipName = Join-Path $OutDir ("part-{0:D2}.zip" -f $i)
  $stagingDir = Join-Path $OutDir ("staging-{0:D2}" -f $i)
  New-Item -ItemType Directory -Path $stagingDir | Out-Null
  foreach ($entry in $bin) {
    $destPath = Join-Path $stagingDir $entry.Rel
    $destDir = Split-Path $destPath -Parent
    if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }
    Copy-Item $entry.Path $destPath
  }
  Compress-Archive -Path (Join-Path $stagingDir '*') -DestinationPath $zipName -CompressionLevel Optimal
  Remove-Item $stagingDir -Recurse -Force
  $i++
}

Get-ChildItem $OutDir -Filter "*.zip" | Select-Object Name, @{N='SizeMB';E={[math]::Round($_.Length/1MB,2)}} | Sort-Object Name

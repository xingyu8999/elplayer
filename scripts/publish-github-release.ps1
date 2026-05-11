param(
  [string]$Tag = "v5.3.4",
  [string]$Title = "Elplayer v5.3.4",
  [string]$Repo = "xingyu8999/elplayer"
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Error "未检测到 GitHub CLI。请先安装 gh，并执行 gh auth login。"
}

$notes = Get-Content ".github/release-template.md" -Raw
$assets = @()
if (Test-Path "release/Elplayer-5.3.4-Setup-x64.exe") { $assets += "release/Elplayer-5.3.4-Setup-x64.exe" }
Get-ChildItem "release" -ErrorAction SilentlyContinue -Filter "Elplayer-5.3.4*.dmg" | ForEach-Object { $assets += $_.FullName }
Get-ChildItem "release" -ErrorAction SilentlyContinue -Filter "Elplayer-5.3.4*.zip" | ForEach-Object { $assets += $_.FullName }

if ($assets.Count -eq 0) {
  Write-Error "release/ 目录下没有找到可上传的 v5.3.4 安装包。请先运行 npm run dist:win 或 npm run dist:mac。"
}

gh release create $Tag $assets --repo $Repo --title $Title --notes $notes
Write-Host "GitHub Release 已创建：$Tag"

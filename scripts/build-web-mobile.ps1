param(
    [string]$CreatorPath = $env:COCOS_CREATOR_PATH
)
$ErrorActionPreference = 'Stop'
if (-not $CreatorPath -or -not (Test-Path -LiteralPath $CreatorPath -PathType Leaf)) {
    throw 'Set COCOS_CREATOR_PATH to the installed Creator 3.8.8 executable, or pass -CreatorPath.'
}
$projectRoot = Split-Path -Parent $PSScriptRoot
$logDirectory = Join-Path $projectRoot 'temp'
New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null
$logPath = Join-Path $logDirectory 'creator-web-mobile.log'
$configPath = Join-Path $PSScriptRoot 'build-web-mobile.json'
$buildOptions = 'configPath=' + $configPath + ';logDest=' + $logPath
$process = Start-Process -FilePath $CreatorPath -ArgumentList @('--project', ('"' + $projectRoot + '"'), '--build', ('"' + $buildOptions + '"')) -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logDirectory 'creator-web-mobile.stdout.log') -RedirectStandardError (Join-Path $logDirectory 'creator-web-mobile.stderr.log') -PassThru -Wait
if ($process.ExitCode -ne 36) {
    throw "Creator build failed with exit code $($process.ExitCode). See $logPath"
}
Write-Output "Creator build succeeded (exit 36). Log: $logPath"

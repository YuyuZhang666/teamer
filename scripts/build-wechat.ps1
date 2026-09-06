param(
    [string]$CreatorPath = $env:COCOS_CREATOR_PATH
)

$ErrorActionPreference = 'Stop'
$expectedCreatorExitCode = 36
$expectedAppId = 'wx79a1c555206206f6'

if (-not $CreatorPath -or -not (Test-Path -LiteralPath $CreatorPath -PathType Leaf)) {
    throw 'Set COCOS_CREATOR_PATH to the installed Creator 3.8.8 executable, or pass -CreatorPath.'
}

$projectRoot = Split-Path -Parent $PSScriptRoot
$outputRoot = Join-Path $projectRoot 'build\wechatgame'
$logDirectory = Join-Path $projectRoot 'temp'
$logPath = Join-Path $logDirectory 'creator-wechatgame.log'
$stdoutPath = Join-Path $logDirectory 'creator-wechatgame.stdout.log'
$stderrPath = Join-Path $logDirectory 'creator-wechatgame.stderr.log'
$configPath = Join-Path $PSScriptRoot 'build-wechat.json'

New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null

$buildOptions = 'configPath=' + $configPath + ';logDest=' + $logPath
$process = Start-Process `
    -FilePath $CreatorPath `
    -ArgumentList @('--project', ('"' + $projectRoot + '"'), '--build', ('"' + $buildOptions + '"')) `
    -WindowStyle Hidden `
    -RedirectStandardOutput $stdoutPath `
    -RedirectStandardError $stderrPath `
    -PassThru `
    -Wait

if ($process.ExitCode -ne $expectedCreatorExitCode) {
    throw "Creator WeChat build failed with exit code $($process.ExitCode). See $logPath"
}

function Set-JsonProperty {
    param(
        [Parameter(Mandatory = $true)]$InputObject,
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)]$Value
    )

    if ($InputObject.PSObject.Properties[$Name]) {
        $InputObject.$Name = $Value
    } else {
        $InputObject | Add-Member -NotePropertyName $Name -NotePropertyValue $Value
    }
}

function Write-JsonWithoutBom {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)]$Value
    )

    $json = $Value | ConvertTo-Json -Depth 100
    $utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $json + [Environment]::NewLine, $utf8WithoutBom)
}

$projectConfigPath = Join-Path $outputRoot 'project.config.json'
$gameConfigPath = Join-Path $outputRoot 'game.json'

if (-not (Test-Path -LiteralPath $projectConfigPath -PathType Leaf)) {
    throw "Creator build did not produce $projectConfigPath"
}
if (-not (Test-Path -LiteralPath $gameConfigPath -PathType Leaf)) {
    throw "Creator build did not produce $gameConfigPath"
}

# Creator 3.8.8 ships a legacy WeChat template with compileType "game".
# Normalize only the public generated contract; private Developer Tools overrides
# remain untouched so the verifier can expose any effective-value conflict.
$projectConfig = Get-Content -LiteralPath $projectConfigPath -Raw -Encoding UTF8 | ConvertFrom-Json
Set-JsonProperty -InputObject $projectConfig -Name 'appid' -Value $expectedAppId
Set-JsonProperty -InputObject $projectConfig -Name 'compileType' -Value 'minigame'
Write-JsonWithoutBom -Path $projectConfigPath -Value $projectConfig

$gameConfig = Get-Content -LiteralPath $gameConfigPath -Raw -Encoding UTF8 | ConvertFrom-Json
Set-JsonProperty -InputObject $gameConfig -Name 'deviceOrientation' -Value 'portrait'
Write-JsonWithoutBom -Path $gameConfigPath -Value $gameConfig

$verifierPath = Join-Path $PSScriptRoot 'verify-wechat-build.mjs'
& node $verifierPath $outputRoot $expectedAppId
if ($LASTEXITCODE -ne 0) {
    throw "Generated WeChat build failed verification with exit code $LASTEXITCODE."
}

Write-Output "Creator WeChat build succeeded (exit $expectedCreatorExitCode). Log: $logPath"

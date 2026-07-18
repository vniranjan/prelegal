$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

docker build -t prelegal .
docker rm -f prelegal 2>$null
docker run -d --rm --name prelegal -p 8000:8000 --env-file .env prelegal

Write-Host "Prelegal is running at http://localhost:8000"

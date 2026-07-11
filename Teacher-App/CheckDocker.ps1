# CheckDocker.ps1
# Starts Docker Desktop if not running, waits until ready, then lists running containers.

$dockerDesktopPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"

Write-Host "Checking if Docker Desktop is running..."

if (-not (Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue)) {
    Write-Host "Docker Desktop not running. Starting..."
    Start-Process $dockerDesktopPath
} else {
    Write-Host "Docker Desktop is already running."
}

Write-Host "Waiting for Docker to be ready..."
while (!(docker info 2>$null)) {
    Start-Sleep -Seconds 2
}

Write-Host "Docker is ready!"
Write-Host "Listing running containers..."
docker ps

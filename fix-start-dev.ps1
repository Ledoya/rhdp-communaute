# fix-start-dev.ps1
# Usage: powershell -ExecutionPolicy Bypass -File .\fix-start-dev.ps1

Write-Host "=== RHDP DEV FIX & DEMARRAGE ===" -ForegroundColor Cyan

$port = 5001
Write-Host "Vérification du port $port ..."
$lines = netstat -ano | Select-String ":$port" | ForEach-Object { $_.Line.Trim() }
if ($lines) {
    Write-Host "Processus(s) trouvés sur le port $port:" -ForegroundColor Yellow
    $lines | ForEach-Object { Write-Host $_ }
    foreach ($line in $lines) {
        $parts = $line -split '\s+';
        $pid = $parts[-1];
        if ($pid -and $pid -match '^\d+$') {
            Write-Host "Killing PID $pid ..." -ForegroundColor Yellow
            try {
                taskkill /F /PID $pid | Out-Null
                Write-Host "PID $pid stopped." -ForegroundColor Green
            } catch {
                Write-Host "Impossible de kill PID $pid : $_" -ForegroundColor Red
            }
        }
    }
} else {
    Write-Host "Aucun process sur le port $port." -ForegroundColor Green
}

# Vérification des env vars backend
$envFile1 = "c:\Users\abrah\rhdp-communaute\backend\.env"
$envFile2 = "c:\Users\abrah\rhdp-communaute\backend\.env.production"
if (Test-Path $envFile1) { Write-Host "Fichier .env présent." -ForegroundColor Green } else { Write-Host "Fichier .env absent." -ForegroundColor Red }
if (Test-Path $envFile2) { Write-Host ".env.production présent." -ForegroundColor Green } else { Write-Host ".env.production absent." -ForegroundColor Yellow }

function CheckVar($name) {
    if ($null -ne (Get-ChildItem env:$name -ErrorAction SilentlyContinue)) {
        Write-Host "$name trouvé dans env" -ForegroundColor Green
    } else {
        Write-Host "$name non défini dans env" -ForegroundColor Yellow
    }
}
CheckVar SUPABASE_URL
CheckVar SUPABASE_SERVICE_KEY
CheckVar FRONTEND_URL
CheckVar JWT_SECRET

# Démarrage backend
Write-Host "Démarrage du backend..." -ForegroundColor Cyan
Push-Location "c:\Users\abrah\rhdp-communaute\backend"
if (Test-Path ./node_modules/.bin/nodemon) {
    Start-Process -NoNewWindow -FilePath "cmd.exe" -ArgumentList "/c", "npm run dev";
} else {
    Write-Host "nodemon introuvable, exécute npm install dans backend en priorité." -ForegroundColor Red
}
Pop-Location

# Démarrage frontend build (optionnel)
Write-Host "Build frontend..." -ForegroundColor Cyan
Push-Location "c:\Users\abrah\rhdp-communaute\frontend"
npm run build
Pop-Location

Write-Host "=== FIN ===" -ForegroundColor Cyan

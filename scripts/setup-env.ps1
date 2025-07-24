# Create a proper .env file by copying this template
# Copy .env.example to .env and fill in your actual values

# Check if .env exists
if (!(Test-Path ".env")) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created! Please edit it with your actual API keys." -ForegroundColor Green
    Write-Host ""
    Write-Host "Required steps:" -ForegroundColor Cyan
    Write-Host "1. Get TMDB API key from: https://www.themoviedb.org/settings/api" -ForegroundColor White
    Write-Host "2. Get Firebase Admin SDK key from your Firebase Console" -ForegroundColor White
    Write-Host "3. Edit .env file with your actual keys" -ForegroundColor White
} else {
    Write-Host ".env file already exists" -ForegroundColor Green
}

# Initialize database
Write-Host "Initializing database..." -ForegroundColor Yellow
npm run db:push
Write-Host "✅ Database initialized" -ForegroundColor Green

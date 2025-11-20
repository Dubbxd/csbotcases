# CS:GO Discord Bot - Automated Setup Script
# Run this script to set up the bot automatically

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  CS:GO Discord Bot - Automated Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js 20+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Node.js $nodeVersion found" -ForegroundColor Green

# Check npm
Write-Host "Checking npm installation..." -ForegroundColor Yellow
$npmVersion = npm --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: npm is not installed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ npm $npmVersion found" -ForegroundColor Green

# Install dependencies
Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install dependencies!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencies installed" -ForegroundColor Green

# Check for .env file
Write-Host ""
Write-Host "Checking environment configuration..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "⚠ .env file not found. Please configure it before continuing." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Required configuration:" -ForegroundColor Cyan
    Write-Host "  1. DISCORD_TOKEN - Your Discord bot token" -ForegroundColor White
    Write-Host "  2. DISCORD_CLIENT_ID - Your Discord application ID" -ForegroundColor White
    Write-Host "  3. DATABASE_URL - Your PostgreSQL connection string" -ForegroundColor White
    Write-Host ""
    
    $continue = Read-Host "Have you configured the .env file? (y/n)"
    if ($continue -ne "y") {
        Write-Host "Please configure .env and run this script again." -ForegroundColor Yellow
        exit 0
    }
}
Write-Host "✓ Environment file found" -ForegroundColor Green

# Check PostgreSQL
Write-Host ""
Write-Host "Checking database connection..." -ForegroundColor Yellow
$dbCheck = Read-Host "Is PostgreSQL running and DATABASE_URL configured in .env? (y/n)"
if ($dbCheck -ne "y") {
    Write-Host "Please start PostgreSQL and configure DATABASE_URL in .env" -ForegroundColor Yellow
    exit 0
}

# Check Redis
Write-Host ""
Write-Host "Checking Redis connection..." -ForegroundColor Yellow
$redisCheck = Read-Host "Is Redis running? (y/n)"
if ($redisCheck -ne "y") {
    Write-Host "⚠ Redis is required for cooldowns. The bot may have limited functionality." -ForegroundColor Yellow
    $continueWithoutRedis = Read-Host "Continue anyway? (y/n)"
    if ($continueWithoutRedis -ne "y") {
        exit 0
    }
}

# Generate Prisma client
Write-Host ""
Write-Host "Generating Prisma client..." -ForegroundColor Yellow
npm run prisma:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to generate Prisma client!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Prisma client generated" -ForegroundColor Green

# Run migrations
Write-Host ""
Write-Host "Running database migrations..." -ForegroundColor Yellow
npm run prisma:migrate
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to run migrations!" -ForegroundColor Red
    Write-Host "Make sure DATABASE_URL is correct in .env" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Database migrations complete" -ForegroundColor Green

# Seed database
Write-Host ""
Write-Host "Seeding database with initial data..." -ForegroundColor Yellow
npx tsx src/db/seed.ts
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to seed database!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Database seeded successfully" -ForegroundColor Green

# Deploy commands
Write-Host ""
Write-Host "Deploying slash commands to Discord..." -ForegroundColor Yellow
npm run deploy-commands
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to deploy commands!" -ForegroundColor Red
    Write-Host "Make sure DISCORD_TOKEN and DISCORD_CLIENT_ID are correct in .env" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Commands deployed successfully" -ForegroundColor Green

# Success!
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Setup Complete! 🎉" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Invite the bot to your server" -ForegroundColor White
Write-Host "  2. Run: npm run dev" -ForegroundColor White
Write-Host "  3. Test with /ping in Discord" -ForegroundColor White
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "  • QUICKSTART.md - Quick reference" -ForegroundColor White
Write-Host "  • INSTALLATION.md - Detailed setup guide" -ForegroundColor White
Write-Host "  • COMMANDS.md - All available commands" -ForegroundColor White
Write-Host ""
Write-Host "Ready to start? Run: npm run dev" -ForegroundColor Yellow

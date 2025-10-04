@echo off
echo ========================================
echo  Asteroid Impact Simulator Launcher
echo  NASA Space Apps Challenge 2025
echo ========================================
echo.

REM Check if .env exists
if not exist .env (
    echo [WARNING] .env file not found!
    echo Creating from .env.example...
    copy .env.example .env
    echo.
    echo Please edit .env and add your NASA API key
    echo Get one at: https://api.nasa.gov/
    echo.
    pause
)

REM Check if node_modules exists
if not exist node_modules (
    echo [INFO] Installing Node.js dependencies...
    call npm install
    echo.
)

REM Check if Python packages are installed
python -c "import flask" 2>nul
if errorlevel 1 (
    echo [INFO] Installing Python dependencies...
    pip install -r requirements.txt
    echo.
)

echo ========================================
echo  Starting Servers...
echo ========================================
echo.
echo [1/2] Starting Node.js server on port 3000...
start "Asteroid Simulator - Node.js" cmd /k "npm start"
timeout /t 3 /nobreak >nul

echo [2/2] Starting Flask server on port 5000...
start "Asteroid Simulator - Flask" cmd /k "python app.py"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo  Servers Started!
echo ========================================
echo.
echo Node.js Server: http://localhost:3000
echo Flask API:      http://localhost:5000
echo.
echo Opening browser in 5 seconds...
timeout /t 5 /nobreak >nul

start http://localhost:3000

echo.
echo Press any key to stop all servers...
pause >nul

echo.
echo Stopping servers...
taskkill /FI "WindowTitle eq Asteroid Simulator - Node.js*" /T /F
taskkill /FI "WindowTitle eq Asteroid Simulator - Flask*" /T /F

echo.
echo All servers stopped.
pause

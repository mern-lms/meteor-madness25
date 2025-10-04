#!/bin/bash

echo "========================================"
echo " Asteroid Impact Simulator Launcher"
echo " NASA Space Apps Challenge 2025"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}[WARNING]${NC} .env file not found!"
    echo "Creating from .env.example..."
    cp .env.example .env
    echo ""
    echo "Please edit .env and add your NASA API key"
    echo "Get one at: https://api.nasa.gov/"
    echo ""
    read -p "Press enter to continue..."
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${GREEN}[INFO]${NC} Installing Node.js dependencies..."
    npm install
    echo ""
fi

# Check if Python packages are installed
python3 -c "import flask" 2>/dev/null
if [ $? -ne 0 ]; then
    echo -e "${GREEN}[INFO]${NC} Installing Python dependencies..."
    pip3 install -r requirements.txt
    echo ""
fi

echo "========================================"
echo " Starting Servers..."
echo "========================================"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $NODE_PID $FLASK_PID 2>/dev/null
    echo "All servers stopped."
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Node.js server
echo -e "${GREEN}[1/2]${NC} Starting Node.js server on port 3000..."
node server.js &
NODE_PID=$!
sleep 2

# Start Flask server
echo -e "${GREEN}[2/2]${NC} Starting Flask server on port 5000..."
python3 app.py &
FLASK_PID=$!
sleep 2

echo ""
echo "========================================"
echo " Servers Started!"
echo "========================================"
echo ""
echo -e "${GREEN}Node.js Server:${NC} http://localhost:3000"
echo -e "${GREEN}Flask API:${NC}      http://localhost:5000"
echo ""
echo "Opening browser..."

# Open browser (cross-platform)
if command -v xdg-open > /dev/null; then
    xdg-open http://localhost:3000
elif command -v open > /dev/null; then
    open http://localhost:3000
fi

echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

# Wait for processes
wait $NODE_PID $FLASK_PID

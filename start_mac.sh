#!/bin/bash
# ==============================================================================
# AegisVote - One-Click Launcher for macOS (Apple Silicon M1/M2/M3/M4/M5)
# ==============================================================================

echo "=========================================================="
echo "🛡️  AegisVote: Privacy-Preserving Blockchain E-Voting"
echo "🍎  Launching for macOS (Apple Silicon / ARM64)"
echo "=========================================================="

# Check for Python 3
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install it using: brew install python"
    exit 1
fi

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it using: brew install node"
    exit 1
fi

# 1. Start Backend in Background
echo "🚀 [1/2] Initializing FastAPI Backend on http://127.0.0.1:8000..."
cd backend
if [ ! -d ".venv" ]; then
    echo "📦 Creating Python virtual environment (.venv)..."
    python3 -m venv .venv
fi

source .venv/bin/activate
pip install -q -r requirements.txt
python3 start_server.py &
BACKEND_PID=$!
cd ..

# 2. Start Frontend
echo "💻 [2/2] Launching React Dev Server on http://localhost:3000..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
fi

# Open browser automatically on macOS
sleep 2
open http://localhost:3000 &
npm run dev

# Trap exit to cleanup background processes
trap "kill $BACKEND_PID" EXIT

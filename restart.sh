#!/bin/bash

echo "🔄 Stopping existing servers..."
# Kill process on port 8000 (Backend) - Only if it's Python
lsof -i :8000 | awk '$1 ~ /Python|python/ {print $2}' | xargs kill -9 2>/dev/null
# Kill process on port 3000 (Web) - Only if it's node
lsof -i :3000 | awk '$1 == "node" {print $2}' | xargs kill -9 2>/dev/null

echo "✓ Stopped backend"
echo "✓ Stopped web server"

echo ""
echo "🚀 Starting servers..."

# Start Backend
cd server
# Run in background, redirect logs
nohup ./venv/bin/python main.py > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "✓ Backend started (PID: $BACKEND_PID)"

# Start Web
cd ../web
nohup npm run dev > /tmp/web.log 2>&1 &
WEB_PID=$!
echo "✓ Web server started (PID: $WEB_PID)"

echo ""
echo "🔍 Checking server status..."
sleep 2

if ps -p $BACKEND_PID > /dev/null; then
    echo "✅ Backend: http://localhost:8000 - RUNNING (PID: $BACKEND_PID)"
else
    echo "❌ Backend failed to start. Check /tmp/backend.log"
fi

if ps -p $WEB_PID > /dev/null; then
    echo "✅ Web App: http://localhost:3000 - RUNNING (PID: $WEB_PID)"
else
    echo "❌ Web App failed to start. Check /tmp/web.log"
fi

echo ""
echo "📊 Logs:"
echo "   Backend: tail -f /tmp/backend.log"
echo "   Web:     tail -f /tmp/web.log"
echo ""
echo "🎉 Done! Open http://localhost:3000 in your browser"

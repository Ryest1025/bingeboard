# 🚀 BingeBoard Development Server Setup

This project now includes a robust development server setup that ensures both backend and frontend servers start reliably every time.

## 📋 Quick Commands

| Command | Description |
|---------|-------------|
| `npm run dev:full` | 🚀 Start both servers (recommended) |
| `npm run dev:stop` | 🛑 Stop both servers |
| `npm run dev:restart` | 🔄 Restart both servers |
| `npm run dev:status` | 🔍 Check server status |
| `npm run dev` | 🖥️ Start backend only |

## 🌐 Server URLs

- **Frontend (Vite)**: http://localhost:3000
- **Backend (Express)**: http://localhost:5000

## ✨ What's Fixed

### 🔧 **Robust Server Management**
- **Port Conflict Resolution**: Automatically kills existing processes on ports 3000 and 5000
- **Startup Verification**: Waits for servers to be ready before reporting success
- **Process Isolation**: Backend and frontend run in separate processes with proper logging
- **Failure Detection**: Clear error messages and automatic cleanup on startup failure

### 📁 **Log Management**
- **Backend logs**: `server.log`
- **Frontend logs**: `vite.log`
- **Automatic cleanup**: Old logs are cleared on restart

### 🔍 **Health Checks**
- **Port availability**: Checks if ports are free before starting
- **Server responsiveness**: Tests HTTP responses after startup
- **Process monitoring**: Shows running processes and PIDs

### ⚙️ **Enhanced Vite Configuration**
- **Separate HMR port**: Uses port 3001 for Hot Module Replacement
- **Strict port mode**: Fails fast if port 3000 is occupied
- **Better host configuration**: Supports all development environments

## 🚨 Troubleshooting

### If servers won't start:
```bash
npm run dev:stop    # Clean shutdown
npm run dev:full    # Fresh start
```

### Check what's running:
```bash
npm run dev:status  # Detailed status check
```

### Manual cleanup:
```bash
# Kill processes by port
lsof -ti :3000 | xargs kill -9
lsof -ti :5000 | xargs kill -9

# Kill by process name
pkill -f "tsx"
pkill -f "vite"
```

### View logs:
```bash
# Backend logs
tail -f server.log

# Frontend logs
tail -f vite.log
```

## 🎯 Why This Works

1. **Sequential startup**: Backend starts first, frontend second
2. **Port verification**: Confirms each server is listening before proceeding
3. **Process management**: Uses nohup for background processes with PID tracking
4. **Error handling**: Comprehensive error checking and cleanup
5. **Environment consistency**: Same behavior across all development environments

## 🔄 Development Workflow

1. **Start development**: `npm run dev:full`
2. **Check status**: `npm run dev:status` 
3. **Make changes**: Files auto-reload via Vite HMR
4. **Stop when done**: `npm run dev:stop`

The site should now load consistently at **http://localhost:3000** every time! 🎉
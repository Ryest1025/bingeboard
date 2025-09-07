# ⚠️ IMPORTANT CODESPACES REMINDER ⚠️

## THIS IS A GITHUB CODESPACES ENVIRONMENT - NOT LOCAL!

**Key Points:**

- This is running in GitHub Codespaces, not on a local machine
- Servers need to be configured for Codespaces port forwarding
- URLs will be in the format: `https://[codespace-name]-[port].app.github.dev`
- NOT `localhost:3000` or `localhost:5173`

## Current Server Configuration:

- **Main Server (Express + API)**: Port 3000
- **Client Server (Vite)**: Port 5173

## Codespaces Port Access:

- Ports are automatically forwarded by GitHub Codespaces
- Access via the forwarded URLs provided by Codespaces
- Check the "Ports" tab in VS Code to see the forwarded URLs

## DO NOT assume localhost URLs will work!

## ⚠️ NEVER USE LOCALHOST COMMANDS IN CODESPACES ⚠️
- DO NOT use `curl -I http://localhost:3000`
- DO NOT test with `http://localhost:5173`
- DO NOT assume localhost works AT ALL

## What to do instead:
- Use the "Ports" tab in VS Code to find forwarded URLs
- URLs will be like: `https://[codespace-name]-3000.app.github.dev`
- Or check the terminal output for the Network URLs
- The Vite server shows Network URL: `http://10.0.4.137:5173/`

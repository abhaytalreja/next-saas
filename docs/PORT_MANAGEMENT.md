# Port Management for Next.js Apps

This document explains how automatic port allocation works in the Next SaaS monorepo.

## Overview

Each Next.js application in the monorepo is configured to automatically find an available port if its default port is already in use. This prevents port conflicts when running multiple applications simultaneously.

## Default Ports

- **Web App**: Port 3000
- **Docs App**: Port 3001
- **Landing App**: Port 3002

## How It Works

When you run `npm run dev` in any app directory (or `turbo dev` from the root), the system:

1. Checks if the default port is available
2. If the port is in use, it automatically finds the next available port (up to 10 attempts)
3. Displays which port is being used when starting the server
4. Shows what process is using a port (when possible)

## Usage

### Running Individual Apps

From the app directory:
```bash
# Automatically finds available port
npm run dev

# Use specific port without automatic fallback
npm run dev:direct
```

### Running All Apps

From the root directory:
```bash
# Runs all apps with automatic port management
npm run dev
# or
turbo dev
```

## Configuration

### Custom Port

You can specify a different starting port:

```bash
# From app directory
npm run dev -- --port 4000

# Or set environment variable
DEFAULT_PORT=4000 npm run dev
```

### Direct Port Usage

If you need to use a specific port without automatic fallback:

```bash
npm run dev:direct
```

## Technical Implementation

The port management is handled by the `scripts/dev-with-port.js` script which:

- Uses Node.js `net` module to check port availability
- Provides colored terminal output for better visibility
- Handles graceful shutdown on SIGINT/SIGTERM
- Works cross-platform (macOS, Linux, Windows)
- Shows which process is using a port (when available)

## Troubleshooting

### Port Still Shows as Occupied

If a port shows as occupied but you believe it should be free:

1. Check running processes:
   ```bash
   # macOS/Linux
   lsof -i :3000
   
   # Windows
   netstat -ano | findstr :3000
   ```

2. Kill the process using the port:
   ```bash
   # macOS/Linux
   kill -9 <PID>
   
   # Windows
   taskkill /PID <PID> /F
   ```

### Maximum Attempts Reached

If the script can't find an available port after 10 attempts:

1. Use a different starting port:
   ```bash
   npm run dev -- --port 5000
   ```

2. Or increase the port range by modifying the script's `maxAttempts` parameter

## Benefits

- **No Manual Configuration**: Developers don't need to manually change ports
- **Parallel Development**: Run all apps simultaneously without conflicts
- **CI/CD Friendly**: Works reliably in automated environments
- **Developer Experience**: Clear feedback about port usage
- **Graceful Fallback**: Always attempts to use the preferred port first
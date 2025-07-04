#!/usr/bin/env node

const net = require('net');
const { spawn } = require('child_process');
const path = require('path');

// ANSI color codes for better terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

/**
 * Color text for terminal output
 * @param {string} text - The text to color
 * @param {string} color - The color code
 * @returns {string} - Colored text
 */
function colorize(text, color) {
  return `${color}${text}${colors.reset}`;
}

/**
 * Check if a port is available
 * @param {number} port - The port to check
 * @returns {Promise<boolean>} - True if port is available, false otherwise
 */
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      resolve(false);
    });
    
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    
    server.listen(port, '127.0.0.1');
  });
}

/**
 * Get process using a specific port (for debugging)
 * @param {number} port - The port to check
 * @returns {Promise<string|null>} - Process info or null
 */
async function getPortProcess(port) {
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);
  
  try {
    // Different commands for different platforms
    const platform = process.platform;
    let command;
    
    if (platform === 'darwin' || platform === 'linux') {
      command = `lsof -i :${port} | grep LISTEN | awk '{print $1, $2}'`;
    } else if (platform === 'win32') {
      command = `netstat -ano | findstr :${port}`;
    } else {
      return null;
    }
    
    const { stdout } = await execPromise(command);
    return stdout.trim() || null;
  } catch {
    return null;
  }
}

/**
 * Find an available port starting from the given port
 * @param {number} startPort - The port to start checking from
 * @param {number} maxAttempts - Maximum number of ports to try
 * @returns {Promise<number>} - The first available port found
 */
async function findAvailablePort(startPort, maxAttempts = 10) {
  console.log(colorize(`\nChecking port availability starting from ${startPort}...`, colors.cyan));
  
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    const available = await isPortAvailable(port);
    
    if (available) {
      return port;
    }
    
    // Try to get info about what's using the port
    const processInfo = await getPortProcess(port);
    const processMsg = processInfo ? ` (used by: ${processInfo})` : '';
    
    console.log(colorize(`  ✗ Port ${port} is in use${processMsg}`, colors.yellow));
  }
  
  throw new Error(`No available port found after ${maxAttempts} attempts starting from port ${startPort}`);
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {
    port: 3000,
    appName: 'app',
    nextArgs: []
  };
  
  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--port' && args[i + 1]) {
      result.port = parseInt(args[i + 1], 10);
      i++; // Skip next argument
    } else if (args[i].startsWith('--app-name=')) {
      result.appName = args[i].split('=')[1];
    } else {
      result.nextArgs.push(args[i]);
    }
  }
  
  // Also check environment variables
  if (process.env.APP_NAME) {
    result.appName = process.env.APP_NAME;
  }
  
  if (process.env.DEFAULT_PORT) {
    result.port = parseInt(process.env.DEFAULT_PORT, 10);
  }
  
  return result;
}

/**
 * Start Next.js dev server with an available port
 */
async function startDevServer() {
  const { port: defaultPort, appName, nextArgs } = parseArgs();
  
  console.log(colorize(`\n${colors.bright}Starting ${appName} development server...${colors.reset}`, colors.blue));
  
  try {
    const availablePort = await findAvailablePort(defaultPort);
    
    if (availablePort !== defaultPort) {
      console.log(colorize(`\n⚠️  Port ${defaultPort} is occupied, using port ${availablePort} instead`, colors.yellow));
    } else {
      console.log(colorize(`\n✓ Port ${availablePort} is available`, colors.green));
    }
    
    console.log(colorize(`\n🚀 Starting ${appName} on http://localhost:${availablePort}\n`, colors.green));
    
    // Determine the shell command based on the platform
    const isWindows = process.platform === 'win32';
    const shell = isWindows ? true : '/bin/sh';
    const command = isWindows ? 'next.cmd' : 'next';
    
    // Start Next.js with the available port
    const nextProcess = spawn(command, ['dev', '--port', availablePort.toString(), ...nextArgs], {
      stdio: 'inherit',
      shell: shell,
      cwd: process.cwd()
    });
    
    // Handle process termination gracefully
    const cleanup = () => {
      if (!nextProcess.killed) {
        nextProcess.kill('SIGTERM');
      }
    };
    
    process.on('SIGINT', () => {
      console.log(colorize('\n\nShutting down gracefully...', colors.yellow));
      cleanup();
      process.exit(0);
    });
    
    process.on('SIGTERM', cleanup);
    process.on('exit', cleanup);
    
    nextProcess.on('error', (error) => {
      console.error(colorize(`\n❌ Failed to start Next.js: ${error.message}`, colors.red));
      process.exit(1);
    });
    
    nextProcess.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        console.error(colorize(`\n❌ Next.js exited with code ${code}`, colors.red));
      }
      process.exit(code || 0);
    });
    
  } catch (error) {
    console.error(colorize(`\n❌ Error: ${error.message}`, colors.red));
    console.error(colorize('\nTip: You can try running with a different port using --port <number>', colors.dim));
    process.exit(1);
  }
}

// Check if running directly
if (require.main === module) {
  startDevServer();
}

module.exports = { findAvailablePort, isPortAvailable };
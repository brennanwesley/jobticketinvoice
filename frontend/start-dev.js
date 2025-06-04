/**
 * Development server startup script for JobTicketInvoice frontend
 * This script helps start the development server with proper environment setup
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

// Print a styled header
console.log(`
${colors.bgBlue}${colors.white}${colors.bright} ================================================= ${colors.reset}
${colors.bgBlue}${colors.white}${colors.bright} JobTicketInvoice - Frontend Development Server    ${colors.reset}
${colors.bgBlue}${colors.white}${colors.bright} ================================================= ${colors.reset}
`);

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log(`${colors.yellow}Warning: No .env file found. Creating default .env file...${colors.reset}`);
  
  // Create a default .env file
  const defaultEnvContent = `
# Frontend Environment Variables
REACT_APP_API_URL=http://localhost:8000
REACT_APP_DEBUG=true
`;
  
  fs.writeFileSync(envPath, defaultEnvContent.trim());
  console.log(`${colors.green}Created default .env file.${colors.reset}`);
}

// Display development information
console.log(`${colors.cyan}Starting development server with the following configuration:${colors.reset}`);
console.log(`${colors.bright}• Node Environment:${colors.reset} ${colors.green}development${colors.reset}`);
console.log(`${colors.bright}• Auth Test Page:${colors.reset} ${colors.green}Enabled${colors.reset} (available at /auth-test)`);
console.log(`${colors.bright}• Console Test Utilities:${colors.reset} ${colors.green}Enabled${colors.reset} (use testLogin(), testRegister(), etc.)`);

// Start the development server
console.log(`\n${colors.yellow}Starting development server...${colors.reset}`);
console.log(`${colors.dim}Press Ctrl+C to stop the server${colors.reset}\n`);

try {
  // Set environment variables and start the server
  process.env.NODE_ENV = 'development';
  process.env.BROWSER = 'none'; // Prevent auto-opening browser
  
  // Execute npm start
  execSync('npm start', { stdio: 'inherit' });
} catch (error) {
  console.error(`${colors.red}Error starting development server:${colors.reset}`, error.message);
  process.exit(1);
}

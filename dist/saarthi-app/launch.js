const { spawn } = require('child_process');
const path = require('path');

// Launch Electron
const electronPath = path.join(__dirname, 'node_modules', '.bin', 'electron.cmd');
const appPath = __dirname;

const child = spawn(electronPath, [appPath], {
  detached: true,
  stdio: 'ignore'
});

child.unref();

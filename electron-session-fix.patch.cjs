/**
 * Patch script to fix subdomain authentication in generated Electron main.js
 * Run this after building the desktop app to enable session sharing across subdomains
 */

const fs = require('fs');
const path = require('path');

const mainJsPath = path.join(__dirname, 'dist', 'saarthi-app', 'main.js');

if (!fs.existsSync(mainJsPath)) {
    console.error('Error: main.js not found at', mainJsPath);
    console.error('Please build the app first using: node .\\bin\\mernpkg.js build');
    process.exit(1);
}

console.log('Reading main.js...');
let content = fs.readFileSync(mainJsPath, 'utf8');

// 1. Add partition to webPreferences
console.log('Adding session partition...');
content = content.replace(
    /webPreferences: \{[\s\S]*?sandbox: false\s*\}/,
    (match) => {
        if (match.includes('partition:')) {
            console.log('  ✓ Partition already exists');
            return match;
        }
        return match.replace(
            'sandbox: false',
            `sandbox: false,
      partition: 'persist:saarthi',
      webSecurity: true`
        );
    }
);

// 2. Add navigation handlers after Menu.setApplicationMenu(null);
console.log('Adding navigation handlers...');
const navigationHandlers = `
  // Handle navigation to subdomains (mail, calendar, vault)
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const allowedDomains = ['sartthi.com', 'mail.sartthi.com', 'calendar.sartthi.com', 'vault.sartthi.com'];
    try {
      const urlObj = new URL(url);
      const isAllowed = allowedDomains.some(domain => urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain));
      if (!isAllowed) {
        event.preventDefault();
        shell.openExternal(url);
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  });

  // Handle new window requests (e.g., target="_blank")
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    const allowedDomains = ['sartthi.com', 'mail.sartthi.com', 'calendar.sartthi.com', 'vault.sartthi.com'];
    try {
      const urlObj = new URL(url);
      const isAllowed = allowedDomains.some(domain => urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain));
      if (isAllowed) {
        // Allow opening in the same window
        mainWindow.loadURL(url);
        return { action: 'deny' };
      } else {
        // Open external links in default browser
        shell.openExternal(url);
        return { action: 'deny' };
      }
    } catch (error) {
      console.error('Window open error:', error);
      return { action: 'deny' };
    }
  });
`;

if (!content.includes('will-navigate')) {
    content = content.replace(
        /Menu\.setApplicationMenu\(null\);\s*\n\s*mainWindow\.loadURL\(SPLASH_DATA_URL\);/,
        `Menu.setApplicationMenu(null);
  mainWindow.loadURL(SPLASH_DATA_URL);
${navigationHandlers}`
    );
    console.log('  ✓ Navigation handlers added');
} else {
    console.log('  ✓ Navigation handlers already exist');
}

// Write the patched file
console.log('Writing patched main.js...');
fs.writeFileSync(mainJsPath, content, 'utf8');

console.log('\n✅ Successfully patched main.js!');
console.log('The desktop app now supports subdomain navigation with shared authentication.');
console.log('\nNext steps:');
console.log('1. Rebuild the installer: .\\create-exe-installer.bat');
console.log('2. Install and test the new version');

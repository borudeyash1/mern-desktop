# mernpkg

**Standalone offline packager and desktop client generator for MERN web apps**

Convert your MERN web application into signed, installable desktop applications for Windows, macOS, and Linux with a single command.

## Features

- 🚀 **Cross-Platform**: Build for Windows (x64/arm64), macOS (x64/arm64), and Linux (x64/arm64)
- 📦 **Multiple Formats**: NSIS, MSI, portable ZIP, DMG, PKG, AppImage, DEB, RPM
- ✍️ **Code Signing**: Support for Windows PFX and macOS code signing
- 🔐 **Secure**: Built-in secure token storage with keytar
- 🔄 **Auto-Update**: Electron-updater integration
- 📤 **Upload**: Direct upload to release server
- 🎯 **Dry Run**: Test builds without executing
- 📝 **Manifest**: Automatic release.json generation with checksums

## Installation

```bash
npm install -g mernpkg
```

Or use locally in your project:

```bash
npm install --save-dev mernpkg
```

## Quick Start

### 1. Initialize Configuration

```bash
mernpkg init
```

This creates a `mernpkg.config.json` file with default settings.

### 2. Test with Dry Run

```bash
mernpkg build --dry-run
```

This simulates the build process and shows what would be created.

### 3. Build Desktop Apps

```bash
mernpkg build
```

This creates desktop installers for all configured platforms.

## Configuration

### Basic Configuration (mernpkg.config.json)

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "description": "My MERN Desktop Application",
  "platforms": ["windows", "macos", "linux"],
  "architectures": ["x64"],
  "frontend": {
    "dir": "./client",
    "buildCommand": "npm run build",
    "outputDir": "./build"
  },
  "desktop": {
    "main": "electron/main.js",
    "preload": "electron/preload.js",
    "width": 1200,
    "height": 800
  },
  "build": {
    "outputDir": "./dist",
    "keepTemp": false,
    "compression": "normal"
  },
  "channel": "stable"
}
```

### Advanced Configuration

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "platforms": ["windows", "macos", "linux"],
  "architectures": ["x64", "arm64"],
  "frontend": {
    "deployedUrl": "https://myapp.com"
  },
  "signing": {
    "windows": {
      "certificateFile": "./certs/cert.pfx",
      "certificatePassword": "${WINDOWS_CERT_PASSWORD}"
    },
    "macos": {
      "identity": "Developer ID Application: My Company",
      "teamId": "ABCDE12345",
      "notarize": true
    }
  },
  "upload": {
    "enabled": true,
    "url": "http://localhost:3000/admin/releases",
    "authToken": "${RELEASE_TOKEN}"
  }
}
```

## CLI Commands

### build

Build desktop application packages.

```bash
mernpkg build [options]
```

**Options:**
- `-c, --config <path>` - Config file path (default: mernpkg.config.json)
- `--version <version>` - Override application version
- `--platforms <platforms>` - Target platforms (comma-separated)
- `--arch <arch>` - Target architectures (comma-separated)
- `--dry-run` - Simulate build without executing
- `--sign` - Sign artifacts
- `--upload` - Upload to release server
- `-v, --verbose` - Enable verbose logging

**Examples:**

```bash
# Build for all platforms
mernpkg build

# Build only for Windows x64
mernpkg build --platforms windows --arch x64

# Dry run to test configuration
mernpkg build --dry-run

# Build with signing
mernpkg build --sign --pfx ./cert.pfx --pfx-pass mypassword

# Build and upload
mernpkg build --upload --upload-url https://releases.myapp.com
```

### init

Initialize mernpkg configuration.

```bash
mernpkg init [options]
```

**Options:**
- `-o, --output <path>` - Output file path (default: mernpkg.config.json)
- `--format <format>` - Config format: json or yaml (default: json)

### validate

Validate configuration file.

```bash
mernpkg validate <config>
```

### list-targets

List available build targets.

```bash
mernpkg list-targets [options]
```

**Options:**
- `--platforms <platforms>` - Filter by platforms
- `--arch <arch>` - Filter by architectures

## Platform Requirements

### Windows

- **Node.js 18+**
- **signtool** (optional, for signing)

### macOS

- **Node.js 18+**
- **Xcode Command Line Tools**: `xcode-select --install`
- **codesign** (for signing)
- **Apple Developer Account** (for notarization)

### Linux

- **Node.js 18+**
- **dpkg** (for .deb packages)
- **rpmbuild** (for .rpm packages)

## Desktop Client Features

The generated desktop application includes:

### Secure Token Storage

Uses `keytar` for secure credential storage:

```javascript
// In your app
const token = await window.electronAPI.getToken();
await window.electronAPI.setToken(token);
```

### Local Database

Built-in SQLite database with better-sqlite3:

```javascript
// Sync service handles local caching
await window.electronAPI.syncData();
```

### Auto-Update

Automatic updates using electron-updater:

```javascript
// Checks for updates on startup
// Downloads and installs in background
```

### Offline Support

Works offline with local cache and sync queue.

## Programmatic API

Use mernpkg as a library:

```javascript
import { build, validate, listTargets } from 'mernpkg';

// Build programmatically
const result = await build({
  config: './mernpkg.config.json',
  dryRun: false,
  verbose: true
});

console.log('Artifacts:', result.artifacts);
console.log('Manifest:', result.manifest);

// Validate configuration
const validation = await validate('./mernpkg.config.json');
if (validation.valid) {
  console.log('Config is valid');
}

// List targets
const targets = listTargets({
  platforms: ['windows', 'macos'],
  arch: ['x64']
});
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Build Desktop Apps

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
    
    runs-on: ${{ matrix.os }}
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build desktop app
        run: npx mernpkg build --sign
        env:
          WINDOWS_CERT_PASSWORD: ${{ secrets.WINDOWS_CERT_PASSWORD }}
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_PASSWORD: ${{ secrets.APPLE_PASSWORD }}
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: desktop-apps-${{ matrix.os }}
          path: dist/*
```

## Output Structure

After building, you'll find:

```
dist/
├── my-app-1.0.0-win-x64.exe          # Windows NSIS installer
├── my-app-1.0.0-win-x64-portable.zip # Windows portable
├── my-app-1.0.0-mac-x64.dmg          # macOS DMG
├── my-app-1.0.0-mac-x64.pkg          # macOS PKG
├── my-app-1.0.0-linux-x64.AppImage   # Linux AppImage
├── my-app_1.0.0_x64.deb              # Debian package
├── my-app-1.0.0.x64.rpm              # RPM package
├── release.json                       # Release manifest
└── latest.yml                         # Auto-update metadata
```

## Release Manifest (release.json)

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "channel": "stable",
  "releaseDate": "2025-10-27T12:00:00.000Z",
  "artifacts": [
    {
      "name": "my-app-1.0.0-win-x64.exe",
      "platform": "windows",
      "arch": "x64",
      "format": "nsis",
      "path": "dist/my-app-1.0.0-win-x64.exe",
      "size": 52428800,
      "checksum": "abc123..."
    }
  ]
}
```

## Troubleshooting

### "Node.js 18+ required"

Update Node.js to version 18 or higher.

### "Xcode Command Line Tools not found"

On macOS, install with:
```bash
xcode-select --install
```

### "signtool not found"

On Windows, install Windows SDK or Visual Studio.

### Build fails on non-native platform

Some features are limited when building for a platform from a different OS. For best results:
- Build Windows apps on Windows
- Build macOS apps on macOS
- Build Linux apps on Linux

## Development

### Run in Development Mode

```bash
# Clone the repo
git clone https://github.com/yourusername/mernpkg.git
cd mernpkg

# Install dependencies
npm install

# Run CLI
npm run dev -- build --dry-run
```

### Run Tests

```bash
npm test
```

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR.

## Support

- 📧 Email: support@mernpkg.com
- 💬 Discord: https://discord.gg/mernpkg
- 📖 Docs: https://docs.mernpkg.com

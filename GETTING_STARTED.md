# Getting Started with mernpkg

This guide will walk you through packaging your MERN web application as a desktop application.

## Prerequisites

- Node.js 18 or higher
- Your MERN web application
- Platform-specific tools (see Platform Requirements below)

## Step 1: Install mernpkg

### Global Installation (Recommended)

```bash
npm install -g mernpkg
```

### Local Installation

```bash
cd your-mern-app
npm install --save-dev mernpkg
```

## Step 2: Initialize Configuration

Run the init command in your project root:

```bash
mernpkg init
```

This will prompt you for:
- Application name
- Version
- Description
- Target platforms
- Target architectures
- Frontend directory
- Build command

It creates a `mernpkg.config.json` file.

## Step 3: Review Configuration

Open `mernpkg.config.json` and verify/customize:

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
    "keepTemp": false
  }
}
```

## Step 4: Test with Dry Run

Before building, test your configuration:

```bash
mernpkg build --dry-run --verbose
```

This will:
- Validate your configuration
- Check environment requirements
- Show what artifacts would be created
- **Not** actually build anything

Review the output for any warnings or errors.

## Step 5: Build Desktop Application

Once dry run succeeds, build for real:

```bash
mernpkg build
```

This will:
1. Validate environment
2. Build your frontend (if configured)
3. Generate Electron wrapper
4. Package for each platform
5. Generate checksums
6. Create release manifest

## Step 6: Find Your Artifacts

Check the `dist/` directory:

```
dist/
├── my-app-1.0.0-win-x64.exe
├── my-app-1.0.0-win-x64-portable.zip
├── my-app-1.0.0-mac-x64.dmg
├── my-app-1.0.0-mac-x64.pkg
├── my-app-1.0.0-linux-x64.AppImage
├── my-app_1.0.0_x64.deb
├── my-app-1.0.0.x64.rpm
└── release.json
```

## Platform Requirements

### Windows

**Required:**
- Node.js 18+

**Optional (for signing):**
- Windows SDK (includes signtool)
- Code signing certificate (.pfx file)

**Install Windows SDK:**
1. Download from https://developer.microsoft.com/windows/downloads/windows-sdk/
2. Or install Visual Studio with "Desktop development with C++"

### macOS

**Required:**
- Node.js 18+
- Xcode Command Line Tools

**Install Xcode Tools:**
```bash
xcode-select --install
```

**Optional (for signing/notarization):**
- Apple Developer Account
- Developer ID Application certificate
- App-specific password for notarization

### Linux

**Required:**
- Node.js 18+

**Optional (for specific formats):**
- dpkg (for .deb) - usually pre-installed on Debian/Ubuntu
- rpmbuild (for .rpm) - install with `sudo apt install rpm` or `sudo yum install rpm-build`

## Advanced Usage

### Using a Deployed URL

If your app is already deployed, you can package it without building:

```json
{
  "frontend": {
    "deployedUrl": "https://myapp.com"
  }
}
```

Or via CLI:

```bash
mernpkg build --use-deployed-url https://myapp.com
```

### Building for Specific Platforms

```bash
# Windows only
mernpkg build --platforms windows

# macOS and Linux only
mernpkg build --platforms macos,linux

# Specific architecture
mernpkg build --arch x64
```

### Code Signing

#### Windows

```json
{
  "signing": {
    "windows": {
      "certificateFile": "./certs/cert.pfx",
      "certificatePassword": "${WINDOWS_CERT_PASSWORD}"
    }
  }
}
```

Or via CLI:

```bash
mernpkg build --sign --pfx ./certs/cert.pfx --pfx-pass mypassword
```

#### macOS

```json
{
  "signing": {
    "macos": {
      "identity": "Developer ID Application: My Company",
      "teamId": "ABCDE12345",
      "notarize": true
    }
  }
}
```

Or via CLI:

```bash
mernpkg build --sign --apple-identity "Developer ID Application: My Company" --apple-team-id ABCDE12345 --notarize
```

### Uploading to Release Server

```json
{
  "upload": {
    "enabled": true,
    "url": "http://localhost:3000/admin/releases",
    "authToken": "${RELEASE_TOKEN}"
  }
}
```

Or via CLI:

```bash
mernpkg build --upload --upload-url http://localhost:3000/admin/releases --auth-token YOUR_TOKEN
```

## Development Workflow

### 1. Local Development

Test your app in Electron without building:

```bash
# Install Electron
npm install --save-dev electron

# Create a simple main.js
# (mernpkg generates this for you, but for dev you can create manually)

# Run
npx electron .
```

### 2. Test Build

```bash
mernpkg build --dry-run
```

### 3. Build for Current Platform

```bash
mernpkg build --platforms $(uname -s | tr '[:upper:]' '[:lower:]')
```

### 4. Full Build

```bash
mernpkg build
```

## CI/CD Setup

### GitHub Actions Example

Create `.github/workflows/build-desktop.yml`:

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
        run: npm ci
      
      - name: Build desktop app
        run: npx mernpkg build
        env:
          WINDOWS_CERT_PASSWORD: ${{ secrets.WINDOWS_CERT_PASSWORD }}
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: desktop-apps-${{ matrix.os }}
          path: dist/*
```

## Troubleshooting

### "Configuration file not found"

Make sure you're running mernpkg from your project root where `mernpkg.config.json` exists.

### "Node.js 18+ required"

Update Node.js:
```bash
# Using nvm
nvm install 18
nvm use 18

# Or download from nodejs.org
```

### "Frontend build failed"

Check that:
1. `frontend.dir` points to correct directory
2. `frontend.buildCommand` is correct
3. You can manually run the build command successfully

### "Xcode Command Line Tools not found" (macOS)

```bash
xcode-select --install
```

### Build succeeds but app doesn't work

1. Test with deployed URL first:
   ```bash
   mernpkg build --use-deployed-url http://localhost:3000
   ```

2. Check Electron logs (varies by platform)

3. Enable verbose logging:
   ```bash
   mernpkg build --verbose
   ```

## Next Steps

- [Configure Auto-Update](./docs/AUTO_UPDATE.md)
- [Add Custom IPC APIs](./docs/IPC_APIS.md)
- [Implement Offline Sync](./docs/OFFLINE_SYNC.md)
- [Customize Electron Wrapper](./docs/CUSTOMIZATION.md)

## Support

- GitHub Issues: https://github.com/yourusername/mernpkg/issues
- Documentation: https://docs.mernpkg.com
- Discord: https://discord.gg/mernpkg

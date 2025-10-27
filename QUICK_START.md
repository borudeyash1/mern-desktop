# mernpkg - Quick Start

## 5-Minute Setup

### 1. Install Dependencies

```bash
cd mernpkg
npm install
```

### 2. Initialize Configuration

```bash
node bin/mernpkg.js init
```

Follow the prompts to create `mernpkg.config.json`.

### 3. Test with Dry Run

```bash
node bin/mernpkg.js build --dry-run --verbose
```

This shows exactly what would be built without actually building.

### 4. Build (when ready)

```bash
node bin/mernpkg.js build
```

## Common Commands

```bash
# Initialize config
node bin/mernpkg.js init

# Validate config
node bin/mernpkg.js validate mernpkg.config.json

# List available targets
node bin/mernpkg.js list-targets

# Dry run (safe, shows what would happen)
node bin/mernpkg.js build --dry-run

# Dry run with details
node bin/mernpkg.js build --dry-run --verbose

# Build for specific platform
node bin/mernpkg.js build --platforms windows

# Build for specific architecture
node bin/mernpkg.js build --arch x64

# Build with signing
node bin/mernpkg.js build --sign --pfx ./cert.pfx

# Build and upload
node bin/mernpkg.js build --upload --upload-url http://localhost:3000/admin/releases
```

## Example Configuration

**Minimal (`mernpkg.config.json`):**

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "platforms": ["windows"],
  "architectures": ["x64"],
  "frontend": {
    "dir": "./client",
    "buildCommand": "npm run build",
    "outputDir": "./build"
  }
}
```

**With Deployed URL:**

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "platforms": ["windows", "macos", "linux"],
  "architectures": ["x64"],
  "frontend": {
    "deployedUrl": "https://myapp.com"
  }
}
```

## What Gets Created

After running `build`, check the `dist/` folder:

```
dist/
├── my-app-1.0.0-win-x64.exe          # Windows installer
├── my-app-1.0.0-win-x64-portable.zip # Windows portable
├── my-app-1.0.0-mac-x64.dmg          # macOS DMG
├── my-app-1.0.0-mac-x64.pkg          # macOS PKG
├── my-app-1.0.0-linux-x64.AppImage   # Linux AppImage
├── my-app_1.0.0_x64.deb              # Debian package
├── my-app-1.0.0.x64.rpm              # RPM package
└── release.json                       # Manifest with checksums
```

## Platform Requirements

| Platform | Required | Optional |
|----------|----------|----------|
| **Windows** | Node.js 18+ | signtool (for signing) |
| **macOS** | Node.js 18+, Xcode CLI Tools | codesign, notarytool |
| **Linux** | Node.js 18+ | dpkg, rpmbuild |

### Install Platform Tools

**macOS:**
```bash
xcode-select --install
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt install dpkg rpm
```

## Troubleshooting

### "Configuration file not found"
Run from project root where `mernpkg.config.json` exists.

### "Node.js 18+ required"
Update Node.js to version 18 or higher.

### "Xcode Command Line Tools not found"
Run: `xcode-select --install`

### Build fails
1. Try dry-run first: `node bin/mernpkg.js build --dry-run --verbose`
2. Check configuration: `node bin/mernpkg.js validate mernpkg.config.json`
3. Verify frontend builds manually

## Next Steps

- Read [GETTING_STARTED.md](./GETTING_STARTED.md) for detailed guide
- Check [README.md](./README.md) for full documentation
- Review [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for architecture details
- See [examples/](./examples/) for configuration templates

## Current Status

✅ **Dry-run mode is fully functional**
- Test your configuration safely
- See exactly what would be built
- Validate environment requirements

🚧 **Actual builds coming in Phase 2**
- Real electron-builder integration
- Code signing
- Upload to release server

## Test It Now!

```bash
# 1. Install
cd mernpkg && npm install

# 2. Create config
node bin/mernpkg.js init

# 3. Test
node bin/mernpkg.js build --dry-run --verbose

# 4. Review output
# You'll see the complete build plan!
```

That's it! You're ready to package your MERN app as a desktop application. 🚀

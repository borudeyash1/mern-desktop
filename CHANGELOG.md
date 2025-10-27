# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-10-27

### Added
- Initial release of mern-desktop
- Support for portable builds (ZIP/TAR.GZ)
- Support for installer builds (NSIS/DMG/AppImage/DEB)
- Cross-platform support (Windows, macOS, Linux)
- Multi-architecture support (x64, arm64)
- Configuration file support (JSON/YAML)
- CLI with commands: init, build, validate, list-targets
- Dry-run mode for testing
- OAuth support (opens in browser)
- Professional Electron wrapper with menus
- Auto-fallback from installer to portable if build tools missing
- Comprehensive documentation
- Example configurations

### Features
- **Portable Mode**: Creates lightweight ZIP/TAR.GZ archives
- **Installer Mode**: Creates professional installers with electron-builder
- **Direct Login**: Desktop apps open directly to login page
- **OAuth Integration**: Google OAuth opens in default browser
- **Dark Theme**: Proper styling with dark background
- **Professional Menus**: File, Edit, View, Window, Help menus
- **Keyboard Shortcuts**: Standard shortcuts (Ctrl+R, F12, etc.)
- **External Links**: Opens in default browser
- **Checksum Generation**: SHA256 checksums for all artifacts
- **Release Manifest**: Automatic release.json generation

### Documentation
- README.md - Main documentation
- COMPLETE_GUIDE.md - Guide for any MERN project
- FORMATS_GUIDE.md - Portable vs Installer comparison
- GETTING_STARTED.md - Step-by-step guide
- QUICK_START.md - 5-minute setup
- OAUTH_FIX.md - OAuth integration guide
- DESKTOP_APP_GUIDE.md - Desktop features
- CONTRIBUTING.md - Contribution guidelines

[Unreleased]: https://github.com/borudeyash1/mern-desktop/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/borudeyash1/mern-desktop/releases/tag/v1.0.0

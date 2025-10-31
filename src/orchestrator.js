/**
 * Build orchestrator - coordinates the entire packaging flow
 */

import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { logger } from './utils/logger.js';
import { validateEnvironment } from './utils/validateEnv.js';
import { generateChecksum } from './utils/checksum.js';
import { SimpleBuilder } from './builder/simpleBuilder.js';
import { InstallerBuilder } from './builder/installerBuilder.js';
import fs from 'fs-extra';

export class Orchestrator {
  constructor(config) {
    this.config = config;
    this.artifacts = [];
    this.workDir = join(process.cwd(), '.mernpkg-temp');
  }

  /**
   * Execute the build flow
   * @param {boolean} dryRun - Simulate without executing
   * @returns {Promise<Object>} Build result
   */
  async build(dryRun = false) {
    try {
      logger.info('🚀 Starting build process...\n');
      
      // Step 1: Validate environment
      logger.info('📋 Step 1: Validating environment...');
      await this.validateEnvironment(dryRun);
      logger.success('✓ Environment validation passed\n');
      
      // Step 2: Prepare workspace
      logger.info('📁 Step 2: Preparing workspace...');
      await this.prepareWorkspace(dryRun);
      logger.success('✓ Workspace prepared\n');
      
      // Step 3: Build frontend (if needed)
      if (this.config.buildFrontend && this.config.frontend && !this.config.frontend.deployedUrl) {
        logger.info('🔨 Step 3: Building frontend...');
        await this.buildFrontend(dryRun);
        logger.success('✓ Frontend built\n');
      } else if (this.config.frontend?.deployedUrl) {
        logger.info('🌐 Step 3: Using deployed URL:', this.config.frontend.deployedUrl);
        logger.success('✓ Skipping frontend build\n');
      } else {
        logger.info('📦 Step 3: Using existing frontend build');
        logger.success('✓ Skipping frontend build\n');
      }
      
      // Step 4: Generate Electron wrapper
      logger.info('⚡ Step 4: Generating Electron wrapper...');
      await this.generateElectronWrapper(dryRun);
      logger.success('✓ Electron wrapper generated\n');
      
      // Step 5: Package for each platform
      logger.info('📦 Step 5: Packaging applications...');
      await this.packageApplications(dryRun);
      logger.success('✓ Applications packaged\n');
      
      // Step 6: Generate checksums
      logger.info('🔐 Step 6: Generating checksums...');
      await this.generateChecksums(dryRun);
      logger.success('✓ Checksums generated\n');
      
      // Step 7: Create release manifest
      logger.info('📄 Step 7: Creating release manifest...');
      const manifest = await this.createReleaseManifest(dryRun);
      logger.success('✓ Release manifest created\n');
      
      // Step 8: Sign artifacts (if configured)
      if (this.config.signing) {
        logger.info('✍️  Step 8: Signing artifacts...');
        await this.signArtifacts(dryRun);
        logger.success('✓ Artifacts signed\n');
      }
      
      // Step 9: Upload (if configured)
      if (this.config.upload?.enabled) {
        logger.info('☁️  Step 9: Uploading artifacts...');
        await this.uploadArtifacts(dryRun);
        logger.success('✓ Artifacts uploaded\n');
      }
      
      // Step 10: Cleanup
      if (!this.config.build.keepTemp && !dryRun) {
        logger.info('🧹 Step 10: Cleaning up...');
        await this.cleanup();
        logger.success('✓ Cleanup completed\n');
      }
      
      return {
        success: true,
        artifacts: this.artifacts,
        manifest,
        dryRun
      };
      
    } catch (error) {
      logger.error('Build failed:', error.message);
      throw error;
    }
  }

  async validateEnvironment(dryRun) {
    if (dryRun) {
      logger.verbose('[DRY RUN] Skipping environment validation');
      return;
    }
    
    const validation = await validateEnvironment(this.config);
    
    if (!validation.valid) {
      throw new Error(`Environment validation failed:\n${validation.errors.join('\n')}`);
    }
  }

  async prepareWorkspace(dryRun) {
    if (dryRun) {
      logger.verbose('[DRY RUN] Would create workspace at:', this.workDir);
      return;
    }
    
    // Create temp directory
    if (!existsSync(this.workDir)) {
      mkdirSync(this.workDir, { recursive: true });
    }
    
    // Create output directory
    const outputDir = this.config.build.outputDir;
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
    
    logger.verbose('Workspace created at:', this.workDir);
  }

  async buildFrontend(dryRun) {
    if (dryRun) {
      logger.verbose('[DRY RUN] Would build frontend with command:', this.config.frontend.buildCommand);
      return;
    }
    
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const frontendDir = this.config.frontend.dir;
    
    logger.verbose('Building frontend in:', frontendDir);
    logger.verbose('Command:', this.config.frontend.buildCommand);
    
    try {
      const { stdout, stderr } = await execAsync(this.config.frontend.buildCommand, {
        cwd: frontendDir
      });
      
      if (stdout) logger.verbose(stdout);
      if (stderr) logger.verbose(stderr);
      
    } catch (error) {
      throw new Error(`Frontend build failed: ${error.message}`);
    }
  }

  async generateElectronWrapper(dryRun) {
    if (dryRun) {
      logger.verbose('[DRY RUN] Would generate Electron files in:', this.workDir);
      logger.verbose('[DRY RUN] Files: main.js, preload.js, package.json');
      return;
    }
    
    // Generate Electron files in workDir root (not subdirectory)
    await this.generateElectronMain(this.workDir);
    await this.generateElectronPreload(this.workDir);
    await this.generateElectronPackageJson(this.workDir);
    
    // Copy frontend build if it exists
    if (this.config.frontend && !this.config.frontend.deployedUrl) {
      await this.copyFrontendBuild();
    }
    
    logger.verbose('Electron wrapper generated in:', this.workDir);
  }

  async generateElectronMain(electronDir) {
    const mainContent = `// Auto-generated by mernpkg
const { app, BrowserWindow, ipcMain, Menu, shell, protocol } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow;

// Handle OAuth callback URLs
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('${this.config.name}', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('${this.config.name}');
}

// Handle the protocol (deep link) on Windows
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, focus our window instead
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      
      // Handle OAuth callback URL
      const url = commandLine.find(arg => arg.startsWith('http'));
      if (url) {
        handleOAuthCallback(url);
      }
    }
  });
}

// Handle OAuth callback
function handleOAuthCallback(callbackUrl) {
  if (mainWindow && callbackUrl) {
    console.log('OAuth callback received:', callbackUrl);
    mainWindow.loadURL(callbackUrl);
  }
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: ${this.config.desktop?.width || 1400},
    height: ${this.config.desktop?.height || 900},
    minWidth: 1000,
    minHeight: 600,
    backgroundColor: '#0B1437', // Dark blue background matching your app
    show: false, // Don't show until ready
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false, // Allow loading local resources
      allowRunningInsecureContent: false
    },
    titleBarStyle: 'default',
    frame: true,
    icon: path.join(__dirname, 'icon.png')
  });

  // Create application menu
  createMenu();

  // Load app - directly to login page for desktop
  ${this.config.frontend?.deployedUrl 
    ? `
  // Load from deployed URL - go directly to login
  mainWindow.loadURL('${this.config.frontend.deployedUrl}/login');
  `
    : `
  // Load local build - go directly to login
  const startUrl = url.format({
    pathname: path.join(__dirname, 'build', 'index.html'),
    protocol: 'file:',
    slashes: true
  });
  mainWindow.loadURL(startUrl + '#/login');
  `
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Inject CSS to fix styling issues
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.insertCSS(\`
      /* Ensure proper background and text colors */
      body {
        background-color: #0B1437 !important;
        color: #ffffff !important;
      }
      
      /* Fix any light text on light background issues */
      * {
        color: inherit;
      }
      
      /* Ensure buttons and inputs are visible */
      button, input, select, textarea {
        color: #000000;
      }
      
      /* Fix scrollbars for dark theme */
      ::-webkit-scrollbar {
        width: 12px;
        background-color: #1a1f3a;
      }
      
      ::-webkit-scrollbar-thumb {
        background-color: #2d3454;
        border-radius: 6px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background-color: #3d4464;
      }
    \`);
  });

  // Handle external links and OAuth - open in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    console.log('Window open requested:', url);
    
    // Open OAuth and all external links in default browser
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Intercept OAuth callback before browser opens
  mainWindow.webContents.session.webRequest.onBeforeRequest(
    { urls: ['http://localhost:*/*', 'https://*.vercel.app/*'] },
    (details, callback) => {
      const requestUrl = details.url;
      console.log('Request intercepted:', requestUrl);
      
      // Check if this is an OAuth callback
      if (requestUrl.includes('code=') || requestUrl.includes('token=') || requestUrl.includes('auth')) {
        console.log('OAuth callback detected, loading in app:', requestUrl);
        
        // Load the callback URL in the main window
        setTimeout(() => {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.loadURL(requestUrl);
          }
        }, 100);
      }
      
      callback({ cancel: false });
    }
  );

  // Handle OAuth redirects from browser
  mainWindow.webContents.on('will-redirect', (event, url) => {
    console.log('Will redirect:', url);
    
    // If redirecting back from OAuth, handle it in main window
    if (url.includes('${this.config.frontend?.deployedUrl || 'localhost'}')) {
      console.log('Loading OAuth callback in main window');
      mainWindow.loadURL(url);
    }
  });

  // Listen for navigation events (OAuth callback)
  mainWindow.webContents.on('will-navigate', (event, url) => {
    console.log('Will navigate:', url);
    
    // Allow navigation within your app
    if (url.includes('${this.config.frontend?.deployedUrl || 'localhost'}')) {
      // Let it navigate normally
      return;
    }
    
    // Open external URLs in browser
    event.preventDefault();
    shell.openExternal(url);
  });

  // Listen for when new windows are created (OAuth popups)
  mainWindow.webContents.on('did-create-window', (newWindow) => {
    console.log('New window created');
    
    newWindow.webContents.on('will-redirect', (event, url) => {
      console.log('New window will redirect:', url);
      
      // If OAuth callback, load in main window and close popup
      if (url.includes('${this.config.frontend?.deployedUrl || 'localhost'}')) {
        event.preventDefault();
        mainWindow.loadURL(url);
        newWindow.close();
      }
    });
  });

  // Development tools
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Refresh',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (mainWindow) mainWindow.reload();
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            await shell.openExternal('https://github.com');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Handle OAuth callback URLs (macOS/Linux)
app.on('open-url', (event, url) => {
  event.preventDefault();
  console.log('App opened with URL:', url);
  handleOAuthCallback(url);
});

// Handle OAuth callback URLs (Windows - already handled in second-instance)

// Handle IPC messages
ipcMain.handle('app-version', () => {
  return app.getVersion();
});

ipcMain.handle('app-path', () => {
  return app.getPath('userData');
});
`;
    
    await fs.writeFile(join(electronDir, 'main.js'), mainContent);
  }

  async generateElectronPreload(electronDir) {
    const preloadContent = `// Auto-generated by mernpkg
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Platform info
  platform: process.platform,
  versions: process.versions,
  
  // App info
  getAppVersion: () => ipcRenderer.invoke('app-version'),
  getAppPath: () => ipcRenderer.invoke('app-path'),
  
  // Window controls
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  
  // Notifications
  showNotification: (title, body) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  },
  
  // Check if running in Electron
  isElectron: true
});

// Log that preload script loaded
console.log('Electron preload script loaded successfully');
`;
    
    await fs.writeFile(join(electronDir, 'preload.js'), preloadContent);
  }

  async generateElectronPackageJson(electronDir) {
    const packageJson = {
      name: this.config.name,
      version: this.config.version,
      description: this.config.description,
      main: 'main.js',
      author: this.config.author || '',
      license: 'MIT',
      dependencies: {}
    };
    
    await fs.writeFile(
      join(electronDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
  }

  async copyFrontendBuild() {
    const frontendBuildPath = join(
      process.cwd(),
      this.config.frontend.dir,
      this.config.frontend.outputDir
    );
    const targetPath = join(this.workDir, 'build');
    
    if (existsSync(frontendBuildPath)) {
      logger.verbose('Copying frontend build from:', frontendBuildPath);
      await fs.copy(frontendBuildPath, targetPath);
      logger.verbose('Frontend build copied to:', targetPath);
    } else {
      logger.warn('Frontend build not found at:', frontendBuildPath);
      logger.warn('Make sure to build frontend first or use --build-frontend flag');
    }
  }

  async packageApplications(dryRun) {
    // Choose builder based on format
    const useInstaller = this.config.formats === 'installer';
    const builder = useInstaller 
      ? new InstallerBuilder(this.config, this.workDir)
      : new SimpleBuilder(this.config, this.workDir);
    
    if (useInstaller) {
      logger.info('📦 Using installer builder (NSIS, DMG, AppImage, DEB)');
    } else {
      logger.info('📦 Using portable builder (ZIP, TAR.GZ)');
    }
    
    for (const platform of this.config.platforms) {
      for (const arch of this.config.architectures) {
        logger.info(`  Building ${platform}-${arch}...`);
        
        const artifacts = await builder.build(platform, arch, dryRun);
        this.artifacts.push(...artifacts);
        
        if (dryRun) {
          logger.verbose(`[DRY RUN] Would create artifacts for ${platform}-${arch}`);
        }
      }
    }
  }

  async generateChecksums(dryRun) {
    if (dryRun) {
      logger.verbose('[DRY RUN] Would generate SHA256 checksums for all artifacts');
      return;
    }
    
    for (const artifact of this.artifacts) {
      if (existsSync(artifact.path)) {
        artifact.checksum = await generateChecksum(artifact.path);
        logger.verbose(`Checksum for ${artifact.name}: ${artifact.checksum}`);
      }
    }
  }

  async createReleaseManifest(dryRun) {
    const manifest = {
      name: this.config.name,
      version: this.config.version,
      channel: this.config.channel || 'stable',
      releaseDate: new Date().toISOString(),
      artifacts: this.artifacts.map(a => ({
        name: a.name,
        platform: a.platform,
        arch: a.arch,
        format: a.format,
        path: a.path,
        size: a.size,
        checksum: a.checksum
      }))
    };
    
    if (dryRun) {
      logger.verbose('[DRY RUN] Would create release.json with', manifest.artifacts.length, 'artifacts');
      return manifest;
    }
    
    const manifestPath = join(this.config.build.outputDir, 'release.json');
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    
    logger.verbose('Release manifest created at:', manifestPath);
    
    return manifest;
  }

  async signArtifacts(dryRun) {
    if (dryRun) {
      logger.verbose('[DRY RUN] Would sign artifacts with configured certificates');
      return;
    }
    
    // TODO: Implement signing
    logger.verbose('Signing not yet implemented');
  }

  async uploadArtifacts(dryRun) {
    if (dryRun) {
      logger.verbose('[DRY RUN] Would upload artifacts to:', this.config.upload.url);
      return;
    }
    
    // TODO: Implement upload
    logger.verbose('Upload not yet implemented');
  }

  async cleanup() {
    if (existsSync(this.workDir)) {
      await fs.remove(this.workDir);
      logger.verbose('Temporary files cleaned up');
    }
  }
}

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
    const baseFrontendUrl = (url => {
      if (!url || typeof url !== 'string') return 'https://sartthi.com';
      return url.endsWith('/') ? url.slice(0, -1) : url;
    })(this.config.frontend?.deployedUrl || 'https://sartthi.com');

    const splashBase64 = Buffer.from(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Sartthi Desktop</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: radial-gradient(circle at top, #11131f, #07080e);
      color: #f4f4f4;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      background: rgba(7,8,14,0.9);
      border: 1px solid rgba(255,228,128,0.12);
      border-radius: 22px;
      padding: 48px;
      width: 420px;
      text-align: center;
      backdrop-filter: blur(18px);
      box-shadow: 0 25px 80px rgba(0,0,0,0.65);
    }
    .logo {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      color: #ffdf5b;
    }
    p {
      margin: 0 0 28px;
      color: rgba(244,244,244,0.85);
      line-height: 1.5;
    }
    button {
      width: 100%;
      padding: 14px 18px;
      font-size: 16px;
      border-radius: 14px;
      border: none;
      cursor: pointer;
      font-weight: 600;
      transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
      margin-bottom: 14px;
    }
    button.primary {
      background: linear-gradient(135deg, #ffd755, #f7b733);
      color: #120f1f;
      box-shadow: 0 18px 38px rgba(247,183,51,0.35);
    }
    button.secondary {
      background: rgba(20,23,32,0.9);
      color: #f4f4f4;
      border: 1px solid rgba(255,215,85,0.25);
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(0,0,0,0.4);
    }
    .cta-note {
      font-size: 13px;
      margin-top: 10px;
      color: rgba(244,244,244,0.55);
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">
      <span>⚡</span>
      <span>Sartthi Desktop</span>
    </div>
    <p>Authenticate through the secure Sartthi portal. Choose an option below to continue in your browser.</p>
    <button class="primary" onclick="window.electronAPI.openExternal('${baseFrontendUrl}/login?source=desktop&redirect=%2Fdesktop-handshake')">Continue to Login</button>
    <button class="secondary" onclick="window.electronAPI.openExternal('${baseFrontendUrl}/register?source=desktop&redirect=%2Fdesktop-handshake')">Create a new account</button>
    <div class="cta-note">Already signed in? Re-open the app after completing login.</div>
  </div>
</body>
</html>`, 'utf-8').toString('base64');
    const apiFallbacks = Array.isArray(this.config.apiFallbacks)
      ? this.config.apiFallbacks.filter(value => typeof value === 'string' && value.trim().length > 0)
      : [];

    const mainContent = `// Auto-generated by mernpkg
const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron');
const path = require('path');
const https = require('https');
const http = require('http');

let mainWindow;
let pendingDesktopToken = null;
let desktopSessionPayload = null;

const ICON_PATH = path.join(__dirname, 'logo_only.ico');
const SPLASH_HTML_BASE64 = '${splashBase64}';
const SPLASH_DATA_URL = 'data:text/html;base64,' + SPLASH_HTML_BASE64;

const sanitizeBase = (value) => {
  if (typeof value !== 'string') return '';
  return value.endsWith('/') ? value.slice(0, -1) : value;
};

const FRONTEND_URL = sanitizeBase('${this.config.frontend?.deployedUrl || 'https://sartthi.com'}');
const API_FALLBACKS = ${JSON.stringify(apiFallbacks, null, 2)};
const CONFIGURED_API_BASE = sanitizeBase('${this.config.apiBase || 'https://api.sartthi.com/api'}');
const API_BASE_CANDIDATES = Array.from(
  new Set(
    [sanitizeBase(process.env.SAARTHI_API_BASE || ''), CONFIGURED_API_BASE]
      .concat(Array.isArray(API_FALLBACKS) ? API_FALLBACKS : [])
      .map(sanitizeBase)
      .filter(Boolean)
  )
);
const DESKTOP_SHELL_URL = FRONTEND_URL + '/desktop-shell?source=desktop';
const DESKTOP_REDIRECT_URL = FRONTEND_URL + '/home';
const DESKTOP_SESSION_EXCHANGE_PATH = '/auth/desktop-session/exchange';
const DESKTOP_PROTOCOL_SCHEME = 'sartthi-desktop:';
const DESKTOP_LOGIN_URL = FRONTEND_URL + '/login?source=desktop&redirect=%2Fdesktop-handshake';
const DESKTOP_REGISTER_URL = FRONTEND_URL + '/register?source=desktop&redirect=%2Fdesktop-handshake';

function postJson(targetUrl, body) {
  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(targetUrl);
      const payload = JSON.stringify(body || {});
      const isHttps = parsedUrl.protocol === 'https:';
      const requestOptions = {
        method: 'POST',
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      };

      const request = (isHttps ? https : http).request(requestOptions, (response) => {
        let rawData = '';
        response.on('data', chunk => rawData += chunk);
        response.on('end', () => {
          try {
            const parsedBody = rawData ? JSON.parse(rawData) : {};
            resolve({ statusCode: response.statusCode, body: parsedBody });
          } catch (parseError) {
            reject(parseError);
          }
        });
      });

      request.on('error', reject);
      request.write(payload);
      request.end();
    } catch (error) {
      reject(error);
    }
  });
}

function getDesktopSessionPayloadSnapshot() {
  if (!desktopSessionPayload) return null;
  return {
    ...desktopSessionPayload,
    redirect: DESKTOP_REDIRECT_URL
  };
}

function consumeDesktopSessionPayload() {
  const payload = getDesktopSessionPayloadSnapshot();
  if (payload) {
    desktopSessionPayload = null;
  }
  return payload;
}

function emitDesktopSessionIfAvailable() {
  const payload = getDesktopSessionPayloadSnapshot();
  if (!payload || !mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send('saarthi-desktop-session', payload);
}

async function exchangeDesktopTokenWithBase(baseUrl, token) {
  if (!baseUrl) {
    throw new Error('Empty API base URL');
  }
  const exchangeUrl = baseUrl + DESKTOP_SESSION_EXCHANGE_PATH;
  const result = await postJson(exchangeUrl, { token });

  if (!result || result.statusCode < 200 || result.statusCode >= 300 || !result.body?.success || !result.body?.data) {
    throw new Error(result?.body?.message || ('Failed to exchange desktop session token via ' + exchangeUrl));
  }

  return result.body.data;
}

async function attemptDesktopSessionExchange(token) {
  if (!API_BASE_CANDIDATES.length) {
    throw new Error('No API base candidates configured for desktop session exchange');
  }

  let lastError;
  for (const base of API_BASE_CANDIDATES) {
    try {
      console.log('[Desktop] Attempting session exchange via ' + base);
      return await exchangeDesktopTokenWithBase(base, token);
    } catch (error) {
      lastError = error;
      console.error('[Desktop] Session exchange failed via ' + base + ':', error?.message || error);
    }
  }

  throw lastError || new Error('All desktop session exchange attempts failed');
}

async function handleDesktopToken(token) {
  if (!token) return;
  try {
    console.log('Processing desktop authentication token');
    const exchangeResult = await attemptDesktopSessionExchange(token);
    const { accessToken, refreshToken } = exchangeResult;
    desktopSessionPayload = {
      accessToken: accessToken || '',
      refreshToken: refreshToken || ''
    };

    if (mainWindow && !mainWindow.isDestroyed()) {
      await mainWindow.loadURL(DESKTOP_SHELL_URL);
      emitDesktopSessionIfAvailable();
    }
  } catch (error) {
    console.error('Desktop authentication failed:', error);
    if (mainWindow && !mainWindow.isDestroyed()) {
      const errorScript = "window.postMessage({ type: 'saarthi-desktop-auth-error', message: 'Desktop authentication failed. Please try again.' }, '*');";
      mainWindow.webContents.executeJavaScript(errorScript).catch(() => {});
    }
  }
}

function handleDesktopDeepLink(rawUrl) {
  if (!rawUrl) return;
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== DESKTOP_PROTOCOL_SCHEME) {
      return;
    }

    const token = parsed.searchParams.get('token');
    if (!token) {
      return;
    }

    if (mainWindow && !mainWindow.isDestroyed()) {
      handleDesktopToken(token);
    } else {
      pendingDesktopToken = token;
    }
  } catch (error) {
    console.error('Failed to process desktop deep link:', error);
  }
}

function inspectArgsForDeepLink(argv = []) {
  const match = argv.find(arg => typeof arg === 'string' && arg.startsWith(DESKTOP_PROTOCOL_SCHEME));
  if (match) {
    handleDesktopDeepLink(match);
  }
}

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('sartthi-desktop', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('sartthi-desktop');
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, commandLine) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
    inspectArgsForDeepLink(commandLine);
  });

  app.on('open-url', (_event, deepLinkUrl) => {
    handleDesktopDeepLink(deepLinkUrl);
  });

  app.on('ready', () => {
    createWindow();
    inspectArgsForDeepLink(process.argv);
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}

function flushPendingToken() {
  if (pendingDesktopToken) {
    const token = pendingDesktopToken;
    pendingDesktopToken = null;
    handleDesktopToken(token);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: ${this.config.desktop?.width || 1400},
    height: ${this.config.desktop?.height || 900},
    icon: ICON_PATH,
    show: false,
    backgroundColor: '#0B0F18',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  Menu.setApplicationMenu(null);
  mainWindow.loadURL(SPLASH_DATA_URL);

  mainWindow.webContents.on('did-finish-load', () => {
    const currentUrl = mainWindow.webContents.getURL();
    if (currentUrl.startsWith(DESKTOP_SHELL_URL)) {
      emitDesktopSessionIfAvailable();
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    flushPendingToken();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

ipcMain.on('open-external', (_event, targetUrl) => {
  if (typeof targetUrl === 'string') {
    shell.openExternal(targetUrl);
  }
});

ipcMain.handle('saarthi-desktop-get-session', async () => {
  return consumeDesktopSessionPayload();
});

ipcMain.handle('saarthi-desktop-show-splash', async () => {
  desktopSessionPayload = null;
  pendingDesktopToken = null;
  if (!mainWindow || mainWindow.isDestroyed()) return;
  await mainWindow.loadURL(SPLASH_DATA_URL);
});

console.log('Electron main script loaded with desktop deep link handler');
`;

    await fs.writeFile(join(electronDir, 'main.js'), mainContent);
  }

  async generateElectronPreload(electronDir) {
    const preloadContent = `// Auto-generated by mernpkg
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openExternal: (url) => ipcRenderer.send('open-external', url),
  getDesktopSession: () => ipcRenderer.invoke('saarthi-desktop-get-session'),
  showSplash: () => ipcRenderer.invoke('saarthi-desktop-show-splash'),
  onDesktopSession: (callback) => {
    if (typeof callback !== 'function') {
      return () => {};
    }
    const handler = (_event, payload) => callback(payload);
    ipcRenderer.on('saarthi-desktop-session', handler);
    return () => ipcRenderer.removeListener('saarthi-desktop-session', handler);
  }
});

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

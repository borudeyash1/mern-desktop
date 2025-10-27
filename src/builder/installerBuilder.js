/**
 * Installer Builder - creates professional installers using electron-builder
 * Requires Visual Studio Build Tools on Windows
 */

import { join } from 'path';
import { existsSync, statSync } from 'fs';
import { logger } from '../utils/logger.js';
import fs from 'fs-extra';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class InstallerBuilder {
  constructor(config, workDir) {
    this.config = config;
    this.workDir = workDir;
  }

  /**
   * Build installer for specific platform and architecture
   */
  async build(platform, arch, dryRun = false) {
    const artifacts = [];
    
    if (platform === 'windows') {
      return await this.buildWindows(arch, dryRun);
    } else if (platform === 'macos') {
      return await this.buildMacOS(arch, dryRun);
    } else if (platform === 'linux') {
      return await this.buildLinux(arch, dryRun);
    }
    
    return artifacts;
  }

  async buildWindows(arch, dryRun) {
    const artifacts = [];
    const outputDir = this.config.build.outputDir;
    
    // NSIS Installer
    const nsisArtifact = {
      name: `${this.config.name}-Setup-${this.config.version}.exe`,
      platform: 'windows',
      arch,
      format: 'nsis',
      path: join(outputDir, `${this.config.name}-Setup-${this.config.version}.exe`),
      size: dryRun ? '~60MB' : 0
    };
    artifacts.push(nsisArtifact);
    
    if (dryRun) {
      logger.verbose(`[DRY RUN] Would create Windows ${arch} installer:`);
      artifacts.forEach(a => logger.verbose(`  - ${a.name}`));
      return artifacts;
    }
    
    logger.verbose('Building Windows installer with electron-builder...');
    
    try {
      // Create electron-builder config
      const builderConfig = this.generateElectronBuilderConfig();
      await fs.writeFile(
        join(this.workDir, 'electron-builder.json'),
        JSON.stringify(builderConfig, null, 2)
      );
      
      // Run electron-builder
      const command = `npx electron-builder --win --${arch} --config electron-builder.json`;
      logger.verbose(`Running: ${command}`);
      
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.workDir,
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });
      
      if (stdout) logger.verbose(stdout);
      if (stderr) logger.verbose(stderr);
      
      // Update artifact sizes
      for (const artifact of artifacts) {
        if (existsSync(artifact.path)) {
          artifact.size = statSync(artifact.path).size;
          logger.verbose(`Created: ${artifact.name} (${this.formatBytes(artifact.size)})`);
        }
      }
      
    } catch (error) {
      logger.error('Windows installer build failed:', error.message);
      logger.warn('Note: Windows installers require Visual Studio Build Tools');
      logger.warn('Falling back to portable ZIP...');
      
      // Fallback to simple builder
      const { SimpleBuilder } = await import('./simpleBuilder.js');
      const simpleBuilder = new SimpleBuilder(this.config, this.workDir);
      return await simpleBuilder.buildWindows(arch, false);
    }
    
    return artifacts;
  }

  async buildMacOS(arch, dryRun) {
    const artifacts = [];
    const outputDir = this.config.build.outputDir;
    
    // DMG
    const dmgArtifact = {
      name: `${this.config.name}-${this.config.version}.dmg`,
      platform: 'macos',
      arch,
      format: 'dmg',
      path: join(outputDir, `${this.config.name}-${this.config.version}.dmg`),
      size: dryRun ? '~65MB' : 0
    };
    artifacts.push(dmgArtifact);
    
    if (dryRun) {
      logger.verbose(`[DRY RUN] Would create macOS ${arch} installer:`);
      artifacts.forEach(a => logger.verbose(`  - ${a.name}`));
      return artifacts;
    }
    
    logger.verbose('Building macOS installer with electron-builder...');
    
    try {
      const builderConfig = this.generateElectronBuilderConfig();
      await fs.writeFile(
        join(this.workDir, 'electron-builder.json'),
        JSON.stringify(builderConfig, null, 2)
      );
      
      const command = `npx electron-builder --mac --${arch} --config electron-builder.json`;
      logger.verbose(`Running: ${command}`);
      
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.workDir,
        maxBuffer: 10 * 1024 * 1024
      });
      
      if (stdout) logger.verbose(stdout);
      if (stderr) logger.verbose(stderr);
      
      for (const artifact of artifacts) {
        if (existsSync(artifact.path)) {
          artifact.size = statSync(artifact.path).size;
          logger.verbose(`Created: ${artifact.name} (${this.formatBytes(artifact.size)})`);
        }
      }
      
    } catch (error) {
      logger.error('macOS installer build failed:', error.message);
      logger.warn('Falling back to portable ZIP...');
      
      const { SimpleBuilder } = await import('./simpleBuilder.js');
      const simpleBuilder = new SimpleBuilder(this.config, this.workDir);
      return await simpleBuilder.buildMacOS(arch, false);
    }
    
    return artifacts;
  }

  async buildLinux(arch, dryRun) {
    const artifacts = [];
    const outputDir = this.config.build.outputDir;
    
    // AppImage
    const appImageArtifact = {
      name: `${this.config.name}-${this.config.version}.AppImage`,
      platform: 'linux',
      arch,
      format: 'AppImage',
      path: join(outputDir, `${this.config.name}-${this.config.version}.AppImage`),
      size: dryRun ? '~70MB' : 0
    };
    artifacts.push(appImageArtifact);
    
    // DEB
    const debArtifact = {
      name: `${this.config.name}_${this.config.version}_${arch}.deb`,
      platform: 'linux',
      arch,
      format: 'deb',
      path: join(outputDir, `${this.config.name}_${this.config.version}_${arch}.deb`),
      size: dryRun ? '~60MB' : 0
    };
    artifacts.push(debArtifact);
    
    if (dryRun) {
      logger.verbose(`[DRY RUN] Would create Linux ${arch} installers:`);
      artifacts.forEach(a => logger.verbose(`  - ${a.name}`));
      return artifacts;
    }
    
    logger.verbose('Building Linux installers with electron-builder...');
    
    try {
      const builderConfig = this.generateElectronBuilderConfig();
      await fs.writeFile(
        join(this.workDir, 'electron-builder.json'),
        JSON.stringify(builderConfig, null, 2)
      );
      
      const command = `npx electron-builder --linux --${arch} --config electron-builder.json`;
      logger.verbose(`Running: ${command}`);
      
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.workDir,
        maxBuffer: 10 * 1024 * 1024
      });
      
      if (stdout) logger.verbose(stdout);
      if (stderr) logger.verbose(stderr);
      
      for (const artifact of artifacts) {
        if (existsSync(artifact.path)) {
          artifact.size = statSync(artifact.path).size;
          logger.verbose(`Created: ${artifact.name} (${this.formatBytes(artifact.size)})`);
        }
      }
      
    } catch (error) {
      logger.error('Linux installer build failed:', error.message);
      logger.warn('Falling back to portable TAR.GZ...');
      
      const { SimpleBuilder } = await import('./simpleBuilder.js');
      const simpleBuilder = new SimpleBuilder(this.config, this.workDir);
      return await simpleBuilder.buildLinux(arch, false);
    }
    
    return artifacts;
  }

  /**
   * Generate electron-builder configuration
   */
  generateElectronBuilderConfig() {
    return {
      appId: `com.${this.config.name}.app`,
      productName: this.config.name,
      copyright: `Copyright © ${new Date().getFullYear()} ${this.config.author || this.config.name}`,
      directories: {
        output: this.config.build.outputDir,
        buildResources: this.workDir
      },
      files: [
        'main.js',
        'preload.js',
        'package.json',
        'build/**/*'
      ],
      win: {
        target: ['nsis'],
        icon: this.config.desktop?.icon || undefined,
        publisherName: this.config.author
      },
      nsis: {
        oneClick: false,
        allowToChangeInstallationDirectory: true,
        createDesktopShortcut: true,
        createStartMenuShortcut: true,
        shortcutName: this.config.name
      },
      mac: {
        target: ['dmg'],
        icon: this.config.desktop?.icon || undefined,
        category: 'public.app-category.productivity',
        hardenedRuntime: true,
        gatekeeperAssess: false
      },
      dmg: {
        title: `${this.config.name} ${this.config.version}`,
        icon: this.config.desktop?.icon || undefined
      },
      linux: {
        target: ['AppImage', 'deb'],
        icon: this.config.desktop?.icon || undefined,
        category: 'Utility',
        maintainer: this.config.author
      }
    };
  }

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

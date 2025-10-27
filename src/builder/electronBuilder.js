/**
 * Electron Builder - handles packaging with electron-builder
 */

import { join } from 'path';
import { existsSync, statSync } from 'fs';
import { logger } from '../utils/logger.js';
import fs from 'fs-extra';
import { build as electronBuild, Platform, Arch } from 'electron-builder';

export class ElectronBuilder {
  constructor(config, workDir) {
    this.config = config;
    this.workDir = workDir;
  }

  /**
   * Build application for specific platform and architecture
   * @param {string} platform - Target platform
   * @param {string} arch - Target architecture
   * @param {boolean} dryRun - Simulate build
   * @returns {Promise<Array>} Generated artifacts
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
    
    // NSIS installer
    const nsisArtifact = {
      name: `${this.config.name}-${this.config.version}-win-${arch}.exe`,
      platform: 'windows',
      arch,
      format: 'nsis',
      path: join(outputDir, `${this.config.name}-${this.config.version}-win-${arch}.exe`),
      size: dryRun ? '~50MB' : 0
    };
    artifacts.push(nsisArtifact);
    
    // Portable ZIP
    const portableArtifact = {
      name: `${this.config.name}-${this.config.version}-win-${arch}-portable.zip`,
      platform: 'windows',
      arch,
      format: 'portable',
      path: join(outputDir, `${this.config.name}-${this.config.version}-win-${arch}-portable.zip`),
      size: dryRun ? '~45MB' : 0
    };
    artifacts.push(portableArtifact);
    
    if (dryRun) {
      logger.verbose(`[DRY RUN] Would create Windows ${arch} artifacts:`);
      artifacts.forEach(a => logger.verbose(`  - ${a.name}`));
      return artifacts;
    }
    
    // Real build with electron-builder
    logger.verbose('Building Windows artifacts with electron-builder...');
    
    try {
      const builderConfig = this.generateElectronBuilderConfig();
      
      await electronBuild({
        targets: Platform.WINDOWS.createTarget(['nsis', 'portable'], Arch[arch]),
        config: {
          ...builderConfig,
          directories: {
            ...builderConfig.directories,
            app: this.workDir
          }
        }
      });
      
      // Update artifact sizes
      for (const artifact of artifacts) {
        if (existsSync(artifact.path)) {
          artifact.size = statSync(artifact.path).size;
        }
      }
      
    } catch (error) {
      logger.error('Windows build failed:', error.message);
      throw error;
    }
    
    return artifacts;
  }

  async buildMacOS(arch, dryRun) {
    const artifacts = [];
    const outputDir = this.config.build.outputDir;
    
    // DMG
    const dmgArtifact = {
      name: `${this.config.name}-${this.config.version}-mac-${arch}.dmg`,
      platform: 'macos',
      arch,
      format: 'dmg',
      path: join(outputDir, `${this.config.name}-${this.config.version}-mac-${arch}.dmg`),
      size: dryRun ? '~55MB' : 0
    };
    artifacts.push(dmgArtifact);
    
    // PKG
    const pkgArtifact = {
      name: `${this.config.name}-${this.config.version}-mac-${arch}.pkg`,
      platform: 'macos',
      arch,
      format: 'pkg',
      path: join(outputDir, `${this.config.name}-${this.config.version}-mac-${arch}.pkg`),
      size: dryRun ? '~55MB' : 0
    };
    artifacts.push(pkgArtifact);
    
    if (dryRun) {
      logger.verbose(`[DRY RUN] Would create macOS ${arch} artifacts:`);
      artifacts.forEach(a => logger.verbose(`  - ${a.name}`));
      return artifacts;
    }
    
    // Actual build would use electron-builder here
    logger.verbose('Building macOS artifacts...');
    
    // Create placeholder files for now
    for (const artifact of artifacts) {
      await fs.ensureFile(artifact.path);
      await fs.writeFile(artifact.path, `Placeholder for ${artifact.name}`);
      
      if (existsSync(artifact.path)) {
        artifact.size = statSync(artifact.path).size;
      }
    }
    
    return artifacts;
  }

  async buildLinux(arch, dryRun) {
    const artifacts = [];
    const outputDir = this.config.build.outputDir;
    
    // AppImage
    const appImageArtifact = {
      name: `${this.config.name}-${this.config.version}-linux-${arch}.AppImage`,
      platform: 'linux',
      arch,
      format: 'AppImage',
      path: join(outputDir, `${this.config.name}-${this.config.version}-linux-${arch}.AppImage`),
      size: dryRun ? '~60MB' : 0
    };
    artifacts.push(appImageArtifact);
    
    // DEB
    const debArtifact = {
      name: `${this.config.name}_${this.config.version}_${arch}.deb`,
      platform: 'linux',
      arch,
      format: 'deb',
      path: join(outputDir, `${this.config.name}_${this.config.version}_${arch}.deb`),
      size: dryRun ? '~50MB' : 0
    };
    artifacts.push(debArtifact);
    
    // RPM
    const rpmArtifact = {
      name: `${this.config.name}-${this.config.version}.${arch}.rpm`,
      platform: 'linux',
      arch,
      format: 'rpm',
      path: join(outputDir, `${this.config.name}-${this.config.version}.${arch}.rpm`),
      size: dryRun ? '~50MB' : 0
    };
    artifacts.push(rpmArtifact);
    
    if (dryRun) {
      logger.verbose(`[DRY RUN] Would create Linux ${arch} artifacts:`);
      artifacts.forEach(a => logger.verbose(`  - ${a.name}`));
      return artifacts;
    }
    
    // Actual build would use electron-builder here
    logger.verbose('Building Linux artifacts...');
    
    // Create placeholder files for now
    for (const artifact of artifacts) {
      await fs.ensureFile(artifact.path);
      await fs.writeFile(artifact.path, `Placeholder for ${artifact.name}`);
      
      if (existsSync(artifact.path)) {
        artifact.size = statSync(artifact.path).size;
      }
    }
    
    return artifacts;
  }

  /**
   * Generate electron-builder configuration
   * @returns {Object} electron-builder config
   */
  generateElectronBuilderConfig() {
    return {
      appId: `com.${this.config.name}.app`,
      productName: this.config.name,
      directories: {
        output: this.config.build.outputDir,
        buildResources: join(this.workDir, 'resources')
      },
      files: [
        'electron/**/*',
        'build/**/*'
      ],
      win: {
        target: ['nsis', 'portable'],
        icon: this.config.desktop?.icon
      },
      mac: {
        target: ['dmg', 'pkg'],
        icon: this.config.desktop?.icon,
        category: 'public.app-category.productivity'
      },
      linux: {
        target: ['AppImage', 'deb', 'rpm'],
        icon: this.config.desktop?.icon,
        category: 'Utility'
      },
      nsis: {
        oneClick: false,
        allowToChangeInstallationDirectory: true
      }
    };
  }
}

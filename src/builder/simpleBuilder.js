/**
 * Simple Builder - creates basic Electron packages without electron-builder
 * This is a lightweight alternative that works without native dependencies
 */

import { join } from 'path';
import { existsSync, statSync, createReadStream, createWriteStream } from 'fs';
import { logger } from '../utils/logger.js';
import fs from 'fs-extra';
import archiver from 'archiver';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class SimpleBuilder {
  constructor(config, workDir) {
    this.config = config;
    this.workDir = workDir;
  }

  /**
   * Build application for specific platform and architecture
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
    
    // Create portable ZIP
    logger.verbose('Creating Windows portable package...');
    
    try {
      await fs.ensureDir(outputDir);
      
      // Create ZIP archive
      await this.createZipArchive(this.workDir, portableArtifact.path);
      
      // Update artifact size
      if (existsSync(portableArtifact.path)) {
        portableArtifact.size = statSync(portableArtifact.path).size;
        logger.verbose(`Created: ${portableArtifact.name} (${this.formatBytes(portableArtifact.size)})`);
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
    
    // ZIP
    const zipArtifact = {
      name: `${this.config.name}-${this.config.version}-mac-${arch}.zip`,
      platform: 'macos',
      arch,
      format: 'zip',
      path: join(outputDir, `${this.config.name}-${this.config.version}-mac-${arch}.zip`),
      size: dryRun ? '~55MB' : 0
    };
    artifacts.push(zipArtifact);
    
    if (dryRun) {
      logger.verbose(`[DRY RUN] Would create macOS ${arch} artifacts:`);
      artifacts.forEach(a => logger.verbose(`  - ${a.name}`));
      return artifacts;
    }
    
    // Create ZIP archive
    logger.verbose('Creating macOS package...');
    
    try {
      await fs.ensureDir(outputDir);
      await this.createZipArchive(this.workDir, zipArtifact.path);
      
      if (existsSync(zipArtifact.path)) {
        zipArtifact.size = statSync(zipArtifact.path).size;
        logger.verbose(`Created: ${zipArtifact.name} (${this.formatBytes(zipArtifact.size)})`);
      }
      
    } catch (error) {
      logger.error('macOS build failed:', error.message);
      throw error;
    }
    
    return artifacts;
  }

  async buildLinux(arch, dryRun) {
    const artifacts = [];
    const outputDir = this.config.build.outputDir;
    
    // TAR.GZ
    const tarArtifact = {
      name: `${this.config.name}-${this.config.version}-linux-${arch}.tar.gz`,
      platform: 'linux',
      arch,
      format: 'tar.gz',
      path: join(outputDir, `${this.config.name}-${this.config.version}-linux-${arch}.tar.gz`),
      size: dryRun ? '~50MB' : 0
    };
    artifacts.push(tarArtifact);
    
    if (dryRun) {
      logger.verbose(`[DRY RUN] Would create Linux ${arch} artifacts:`);
      artifacts.forEach(a => logger.verbose(`  - ${a.name}`));
      return artifacts;
    }
    
    // Create TAR.GZ archive
    logger.verbose('Creating Linux package...');
    
    try {
      await fs.ensureDir(outputDir);
      await this.createTarGzArchive(this.workDir, tarArtifact.path);
      
      if (existsSync(tarArtifact.path)) {
        tarArtifact.size = statSync(tarArtifact.path).size;
        logger.verbose(`Created: ${tarArtifact.name} (${this.formatBytes(tarArtifact.size)})`);
      }
      
    } catch (error) {
      logger.error('Linux build failed:', error.message);
      throw error;
    }
    
    return artifacts;
  }

  /**
   * Create ZIP archive
   */
  async createZipArchive(sourceDir, outputPath) {
    return new Promise((resolve, reject) => {
      const output = createWriteStream(outputPath);
      const archive = archiver('zip', {
        zlib: { level: 9 }
      });

      output.on('close', () => {
        resolve();
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.pipe(output);
      archive.directory(sourceDir, this.config.name);
      archive.finalize();
    });
  }

  /**
   * Create TAR.GZ archive
   */
  async createTarGzArchive(sourceDir, outputPath) {
    return new Promise((resolve, reject) => {
      const output = createWriteStream(outputPath);
      const archive = archiver('tar', {
        gzip: true,
        gzipOptions: { level: 9 }
      });

      output.on('close', () => {
        resolve();
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.pipe(output);
      archive.directory(sourceDir, this.config.name);
      archive.finalize();
    });
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

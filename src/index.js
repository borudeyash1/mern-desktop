/**
 * mernpkg - Library API
 * Programmatic interface for packaging MERN apps as desktop applications
 */

import { Orchestrator } from './orchestrator.js';
import { loadConfig } from './config.js';
import { logger } from './utils/logger.js';

/**
 * Build desktop application packages
 * @param {Object} options - Build options
 * @param {string} options.config - Path to config file
 * @param {string} options.workdir - Working directory
 * @param {boolean} options.dryRun - Simulate build without executing
 * @param {boolean} options.verbose - Enable verbose logging
 * @returns {Promise<Object>} Build result with artifacts and manifest
 */
export async function build(options = {}) {
  try {
    logger.setVerbose(options.verbose || false);
    
    const config = await loadConfig(options.config, options);
    const orchestrator = new Orchestrator(config);
    
    return await orchestrator.build(options.dryRun || false);
  } catch (error) {
    logger.error('Build failed:', error.message);
    throw error;
  }
}

/**
 * Validate configuration without building
 * @param {string} configPath - Path to config file
 * @returns {Promise<Object>} Validation result
 */
export async function validate(configPath) {
  try {
    const config = await loadConfig(configPath);
    logger.success('Configuration is valid');
    return { valid: true, config };
  } catch (error) {
    logger.error('Configuration validation failed:', error.message);
    return { valid: false, error: error.message };
  }
}

/**
 * List available build targets
 * @param {Object} options - Filter options
 * @returns {Array} Available targets
 */
export function listTargets(options = {}) {
  const targets = [];
  
  const platforms = options.platforms || ['windows', 'macos', 'linux'];
  const architectures = options.arch || ['x64', 'arm64'];
  
  platforms.forEach(platform => {
    architectures.forEach(arch => {
      if (platform === 'windows') {
        targets.push({ platform, arch, format: 'nsis' });
        targets.push({ platform, arch, format: 'portable' });
      } else if (platform === 'macos') {
        targets.push({ platform, arch, format: 'dmg' });
        targets.push({ platform, arch, format: 'pkg' });
      } else if (platform === 'linux') {
        targets.push({ platform, arch, format: 'AppImage' });
        targets.push({ platform, arch, format: 'deb' });
        targets.push({ platform, arch, format: 'rpm' });
      }
    });
  });
  
  return targets;
}

export { Orchestrator, loadConfig, logger };

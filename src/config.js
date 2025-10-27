/**
 * Configuration loader and validator
 */

import Ajv from 'ajv';
import { readFileSync } from 'fs';
import { load as yamlLoad } from 'js-yaml';
import { join } from 'path';
import { logger } from './utils/logger.js';

const configSchema = {
  type: 'object',
  required: ['name', 'version'],
  properties: {
    name: { type: 'string', minLength: 1 },
    version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+' },
    description: { type: 'string' },
    author: { type: 'string' },
    platforms: {
      type: 'array',
      items: { enum: ['windows', 'macos', 'linux'] },
      minItems: 1
    },
    architectures: {
      type: 'array',
      items: { enum: ['x64', 'arm64'] },
      minItems: 1
    },
    frontend: {
      type: 'object',
      properties: {
        dir: { type: 'string' },
        buildCommand: { type: 'string' },
        outputDir: { type: 'string' },
        deployedUrl: { type: 'string' }
      }
    },
    desktop: {
      type: 'object',
      properties: {
        main: { type: 'string' },
        preload: { type: 'string' },
        icon: { type: 'string' },
        width: { type: 'number', minimum: 400 },
        height: { type: 'number', minimum: 300 }
      }
    },
    build: {
      type: 'object',
      properties: {
        outputDir: { type: 'string' },
        keepTemp: { type: 'boolean' },
        compression: { enum: ['store', 'normal', 'maximum'] }
      }
    },
    signing: {
      type: 'object',
      properties: {
        windows: {
          type: 'object',
          properties: {
            certificateFile: { type: 'string' },
            certificatePassword: { type: 'string' }
          }
        },
        macos: {
          type: 'object',
          properties: {
            identity: { type: 'string' },
            teamId: { type: 'string' },
            notarize: { type: 'boolean' }
          }
        }
      }
    },
    upload: {
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
        url: { type: 'string' },
        authToken: { type: 'string' }
      }
    },
    channel: { enum: ['stable', 'beta', 'alpha', 'dev'] }
  }
};

/**
 * Load and validate configuration
 * @param {string} configPath - Path to config file
 * @param {Object} overrides - CLI option overrides
 * @returns {Promise<Object>} Validated configuration
 */
export async function loadConfig(configPath, overrides = {}) {
  try {
    logger.verbose(`Loading config from: ${configPath}`);
    
    let config;
    
    if (configPath.endsWith('.yaml') || configPath.endsWith('.yml')) {
      const content = readFileSync(configPath, 'utf-8');
      config = yamlLoad(content);
    } else {
      const content = readFileSync(configPath, 'utf-8');
      config = JSON.parse(content);
    }
    
    // Apply CLI overrides
    if (overrides.name) config.name = overrides.name;
    if (overrides.version) config.version = overrides.version;
    if (overrides.channel) config.channel = overrides.channel;
    if (overrides.platforms) {
      config.platforms = overrides.platforms.split(',').map(p => p.trim());
    }
    if (overrides.arch) {
      config.architectures = overrides.arch.split(',').map(a => a.trim());
    }
    if (overrides.useDeployedUrl) {
      config.frontend = config.frontend || {};
      config.frontend.deployedUrl = overrides.useDeployedUrl;
    }
    if (overrides.icon) {
      config.desktop = config.desktop || {};
      config.desktop.icon = overrides.icon;
    }
    
    // Signing overrides
    if (overrides.sign) {
      config.signing = config.signing || {};
      if (overrides.pfx) {
        config.signing.windows = config.signing.windows || {};
        config.signing.windows.certificateFile = overrides.pfx;
        config.signing.windows.certificatePassword = overrides.pfxPass;
      }
      if (overrides.appleIdentity) {
        config.signing.macos = config.signing.macos || {};
        config.signing.macos.identity = overrides.appleIdentity;
        config.signing.macos.teamId = overrides.appleTeamId;
        config.signing.macos.notarize = overrides.notarize || false;
      }
    }
    
    // Upload overrides
    if (overrides.upload) {
      config.upload = config.upload || {};
      config.upload.enabled = true;
      if (overrides.uploadUrl) config.upload.url = overrides.uploadUrl;
      if (overrides.authToken) config.upload.authToken = overrides.authToken;
    }
    
    // Validate
    const ajv = new Ajv({ allErrors: true });
    const validate = ajv.compile(configSchema);
    const valid = validate(config);
    
    if (!valid) {
      const errors = validate.errors.map(err => 
        `${err.instancePath} ${err.message}`
      ).join(', ');
      throw new Error(`Configuration validation failed: ${errors}`);
    }
    
    // Set defaults
    config.platforms = config.platforms || ['windows', 'macos', 'linux'];
    config.architectures = config.architectures || ['x64'];
    config.channel = config.channel || 'stable';
    config.build = config.build || {};
    config.build.outputDir = config.build.outputDir || './dist';
    config.build.keepTemp = config.build.keepTemp || false;
    config.buildFrontend = overrides.buildFrontend || false;
    config.formats = overrides.formats || 'portable';
    
    logger.verbose('Configuration loaded and validated successfully');
    
    return config;
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Configuration file not found: ${configPath}`);
    }
    throw error;
  }
}

/**
 * Get default configuration template
 * @returns {Object} Default configuration
 */
export function getDefaultConfig() {
  return {
    name: 'my-app',
    version: '1.0.0',
    description: 'My MERN Desktop Application',
    platforms: ['windows', 'macos', 'linux'],
    architectures: ['x64'],
    frontend: {
      dir: './client',
      buildCommand: 'npm run build',
      outputDir: './build'
    },
    desktop: {
      main: 'electron/main.js',
      preload: 'electron/preload.js',
      width: 1200,
      height: 800
    },
    build: {
      outputDir: './dist',
      keepTemp: false,
      compression: 'normal'
    },
    channel: 'stable'
  };
}

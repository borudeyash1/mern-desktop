/**
 * Environment validation utilities
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { platform } from 'os';

const execAsync = promisify(exec);

/**
 * Validate environment for building desktop applications
 * @param {Object} config - Build configuration
 * @returns {Promise<Object>} Validation result
 */
export async function validateEnvironment(config) {
  const errors = [];
  const warnings = [];
  
  // Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 18) {
    errors.push(`Node.js 18+ required, found ${nodeVersion}`);
  }
  
  // Check platform-specific requirements
  const currentPlatform = platform();
  
  for (const targetPlatform of config.platforms) {
    if (targetPlatform === 'windows') {
      await validateWindowsTools(errors, warnings, currentPlatform);
    } else if (targetPlatform === 'macos') {
      await validateMacOSTools(errors, warnings, currentPlatform);
    } else if (targetPlatform === 'linux') {
      await validateLinuxTools(errors, warnings, currentPlatform);
    }
  }
  
  // Check signing requirements
  if (config.signing) {
    validateSigningConfig(config.signing, errors, warnings);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

async function validateWindowsTools(errors, warnings, currentPlatform) {
  if (currentPlatform === 'win32') {
    // Check for signtool (optional)
    try {
      await execAsync('where signtool');
    } catch {
      warnings.push('signtool not found - Windows signing will be unavailable');
    }
  } else {
    warnings.push('Building Windows apps on non-Windows platform - some features may be limited');
  }
}

async function validateMacOSTools(errors, warnings, currentPlatform) {
  if (currentPlatform === 'darwin') {
    // Check for Xcode
    try {
      await execAsync('xcode-select -p');
    } catch {
      errors.push('Xcode Command Line Tools not found - required for macOS builds');
      errors.push('Install with: xcode-select --install');
    }
    
    // Check for codesign
    try {
      await execAsync('which codesign');
    } catch {
      warnings.push('codesign not found - macOS signing will be unavailable');
    }
  } else {
    warnings.push('Building macOS apps on non-macOS platform - some features may be limited');
  }
}

async function validateLinuxTools(errors, warnings, currentPlatform) {
  if (currentPlatform === 'linux') {
    // Check for dpkg (for .deb)
    try {
      await execAsync('which dpkg');
    } catch {
      warnings.push('dpkg not found - .deb packaging will be unavailable');
    }
    
    // Check for rpmbuild (for .rpm)
    try {
      await execAsync('which rpmbuild');
    } catch {
      warnings.push('rpmbuild not found - .rpm packaging will be unavailable');
    }
  }
}

function validateSigningConfig(signing, errors, warnings) {
  if (signing.windows) {
    if (!signing.windows.certificateFile) {
      warnings.push('Windows certificate file not configured');
    }
  }
  
  if (signing.macos) {
    if (!signing.macos.identity) {
      warnings.push('macOS signing identity not configured');
    }
    if (signing.macos.notarize && !signing.macos.teamId) {
      errors.push('macOS notarization requires teamId');
    }
  }
}

/**
 * Check if a command exists
 * @param {string} command - Command to check
 * @returns {Promise<boolean>} True if command exists
 */
export async function commandExists(command) {
  try {
    const checkCommand = platform() === 'win32' ? 'where' : 'which';
    await execAsync(`${checkCommand} ${command}`);
    return true;
  } catch {
    return false;
  }
}

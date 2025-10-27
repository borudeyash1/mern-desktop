/**
 * Tests for configuration validation
 */

import { describe, test, expect } from '@jest/globals';
import { loadConfig, getDefaultConfig } from './config.js';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

describe('Configuration', () => {
  const testConfigPath = join(process.cwd(), 'test-config.json');

  afterEach(() => {
    try {
      unlinkSync(testConfigPath);
    } catch {}
  });

  test('should load valid configuration', async () => {
    const config = {
      name: 'test-app',
      version: '1.0.0',
      platforms: ['windows'],
      architectures: ['x64']
    };

    writeFileSync(testConfigPath, JSON.stringify(config));
    
    const loaded = await loadConfig(testConfigPath);
    expect(loaded.name).toBe('test-app');
    expect(loaded.version).toBe('1.0.0');
  });

  test('should reject invalid version format', async () => {
    const config = {
      name: 'test-app',
      version: 'invalid',
      platforms: ['windows']
    };

    writeFileSync(testConfigPath, JSON.stringify(config));
    
    await expect(loadConfig(testConfigPath)).rejects.toThrow();
  });

  test('should apply CLI overrides', async () => {
    const config = {
      name: 'test-app',
      version: '1.0.0',
      platforms: ['windows']
    };

    writeFileSync(testConfigPath, JSON.stringify(config));
    
    const loaded = await loadConfig(testConfigPath, {
      version: '2.0.0',
      platforms: 'macos,linux'
    });

    expect(loaded.version).toBe('2.0.0');
    expect(loaded.platforms).toEqual(['macos', 'linux']);
  });

  test('should provide default configuration', () => {
    const config = getDefaultConfig();
    
    expect(config.name).toBeDefined();
    expect(config.version).toBeDefined();
    expect(config.platforms).toBeInstanceOf(Array);
  });
});

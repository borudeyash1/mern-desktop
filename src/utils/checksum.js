/**
 * Checksum generation utilities
 */

import { createHash } from 'crypto';
import { createReadStream } from 'fs';

/**
 * Generate SHA256 checksum for a file
 * @param {string} filePath - Path to file
 * @returns {Promise<string>} Hex checksum
 */
export function generateChecksum(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(filePath);

    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

/**
 * Generate checksums for multiple files
 * @param {string[]} filePaths - Array of file paths
 * @returns {Promise<Object>} Map of file paths to checksums
 */
export async function generateChecksums(filePaths) {
  const checksums = {};
  
  for (const filePath of filePaths) {
    checksums[filePath] = await generateChecksum(filePath);
  }
  
  return checksums;
}

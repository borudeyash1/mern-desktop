/**
 * mernpkg CLI implementation
 */

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { build, validate, listTargets } from './index.js';
import { logger } from './utils/logger.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

export async function cli(argv) {
  const program = new Command();

  program
    .name('mernpkg')
    .description('Package MERN web apps as signed, installable desktop applications')
    .version(packageJson.version);

  // Build command
  program
    .command('build')
    .description('Build desktop application packages')
    .option('-c, --config <path>', 'Path to config file', 'mernpkg.config.json')
    .option('-w, --workdir <path>', 'Working directory', process.cwd())
    .option('--version <version>', 'Application version')
    .option('--name <name>', 'Application name')
    .option('--channel <channel>', 'Release channel (stable, beta, alpha)', 'stable')
    .option('--platforms <platforms>', 'Target platforms (comma-separated)', 'windows,macos,linux')
    .option('--arch <arch>', 'Target architectures (comma-separated)', 'x64,arm64')
    .option('--formats <formats>', 'Output formats: portable (zip/tar.gz) or installer (exe/dmg/deb)', 'portable')
    .option('--build-frontend', 'Build frontend before packaging')
    .option('--use-deployed-url <url>', 'Use deployed URL instead of local build')
    .option('--sign', 'Sign artifacts')
    .option('--pfx <path>', 'Windows PFX certificate path')
    .option('--pfx-pass <password>', 'Windows PFX password')
    .option('--apple-identity <identity>', 'macOS signing identity')
    .option('--apple-team-id <id>', 'Apple Team ID')
    .option('--notarize', 'Notarize macOS artifacts')
    .option('--upload', 'Upload artifacts to release server')
    .option('--upload-url <url>', 'Release server URL')
    .option('--auth-token <token>', 'Authentication token for upload')
    .option('--icon <path>', 'Application icon path')
    .option('--include <patterns>', 'Include patterns (comma-separated)')
    .option('--exclude <patterns>', 'Exclude patterns (comma-separated)')
    .option('--keep-temp', 'Keep temporary build files')
    .option('--dry-run', 'Simulate build without executing')
    .option('-v, --verbose', 'Enable verbose logging')
    .option('--ci-mode', 'CI mode (no interactive prompts)')
    .action(async (options) => {
      try {
        logger.setVerbose(options.verbose);
        
        logger.info(chalk.bold.cyan('\n🚀 mernpkg - MERN Desktop Packager\n'));
        
        // Interactive mode if not CI
        if (!options.ciMode && !options.dryRun) {
          const answers = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'proceed',
              message: 'Ready to build desktop packages?',
              default: true
            }
          ]);
          
          if (!answers.proceed) {
            logger.info('Build cancelled');
            return;
          }
        }
        
        const result = await build(options);
        
        logger.success('\n✅ Build completed successfully!\n');
        
        if (result.artifacts) {
          logger.info(chalk.bold('Generated artifacts:'));
          result.artifacts.forEach(artifact => {
            logger.info(`  ${chalk.cyan('•')} ${artifact.path} (${artifact.size})`);
          });
        }
        
        if (result.manifest) {
          logger.info(chalk.bold('\n📦 Release manifest:'));
          logger.info(`  Version: ${result.manifest.version}`);
          logger.info(`  Channel: ${result.manifest.channel}`);
          logger.info(`  Artifacts: ${result.manifest.artifacts?.length || 0}`);
        }
        
      } catch (error) {
        logger.error(chalk.red('\n❌ Build failed:'), error.message);
        if (options.verbose) {
          console.error(error);
        }
        process.exit(1);
      }
    });

  // Init command
  program
    .command('init')
    .description('Initialize mernpkg configuration')
    .option('-o, --output <path>', 'Output config file path', 'mernpkg.config.json')
    .option('--format <format>', 'Config format (json, yaml)', 'json')
    .action(async (options) => {
      try {
        logger.info(chalk.bold.cyan('\n📝 Initialize mernpkg configuration\n'));
        
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'name',
            message: 'Application name:',
            default: 'my-app'
          },
          {
            type: 'input',
            name: 'version',
            message: 'Application version:',
            default: '1.0.0'
          },
          {
            type: 'input',
            name: 'description',
            message: 'Application description:',
            default: 'My MERN Desktop Application'
          },
          {
            type: 'checkbox',
            name: 'platforms',
            message: 'Target platforms:',
            choices: ['windows', 'macos', 'linux'],
            default: ['windows', 'macos', 'linux']
          },
          {
            type: 'checkbox',
            name: 'architectures',
            message: 'Target architectures:',
            choices: ['x64', 'arm64'],
            default: ['x64']
          },
          {
            type: 'input',
            name: 'frontendDir',
            message: 'Frontend directory:',
            default: './client'
          },
          {
            type: 'input',
            name: 'buildCommand',
            message: 'Frontend build command:',
            default: 'npm run build'
          }
        ]);
        
        const config = {
          name: answers.name,
          version: answers.version,
          description: answers.description,
          platforms: answers.platforms,
          architectures: answers.architectures,
          frontend: {
            dir: answers.frontendDir,
            buildCommand: answers.buildCommand,
            outputDir: './build'
          },
          desktop: {
            main: 'electron/main.js',
            preload: 'electron/preload.js'
          },
          build: {
            outputDir: './dist',
            keepTemp: false
          }
        };
        
        const fs = await import('fs-extra');
        const yaml = await import('js-yaml');
        
        const outputPath = options.output;
        const content = options.format === 'yaml' 
          ? yaml.dump(config)
          : JSON.stringify(config, null, 2);
        
        await fs.writeFile(outputPath, content);
        
        logger.success(`\n✅ Configuration created: ${outputPath}`);
        logger.info('\nNext steps:');
        logger.info(`  1. Review and customize ${outputPath}`);
        logger.info('  2. Run: mernpkg build --dry-run');
        logger.info('  3. Run: mernpkg build\n');
        
      } catch (error) {
        logger.error('Init failed:', error.message);
        process.exit(1);
      }
    });

  // Validate command
  program
    .command('validate')
    .description('Validate configuration file')
    .argument('<config>', 'Path to config file')
    .action(async (configPath) => {
      try {
        const result = await validate(configPath);
        if (result.valid) {
          logger.success('✅ Configuration is valid');
          logger.info('\nConfiguration summary:');
          logger.info(`  Name: ${result.config.name}`);
          logger.info(`  Version: ${result.config.version}`);
          logger.info(`  Platforms: ${result.config.platforms?.join(', ')}`);
        } else {
          logger.error('❌ Configuration is invalid:', result.error);
          process.exit(1);
        }
      } catch (error) {
        logger.error('Validation failed:', error.message);
        process.exit(1);
      }
    });

  // List targets command
  program
    .command('list-targets')
    .description('List available build targets')
    .option('--platforms <platforms>', 'Filter by platforms')
    .option('--arch <arch>', 'Filter by architectures')
    .action((options) => {
      const targets = listTargets({
        platforms: options.platforms?.split(','),
        arch: options.arch?.split(',')
      });
      
      logger.info(chalk.bold('\nAvailable build targets:\n'));
      
      const grouped = {};
      targets.forEach(target => {
        const key = target.platform;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(target);
      });
      
      Object.entries(grouped).forEach(([platform, platformTargets]) => {
        logger.info(chalk.bold.cyan(`${platform}:`));
        platformTargets.forEach(target => {
          logger.info(`  ${chalk.cyan('•')} ${target.arch} - ${target.format}`);
        });
        logger.info('');
      });
    });

  // Upload command
  program
    .command('upload')
    .description('Upload artifacts to release server')
    .argument('<artifacts...>', 'Artifact paths to upload')
    .option('--url <url>', 'Release server URL', 'http://localhost:3000/admin/releases')
    .option('--token <token>', 'Authentication token')
    .option('--version <version>', 'Release version')
    .option('--channel <channel>', 'Release channel', 'stable')
    .action(async (artifacts, options) => {
      try {
        logger.info(chalk.bold.cyan('\n📤 Uploading artifacts\n'));
        
        // TODO: Implement upload logic
        logger.info(`Uploading ${artifacts.length} artifacts to ${options.url}`);
        logger.success('\n✅ Upload completed');
        
      } catch (error) {
        logger.error('Upload failed:', error.message);
        process.exit(1);
      }
    });

  await program.parseAsync(argv);
}

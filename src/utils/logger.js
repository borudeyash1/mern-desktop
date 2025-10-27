/**
 * Logger utility with color support
 */

import chalk from 'chalk';

class Logger {
  constructor() {
    this.verboseEnabled = false;
  }

  setVerbose(enabled) {
    this.verboseEnabled = enabled;
  }

  info(...args) {
    console.log(chalk.blue('ℹ'), ...args);
  }

  success(...args) {
    console.log(chalk.green('✓'), ...args);
  }

  warn(...args) {
    console.log(chalk.yellow('⚠'), ...args);
  }

  error(...args) {
    console.error(chalk.red('✗'), ...args);
  }

  verbose(...args) {
    if (this.verboseEnabled) {
      console.log(chalk.gray('→'), ...args);
    }
  }

  debug(...args) {
    if (this.verboseEnabled) {
      console.log(chalk.magenta('🐛'), ...args);
    }
  }
}

export const logger = new Logger();

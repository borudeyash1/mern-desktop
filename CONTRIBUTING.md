# Contributing to mern-desktop

First off, thank you for considering contributing to mern-desktop! 🎉

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates.

**When reporting a bug, include:**
- Your OS and version (Windows 10, macOS 13, Ubuntu 22.04, etc.)
- Node.js version (`node --version`)
- mern-desktop version
- Steps to reproduce
- Expected behavior
- Actual behavior
- Error messages/logs

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- Clear and descriptive title
- Detailed description of the proposed functionality
- Why this enhancement would be useful
- Examples of how it would work

### Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Make your changes**
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Follow the coding style** of the project
6. **Write clear commit messages**
7. **Submit a pull request**

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/mern-desktop.git
cd mern-desktop

# Install dependencies
npm install

# Run tests
npm test

# Test CLI
node bin/mernpkg.js --help
```

## Coding Guidelines

### JavaScript Style

- Use ES6+ features
- Use `async/await` over callbacks
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

### Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters
- Reference issues and pull requests

**Examples:**
```
Add support for custom Electron versions
Fix OAuth redirect handling in desktop mode
Update documentation for installer format
```

### File Structure

```
mern-desktop/
├── bin/              # CLI entry point
├── src/
│   ├── builder/      # Build implementations
│   ├── utils/        # Utility functions
│   ├── cli.js        # CLI commands
│   ├── config.js     # Configuration handling
│   └── orchestrator.js  # Build orchestration
├── examples/         # Example configurations
└── docs/            # Documentation
```

## Testing

### Manual Testing

```bash
# Test portable build
node bin/mernpkg.js build --config examples/mernpkg.config.json --dry-run

# Test installer build
node bin/mernpkg.js build --config examples/mernpkg.config.json --formats installer --dry-run
```

### Adding Tests

- Add unit tests in `src/*.test.js`
- Test both success and error cases
- Mock external dependencies

## Documentation

- Update README.md for user-facing changes
- Update COMPLETE_GUIDE.md for detailed guides
- Add JSDoc comments to functions
- Update examples if needed

## Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create a git tag
4. Push to GitHub
5. Publish to npm (maintainers only)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all.

### Our Standards

**Positive behavior includes:**
- Being respectful and inclusive
- Accepting constructive criticism
- Focusing on what's best for the community
- Showing empathy

**Unacceptable behavior includes:**
- Harassment or discriminatory language
- Trolling or insulting comments
- Publishing others' private information
- Other unprofessional conduct

## Questions?

Feel free to open an issue with the `question` label or reach out to the maintainers.

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- GitHub contributors page

Thank you for contributing! 🚀

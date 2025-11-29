const fs = require('fs');

try {
    const cfg = JSON.parse(fs.readFileSync('saarthi.config.json', 'utf8'));

    if (!cfg.name || !cfg.version) {
        console.error('Config must include name and version');
        process.exit(1);
    }

    const get = v => (v ?? '').toString();

    console.log('APP_NAME=' + get(cfg.name));
    console.log('APP_VERSION=' + get(cfg.version));
    console.log('APP_AUTHOR=' + get(cfg.author || cfg.name));

    const frontend = cfg.frontend || {};
    console.log('APP_URL=' + get(frontend.deployedUrl || ''));
    console.log('APP_PROJECT_DIR=' + get(frontend.dir || 'Project/Project-Management'));
} catch (error) {
    console.error('Error reading config:', error.message);
    process.exit(1);
}

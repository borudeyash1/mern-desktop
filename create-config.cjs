const fs = require('fs');

const config = {
    "name": "saarthi",
    "version": "1.0.2",
    "description": "Saarthi - Project Management Desktop Application",
    "author": "Yash Borude",
    "platforms": ["windows", "macos", "linux"],
    "architectures": ["x64"],
    "frontend": {
        "deployedUrl": "https://sartthi.com"
    },
    "apiBase": "https://sartthi.com/api",
    "apiFallbacks": [
        "https://api.sartthi.com/api",
        "http://localhost:5000/api"
    ],
    "desktop": {
        "main": "electron/main.js",
        "preload": "electron/preload.js",
        "width": 1400,
        "height": 900
    },
    "build": {
        "outputDir": "./dist",
        "keepTemp": false,
        "compression": "normal"
    },
    "channel": "stable"
};

// Write without BOM
fs.writeFileSync('saarthi.config.json', JSON.stringify(config, null, 2), { encoding: 'utf8' });
console.log('Config file created successfully!');

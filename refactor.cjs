const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// 1. Create directories
const dirs = [
    'landingPage/presentation/components',
    'landingPage/presentation/views',
    'login/presentation/layouts',
    'login/presentation/views',
    'frontend/presentation/layouts',
    'frontend/presentation/views',
    'frontend/application',
    'frontend/domain',
    'router',
    'assets'
];

dirs.forEach(d => {
    fs.mkdirSync(path.join(srcDir, d), { recursive: true });
});

// 2. Move files
const moves = [
    { from: 'presentation/views/LandingPage.vue', to: 'landingPage/presentation/views/LandingPage.vue' },
    { from: 'presentation/layouts/AuthLayout.vue', to: 'login/presentation/layouts/AuthLayout.vue' },
    { from: 'presentation/views/auth/LoginView.vue', to: 'login/presentation/views/LoginView.vue' },
    { from: 'presentation/views/auth/RegisterView.vue', to: 'login/presentation/views/RegisterView.vue' },
    { from: 'presentation/layouts/DashboardLayout.vue', to: 'frontend/presentation/layouts/DashboardLayout.vue' },
    { from: 'presentation/views/dashboard/SimulatorView.vue', to: 'frontend/presentation/views/SimulatorView.vue' },
    { from: 'infrastructure/router/index.js', to: 'router/index.js' }
];

moves.forEach(m => {
    if (fs.existsSync(path.join(srcDir, m.from))) {
        fs.renameSync(path.join(srcDir, m.from), path.join(srcDir, m.to));
    }
});

// Move components
const componentsDir = path.join(srcDir, 'presentation/components');
if (fs.existsSync(componentsDir)) {
    fs.readdirSync(componentsDir).forEach(file => {
        fs.renameSync(path.join(componentsDir, file), path.join(srcDir, 'landingPage/presentation/components', file));
    });
}

// Move application
const appDir = path.join(srcDir, 'application');
if (fs.existsSync(appDir)) {
    fs.readdirSync(appDir).forEach(file => {
        fs.renameSync(path.join(appDir, file), path.join(srcDir, 'frontend/application', file));
    });
}

// Move domain
const domainDir = path.join(srcDir, 'domain');
if (fs.existsSync(domainDir)) {
    fs.readdirSync(domainDir).forEach(file => {
        fs.renameSync(path.join(domainDir, file), path.join(srcDir, 'frontend/domain', file));
    });
}

// Move assets
const assetsDir = path.join(srcDir, 'presentation/assets');
if (fs.existsSync(assetsDir)) {
    fs.readdirSync(assetsDir).forEach(file => {
        fs.renameSync(path.join(assetsDir, file), path.join(srcDir, 'assets', file));
    });
}

// Clean up old directories
const oldDirs = ['application', 'domain', 'infrastructure', 'presentation'];
oldDirs.forEach(d => {
    if (fs.existsSync(path.join(srcDir, d))) {
        fs.rmSync(path.join(srcDir, d), { recursive: true, force: true });
    }
});

// 3. Rewrite imports
// main.js
let mainJs = fs.readFileSync(path.join(srcDir, 'main.js'), 'utf8');
mainJs = mainJs.replace("'./presentation/assets/index.css'", "'./assets/index.css'");
mainJs = mainJs.replace("'./infrastructure/router'", "'./router'");
fs.writeFileSync(path.join(srcDir, 'main.js'), mainJs);

// router/index.js
let routerJs = fs.readFileSync(path.join(srcDir, 'router/index.js'), 'utf8');
routerJs = routerJs.replace("'../../presentation/views/LandingPage.vue'", "'../landingPage/presentation/views/LandingPage.vue'");
routerJs = routerJs.replace("'../../presentation/views/auth/LoginView.vue'", "'../login/presentation/views/LoginView.vue'");
routerJs = routerJs.replace("'../../presentation/views/auth/RegisterView.vue'", "'../login/presentation/views/RegisterView.vue'");
routerJs = routerJs.replace("'../../presentation/layouts/DashboardLayout.vue'", "'../frontend/presentation/layouts/DashboardLayout.vue'");
routerJs = routerJs.replace("'../../presentation/views/dashboard/SimulatorView.vue'", "'../frontend/presentation/views/SimulatorView.vue'");
fs.writeFileSync(path.join(srcDir, 'router/index.js'), routerJs);

// SimulatorView.vue
let simView = fs.readFileSync(path.join(srcDir, 'frontend/presentation/views/SimulatorView.vue'), 'utf8');
simView = simView.replace("'../../../application/useCreditSimulator'", "'../../application/useCreditSimulator'");
fs.writeFileSync(path.join(srcDir, 'frontend/presentation/views/SimulatorView.vue'), simView);

console.log("Refactor completed!");

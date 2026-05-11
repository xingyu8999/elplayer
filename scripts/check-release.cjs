const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const version = pkg.version;
const requiredFiles = [
  'index.html',
  'README.md',
  'LICENSE',
  'package.json',
  'build/icon.ico',
  'build/icon.icns',
  'build/icon.png',
  'build/entitlements.mac.plist',
  'electron/main.cjs',
  'electron/preload.cjs',
  'electron/lyrics-overlay.html',
  'electron/lyrics-overlay.css',
  'electron/lyrics-overlay.js',
  '.github/release-template.md',
  'download.html',
  'website.html',
  'docs/installer-usage.md',
  'docs/release-assets.md',
  'docs/website-download-section.md',
  'docs/first-run-experience.md',
  'public/release/github-release-cover.png',
  'public/release/release-desktop-overlay.png',
  'public/release/release-mini-vinyl.png',
  'public/release/release-settings-panel.png',
  'public/release/release-mobile-pwa.png'
];


function readIcoSizes(filePath) {
  const data = fs.readFileSync(filePath);
  if (data.length < 6) return [];
  const reserved = data.readUInt16LE(0);
  const type = data.readUInt16LE(2);
  const count = data.readUInt16LE(4);
  if (reserved !== 0 || type !== 1 || count < 1) return [];
  const sizes = [];
  for (let i = 0; i < count; i += 1) {
    const offset = 6 + i * 16;
    if (offset + 16 > data.length) break;
    const widthByte = data.readUInt8(offset);
    const heightByte = data.readUInt8(offset + 1);
    sizes.push({
      width: widthByte === 0 ? 256 : widthByte,
      height: heightByte === 0 ? 256 : heightByte
    });
  }
  return sizes;
}

function collectWinTargetArchs(target) {
  const archs = new Set();
  const walk = item => {
    if (!item) return;
    if (typeof item === 'string') return;
    if (Array.isArray(item)) {
      for (const entry of item) walk(entry);
      return;
    }
    if (typeof item === 'object' && Array.isArray(item.arch)) {
      for (const arch of item.arch) archs.add(arch);
    }
  };
  walk(target);
  return archs;
}


const allowedWinKeys = new Set([
  'appId', 'artifactName', 'asar', 'asarUnpack', 'azureSignOptions', 'compression',
  'cscKeyPassword', 'cscLink', 'defaultArch', 'detectUpdateChannel',
  'disableDefaultIgnoredFiles', 'electronLanguages', 'electronUpdaterCompatibility',
  'executableName', 'extraFiles', 'extraResources', 'fileAssociations', 'files',
  'forceCodeSigning', 'generateUpdatesFilesForAllChannels', 'icon', 'legalTrademarks',
  'protocols', 'publish', 'releaseInfo', 'requestedExecutionLevel',
  'signAndEditExecutable', 'signExts', 'signtoolOptions', 'target',
  'verifyUpdateCodeSignature'
]);

const failures = [];
for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) failures.push(`missing ${file}`);
}

const versionFiles = ['index.html', 'README.md', 'docs/changelog.md', 'download.html',
  'website.html', '.github/release-template.md'];
for (const file of versionFiles) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  if (!text.includes(version) && !text.includes(`v${version}`)) failures.push(`${file} does not mention ${version}`);
}

const build = pkg.build || {};
if (build.appId !== 'cn.maxingyu.elplayer') failures.push('appId must remain cn.maxingyu.elplayer');
if (!build.win || build.win.icon !== 'build/icon.ico') failures.push('Windows icon is not configured');
if (build.win) {
  for (const key of Object.keys(build.win)) {
    if (!allowedWinKeys.has(key)) failures.push(`unsupported electron-builder win option: ${key}`);
  }
}
if (build.win) {
  const winArchs = collectWinTargetArchs(build.win.target);
  if (winArchs.has('ia32')) failures.push('default Windows build must not include ia32; use npm run dist:win:ia32 only when explicitly needed');
  if (!winArchs.has('x64')) failures.push('default Windows build must include x64');
}
if (pkg.scripts && pkg.scripts['dist:win'] !== 'electron-builder --win --x64') {
  failures.push('dist:win must build Windows x64 only by default');
}
if (!pkg.scripts || pkg.scripts['dist:win:ia32'] !== 'electron-builder --win --ia32') {
  failures.push('dist:win:ia32 script is missing for optional 32-bit builds');
}
if (!build.mac || build.mac.icon !== 'build/icon.icns') failures.push('macOS icon is not configured');
if (!build.nsis || build.nsis.oneClick !== false) failures.push('NSIS assisted installer is not configured');

const icoSizes = readIcoSizes(path.join(root, 'build/icon.ico'));
if (!icoSizes.some(size => size.width >= 256 && size.height >= 256)) {
  failures.push('build/icon.ico must contain a 256x256 image for electron-builder');
}


const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
if (!indexHtml.includes('v5.3.4 窗口化专用紧凑布局')) failures.push('index.html is missing v5.3.4 compact windowed layout CSS');
const overlayCss = fs.readFileSync(path.join(root, 'electron/lyrics-overlay.css'), 'utf8');
if (!overlayCss.includes('v5.3.4 极简小尺寸修复')) failures.push('lyrics-overlay.css is missing v5.3.4 mini-small layout fix');
const readmeText = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
if (!readmeText.includes('**Elplayer 是')) failures.push('README must start with Chinese-first project description');

if (failures.length) {
  console.error('[release:check] failed');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`[release:check] OK for Elplayer v${version}`);

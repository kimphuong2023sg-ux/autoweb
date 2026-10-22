const fs = require('fs');
const path = require('path');
const AdmZip = require(path.resolve('server/node_modules/adm-zip'));

const pluginPhpPath = path.resolve('wp-plugin/flatsome-seo-bridge/flatsome-seo-bridge.php');
if (!fs.existsSync(pluginPhpPath)) {
  console.error('File not found:', pluginPhpPath);
  process.exit(1);
}

const phpContent = fs.readFileSync(pluginPhpPath);

const zip = new AdmZip();
// Add file with standard forward slash relative path
zip.addFile('flatsome-seo-bridge/flatsome-seo-bridge.php', phpContent);

// Check entries
zip.getEntries().forEach((entry) => {
  entry.entryName = entry.entryName.replace(/\\/g, '/');
  console.log('Entry:', entry.entryName);
});

const zipBuffer = zip.toBuffer();

const targetPaths = [
  path.resolve('wp-plugin/flatsome-seo-bridge.zip'),
  path.resolve('client/public/wp-bridge-plugin/flatsome-seo-bridge.zip'),
  path.resolve('client/dist/wp-bridge-plugin/flatsome-seo-bridge.zip'),
];

for (const p of targetPaths) {
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(p, zipBuffer);
  console.log('Successfully written to:', p, `(${zipBuffer.length} bytes)`);
}

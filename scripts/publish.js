import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');
const ZIP_PATH = path.join(DIST_DIR, 'build.zip');
const MANIFEST_PATH = path.resolve(__dirname, '../manifest.json');
const ICONS_DIR = path.resolve(__dirname, '../icons');

function runBuild() {
  execSync('npm run build -- --prod', { stdio: 'inherit' });
}


function zipFiles() {
  if (!fs.existsSync(DIST_DIR)) {
    throw new Error('dist directory does not exist... huh??');
  }
  
  const mapPath = path.join(DIST_DIR, 'index.js.map');
  if (fs.existsSync(mapPath)) {
    fs.unlinkSync(mapPath);
  }

  if (fs.existsSync(ZIP_PATH)) {
    fs.unlinkSync(ZIP_PATH);
  }
  const output = fs.createWriteStream(ZIP_PATH);
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', function () {
    console.log(`Created ${ZIP_PATH} (${archive.pointer()} total bytes)`);
  });

  archive.on('error', function (err) {
    throw err;
  });

  archive.pipe(output);

  // dist excluding build.zip itself
  archive.directory(DIST_DIR, 'dist', (entry) => {
    if (entry.name === 'build.zip') return false;
    return entry;
  });

  archive.file(MANIFEST_PATH, { name: 'manifest.json' });

  archive.directory(ICONS_DIR, 'icons');

  archive.finalize();
}


runBuild();
zipFiles();

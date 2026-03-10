#!/usr/bin/env node
/**
 * Image Dashboard — local tool to import photos into Silent Shutter.
 * Supports 1000+ images via server-side thumbnails, pagination & lazy loading.
 *
 * Usage:  node tools/image-dashboard.mjs
 * Opens:  http://localhost:4321
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
let IMAGES_DIR = path.join(ROOT, "images");
const PUBLIC_DIR = path.join(ROOT, "public");
const CONFIG_FILE = path.join(ROOT, "src/config/categoryImages.ts");
const THUMB_DIR = path.join(os.tmpdir(), "silent-shutter-thumbs");
const HOME = os.homedir();

const CATEGORIES = ["landscapes", "nature", "street", "architecture", "travel"];
const CATEGORY_PREFIX = { landscapes: "l", nature: "n", street: "s", architecture: "a", travel: "t" };

const PAGE_SIZE = 24;
const THUMB_MAX_PX = 400;
const PORT = 4321;

// Ensure thumb cache dir
if (!fs.existsSync(THUMB_DIR)) fs.mkdirSync(THUMB_DIR, { recursive: true });

// ── Helpers ──────────────────────────────────────────────────────────────────

function fileHash(filePath) {
  const fd = fs.openSync(filePath, 'r');
  const buf = Buffer.alloc(65536);
  const bytesRead = fs.readSync(fd, buf, 0, 65536, 0);
  fs.closeSync(fd);
  return crypto.createHash('md5').update(buf.subarray(0, bytesRead)).digest('hex');
}

function getProcessedHashes() {
  const hashes = new Set();
  for (const cat of CATEGORIES) {
    const catDir = path.join(PUBLIC_DIR, cat);
    if (!fs.existsSync(catDir)) continue;
    for (const f of fs.readdirSync(catDir)) {
      if (!/\.(jpe?g|png|webp)$/i.test(f)) continue;
      try {
        hashes.add(fileHash(path.join(catDir, f)));
      } catch { /* skip */ }
    }
  }
  return hashes;
}

let _processedHashCache = null;
let _processedHashTime = 0;
function getCachedProcessedHashes() {
  const now = Date.now();
  if (!_processedHashCache || now - _processedHashTime > 10000) {
    _processedHashCache = getProcessedHashes();
    _processedHashTime = now;
  }
  return _processedHashCache;
}
function invalidateHashCache() { _processedHashCache = null; }

function getImages() {
  if (!fs.existsSync(IMAGES_DIR)) return [];
  const processed = getCachedProcessedHashes();
  const files = fs.readdirSync(IMAGES_DIR)
    .filter(f => !f.startsWith('._') && /\.(jpe?g|png|webp)$/i.test(f));
  const results = [];
  for (const f of files) {
    const fp = path.join(IMAGES_DIR, f);
    try {
      const stat = fs.statSync(fp);
      const h = fileHash(fp);
      if (processed.has(h)) continue;
      results.push({ name: f, size: stat.size, mtime: stat.mtimeMs });
    } catch { /* skip */ }
  }
  return results;
}

function getImageDimensions(filePath) {
  const out = execSync(`sips -g pixelWidth -g pixelHeight "${filePath}"`, { encoding: "utf8" });
  const w = parseInt(out.match(/pixelWidth:\s*(\d+)/)?.[1] || "0");
  const h = parseInt(out.match(/pixelHeight:\s*(\d+)/)?.[1] || "0");
  return { width: w, height: h };
}

function detectAspect(w, h) {
  const ratio = w / h;
  if (ratio > 1.15) return "landscape";
  if (ratio < 0.85) return "portrait";
  return "square";
}

function getOrCreateThumbnail(filename) {
  const srcPath = path.join(IMAGES_DIR, filename);
  const stat = fs.statSync(srcPath);
  const cacheKey = `${filename}_${stat.mtimeMs}`.replace(/[^a-zA-Z0-9._-]/g, "_");
  const thumbPath = path.join(THUMB_DIR, cacheKey + ".jpg");

  if (fs.existsSync(thumbPath)) return thumbPath;

  try {
    fs.copyFileSync(srcPath, thumbPath);
    execSync(
      `sips --resampleHeightWidthMax ${THUMB_MAX_PX} --setProperty format jpeg "${thumbPath}"`,
      { encoding: "utf8", stdio: "pipe" }
    );
  } catch {
    if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
    return srcPath;
  }
  return thumbPath;
}

function rotateImage(filePath, degrees) {
  if (degrees === 0) return;
  execSync(`sips --rotate ${degrees} "${filePath}"`, { encoding: "utf8" });
}

function getNextId(category) {
  const config = fs.readFileSync(CONFIG_FILE, "utf8");
  const prefix = CATEGORY_PREFIX[category];
  const regex = new RegExp(`id:\\s*"${prefix}(\\d+)"`, "g");
  let max = 0;
  let match;
  while ((match = regex.exec(config)) !== null) {
    max = Math.max(max, parseInt(match[1]));
  }
  return max + 1;
}

function getNextFileNumber(category) {
  const catDir = path.join(PUBLIC_DIR, category);
  if (!fs.existsSync(catDir)) return 1;
  const files = fs.readdirSync(catDir).filter(f => /\.(jpe?g|png|webp)$/i.test(f));
  let max = 0;
  for (const f of files) {
    const num = parseInt(f.match(/^(\d+)\./)?.[1] || "0");
    if (num > max) max = num;
  }
  return max + 1;
}

function processImage({ filename, category, rotation }) {
  const alt = filename.replace(/\.[^.]+$/, "").replace(/[_-]/g, " ");
  const srcPath = path.join(IMAGES_DIR, filename);
  if (!fs.existsSync(srcPath)) throw new Error(`File not found: ${filename}`);

  const catDir = path.join(PUBLIC_DIR, category);
  if (!fs.existsSync(catDir)) fs.mkdirSync(catDir, { recursive: true });

  const fileNum = getNextFileNumber(category);
  const ext = path.extname(filename).toLowerCase();
  const destName = `${String(fileNum).padStart(2, "0")}${ext}`;
  const destPath = path.join(catDir, destName);

  fs.copyFileSync(srcPath, destPath);

  if (rotation && rotation !== 0) {
    rotateImage(destPath, rotation);
  }

  const { width, height } = getImageDimensions(destPath);
  const aspect = detectAspect(width, height);

  const idNum = getNextId(category);
  const prefix = CATEGORY_PREFIX[category];
  const photoId = `${prefix}${idNum}`;
  const cdnPath = `${category}/${destName}`;

  const config = fs.readFileSync(CONFIG_FILE, "utf8");
  const categoryRegex = new RegExp(
    `(${category}:\\s*\\{[\\s\\S]*?photos:\\s*\\[[\\s\\S]*?)(\\s*\\],)`,
  );
  const match = config.match(categoryRegex);
  if (!match) throw new Error(`Could not find category "${category}" in config`);

  const newEntry = `
      {
        id: "${photoId}",
        src: "/${cdnPath}",
        alt: "${alt.replace(/"/g, '\\"')}",
        aspect: "${aspect}",
      },`;

  const updated = config.replace(categoryRegex, `$1${newEntry}\n    ],`);
  fs.writeFileSync(CONFIG_FILE, updated, "utf8");

  invalidateHashCache();

  return { photoId, destName, aspect, category, cdnPath };
}

function skipImage(filename) {
  const srcPath = path.join(IMAGES_DIR, filename);
  if (!fs.existsSync(srcPath)) throw new Error(`File not found: ${filename}`);
  fs.unlinkSync(srcPath);
  return { skipped: true, filename };
}

function scanPhotoFolders() {
  // Known locations + dynamically discovered folders
  const candidates = [
    path.join(ROOT, "images"),
    path.join(HOME, "flat_camera"),
    path.join(HOME, "Pictures"),
    path.join(HOME, "Pictures/PhonePhotos_Videos"),
    path.join(HOME, "Downloads"),
    path.join(HOME, "Downloads/hemu"),
    path.join(HOME, "Documents/desktop/Kodai"),
    path.join(HOME, "Documents/griezmann/dhods"),
    path.join(HOME, "Documents/griezmann/ruth"),
    path.join(HOME, "Desktop"),
    path.join(HOME, "old_camera/DCIM/311CANON"),
  ];

  // Scan external volumes (e.g. SSDs, USB drives)
  const volumesDir = "/Volumes";
  if (fs.existsSync(volumesDir)) {
    try {
      for (const vol of fs.readdirSync(volumesDir)) {
        if (vol === "Macintosh HD") continue;
        const volRoot = path.join(volumesDir, vol);
        try {
          // Add volume root
          candidates.push(volRoot);
          // Add immediate children (e.g. /Volumes/SSD/Photos)
          for (const child of fs.readdirSync(volRoot)) {
            const childPath = path.join(volRoot, child);
            if (fs.statSync(childPath).isDirectory()) {
              candidates.push(childPath);
              // Add grandchildren (e.g. /Volumes/SSD/Photos/Camera photos)
              try {
                for (const gc of fs.readdirSync(childPath)) {
                  const gcPath = path.join(childPath, gc);
                  if (fs.statSync(gcPath).isDirectory()) candidates.push(gcPath);
                }
              } catch { /* skip */ }
            }
          }
        } catch { /* skip unreadable volume */ }
      }
    } catch { /* /Volumes unreadable */ }
  }
  const results = [];
  for (const dir of candidates) {
    if (!fs.existsSync(dir)) continue;
    try {
      const files = fs.readdirSync(dir).filter(f => !f.startsWith('._') && /\.(jpe?g|png|webp|heic)$/i.test(f));
      if (files.length > 0) {
        results.push({
          path: dir,
          name: dir.replace(HOME, "~"),
          count: files.length,
          active: dir === IMAGES_DIR,
        });
      }
    } catch { /* skip unreadable dirs */ }
  }
  return results;
}

function setSourceFolder(folderPath) {
  const resolved = folderPath.replace(/^~/, HOME);
  if (!fs.existsSync(resolved)) throw new Error(`Folder not found: ${folderPath}`);
  IMAGES_DIR = resolved;
  return { folder: resolved, name: folderPath, count: getImages().length };
}

// ── HTML Dashboard ───────────────────────────────────────────────────────────

function dashboardHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Silent Shutter — Image Dashboard</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #0a0a0a; color: #e0e0e0;
    min-height: 100vh;
  }
  .header {
    padding: 1.2rem 3rem; border-bottom: 1px solid #222;
    display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap;
    position: sticky; top: 0; background: #0a0a0a; z-index: 50;
  }
  .header h1 { font-size: 1.4rem; font-weight: 300; letter-spacing: 0.1em; }
  .header .count { color: #666; font-size: 0.85rem; }
  .header .stats {
    margin-left: auto; display: flex; gap: 1rem; font-size: 0.8rem; color: #555;
  }
  .header .stats span { color: #4ade80; }
  .folder-bar {
    width: 100%; display: flex; align-items: center; gap: 0.8rem;
    padding-top: 0.8rem; border-top: 1px solid #1a1a1a;
  }
  .folder-bar label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: #666; white-space: nowrap; }
  .folder-bar select {
    flex: 1; padding: 0.45rem 0.7rem;
    background: #1a1a1a; border: 1px solid #333; border-radius: 6px;
    color: #e0e0e0; font-size: 0.8rem; outline: none;
  }
  .folder-bar select:focus { border-color: #666; }
  .folder-bar .folder-count { color: #555; font-size: 0.75rem; white-space: nowrap; }
  .folder-bar input[type="text"] {
    flex: 1; padding: 0.45rem 0.7rem;
    background: #1a1a1a; border: 1px solid #333; border-radius: 6px;
    color: #e0e0e0; font-size: 0.8rem; outline: none;
    display: none;
  }
  .folder-bar .custom-btn {
    padding: 0.4rem 0.8rem; background: #1a1a1a; border: 1px solid #333;
    border-radius: 6px; color: #888; font-size: 0.75rem; cursor: pointer;
    white-space: nowrap;
  }
  .folder-bar .custom-btn:hover { border-color: #666; color: #ccc; }
  .sort-bar {
    width: 100%; display: flex; align-items: center; gap: 0.6rem;
    padding-top: 0.6rem;
  }
  .sort-bar label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: #666; white-space: nowrap; }
  .sort-bar button {
    padding: 0.3rem 0.7rem; background: #1a1a1a; border: 1px solid #333;
    border-radius: 6px; color: #888; font-size: 0.72rem; cursor: pointer;
    transition: all 0.2s; white-space: nowrap;
  }
  .sort-bar button:hover { border-color: #666; color: #ccc; }
  .sort-bar button.active { border-color: #888; color: #fff; background: #252525; }
  .empty {
    display: flex; align-items: center; justify-content: center;
    height: 60vh; color: #555; font-size: 1.1rem;
  }
  .virtual-container {
    position: relative; padding: 0 3rem;
  }
  .virtual-spacer {
    width: 100%;
  }
  .virtual-window {
    position: absolute; top: 0; left: 0; right: 0;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem; padding: 0 3rem;
  }
  .card {
    background: #141414; border-radius: 12px; overflow: hidden;
    border: 1px solid #222; transition: border-color 0.2s;
    position: relative;
  }
  .card:hover { border-color: #444; }
  .card-img-wrap {
    position: relative; background: #0a0a0a;
    display: flex; align-items: center; justify-content: center;
    height: 240px; overflow: hidden;
  }
  .card-img-wrap img {
    max-width: 100%; max-height: 240px; object-fit: contain;
    transition: transform 0.3s ease;
  }
  .card-img-wrap .placeholder {
    width: 100%; height: 100%;
    background: #111; display: flex; align-items: center; justify-content: center;
    color: #333; font-size: 0.8rem;
  }
  .card-body { padding: 1rem 1.2rem; }
  .card-filename {
    font-size: 0.75rem; color: #555; margin-bottom: 0.8rem;
    font-family: 'SF Mono', monospace;
  }
  .field { margin-bottom: 0.8rem; }
  .field label {
    display: block; font-size: 0.7rem; text-transform: uppercase;
    letter-spacing: 0.08em; color: #888; margin-bottom: 0.3rem;
  }
  .field select, .field input[type="text"] {
    width: 100%; padding: 0.5rem 0.7rem;
    background: #1a1a1a; border: 1px solid #333; border-radius: 6px;
    color: #e0e0e0; font-size: 0.85rem; outline: none;
    transition: border-color 0.2s;
  }
  .field select:focus, .field input:focus { border-color: #666; }
  .rotation-group { display: flex; gap: 0.4rem; }
  .rotation-group button {
    flex: 1; padding: 0.4rem; background: #1a1a1a; border: 1px solid #333;
    border-radius: 6px; color: #ccc; cursor: pointer; font-size: 0.75rem;
    transition: all 0.2s;
  }
  .rotation-group button:hover { background: #252525; border-color: #555; }
  .rotation-group button.active {
    background: #2a2a2a; border-color: #888; color: #fff;
  }
  .btn-row { display: flex; gap: 0.5rem; }
  .submit-btn {
    flex: 1; padding: 0.6rem;
    background: #e0e0e0; color: #0a0a0a; border: none;
    border-radius: 6px; font-size: 0.8rem; font-weight: 600;
    cursor: pointer; text-transform: uppercase; letter-spacing: 0.06em;
    transition: opacity 0.2s;
  }
  .submit-btn:hover { opacity: 0.85; }
  .submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .skip-btn {
    padding: 0.6rem 1rem;
    background: transparent; border: 1px solid #333; color: #888;
    border-radius: 6px; font-size: 0.8rem; cursor: pointer;
    transition: all 0.2s;
  }
  .skip-btn:hover { border-color: #888; color: #fff; }
  .delete-btn {
    padding: 0.6rem 1rem;
    background: transparent; border: 1px solid #333; color: #666;
    border-radius: 6px; font-size: 0.8rem; cursor: pointer;
    transition: all 0.2s;
  }
  .delete-btn:hover { border-color: #e54; color: #e54; }
  .card.done { opacity: 0.3; pointer-events: none; }
  .card.done .card-img-wrap::after {
    content: "\\2713"; position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 2.5rem; color: #4ade80; background: rgba(0,0,0,0.6);
  }
  .card.skipped { opacity: 0.3; pointer-events: none; }
  .card.skipped .card-img-wrap::after {
    content: "\\2715"; position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 2.5rem; color: #e54; background: rgba(0,0,0,0.6);
  }

  .toast {
    position: fixed; bottom: 2rem; right: 2rem;
    background: #1a1a1a; border: 1px solid #333; border-radius: 8px;
    padding: 0.8rem 1.2rem; font-size: 0.85rem; color: #4ade80;
    transform: translateY(100px); opacity: 0; transition: all 0.3s;
    z-index: 100;
  }
  .toast.show { transform: translateY(0); opacity: 1; }
  .progress-bar {
    height: 2px; background: #4ade80; transition: width 0.3s;
    position: fixed; top: 0; left: 0; z-index: 100;
  }
  .modal-overlay {
    display: none; position: fixed; inset: 0; z-index: 9999;
    background: rgba(0,0,0,0.92); cursor: zoom-out;
    align-items: center; justify-content: center;
  }
  .modal-overlay.open { display: flex; }
  .modal-overlay img {
    max-width: 95vw; max-height: 95vh; object-fit: contain;
    border-radius: 4px; cursor: default;
  }
  .modal-close {
    position: absolute; top: 1rem; right: 1.5rem;
    background: none; border: none; color: #fff; font-size: 2rem;
    cursor: pointer; opacity: 0.7; transition: opacity 0.2s;
  }
  .modal-close:hover { opacity: 1; }
</style>
</head>
<body>
<div class="progress-bar" id="progressBar" style="width:0%"></div>
<div class="header">
  <h1>SILENT SHUTTER</h1>
  <span class="count" id="count"></span>
  <div class="stats">
    <div>Added: <span id="addedCount">0</span></div>
    <div>Skipped: <span id="skippedCount">0</span></div>
  </div>
  <div class="sort-bar">
    <label>Sort by</label>
    <button class="active" onclick="sortBy('name','asc',this)">Name \u2191</button>
    <button onclick="sortBy('name','desc',this)">Name \u2193</button>
    <button onclick="sortBy('size','desc',this)">Size \u2193</button>
    <button onclick="sortBy('size','asc',this)">Size \u2191</button>
    <button onclick="sortBy('mtime','desc',this)">Newest</button>
    <button onclick="sortBy('mtime','asc',this)">Oldest</button>
  </div>
  <div class="folder-bar">
    <label>Source folder</label>
    <select id="folderSelect" onchange="onFolderChange(this.value)"></select>
    <span class="folder-count" id="folderCount"></span>
    <input type="text" id="customPath" placeholder="/path/to/folder" />
    <button class="custom-btn" id="customBtn" onclick="toggleCustomPath()">Custom path</button>
  </div>
</div>
<div id="content"></div>
<div class="toast" id="toast"></div>

<script>
const CATEGORIES = ${JSON.stringify(CATEGORIES)};
const ROW_HEIGHT = 480; // card height estimate in px
const COLS = 2;
const BUFFER = 4; // extra rows above/below viewport

let allImages = []; // [{name, size, mtime}]
let hiddenSet = new Set(); // skipped cards (client-only)
let visibleImages = []; // filtered view
let addedTotal = 0;
let skippedTotal = 0;
let customMode = false;
let currentSort = { key: 'name', dir: 'asc' };

async function init() {
  await loadFolders();
  await loadImageList();
  window.addEventListener('scroll', renderVirtual);
  window.addEventListener('resize', renderVirtual);
}

function getVisibleImages() {
  return allImages.filter(function(img) { return !hiddenSet.has(img.name); });
}

function doSort(images, key, dir) {
  return images.slice().sort(function(a, b) {
    var va = a[key], vb = b[key];
    if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
    if (va < vb) return dir === 'asc' ? -1 : 1;
    if (va > vb) return dir === 'asc' ? 1 : -1;
    return 0;
  });
}

function sortBy(key, dir, btn) {
  currentSort = { key: key, dir: dir };
  document.querySelectorAll('.sort-bar button').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  visibleImages = doSort(getVisibleImages(), key, dir);
  renderVirtual();
}

function refreshVisibleList() {
  visibleImages = doSort(getVisibleImages(), currentSort.key, currentSort.dir);
}

function renderVirtual() {
  var container = document.getElementById('virtualContainer');
  var spacer = document.getElementById('virtualSpacer');
  var win = document.getElementById('virtualWindow');
  if (!container || !win) return;

  var totalRows = Math.ceil(visibleImages.length / COLS);
  var totalHeight = totalRows * ROW_HEIGHT;
  spacer.style.height = totalHeight + 'px';

  var scrollTop = window.scrollY - container.offsetTop;
  var vpHeight = window.innerHeight;

  var firstRow = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER);
  var lastRow = Math.min(totalRows - 1, Math.ceil((scrollTop + vpHeight) / ROW_HEIGHT) + BUFFER);

  var startIdx = firstRow * COLS;
  var endIdx = Math.min((lastRow + 1) * COLS, visibleImages.length);

  win.style.top = (firstRow * ROW_HEIGHT) + 'px';

  // Build only visible cards
  var html = '';
  for (var i = startIdx; i < endIdx; i++) {
    html += createCardHTML(visibleImages[i].name);
  }
  win.innerHTML = html;

  // Bind rotation buttons
  win.querySelectorAll('.rotation-group button').forEach(function(btn) {
    btn.addEventListener('click', handleRotation);
  });

  // Lazy-load visible thumbnails
  win.querySelectorAll('img[data-src]').forEach(function(img) {
    img.src = img.dataset.src;
    img.removeAttribute('data-src');
  });

  updateHeader();
}

function createCardHTML(filename) {
  var id = filename.replace(/[^a-zA-Z0-9]/g, '_');
  var eName = encodeURIComponent(filename);
  var safeName = filename.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/'/g,'&#39;').replace(/"/g,'&quot;');
  return '<div class="card" id="card-' + id + '">' +
    '<div class="card-img-wrap" onclick="openModal(\\'' + eName + '\\')" style="cursor:zoom-in">' +
      '<img data-src="/api/thumb/' + eName + '" alt="' + safeName + '"' +
      ' loading="lazy" onload="this.parentElement.querySelector(\\'.placeholder\\')?.remove()"' +
      ' onerror="this.style.display=\\'none\\'" />' +
      '<div class="placeholder">Loading\\u2026</div>' +
    '</div>' +
    '<div class="card-body">' +
      '<div class="card-filename">' + safeName + '</div>' +
      '<div class="field">' +
        '<label>Rotation</label>' +
        '<div class="rotation-group" data-id="' + id + '">' +
          '<button data-deg="0" class="active">0\\u00b0</button>' +
          '<button data-deg="90">90\\u00b0</button>' +
          '<button data-deg="180">180\\u00b0</button>' +
          '<button data-deg="270">270\\u00b0</button>' +
        '</div>' +
      '</div>' +
      '<div class="field">' +
        '<label>Category</label>' +
        '<select id="cat-' + id + '">' +
          '<option value="">Select\\u2026</option>' +
          CATEGORIES.map(function(c) {
            return '<option value="' + c + '">' + c.charAt(0).toUpperCase() + c.slice(1) + '</option>';
          }).join('') +
        '</select>' +
      '</div>' +
      '<div class="btn-row">' +
        '<button class="submit-btn" onclick="submitImage(\\'' + id + '\\', \\'' + eName + '\\')">Add</button>' +
        '<button class="skip-btn" onclick="doSkip(\\'' + eName + '\\')">Skip</button>' +
        '<button class="delete-btn" onclick="doDelete(\\'' + id + '\\', \\'' + eName + '\\')">\\u2715</button>' +
      '</div>' +
    '</div>' +
  '</div>';
}

function handleRotation(e) {
  const btn = e.currentTarget;
  const group = btn.parentElement;
  const id = group.dataset.id;
  const deg = btn.dataset.deg;
  group.querySelectorAll('button').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  var card = document.getElementById('card-' + id);
  var img = card.querySelector('.card-img-wrap img');
  if (img) img.style.transform = 'rotate(' + deg + 'deg)';
}

async function submitImage(id, encodedFilename) {
  var filename = decodeURIComponent(encodedFilename);
  var category = document.getElementById('cat-' + id)?.value;
  var rotBtn = document.querySelector('.rotation-group[data-id="' + id + '"] button.active');
  var rotation = parseInt(rotBtn?.dataset.deg || '0');

  if (!category) { alert('Please select a category'); return; }

  var btn = document.querySelector('#card-' + id + ' .submit-btn');
  btn.disabled = true;
  btn.textContent = '\\u2026';

  try {
    var res = await fetch('/api/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: filename, category: category, rotation: rotation }),
    });
    var result = await res.json();
    if (result.error) throw new Error(result.error);

    hiddenSet.add(filename);
    addedTotal++;
    refreshVisibleList();
    renderVirtual();
    showToast(filename + ' \\u2192 ' + result.category + '/' + result.destName + ' (' + result.aspect + ')');
  } catch (err) {
    alert('Error: ' + err.message);
    btn.disabled = false;
    btn.textContent = 'Add';
  }
}

function doSkip(encodedFilename) {
  var filename = decodeURIComponent(encodedFilename);
  hiddenSet.add(filename);
  skippedTotal++;
  refreshVisibleList();
  renderVirtual();
}

async function doDelete(id, encodedFilename) {
  var filename = decodeURIComponent(encodedFilename);
  var btn = document.querySelector('#card-' + id + ' .delete-btn');
  if (btn) btn.disabled = true;

  try {
    var res = await fetch('/api/skip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: filename }),
    });
    var result = await res.json();
    if (result.error) throw new Error(result.error);

    hiddenSet.add(filename);
    skippedTotal++;
    refreshVisibleList();
    renderVirtual();
  } catch (err) {
    alert('Error: ' + err.message);
    if (btn) btn.disabled = false;
  }
}

function updateHeader() {
  var total = allImages.length;
  var remaining = visibleImages.length;
  document.getElementById('count').textContent = remaining > 0
    ? remaining + ' of ' + total + ' remaining'
    : 'All done! Run npm run deploy';
  document.getElementById('addedCount').textContent = addedTotal;
  document.getElementById('skippedCount').textContent = skippedTotal;
  var pct = total > 0 ? (((total - remaining) / total) * 100) : 0;
  document.getElementById('progressBar').style.width = pct + '%';
}

function showToast(msg) {
  var toast = document.getElementById('toast');
  toast.textContent = '\\u2713 ' + msg;
  toast.classList.add('show');
  setTimeout(function() { toast.classList.remove('show'); }, 3000);
}

function openModal(encodedFilename) {
  var overlay = document.getElementById('modalOverlay');
  var img = document.getElementById('modalImg');
  img.src = '/api/image/' + encodedFilename;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  var overlay = document.getElementById('modalOverlay');
  overlay.classList.remove('open');
  document.getElementById('modalImg').src = '';
  document.body.style.overflow = '';
}
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeModal();
});

async function loadFolders() {
  var res = await fetch('/api/folders');
  var folders = await res.json();
  var sel = document.getElementById('folderSelect');
  sel.innerHTML = folders.map(function(f) {
    var escaped = f.path.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    var label = f.name.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    return '<option value="' + escaped + '"' + (f.active ? ' selected' : '') + '>' +
           label + ' (' + f.count + ')' + '</option>';
  }).join('');
  var active = folders.find(function(f) { return f.active; });
  if (active) document.getElementById('folderCount').textContent = active.count + ' images';
}

async function onFolderChange(folderPath) {
  if (!folderPath) return;
  try {
    var res = await fetch('/api/set-folder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder: folderPath }),
    });
    var result = await res.json();
    if (result.error) { alert(result.error); return; }
    document.getElementById('folderCount').textContent = result.count + ' images';
    // Reset and reload
    allImages = []; hiddenSet = new Set(); addedTotal = 0; skippedTotal = 0;
    await loadImageList();
  } catch (err) { alert('Error: ' + err.message); }
}

function toggleCustomPath() {
  customMode = !customMode;
  var inp = document.getElementById('customPath');
  var sel = document.getElementById('folderSelect');
  var btn = document.getElementById('customBtn');
  if (customMode) {
    inp.style.display = 'block'; sel.style.display = 'none';
    btn.textContent = 'Use list'; inp.focus();
    inp.onkeydown = function(e) {
      if (e.key === 'Enter') { onFolderChange(inp.value); }
    };
  } else {
    inp.style.display = 'none'; sel.style.display = 'block';
    btn.textContent = 'Custom path';
  }
}

async function loadImageList() {
  var res = await fetch('/api/images');
  allImages = await res.json();
  hiddenSet = new Set();
  addedTotal = 0; skippedTotal = 0;
  refreshVisibleList();

  if (visibleImages.length === 0) {
    document.getElementById('content').innerHTML =
      '<div class="empty">No images in this folder. Pick a different source folder above.</div>';
    return;
  }

  document.getElementById('content').innerHTML =
    '<div class="virtual-container" id="virtualContainer">' +
      '<div class="virtual-spacer" id="virtualSpacer"></div>' +
      '<div class="virtual-window" id="virtualWindow"></div>' +
    '</div>';

  renderVirtual();
}

init();
</script>
<div class="modal-overlay" id="modalOverlay" onclick="closeModal()">
  <button class="modal-close">&times;</button>
  <img id="modalImg" onclick="event.stopPropagation()" />
</div>
</body>
</html>`;
}

// ── Server ───────────────────────────────────────────────────────────────────

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // Dashboard
  if (url.pathname === "/" || url.pathname === "/index.html") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(dashboardHTML());
    return;
  }

  // List all image filenames (lightweight — just names)
  if (url.pathname === "/api/images") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(getImages()));
    return;
  }

  // List discovered photo folders
  if (url.pathname === "/api/folders") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(scanPhotoFolders()));
    return;
  }

  // Switch source folder
  if (url.pathname === "/api/set-folder" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        const result = setSourceFolder(data.path || data.folder);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Serve a thumbnail (~20-50KB instead of 8-10MB)
  if (url.pathname.startsWith("/api/thumb/")) {
    const filename = decodeURIComponent(url.pathname.slice("/api/thumb/".length));
    const filePath = path.join(IMAGES_DIR, filename);
    if (!fs.existsSync(filePath)) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const thumbPath = getOrCreateThumbnail(filename);
    res.writeHead(200, {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=3600",
    });
    fs.createReadStream(thumbPath).pipe(res);
    return;
  }

  // Serve full-res image (if needed)
  if (url.pathname.startsWith("/api/image/")) {
    const filename = decodeURIComponent(url.pathname.slice("/api/image/".length));
    const filePath = path.join(IMAGES_DIR, filename);
    if (!fs.existsSync(filePath)) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const ext = path.extname(filename).toLowerCase();
    const mime = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" }[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": mime, "Cache-Control": "no-cache" });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  // Process image — add to portfolio
  if (url.pathname === "/api/process" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        const result = processImage(data);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Skip image — delete from images/
  if (url.pathname === "/api/skip" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        const result = skipImage(data.filename);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, () => {
  const count = getImages().length;
  console.log(`\n  ┌──────────────────────────────────────────────┐`);
  console.log(`  │  Silent Shutter — Image Dashboard             │`);
  console.log(`  │  http://localhost:${PORT}                       │`);
  console.log(`  │                                                │`);
  console.log(`  │  ${String(count).padEnd(5)} image(s) found                     │`);
  console.log(`  │  Thumbnails: ${THUMB_MAX_PX}px (cached in /tmp)          │`);
  console.log(`  │  Page size:  ${PAGE_SIZE} images at a time              │`);
  console.log(`  │  Press Ctrl+C to stop                          │`);
  console.log(`  └──────────────────────────────────────────────┘\n`);
});

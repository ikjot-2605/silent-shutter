#!/usr/bin/env node
/**
 * Image Dashboard — local tool to import photos into Silent Shutter.
 *
 * Usage:  node tools/image-dashboard.mjs
 * Opens:  http://localhost:4321
 *
 * Workflow per image:
 *   1. Preview the photo (with live rotation)
 *   2. Pick a category (landscapes / nature / street / architecture / travel)
 *   3. Optionally rotate (0° / 90° / 180° / 270°)
 *   4. Add an alt description
 *   5. Submit → image is processed, copied to public/<category>/, config updated
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const IMAGES_DIR = path.join(ROOT, "images");
const PUBLIC_DIR = path.join(ROOT, "public");
const CONFIG_FILE = path.join(ROOT, "src/config/categoryImages.ts");

const CATEGORIES = ["landscapes", "nature", "street", "architecture", "travel"];
const CATEGORY_PREFIX = { landscapes: "l", nature: "n", street: "s", architecture: "a", travel: "t" };

const PORT = 4321;

// ── Helpers ──────────────────────────────────────────────────────────────────

function getImages() {
  if (!fs.existsSync(IMAGES_DIR)) return [];
  return fs.readdirSync(IMAGES_DIR)
    .filter(f => /\.(jpe?g|png|webp)$/i.test(f))
    .map(f => f);
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

function processImage({ filename, category, rotation, alt }) {
  const srcPath = path.join(IMAGES_DIR, filename);
  if (!fs.existsSync(srcPath)) throw new Error(`File not found: ${filename}`);

  // Ensure category directory exists
  const catDir = path.join(PUBLIC_DIR, category);
  if (!fs.existsSync(catDir)) fs.mkdirSync(catDir, { recursive: true });

  // Determine destination filename
  const fileNum = getNextFileNumber(category);
  const ext = path.extname(filename).toLowerCase();
  const destName = `${String(fileNum).padStart(2, "0")}${ext}`;
  const destPath = path.join(catDir, destName);

  // Copy file first
  fs.copyFileSync(srcPath, destPath);

  // Rotate if needed (operates on the copy)
  if (rotation && rotation !== 0) {
    rotateImage(destPath, rotation);
  }

  // Detect orientation from final dimensions
  const { width, height } = getImageDimensions(destPath);
  const aspect = detectAspect(width, height);

  // Generate IDs
  const idNum = getNextId(category);
  const prefix = CATEGORY_PREFIX[category];
  const photoId = `${prefix}${idNum}`;
  const cdnPath = `${category}/${destName}`;

  // Update categoryImages.ts — insert new photo entry into the category's photos array
  const config = fs.readFileSync(CONFIG_FILE, "utf8");

  // Find the closing of the photos array for this category
  // We look for the last photo entry's closing brace + comma before the array close
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

  const updated = config.replace(
    categoryRegex,
    `$1${newEntry}\n    ],`
  );

  fs.writeFileSync(CONFIG_FILE, updated, "utf8");

  // Remove original from images/
  fs.unlinkSync(srcPath);

  return { photoId, destName, aspect, category, cdnPath };
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
    padding: 2rem 3rem; border-bottom: 1px solid #222;
    display: flex; align-items: center; gap: 1rem;
  }
  .header h1 { font-size: 1.5rem; font-weight: 300; letter-spacing: 0.1em; }
  .header .count { color: #666; font-size: 0.9rem; }
  .empty {
    display: flex; align-items: center; justify-content: center;
    height: 60vh; color: #555; font-size: 1.1rem;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 2rem; padding: 2rem 3rem;
  }
  .card {
    background: #141414; border-radius: 12px; overflow: hidden;
    border: 1px solid #222; transition: border-color 0.2s;
  }
  .card:hover { border-color: #444; }
  .card-img-wrap {
    position: relative; background: #0a0a0a;
    display: flex; align-items: center; justify-content: center;
    min-height: 220px; max-height: 320px; overflow: hidden;
  }
  .card-img-wrap img {
    max-width: 100%; max-height: 320px; object-fit: contain;
    transition: transform 0.3s ease;
  }
  .card-body { padding: 1.2rem 1.5rem; }
  .card-filename {
    font-size: 0.8rem; color: #666; margin-bottom: 1rem;
    font-family: 'SF Mono', monospace;
  }
  .field { margin-bottom: 1rem; }
  .field label {
    display: block; font-size: 0.75rem; text-transform: uppercase;
    letter-spacing: 0.08em; color: #888; margin-bottom: 0.4rem;
  }
  .field select, .field input[type="text"] {
    width: 100%; padding: 0.6rem 0.8rem;
    background: #1a1a1a; border: 1px solid #333; border-radius: 6px;
    color: #e0e0e0; font-size: 0.9rem; outline: none;
    transition: border-color 0.2s;
  }
  .field select:focus, .field input:focus { border-color: #666; }
  .rotation-group {
    display: flex; gap: 0.5rem;
  }
  .rotation-group button {
    flex: 1; padding: 0.5rem; background: #1a1a1a; border: 1px solid #333;
    border-radius: 6px; color: #ccc; cursor: pointer; font-size: 0.8rem;
    transition: all 0.2s;
  }
  .rotation-group button:hover { background: #252525; border-color: #555; }
  .rotation-group button.active {
    background: #2a2a2a; border-color: #888; color: #fff;
  }
  .submit-btn {
    width: 100%; padding: 0.7rem;
    background: #e0e0e0; color: #0a0a0a; border: none;
    border-radius: 6px; font-size: 0.85rem; font-weight: 600;
    cursor: pointer; text-transform: uppercase; letter-spacing: 0.08em;
    transition: opacity 0.2s;
  }
  .submit-btn:hover { opacity: 0.85; }
  .submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .card.done { opacity: 0.4; pointer-events: none; }
  .card.done::after {
    content: "✓ Added"; position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    font-size: 1.2rem; color: #4ade80; font-weight: 600;
  }
  .card { position: relative; }
  .toast {
    position: fixed; bottom: 2rem; right: 2rem;
    background: #1a1a1a; border: 1px solid #333; border-radius: 8px;
    padding: 1rem 1.5rem; font-size: 0.9rem; color: #4ade80;
    transform: translateY(100px); opacity: 0; transition: all 0.3s;
    z-index: 100;
  }
  .toast.show { transform: translateY(0); opacity: 1; }
</style>
</head>
<body>
<div class="header">
  <h1>SILENT SHUTTER</h1>
  <span class="count" id="count"></span>
</div>
<div id="content"></div>
<div class="toast" id="toast"></div>

<script>
const CATEGORIES = ${JSON.stringify(CATEGORIES)};

async function loadImages() {
  const res = await fetch('/api/images');
  const images = await res.json();
  const countEl = document.getElementById('count');
  const content = document.getElementById('content');

  if (images.length === 0) {
    content.innerHTML = '<div class="empty">No images in /images — drop some photos in and refresh.</div>';
    countEl.textContent = '';
    return;
  }

  countEl.textContent = images.length + ' image' + (images.length === 1 ? '' : 's') + ' to process';

  content.innerHTML = '<div class="grid">' + images.map(img => cardHTML(img)).join('') + '</div>';
  document.querySelectorAll('.rotation-group button').forEach(btn => {
    btn.addEventListener('click', handleRotation);
  });
}

function cardHTML(filename) {
  const id = filename.replace(/[^a-zA-Z0-9]/g, '_');
  return \`
    <div class="card" id="card-\${id}">
      <div class="card-img-wrap">
        <img src="/api/image/\${encodeURIComponent(filename)}" id="img-\${id}" />
      </div>
      <div class="card-body">
        <div class="card-filename">\${filename}</div>
        <div class="field">
          <label>Rotation</label>
          <div class="rotation-group" data-id="\${id}">
            <button data-deg="0" class="active">0°</button>
            <button data-deg="90">90°</button>
            <button data-deg="180">180°</button>
            <button data-deg="270">270°</button>
          </div>
        </div>
        <div class="field">
          <label>Category</label>
          <select id="cat-\${id}">
            <option value="">Select category…</option>
            \${CATEGORIES.map(c => '<option value="' + c + '">' + c.charAt(0).toUpperCase() + c.slice(1) + '</option>').join('')}
          </select>
        </div>
        <div class="field">
          <label>Alt Description</label>
          <input type="text" id="alt-\${id}" placeholder="Describe the image…" />
        </div>
        <button class="submit-btn" onclick="submitImage('\${id}', '\${filename}')">
          Add to Portfolio
        </button>
      </div>
    </div>
  \`;
}

function handleRotation(e) {
  const btn = e.currentTarget;
  const group = btn.parentElement;
  const id = group.dataset.id;
  const deg = btn.dataset.deg;

  group.querySelectorAll('button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const img = document.getElementById('img-' + id);
  img.style.transform = 'rotate(' + deg + 'deg)';
}

async function submitImage(id, filename) {
  const category = document.getElementById('cat-' + id).value;
  const alt = document.getElementById('alt-' + id).value;
  const rotBtn = document.querySelector('.rotation-group[data-id="' + id + '"] button.active');
  const rotation = parseInt(rotBtn?.dataset.deg || '0');

  if (!category) { alert('Please select a category'); return; }
  if (!alt.trim()) { alert('Please add an alt description'); return; }

  const btn = document.querySelector('#card-' + id + ' .submit-btn');
  btn.disabled = true;
  btn.textContent = 'Processing…';

  try {
    const res = await fetch('/api/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, category, rotation, alt: alt.trim() }),
    });
    const result = await res.json();

    if (result.error) {
      alert('Error: ' + result.error);
      btn.disabled = false;
      btn.textContent = 'Add to Portfolio';
      return;
    }

    const card = document.getElementById('card-' + id);
    card.classList.add('done');
    showToast(filename + ' → ' + result.category + '/' + result.destName + ' (' + result.aspect + ')');

    // Update count
    const remaining = document.querySelectorAll('.card:not(.done)').length;
    document.getElementById('count').textContent = remaining
      ? remaining + ' image' + (remaining === 1 ? '' : 's') + ' remaining'
      : 'All done! Close this tab and run npm run deploy';
  } catch (err) {
    alert('Error: ' + err.message);
    btn.disabled = false;
    btn.textContent = 'Add to Portfolio';
  }
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = '✓ ' + msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

loadImages();
</script>
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

  // List images
  if (url.pathname === "/api/images") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(getImages()));
    return;
  }

  // Serve an image
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

  // Process an image
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

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`\n  ┌─────────────────────────────────────────┐`);
  console.log(`  │  Silent Shutter — Image Dashboard       │`);
  console.log(`  │  http://localhost:${PORT}                  │`);
  console.log(`  │                                         │`);
  console.log(`  │  ${getImages().length} image(s) ready to process           │`);
  console.log(`  │  Press Ctrl+C to stop                   │`);
  console.log(`  └─────────────────────────────────────────┘\n`);
});

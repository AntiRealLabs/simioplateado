import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { minify as minifyJs } from 'terser';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mockupsDir = path.join(rootDir, 'mockups');
const htmlPath = path.join(mockupsDir, 'index.html');
const optimizedDir = path.join(mockupsDir, 'assets', 'optimized');
const inlineDir = path.join(optimizedDir, 'inline');

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif']);
const VERSION = 'perf20260616';
const QUALITY = 78;
const MAX_WIDTH = 1200;

const manifest = new Map();

function hashBuffer(buffer) {
  return crypto.createHash('sha1').update(buffer).digest('hex').slice(0, 10);
}

function webPathFromAbsolute(absPath) {
  return path.relative(mockupsDir, absPath).split(path.sep).join('/');
}

function stripQuery(value = '') {
  return String(value).split('?')[0];
}

function normalizeLocalPath(value = '') {
  const withoutDomain = String(value)
    .replace(/^https?:\/\/(?:www\.)?simioplateado\.com\//, '')
    .replace(/^\/+/, '')
    .replace(/^\.\//, '')
    .replace(/^\.\.\//, '');
  return stripQuery(withoutDomain);
}

function isLocalImageRef(value = '') {
  const normalized = normalizeLocalPath(value);
  if (!normalized.startsWith('assets/')) return false;
  const ext = path.extname(normalized).toLowerCase();
  if (!IMAGE_EXTENSIONS.has(ext)) return false;
  if (normalized.startsWith('assets/favicon') || normalized.includes('apple-touch-icon')) return false;
  return true;
}

function htmlAttr(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}=(["'])(.*?)\\1`, 'i'));
  return match ? match[2] : '';
}

function setHtmlAttr(tag, name, value) {
  const escaped = String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;');
  const pattern = new RegExp(`(\\s${name}=)(["'])(.*?)\\2`, 'i');
  if (pattern.test(tag)) return tag.replace(pattern, `$1"${escaped}"`);
  return tag.replace(/>$/, ` ${name}="${escaped}">`);
}

function removeHtmlAttr(tag, name) {
  return tag.replace(new RegExp(`\\s${name}=(["']).*?\\1`, 'ig'), '');
}

async function ensureDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function optimizeBuffer(buffer, sourceName, outSubdir = '') {
  const hash = hashBuffer(buffer);
  const safeBase = path
    .basename(sourceName, path.extname(sourceName))
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'image';

  const outputPath = path.join(optimizedDir, outSubdir, `${safeBase}.${hash}.webp`);
  const outputWebPath = webPathFromAbsolute(outputPath);
  const existing = manifest.get(hash);
  if (existing) return existing;

  await ensureDir(outputPath);
  const image = sharp(buffer, { animated: false }).rotate();
  const metadata = await image.metadata();
  const width = metadata.width || 0;
  const height = metadata.height || 0;
  const resizeWidth = width > MAX_WIDTH ? MAX_WIDTH : undefined;

  const pipeline = sharp(buffer, { animated: false }).rotate();
  if (resizeWidth) pipeline.resize({ width: resizeWidth, withoutEnlargement: true });
  await pipeline
    .webp({ quality: QUALITY, effort: 5, smartSubsample: true })
    .toFile(outputPath);

  const optimizedMeta = await sharp(outputPath).metadata();
  const record = {
    hash,
    src: outputWebPath,
    file: outputPath,
    width: optimizedMeta.width || width,
    height: optimizedMeta.height || height
  };
  manifest.set(hash, record);
  return record;
}

async function optimizeFile(webPath) {
  const normalized = normalizeLocalPath(webPath);
  const sourcePath = path.join(mockupsDir, normalized);
  const buffer = await fs.readFile(sourcePath);
  const ext = path.extname(normalized);
  const sourceName = path.basename(normalized, ext);
  const relDir = path.dirname(normalized.replace(/^assets\//, ''));
  return optimizeBuffer(buffer, sourceName, relDir);
}

async function externalizeInlineImages(html) {
  const replacements = new Map();
  const matches = [...html.matchAll(/data:image\/([a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)/g)];

  for (const match of matches) {
    const [full, format, payload] = match;
    if (replacements.has(full)) continue;
    const buffer = Buffer.from(payload, 'base64');
    const record = await optimizeBuffer(buffer, `inline-${format}`, 'inline');
    replacements.set(full, record.src);
  }

  let next = html;
  for (const [from, to] of replacements) {
    next = next.split(from).join(to);
  }
  return next;
}

async function replaceLocalImagePaths(html) {
  const refs = new Set();
  const pattern = /(?:https?:\/\/(?:www\.)?simioplateado\.com\/)?assets\/[^"'()\s<>]+?\.(?:png|jpg|jpeg|webp|avif)(?:\?v=[^"'()\s<>]+)?/gi;

  for (const match of html.matchAll(pattern)) {
    const ref = match[0];
    if (isLocalImageRef(ref) && !normalizeLocalPath(ref).startsWith('assets/optimized/')) refs.add(ref);
  }

  const replacement = new Map();
  for (const ref of refs) {
    try {
      const optimized = await optimizeFile(ref);
      const isAbsolute = /^https?:\/\//.test(ref);
      replacement.set(ref, isAbsolute ? `https://simioplateado.com/${optimized.src}` : optimized.src);
    } catch (error) {
      console.warn(`[perf] No pude optimizar ${ref}: ${error.message}`);
    }
  }

  let next = html;
  const ordered = [...replacement.entries()].sort((a, b) => b[0].length - a[0].length);
  for (const [from, to] of ordered) {
    next = next.split(from).join(to);
  }
  return next;
}

function addImageRuntimeHints(html) {
  return html.replace(/<img\b[^>]*>/gi, (tag, offset) => {
    const src = htmlAttr(tag, 'src');
    const normalized = normalizeLocalPath(src);
    const record = [...manifest.values()].find(item => item.src === normalized);
    const isCritical =
      /logo-mini/i.test(tag) ||
      /\bclass=(["']).*?\blogo\b.*?\1/i.test(tag) ||
      /vista-switch-hand/i.test(tag);
    const isPixel = /facebook\.com\/tr/i.test(src);
    let next = tag;

    if (isPixel) return next;

    if (record?.width && record?.height) {
      next = setHtmlAttr(next, 'width', record.width);
      next = setHtmlAttr(next, 'height', record.height);
    }

    next = setHtmlAttr(next, 'decoding', 'async');

    if (isCritical) {
      next = setHtmlAttr(next, 'loading', 'eager');
      next = setHtmlAttr(next, 'fetchpriority', 'high');
    } else {
      next = setHtmlAttr(next, 'loading', 'lazy');
      next = removeHtmlAttr(next, 'fetchpriority');
    }

    return next;
  });
}

function addHeadResourceHints(html) {
  const hints = [
    '<link rel="preconnect" href="https://connect.facebook.net" crossorigin>',
    '<link rel="preconnect" href="https://api.simioplateado.com" crossorigin>',
    '<link rel="dns-prefetch" href="https://unpkg.com">'
  ];
  const missing = hints.filter(hint => !html.includes(hint));
  if (!missing.length) return html;
  return html.replace('<base href="/">', `<base href="/">\n${missing.join('\n')}`);
}

function deferModelViewer(html) {
  const loader = `<script>
  window.loadModelViewerOnce = window.loadModelViewerOnce || function () {
    if (window.__modelViewerLoading) return window.__modelViewerLoading;
    window.__modelViewerLoading = new Promise((resolve, reject) => {
      if (customElements.get('model-viewer')) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://unpkg.com/@google/model-viewer@4.2.0/dist/model-viewer.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return window.__modelViewerLoading;
  };
</script>`;

  let next = html.replace(
    /<script\s+type="module"\s+src="https:\/\/unpkg\.com\/@google\/model-viewer@4\.2\.0\/dist\/model-viewer\.min\.js"><\/script>/,
    loader
  );

  next = next.replace(
    /function cargarModelos3D\(modal\) \{\n\s+modal\.querySelectorAll\('model-viewer\[data-model-src\]'\)\.forEach\(viewer => \{/,
    `function cargarModelos3D(modal) {\n    if (modal?.querySelector('model-viewer[data-model-src]')) window.loadModelViewerOnce?.();\n    modal.querySelectorAll('model-viewer[data-model-src]').forEach(viewer => {`
  );

  next = next.replace(
    /(function setFrameModel\(frame, modelUrl, posterUrl = ''\) \{[\s\S]+?frame\.innerHTML = `\n\s+<model-viewer[\s\S]+?<p class="encargos-model-note">Modelo preliminar generado con Tripo3D · revision final por Simio Plateado\.<\/p>\n\s+`;\n)(?:\s*window\.loadModelViewerOnce\?\.\(\);\n)*\s*\}/,
    `$1    window.loadModelViewerOnce?.();\n  }`
  );

  next = next.replace(
    /(\n  \}\n)\s*window\.loadModelViewerOnce\?\.\(\);\n(\n  function opcionesEncargoDesdeFormulario)/,
    '$1$2'
  );

  return next;
}

async function externalizeApplicationScript(html) {
  const match = html.match(/<script>\n\s*const GALERIA_STATUS_ORDER = [\s\S]+?<\/script>\s*(?=<\/body>)/);
  if (!match) return html;

  const scriptBlock = match[0];
  const source = scriptBlock
    .replace(/^<script>\n?/, '')
    .replace(/<\/script>\s*$/, '');

  let code = source;
  try {
    const minified = await minifyJs(source, {
      compress: {
        passes: 1,
        drop_console: false
      },
      mangle: false,
      format: {
        comments: false
      }
    });
    code = minified.code || source;
  } catch (error) {
    console.warn(`[perf] No pude minificar JS principal, se externaliza sin minificar: ${error.message}`);
  }

  const hash = hashBuffer(Buffer.from(code));
  const outPath = path.join(optimizedDir, `app.${hash}.js`);
  await fs.writeFile(outPath, code);
  return html.replace(scriptBlock, `<script src="${webPathFromAbsolute(outPath)}" defer></script>\n`);
}

async function writePerformanceSupportFiles() {
  await fs.writeFile(
    path.join(mockupsDir, 'robots.txt'),
    [
      'User-agent: *',
      'Allow: /',
      '',
      'Sitemap: https://simioplateado.com/sitemap.xml',
      ''
    ].join('\n')
  );

  await fs.writeFile(
    path.join(mockupsDir, 'sitemap.xml'),
    [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      '  <url>',
      '    <loc>https://simioplateado.com/</loc>',
      '  </url>',
      '  <url>',
      '    <loc>https://simioplateado.com/galeria</loc>',
      '  </url>',
      '  <url>',
      '    <loc>https://simioplateado.com/tienda</loc>',
      '  </url>',
      '  <url>',
      '    <loc>https://simioplateado.com/encargos</loc>',
      '  </url>',
      '  <url>',
      '    <loc>https://simioplateado.com/encargos/crear</loc>',
      '  </url>',
      '  <url>',
      '    <loc>https://simioplateado.com/gracias</loc>',
      '  </url>',
      '  <url>',
      '    <loc>https://simioplateado.com/legal/privacidad</loc>',
      '  </url>',
      '  <url>',
      '    <loc>https://simioplateado.com/legal/terminos</loc>',
      '  </url>',
      '  <url>',
      '    <loc>https://simioplateado.com/legal/uso-imagen</loc>',
      '  </url>',
      '</urlset>',
      ''
    ].join('\n')
  );

  await fs.writeFile(
    path.join(mockupsDir, '_headers'),
    [
      '/assets/optimized/*',
      '  Cache-Control: public, max-age=31536000, immutable',
      '',
      '/assets/models/*',
      '  Cache-Control: public, max-age=31536000, immutable',
      '',
      '/assets/*',
      '  Cache-Control: public, max-age=31536000, immutable',
      '',
      '/legal-content/*',
      '  Cache-Control: public, max-age=86400',
      '',
      '/robots.txt',
      '  Content-Type: text/plain; charset=utf-8',
      '  Cache-Control: public, max-age=86400',
      '',
      '/sitemap.xml',
      '  Content-Type: application/xml; charset=utf-8',
      '  Cache-Control: public, max-age=86400',
      '',
      '/*',
      '  Cache-Control: public, max-age=300, stale-while-revalidate=86400',
      ''
    ].join('\n')
  );
}

async function listOptimizedAssets(dir = optimizedDir) {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  const files = [];
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listOptimizedAssets(abs));
    } else if (entry.isFile() && entry.name.endsWith('.webp')) {
      files.push(abs);
    }
  }
  return files;
}

async function main() {
  await fs.mkdir(inlineDir, { recursive: true });
  let html = await fs.readFile(htmlPath, 'utf8');

  html = await externalizeInlineImages(html);
  html = await replaceLocalImagePaths(html);
  html = addImageRuntimeHints(html);
  html = addHeadResourceHints(html);
  html = deferModelViewer(html);
  html = await externalizeApplicationScript(html);

  await fs.writeFile(htmlPath, html);
  await writePerformanceSupportFiles();

  const existingOptimizedAssets = await listOptimizedAssets();
  const report = {
    version: VERSION,
    optimizedImagesThisRun: manifest.size,
    optimizedImagesTotal: existingOptimizedAssets.length,
    htmlBytes: Buffer.byteLength(html),
    assets: [...manifest.values()].map(item => ({
      src: item.src,
      width: item.width,
      height: item.height
    }))
  };
  await fs.writeFile(path.join(optimizedDir, 'manifest.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({
    optimizedImagesThisRun: manifest.size,
    optimizedImagesTotal: report.optimizedImagesTotal,
    htmlBytes: report.htmlBytes
  }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

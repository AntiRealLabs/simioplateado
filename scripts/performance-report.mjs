import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const htmlPath = path.join(rootDir, 'mockups', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const externalScripts = [...html.matchAll(/<script\s+src=(["'])(.*?)\1[^>]*>/gi)]
  .map(match => match[2])
  .filter(src => src.startsWith('assets/'));
const externalScriptBytes = externalScripts.reduce((total, src) => {
  const file = path.join(rootDir, 'mockups', src.split('?')[0]);
  return total + (fs.existsSync(file) ? fs.statSync(file).size : 0);
}, 0);
const imgTags = [...html.matchAll(/<img\b[^>]*>/gi)].map(match => match[0]);
const dataImages = [...html.matchAll(/data:image\//g)].length;
const localImages = [...html.matchAll(/assets\/[^"'()\s<>]+?\.(?:png|jpg|jpeg|webp|avif)(?:\?v=[^"'()\s<>]+)?/gi)].length;
const optimizedImages = [...html.matchAll(/assets\/optimized\//g)].length;
const modelViewerScriptEager = html.includes('@google/model-viewer@4.2.0/dist/model-viewer.min.js"></script>');

const report = {
  htmlBytes: Buffer.byteLength(html),
  externalScripts: externalScripts.length,
  externalScriptBytes,
  initialSourceBytes: Buffer.byteLength(html) + externalScriptBytes,
  imgTags: imgTags.length,
  dataImages,
  localImages,
  optimizedImages,
  lazyImages: imgTags.filter(tag => /\sloading=["']lazy["']/i.test(tag)).length,
  eagerImages: imgTags.filter(tag => /\sloading=["']eager["']/i.test(tag)).length,
  imagesWithDecoding: imgTags.filter(tag => /\sdecoding=/i.test(tag)).length,
  imagesWithDimensions: imgTags.filter(tag => /\swidth=/i.test(tag) && /\sheight=/i.test(tag)).length,
  modelViewerTags: [...html.matchAll(/<model-viewer\b/gi)].length,
  modelViewerScriptEager
};

console.log(JSON.stringify(report, null, 2));

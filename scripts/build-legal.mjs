import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const docs = [
  { src: 'doctrina/legal-privacidad.md', out: 'mockups/legal-content/privacidad.html' },
  { src: 'doctrina/legal-terminos.md', out: 'mockups/legal-content/terminos.html' },
  { src: 'doctrina/consentimiento-uso-imagen.md', out: 'mockups/legal-content/uso-imagen.html' }
];

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function inlineMarkdown(value = '') {
  const codeSpans = [];
  let html = escapeHtml(value).replace(/`([^`]+)`/g, (_, code) => {
    const token = `@@CODE_${codeSpans.length}@@`;
    codeSpans.push(`<code>${code}</code>`);
    return token;
  });

  html = html
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');

  codeSpans.forEach((span, index) => {
    html = html.replace(`@@CODE_${index}@@`, span);
  });

  return html;
}

function parseTable(lines, start) {
  const rows = [];
  let index = start;
  while (index < lines.length && /^\s*\|.+\|\s*$/.test(lines[index])) {
    rows.push(lines[index]);
    index += 1;
  }

  if (rows.length < 2 || !/^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(rows[1])) {
    return null;
  }

  const parseCells = (row) =>
    row
      .trim()
      .replace(/^\||\|$/g, '')
      .split('|')
      .map((cell) => inlineMarkdown(cell.trim()));

  const head = parseCells(rows[0]);
  const body = rows.slice(2).map(parseCells);
  const html = [
    '<table>',
    '<thead><tr>',
    ...head.map((cell) => `<th>${cell}</th>`),
    '</tr></thead>',
    '<tbody>',
    ...body.map((cells) => `<tr>${cells.map((cell) => `<td>${cell}</td>`).join('')}</tr>`),
    '</tbody>',
    '</table>'
  ].join('');

  return { html, next: index };
}

function listBlock(lines, start, ordered = false) {
  const items = [];
  let index = start;
  const pattern = ordered ? /^\s*\d+\.\s+(.+)$/ : /^\s*[-*]\s+(.+)$/;
  while (index < lines.length) {
    const match = lines[index].match(pattern);
    if (!match) break;
    items.push(`<li>${inlineMarkdown(match[1])}</li>`);
    index += 1;
  }
  const tag = ordered ? 'ol' : 'ul';
  return { html: `<${tag}>${items.join('')}</${tag}>`, next: index };
}

function blockquote(lines, start) {
  const parts = [];
  let index = start;
  while (index < lines.length && /^\s*>\s?/.test(lines[index])) {
    parts.push(lines[index].replace(/^\s*>\s?/, ''));
    index += 1;
  }
  return { html: `<blockquote>${inlineMarkdown(parts.join(' '))}</blockquote>`, next: index };
}

function paragraph(lines, start) {
  const parts = [];
  let index = start;
  while (
    index < lines.length &&
    lines[index].trim() &&
    !/^#{1,6}\s+/.test(lines[index]) &&
    !/^\s*[-*]\s+/.test(lines[index]) &&
    !/^\s*\d+\.\s+/.test(lines[index]) &&
    !/^\s*>\s?/.test(lines[index]) &&
    !/^\s*\|.+\|\s*$/.test(lines[index])
  ) {
    parts.push(lines[index].trim());
    index += 1;
  }
  return { html: `<p>${inlineMarkdown(parts.join(' '))}</p>`, next: index };
}

function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();
    if (!trimmed || /^-{3,}$/.test(trimmed)) {
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      blocks.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      index += 1;
      continue;
    }

    const table = parseTable(lines, index);
    if (table) {
      blocks.push(table.html);
      index = table.next;
      continue;
    }

    if (/^\s*>\s?/.test(line)) {
      const block = blockquote(lines, index);
      blocks.push(block.html);
      index = block.next;
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const block = listBlock(lines, index, false);
      blocks.push(block.html);
      index = block.next;
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const block = listBlock(lines, index, true);
      blocks.push(block.html);
      index = block.next;
      continue;
    }

    const block = paragraph(lines, index);
    blocks.push(block.html);
    index = block.next;
  }

  return blocks.join('\n');
}

await fs.mkdir(path.join(rootDir, 'mockups/legal-content'), { recursive: true });

for (const doc of docs) {
  const markdown = await fs.readFile(path.join(rootDir, doc.src), 'utf8');
  const html = markdownToHtml(markdown);
  await fs.writeFile(path.join(rootDir, doc.out), `${html}\n`, 'utf8');
  console.log(`built ${doc.out}`);
}

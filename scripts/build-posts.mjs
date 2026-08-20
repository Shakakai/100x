#!/usr/bin/env node
// Build step for the globe site.
//
// Scans posts/*.md, parses frontmatter + markdown, then:
//   1. writes posts/data/<slug>.json  (full content, fetched on click)
//   2. injects a `const POSTS = [...]` index into index.html between the
//      __POSTS_DATA_START__ / __POSTS_DATA_END__ markers (fast first paint)
//
// Frontmatter schema (per post):
//   title     (required)  display title
//   date      (required)  free-form display string, e.g. "Mar 2025 — Present"
//   location  (required)  display string, e.g. "Pittsburgh, PA"
//   lat, lon  (required)  globe coordinates
//   category  (required)  "professional" or "personal" — drives the tab,
//                         accent color, and pin mapping
//   photos    (optional)  YAML list (or single value, or legacy `photo:` key);
//                         0 photos -> no image block, 1 -> static image,
//                         2+ -> auto-advancing slideshow in the detail panel
//                         and terminal page
//   pin       (optional)  must match a CITIES/VISITED pin name in index.html
//                         for pin-click + post-flight callout; defaults to
//                         location uppercased
//   org, url  (optional)  organization name + link (professional posts)
//   photo     (optional)  image URL/path shown in the list card + detail panel
//   tag       (optional)  small extra label, e.g. EDUCATION
//   excerpt   (optional)  list-card blurb; defaults to first body paragraph
//
// Usage: node scripts/build-posts.mjs [--watch]
//
// Optional keys: pin (globe pin name, defaults to location uppercased),
// org, url, photo/photos, tag, excerpt (defaults to first body paragraph).

import { readFileSync, writeFileSync, mkdirSync, readdirSync, watch } from 'node:fs';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const postsDir = join(root, 'posts');
const dataDir = join(postsDir, 'data');
const indexPath = join(root, 'index.html');
const START = '// __POSTS_DATA_START__';
const END = '// __POSTS_DATA_END__';
const CATEGORIES = ['professional', 'personal']; // valid values for the frontmatter key

// ---------- frontmatter (simple key: value subset, with "- " lists) ----------
function parseFrontmatter(file, src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error(file + ': missing frontmatter block');
  const meta = {};
  let listKey = null;
  for (const raw of m[1].split('\n')) {
    const line = raw.replace(/\s+$/, '');
    if (!line.trim()) continue;
    const item = line.match(/^\s*-\s+(.*)$/);
    if (item && listKey && Array.isArray(meta[listKey])) {
      meta[listKey].push(unquote(item[1].trim()));
      continue;
    }
    listKey = null;
    const i = line.indexOf(':');
    if (i < 1) continue;
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if (v === '') { meta[k] = []; listKey = k; continue; } // list follows on "- " lines
    meta[k] = unquote(v);
  }
  return { meta, body: m[2].trim() };
}
function unquote(v) {
  return (v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")) ? v.slice(1, -1) : v;
}
function photosOf(meta) {
  const p = meta.photos || meta.photo;
  if (!p) return [];
  return Array.isArray(p) ? p : [p];
}

function req(file, meta, key) {
  if (!meta[key]) throw new Error(file + ': missing required frontmatter key "' + key + '"');
  return meta[key];
}
function num(file, meta, key) {
  const n = parseFloat(req(file, meta, key));
  if (!Number.isFinite(n)) throw new Error(file + ': "' + key + '" is not a number');
  return n;
}
function firstText(body) {
  const p = body.split(/\n{2,}/).find(b => !/^(#|>|-)/.test(b.trim()));
  return p ? p.replace(/[*_`>\[\]]/g, '').trim().slice(0, 220) : '';
}

// ---------- markdown -> html (deliberately small subset) ----------
function mdInline(s) {
  return s
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1">')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}
function mdToHtml(md) {
  const out = [];
  for (const block of md.split(/\n{2,}/)) {
    const lines = block.split('\n').map(l => l.trimEnd()).filter(Boolean);
    if (!lines.length) continue;
    if (/^###\s/.test(lines[0])) { out.push('<h3>' + mdInline(lines[0].replace(/^###\s*/, '')) + '</h3>'); continue; }
    if (/^##\s/.test(lines[0])) { out.push('<h2>' + mdInline(lines[0].replace(/^##\s*/, '')) + '</h2>'); continue; }
    if (/^#\s/.test(lines[0])) { out.push('<h2>' + mdInline(lines[0].replace(/^#\s*/, '')) + '</h2>'); continue; }
    if (lines.every(l => /^[-*]\s+/.test(l))) {
      out.push('<ul>' + lines.map(l => '<li>' + mdInline(l.replace(/^[-*]\s+/, '')) + '</li>').join('') + '</ul>');
      continue;
    }
    if (/^>\s?/.test(lines[0])) {
      out.push('<blockquote>' + mdInline(lines.map(l => l.replace(/^>\s?/, '')).join(' ')) + '</blockquote>');
      continue;
    }
    out.push('<p>' + mdInline(lines.join(' ')) + '</p>');
  }
  return out.join('\n');
}

// ---------- build ----------
function build() {
  mkdirSync(dataDir, { recursive: true });
  const records = [];
  const files = readdirSync(postsDir).filter(f => f.endsWith('.md')).sort();
  for (const f of files) {
    const src = readFileSync(join(postsDir, f), 'utf8');
    const { meta, body } = parseFrontmatter(f, src);
    const cat = req(f, meta, 'category');
    if (!CATEGORIES.includes(cat)) {
      throw new Error(f + ': category must be one of ' + CATEGORIES.join(', '));
    }
    const photos = photosOf(meta);
    const rec = {
      slug: basename(f, '.md'),
      category: cat,
      title: req(f, meta, 'title'),
      date: req(f, meta, 'date'),
      location: req(f, meta, 'location'),
      pin: meta.pin || meta.location.toUpperCase(),
      lat: num(f, meta, 'lat'),
      lon: num(f, meta, 'lon'),
      org: meta.org || null,
      url: meta.url || null,
      photos,
      photo: photos[0] || null, // list-card thumbnail
      tag: meta.tag || null,
      excerpt: meta.excerpt || firstText(body)
    };
    records.push(rec);
    writeFileSync(join(dataDir, rec.slug + '.json'), JSON.stringify({ ...rec, html: mdToHtml(body) }, null, 2) + '\n');
  }
  writeFileSync(join(dataDir, 'index.json'), JSON.stringify(records, null, 2) + '\n');
  const html = readFileSync(indexPath, 'utf8');
  const s = html.indexOf(START), e = html.indexOf(END);
  if (s < 0 || e < 0 || e < s) throw new Error('POSTS markers not found in index.html');
  const block = START + '\n  const POSTS = ' + JSON.stringify(records, null, 2).split('\n').join('\n  ') + ';\n  ';
  writeFileSync(indexPath, html.slice(0, s) + block + html.slice(e));
  console.log('posts:build — ' + records.length + ' posts -> posts/data/*.json + index.html POSTS index');
}

build();

if (process.argv.includes('--watch')) {
  let timer = null;
  watch(postsDir, { recursive: true }, (_ev, filename) => {
    if (!filename || !filename.endsWith('.md')) return; // ignore posts/data output
    clearTimeout(timer);
    timer = setTimeout(() => { try { build(); } catch (err) { console.error(err.message); } }, 150);
  });
  console.log('posts:watch — watching posts/*.md');
}

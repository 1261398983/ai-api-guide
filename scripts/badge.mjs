// 根据 history.json 生成状态徽章 SVG
// 由 GitHub Actions 每次探测后调用，输出 status.svg
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const HISTORY = path.join(ROOT, 'data', 'history.json');
const OUT = path.join(ROOT, 'status.svg');

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function color(uptime) {
  if (uptime === null) return '#8695aa';
  if (uptime >= 99) return '#2ad39b';
  if (uptime >= 95) return '#ffb020';
  return '#ff5c5c';
}

function textWidth(s) {
  // 粗略估算：等宽字体约 6.5px/字符
  return Math.round(s.length * 6.6 + 10);
}

let summary = { h24: { uptime: null, avgMs: null }, d7: { uptime: null } };
try {
  const d = JSON.parse(fs.readFileSync(HISTORY, 'utf8'));
  summary = d.summary || summary;
} catch (e) {
  // 没有数据就用灰色占位
}

const h24 = summary.h24 || {};
const uptime = typeof h24.uptime === 'number' ? h24.uptime : null;
const avg = typeof h24.avgMs === 'number' ? h24.avgMs : null;

const left = 'RELAY X';
let right;
if (uptime === null) {
  right = 'no data';
} else {
  const up = uptime === 100 ? '100%' : uptime.toFixed(2).replace(/0+$/, '').replace(/\.$/, '') + '%';
  right = avg === null ? `${up} 24h` : `${up} 24h | ${avg}ms`;
}

const lw = textWidth(left);
const rw = textWidth(right);
const total = lw + rw;
const c = color(uptime);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="20" role="img" aria-label="${esc(left)}: ${esc(right)}">
  <title>${esc(left)}: ${esc(right)}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r"><rect width="${total}" height="20" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${lw}" height="20" fill="#161b22"/>
    <rect x="${lw}" width="${rw}" height="20" fill="${c}"/>
    <rect width="${total}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="${lw / 2}" y="14" fill="#000" fill-opacity=".3">${esc(left)}</text>
    <text x="${lw / 2}" y="13">${esc(left)}</text>
    <text x="${lw + rw / 2}" y="14" fill="#000" fill-opacity=".3">${esc(right)}</text>
    <text x="${lw + rw / 2}" y="13">${esc(right)}</text>
  </g>
</svg>
`;

fs.writeFileSync(OUT, svg, 'utf8');
console.log(`badge 已生成: ${right} (uptime=${uptime}, avg=${avg})`);

import fs from 'fs';
const p = 'data/history.json';
const d = JSON.parse(fs.readFileSync(p, 'utf8'));
const now = Date.now();
const day = 86400000;

function stats(list) {
  if (!list.length) return { total: 0, up: 0, uptime: null, avgMs: null, p95Ms: null };
  const up = list.filter(r => r.ok).length;
  const lat = list.filter(r => r.ok).map(r => r.dir.ms).sort((a, b) => a - b);
  const avg = lat.length ? Math.round(lat.reduce((a, b) => a + b, 0) / lat.length) : null;
  let p95 = null;
  if (lat.length) {
    const idx = Math.min(lat.length - 1, Math.max(0, Math.ceil(lat.length * 0.95) - 1));
    p95 = lat[idx];
  }
  return { total: list.length, up, uptime: +((up / list.length) * 100).toFixed(2), avgMs: avg, p95Ms: p95 };
}
const w = ms => d.records.filter(r => now - new Date(r.t).getTime() <= ms);
d.summary = { h24: stats(w(day)), d7: stats(w(day * 7)), d30: stats(w(day * 30)) };
d.updatedAt = new Date().toISOString();
fs.writeFileSync(p, JSON.stringify(d, null, 2), 'utf8');
console.log('记录数:', d.records.length);
console.log('lat:', d.records.filter(r=>r.ok).map(r=>r.dir.ms).sort((a,b)=>a-b).join(', '));
console.log('24h: avg =', d.summary.h24.avgMs, ' p95 =', d.summary.h24.p95Ms);
console.log('p95 >= avg:', d.summary.h24.p95Ms >= d.summary.h24.avgMs);

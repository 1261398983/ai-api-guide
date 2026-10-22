// 探测 api.97wl.cc，把结果写入 data/history.json
// 由 GitHub Actions 定时调用
import fs from 'fs';
import path from 'path';

const TARGET = process.env.TARGET_URL || 'https://api.97wl.cc';
const OUT_JSON = path.join(process.cwd(), 'data', 'history.json');
const MAX_RECORDS = 720; // 30 分钟一次 × 24 × 30 天 ≈ 1440，保留最近 720 条

const TIMEOUT = 15000;

async function probe(url, expect) {
  const t0 = Date.now();
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
    const res = await fetch(url, {
      method: 'GET',
      signal: ctrl.signal,
      headers: { 'User-Agent': 'relayx-status-probe/1.0' },
      redirect: 'follow',
    });
    clearTimeout(timer);
    const ms = Date.now() - t0;
    const body = await res.text();
    return {
      status: res.status,
      ms,
      ok: expect.includes(res.status),
      bytes: body.length,
    };
  } catch (e) {
    return {
      status: 0,
      ms: Date.now() - t0,
      ok: false,
      bytes: 0,
      error: String(e.message || e).slice(0, 80),
    };
  }
}

function loadHistory() {
  try {
    if (fs.existsSync(OUT_JSON)) {
      const raw = fs.readFileSync(OUT_JSON, 'utf8');
      const d = JSON.parse(raw);
      if (Array.isArray(d.records)) return d;
    }
  } catch (e) {
    console.error('读取 history.json 失败，重建:', e.message);
  }
  return { target: TARGET, startedAt: new Date().toISOString(), records: [] };
}

function summarize(records) {
  const now = Date.now();
  const day = 86400000;

  const window = (ms) => records.filter(r => now - new Date(r.t).getTime() <= ms);

  function stats(list) {
    if (!list.length) return { total: 0, up: 0, uptime: null, avgMs: null, p95Ms: null };
    const up = list.filter(r => r.ok).length;
    const lat = list.filter(r => r.ok).map(r => r.dir.ms).sort((a, b) => a - b);
    const avg = lat.length ? Math.round(lat.reduce((a, b) => a + b, 0) / lat.length) : null;
    const p95 = lat.length ? lat[Math.floor(lat.length * 0.95) - 1] ?? lat[lat.length - 1] : null;
    return {
      total: list.length,
      up,
      uptime: +((up / list.length) * 100).toFixed(2),
      avgMs: avg,
      p95Ms: p95,
    };
  }

  return {
    h24: stats(window(day)),
    d7: stats(window(day * 7)),
    d30: stats(window(day * 30)),
  };
}

const history = loadHistory();

const dir = await probe(`${TARGET}/`, [200]);
const api = await probe(`${TARGET}/v1/models`, [401, 200]);

const record = {
  t: new Date().toISOString(),
  dir,
  api,
  ok: dir.ok && api.ok,
};

history.records.push(record);

// 只保留最近 N 条
if (history.records.length > MAX_RECORDS) {
  history.records = history.records.slice(-MAX_RECORDS);
}

history.target = TARGET;
history.updatedAt = new Date().toISOString();
history.summary = summarize(history.records);

fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
fs.writeFileSync(OUT_JSON, JSON.stringify(history, null, 2), 'utf8');

console.log(`probe ok=${record.ok} dir=${dir.status}/${dir.ms}ms api=${api.status}/${api.ms}ms`);
console.log(`24h uptime=${history.summary.h24.uptime}% avg=${history.summary.h24.avgMs}ms`);

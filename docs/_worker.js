// Cloudflare Pages worker: same job as api/proxy.js (Vercel). Forwards POST /api/proxy to the Apps Script
// Web App server-side; every other path is served from the static files.
const API_URL = 'https://script.google.com/macros/s/AKfycbxlEbqSLnqiU_TCT86urymZ3ttxStmqaw4Y2WYAErU25jjgzj7GjN5NWcj7P_9uUrY1/exec';
const json = (o, status) => new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json;charset=utf-8' } });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/api/proxy') return env.ASSETS.fetch(request);
    if (request.method !== 'POST') return json({ ok: false, error: 'METHOD_NOT_ALLOWED' }, 405);
    try {
      const gasRes = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        redirect: 'follow',
        body: await request.text(),
      });
      return new Response(await gasRes.text(), { status: 200, headers: { 'Content-Type': 'application/json;charset=utf-8' } });
    } catch (e) {
      return json({ ok: false, error: 'PROXY_FAILED', message: String(e) }, 502);
    }
  },
};

// Forwards frontend requests to the Google Apps Script Web App server-side,
// so the browser only ever talks to our own domain (avoids GAS's lack of
// CORS support for origins outside *.google.com / *.googleusercontent.com).
const API_URL = 'https://script.google.com/macros/s/AKfycbxlEbqSLnqiU_TCT86urymZ3ttxStmqaw4Y2WYAErU25jjgzj7GjN5NWcj7P_9uUrY1/exec';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'METHOD_NOT_ALLOWED' });
    return;
  }
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks).toString('utf8');

    const gasRes = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      redirect: 'follow',
      body,
    });
    const text = await gasRes.text();
    res.status(200).setHeader('Content-Type', 'application/json;charset=utf-8').send(text);
  } catch (e) {
    res.status(502).json({ ok: false, error: 'PROXY_FAILED', message: String(e) });
  }
};

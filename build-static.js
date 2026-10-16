// สร้างเวอร์ชัน static (ไม่พึ่ง Apps Script) ของหน้าเว็บลงโฟลเดอร์ docs/ สำหรับ host บน GitHub Pages
// รันใหม่ทุกครั้งที่แก้ index.html / script / styles แล้วต้องการอัปเดตเว็บที่ฝากไว้ข้างนอก
// ใช้งาน:  node build-static.js
const fs = require('fs');

const strip = s => s.replace(/^﻿/, '');
const html0 = strip(fs.readFileSync('index.html', 'utf8'));
const style = strip(fs.readFileSync('styles', 'utf8')).replace(/^<style>\n?/, '').replace(/<\/style>\s*$/, '');
const script = strip(fs.readFileSync('script', 'utf8')).replace(/^<script>\n?/, '').replace(/<\/script>\s*$/, '');

// แท็ก PWA (manifest/ไอคอน/theme-color) ใส่เฉพาะเวอร์ชัน Vercel เท่านั้น — ไม่แตะ index.html ต้นฉบับที่ใช้กับ GAS Editor
const pwaHead = `<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#D93A2B">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="icons/favicon-32.png">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Equipment Report">
`;
const pwaRegisterScript = `<script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
</script>
`;

const html = html0
  .replace('<?!= include("styles") ?>', '<link rel="stylesheet" href="styles.css">')
  .replace('<?!= include("script") ?>', '<script src="script.js"></script>')
  .replace('</head>', pwaHead + '</head>')
  .replace('</body>', pwaRegisterScript + '</body>');

if (!fs.existsSync('docs')) fs.mkdirSync('docs');
fs.writeFileSync('docs/styles.css', style);
fs.writeFileSync('docs/script.js', script);
fs.writeFileSync('docs/index.html', html);

console.log('✅ สร้าง docs/index.html, docs/styles.css, docs/script.js แล้ว');
console.log('   อย่าลืม commit + push แล้ว GitHub Pages จะอัปเดตให้อัตโนมัติ (ใช้เวลาสักครู่)');

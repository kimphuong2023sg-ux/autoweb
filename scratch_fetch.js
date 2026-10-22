const https = require('https');
https.get('https://juegalottomexico.com/politica-de-privacidad/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const match = data.match(/<style id="flatsome-autotheme-menu-css">([\s\S]*?)<\/style>/);
    if (!match) return;
    const css = match[1];
    const idx = css.indexOf('#main #content strong');
    if (idx !== -1) {
      console.log('SURROUNDING CSS:\n', css.slice(idx - 100, idx + 400));
    }
  });
});

const https = require('https');

https.get('https://juegalotto365.com', (res) => {
  let html = '';
  res.on('data', (c) => (html += c));
  res.on('end', () => {
    const idx = html.indexOf('<div id="top-bar"');
    if (idx !== -1) {
      console.log('--- FOUND TOPBAR:');
      console.log(html.substring(idx, idx + 1000));
    } else {
      console.log('--- TOPBAR NOT FOUND. Looking for <header:');
      const hIdx = html.indexOf('<header');
      if (hIdx !== -1) {
        console.log(html.substring(hIdx, hIdx + 1200));
      }
    }
  });
});

const fs = require('fs');
const s = fs.readFileSync('C:/Users/admin/.gemini/antigravity-ide/brain/7b25c74b-834b-4293-ba28-96b474f5da7e/.system_generated/steps/158/content.md', 'utf8');
const styles = s.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
console.log('Total style tags:', styles.length);
styles.forEach((st, idx) => {
  if (st.includes('background-color') || st.includes('background:')) {
    console.log(`--- Style ${idx} ---`);
    // print snippet
    console.log(st.slice(0, 300));
  }
});

/**
 * Chuyển đổi cú pháp Markdown đơn giản (**in đậm**, *in nghiêng*, [Tên Link](url))
 * thành HTML có style màu sắc và gạch chân để hiển thị trong preview & website.
 */
export function formatRichText(text?: string, linkColor = '#fbbf24'): string {
  if (!text) return '';
  let res = text;
  // Markdown bold: **text** or __text__ -> <strong>text</strong>
  res = res.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  res = res.replace(/__(.*?)__/g, '<strong>$1</strong>');
  // Markdown italic: *text* or _text_ -> <em>text</em>
  res = res.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Markdown link: [text](url) -> <a href="url" ...>text</a>
  res = res.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    `<a href="$2" target="_blank" rel="noopener" style="color: ${linkColor}; text-decoration: underline;" class="hover:opacity-80">$1</a>`
  );
  // Line breaks: chuyển đổi xuống dòng (Enter) thành thẻ <br>
  res = res.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>');
  return res;
}

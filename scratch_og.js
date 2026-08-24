async function testOgImage(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } });
    if (!res.ok) return console.log('not ok', res.status);
    const text = await res.text();
    const match = text.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i) || text.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:image"/i);
    if (match) {
      console.log('Found og:image:', match[1]);
    } else {
      console.log('No og:image found');
    }
  } catch(e) {
    console.error(e);
  }
}
testOgImage('https://shopee.vn/B%E1%BB%99-Ng%E1%BB%A7-L%E1%BB%A5a-Cao-C%E1%BA%A5p-Pijama-N%E1%BB%AF-Tay-Ng%E1%BA%AFn-Qu%E1%BA%A7n-D%C3%A0i-L%E1%BB%A5a-G%E1%BA%A5m-H%E1%BB%8Da-Ti%E1%BA%BFt-Sang-Tr%E1%BB%8Dng-M%E1%BA%B7c-Nh%C3%A0-M%E1%BA%B7c-Ng%E1%BB%A7-M%C3%A1t-M%E1%BA%BB-B01-i.389599292.12879685324');

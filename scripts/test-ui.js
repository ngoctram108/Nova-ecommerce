async function testUI() {
  const url = 'https://nova-ecommerce-psi.vercel.app/products';
  console.log('Fetching', url);
  const res = await fetch(url, { headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }});
  const html = await res.text();
  
  if (html.includes('picsum.photos')) {
     console.log('SUCCESS: New images from picsum.photos found in HTML!');
  } else {
     console.log('WARNING: picsum.photos NOT found in HTML. The Vercel deployment might still be building or caching old data.');
  }
}

testUI().catch(console.error);

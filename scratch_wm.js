fetch('https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Pajamas_illustration.jpg/800px-Pajamas_illustration.jpg', {
  method: 'GET',
  headers: { 
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
  }
})
.then(res => {
  console.log(res.status);
  console.log(res.headers.get('content-type'));
})

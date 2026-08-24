import { searchProductImage } from './src/Backend/services/image-search';

async function test() {
  const result = await searchProductImage("Set Đồ Ngủ Lụa Pijama NORA Váy ngủ");
  console.log(result);
  
  if (!result?.imageUrl) {
    console.log('No image found');
    return;
  }
  const res = await fetch(result.imageUrl, { method: 'GET' });
  console.log('Status:', res.status);
  console.log('Final URL:', result.imageUrl);
  console.log('Content-Type:', res.headers.get('content-type'));
}

test();

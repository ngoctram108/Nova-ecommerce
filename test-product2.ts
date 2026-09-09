import { getProductDetails } from './src/Backend/services/catalog';

async function test() {
  console.log('Testing getProductDetails...');
  const id = 'cmt8g1kzt00obnbmok3gbg0t2';
  
  try {
    const product = await getProductDetails(id);
    console.log('Product:', JSON.stringify(product, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

test();

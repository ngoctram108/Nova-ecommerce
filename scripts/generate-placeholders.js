const fs = require('fs');
const path = require('path');

// A 1x1 transparent WebP image, base64 encoded
const webpBase64 = 'UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
const buffer = Buffer.from(webpBase64, 'base64');

const publicImagesDir = path.join(__dirname, '..', 'public', 'images', 'products');

if (!fs.existsSync(publicImagesDir)) {
  fs.mkdirSync(publicImagesDir, { recursive: true });
}

// Write the hero image
fs.writeFileSync(path.join(__dirname, '..', 'public', 'images', 'hero.jpg'), buffer);

// Mock products data relies on these image names
const imageNames = [
  'merino-sweater-1.jpg',
  'merino-sweater-2.jpg',
  'merino-sweater-3.jpg',
  'merino-sweater-4.jpg',
  'merino-sweater-5.jpg',
  'cashmere-coat-1.jpg',
  'cashmere-coat-2.jpg',
  'cotton-tee-1.jpg',
  'cotton-tee-2.jpg',
  'linen-shirt-1.jpg',
  'linen-shirt-2.jpg',
  'chinos-1.jpg',
  'denim-jacket-1.jpg',
  'oxford-shirt-1.jpg',
  'blazer-1.jpg',
  'cardigan-1.jpg',
  'leather-sneaker-1.jpg',
  'chelsea-boot-1.jpg',
  'loafer-1.jpg',
  'running-shoe-1.jpg',
  'derby-shoe-1.jpg',
  'canvas-sneaker-1.jpg',
  'weekender-1.jpg',
  'backpack-1.jpg',
  'tote-1.jpg',
  'crossbody-1.jpg',
  'messenger-1.jpg',
  'dopp-kit-1.jpg',
  'sunglasses-1.jpg',
  'watch-1.jpg',
  'belt-1.jpg',
  'braided-belt-1.jpg',
  'wallet-1.jpg',
  'sunglasses-2.jpg',
  'card-holder-1.jpg',
  'cashmere-scarf-1.jpg',
  'watch-2.jpg',
  'beanie-1.jpg',
  'keychain-1.jpg',
  'ceramic-mug-1.jpg',
  'notebook-1.jpg',
  'pour-over-1.jpg',
  'candle-1.jpg',
  'throw-blanket-1.jpg',
  'journal-1.jpg',
  'incense-1.jpg',
  'linen-apron-1.jpg',
  'wood-tray-1.jpg',
];

for (const name of imageNames) {
  fs.writeFileSync(path.join(publicImagesDir, name), buffer);
}

console.log('Created placeholder images.');

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/Backend/database/data/products.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Replace: title: '...', content: '...' with comment: '...'
content = content.replace(/title:\s*['"`].*?['"`],\s*content:\s*(['"`].*?['"`])/g, 'comment: $1');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed mock products');

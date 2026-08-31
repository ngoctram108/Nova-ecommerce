const fs = require('fs');
const path = require('path');

const traverse = (dir) => {
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) traverse(full);
    else if (file === 'route.ts') {
      let content = fs.readFileSync(full, 'utf8');
      if (!content.includes('export const dynamic')) {
        fs.writeFileSync(full, "export const dynamic = 'force-dynamic';\n" + content);
      }
    }
  });
};

traverse('./src/app/api/admin');

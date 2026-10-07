const fs = require('fs');
const path = require('path');

const directories = [
  'd:/admin-panel/admin-panel/backend/src',
  'd:/admin-panel/admin-panel/frontend/src'
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Remove lines that only contain single line comments
      content = content.replace(/^\s*\/\/.*$/gm, '');
      
      // Remove multi-line comments (simple version)
      content = content.replace(/\/\*[\s\S]*?\*\//g, '');
      
      // Remove multiple consecutive blank lines
      content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
      
      fs.writeFileSync(fullPath, content);
      console.log('Cleaned:', fullPath);
    }
  }
}

directories.forEach(processDirectory);
console.log('Done cleaning comments!');

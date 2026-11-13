// Standalone verification script to scan for UTF-8 Byte Order Marks (BOM) in project source files.
import fs from 'node:fs';
import path from 'node:path';

function scanDir(dir) {
  let found = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.next', '.git'].includes(entry.name)) {
        found += scanDir(full);
      }
    } else if (/\.(ts|tsx|js|mjs|json|css|md)$/.test(entry.name)) {
      const buf = fs.readFileSync(full);
      if (buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) {
        console.error(`BOM found in: ${full}`);
        found++;
      }
    }
  }
  return found;
}

const count = scanDir(process.cwd());
if (count > 0) {
  console.error(`Total files with BOM: ${count}`);
  process.exit(1);
} else {
  console.log('Zero BOM markers found across workspace.');
}

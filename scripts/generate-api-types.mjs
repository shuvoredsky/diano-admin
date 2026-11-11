import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openapiPath = path.resolve(__dirname, '../../diano-server/openapi.json');
const outputPath = path.resolve(__dirname, '../src/lib/api/schema.d.ts');

if (!fs.existsSync(openapiPath)) {
  console.error(`OpenAPI spec not found at: ${openapiPath}`);
  process.exit(1);
}

const rawSpec = fs.readFileSync(openapiPath, 'utf8');
const schema = JSON.parse(rawSpec);

// Locate cached openapi-typescript or local
const possibleModulePaths = [
  'C:/Users/kumar/AppData/Local/npm-cache/_npx/21d31b7563e6adbc/node_modules/openapi-typescript/dist/index.mjs',
  path.resolve(__dirname, '../node_modules/openapi-typescript/dist/index.mjs'),
];

let openapiTSModule = null;
for (const p of possibleModulePaths) {
  if (fs.existsSync(p)) {
    openapiTSModule = await import(pathToFileURL(p).href);
    break;
  }
}

if (!openapiTSModule) {
  console.error('Could not find openapi-typescript module');
  process.exit(1);
}

const { default: openapiTS, astToString } = openapiTSModule;
const ast = await openapiTS(schema);
const contents = astToString(ast);

fs.writeFileSync(outputPath, contents, 'utf8');
console.log(`✅ Successfully generated ${outputPath} (${contents.length} bytes)`);

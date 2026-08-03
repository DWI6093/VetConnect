import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const apiUrl = process.env.API_URL?.trim();

if (!apiUrl) {
  console.log('API_URL no está definida; se conserva la configuración local del frontend.');
  process.exit(0);
}

const runtimeConfig = `window.__env = {
  API_URL: ${JSON.stringify(apiUrl.replace(/\/+$/, ''))}
};
`;

await writeFile(resolve('public/config.js'), runtimeConfig, 'utf8');
console.log('Configuración del frontend generada para la API definida en API_URL.');

import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const apiUrl = process.env.API_URL?.trim();

if (!apiUrl) {
  console.log('API_URL no está definida; se conserva la configuración local del frontend.');
  process.exit(0);
}

let urlValidada;

try {
  urlValidada = new URL(apiUrl);
} catch {
  console.error('API_URL debe ser una URL absoluta que comience con http:// o https://.');
  process.exit(1);
}

if (!['http:', 'https:'].includes(urlValidada.protocol)) {
  console.error('API_URL debe usar el protocolo http:// o https://.');
  process.exit(1);
}

if (urlValidada.username || urlValidada.password || urlValidada.search || urlValidada.hash) {
  console.error('API_URL no debe incluir credenciales, parámetros de consulta ni fragmentos.');
  process.exit(1);
}

const apiUrlNormalizada = apiUrl.replace(/\/+$/, '');

const runtimeConfig = `window.__env = {
  API_URL: ${JSON.stringify(apiUrlNormalizada)}
};
`;

await writeFile(resolve('public/config.js'), runtimeConfig, 'utf8');
console.log('Configuración del frontend generada para la API definida en API_URL.');

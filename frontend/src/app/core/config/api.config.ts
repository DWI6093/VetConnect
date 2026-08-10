declare global {
  interface Window {
    __env?: {
      API_URL?: string;
    };
  }
}

const hostLocal =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const apiLocal = `${window.location.protocol === 'https:' ? 'https' : 'http'}://localhost:3000`;
const apiConfigurada = window.__env?.API_URL?.trim().replace(/\/+$/, '');

if (!hostLocal && (!apiConfigurada || !/^https?:\/\//i.test(apiConfigurada))) {
  throw new Error(
    'La configuración API_URL no es válida. Debe contener la URL absoluta del backend.',
  );
}

export const URL_BASE_API = apiConfigurada || apiLocal;

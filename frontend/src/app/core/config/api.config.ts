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

export const URL_BASE_API =
  window.__env?.API_URL?.trim().replace(/\/+$/, '') || (hostLocal ? apiLocal : '');

import { Api } from './Api';

const isTauriRuntime = () => typeof window !== 'undefined' && '__TAURI_IPC__' in window;

const resolveBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
  }

  if (isTauriRuntime()) {
    return 'http://192.168.15.7:8081';
  }

  return '';
};

export const api = new Api({
  baseURL: resolveBaseUrl(),
  withCredentials: true,
});

export const API_BASE_URL = resolveBaseUrl();
export const isTauri = isTauriRuntime;


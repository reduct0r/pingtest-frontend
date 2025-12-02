import { Api } from './Api';
import { tauriProxyAdapter } from './tauriProxyAdapter';
const isTauriBuild = Boolean(import.meta.env.TAURI_PLATFORM ?? import.meta.env.TAURI_ENV_PLATFORM);
const isTauriBundle = import.meta.env.BASE_URL === './';

const isTauriRuntime = () => {
  if (typeof window === 'undefined') {
    return (
      isTauriBuild ||
      isTauriBundle ||
      typeof (globalThis as Record<string, unknown>).__TAURI_METADATA__ !== 'undefined'
    );
  }

  const w = window as typeof window & {
    __TAURI_IPC__?: unknown;
    __TAURI__?: unknown;
    __TAURI_METADATA__?: unknown;
  };

  const protocol = w.location?.protocol ?? '';
  const host = w.location?.hostname ?? '';
  const tauriHost = host?.toLowerCase().includes('tauri');

  return (
    isTauriBuild ||
    isTauriBundle ||
    protocol === 'tauri:' ||
    protocol === 'app:' ||
    tauriHost ||
    typeof w.__TAURI_IPC__ !== 'undefined' ||
    typeof w.__TAURI__ !== 'undefined' ||
    typeof w.__TAURI_METADATA__ !== 'undefined' ||
    navigator.userAgent?.toLowerCase().includes('tauri')
  );
};

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

if (isTauriRuntime()) {
  api.instance.defaults.adapter = tauriProxyAdapter;
}


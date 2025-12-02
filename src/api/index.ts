import { Api } from './Api';
import { tauriAxiosAdapter } from './tauriAdapter';

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

export const fetchWithTauri = async (input: RequestInfo | URL, init?: RequestInit) => {
  if (isTauriRuntime()) {
    const { fetch } = await import('@tauri-apps/plugin-http');
    const response = await fetch(input.toString(), {
      method: init?.method ?? 'GET',
      headers: init?.headers as Record<string, string>,
      body: init?.body as string | undefined,
    });
    return {
      ok: response.ok,
      status: response.status,
      json: () => response.json(),
      text: () => response.text(),
    };
  }
  return fetch(input, init);
};

if (isTauriRuntime()) {
  api.instance.defaults.adapter = tauriAxiosAdapter;
}


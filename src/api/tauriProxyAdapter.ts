import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { invoke } from '@tauri-apps/api/core';

type HeaderTuple = [string, string];

interface ProxyResponse {
  status: number;
  headers: HeaderTuple[];
  body?: string | null;
}

const buildFullPath = (baseURL: string | undefined, requestedURL: string) => {
  if (baseURL && !/^([a-z][a-z\d+\-.]*:)?\/\//i.test(requestedURL)) {
    return `${baseURL.replace(/\/+$/, '')}/${requestedURL.replace(/^\/+/, '')}`;
  }
  return requestedURL;
};

const headersToEntries = (headers?: InternalAxiosRequestConfig['headers']): HeaderTuple[] => {
  if (!headers) {
    return [];
  }
  const normalized =
    headers instanceof AxiosHeaders ? headers.toJSON() : (headers as Record<string, unknown>);
  return Object.entries(normalized).reduce<HeaderTuple[]>((acc, [key, value]) => {
    if (value === undefined || value === null) {
      return acc;
    }
    if (Array.isArray(value)) {
      value.forEach((v) => acc.push([key, String(v)]));
      return acc;
    }
    acc.push([key, String(value)]);
    return acc;
  }, []);
};

const prepareBody = (data: unknown) => {
  if (data === undefined || data === null) {
    return null;
  }
  if (typeof data === 'string') {
    return data;
  }
  if (data instanceof URLSearchParams) {
    return data.toString();
  }
  return JSON.stringify(data);
};

const parseResponseBody = (response: ProxyResponse, config: InternalAxiosRequestConfig) => {
  if (!response.body) {
    return null;
  }

  const contentType =
    response.headers.find(([key]) => key.toLowerCase() === 'content-type')?.[1] ?? '';

  if (config.responseType === 'text' || contentType.includes('text/')) {
    return response.body;
  }

  if (config.responseType === 'json' || !config.responseType) {
    try {
      return JSON.parse(response.body);
    } catch {
      return response.body;
    }
  }

  return response.body;
};

export const tauriProxyAdapter: AxiosAdapter = async (config) => {
  const url = buildFullPath(config.baseURL, config.url ?? '');
  const headers = headersToEntries(config.headers);
  const body = prepareBody(config.data);

  try {
    const response = await invoke<ProxyResponse>('proxy_request', {
      request: {
        method: (config.method ?? 'get').toUpperCase(),
        url,
        headers,
        body,
      },
    });

    const data = parseResponseBody(response, config);
    const axiosResponse: AxiosResponse = {
      data,
      status: response.status,
      statusText: response.status.toString(),
      headers: Object.fromEntries(response.headers),
      config,
      request: null,
    };

    const validateStatus = config.validateStatus ?? axios.defaults.validateStatus;
    if (!validateStatus || validateStatus(axiosResponse.status)) {
      return axiosResponse;
    }

    throw new AxiosError(
      `Request failed with status code ${axiosResponse.status}`,
      axiosResponse.status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
      config,
      null,
      axiosResponse,
    );
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error;
    }

    throw new AxiosError(
      (error as Error)?.message ?? 'Network Error',
      AxiosError.ERR_NETWORK,
      config,
    );
  }
};


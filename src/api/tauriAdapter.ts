import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
  type CustomParamsSerializer,
} from 'axios';

const isAbsoluteURL = (url: string) => /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);

const combineURLs = (baseURL: string, relativeURL: string) => {
  if (!baseURL) {
    return relativeURL;
  }
  return `${baseURL.replace(/\/+$/, '')}/${relativeURL.replace(/^\/+/, '')}`;
};

const buildFullPath = (baseURL: string | undefined, requestedURL: string) => {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};

const serializeParams = (
  params?: InternalAxiosRequestConfig['params'],
  paramsSerializer?: InternalAxiosRequestConfig['paramsSerializer'],
): string => {
  if (!params || Object.keys(params).length === 0) {
    return '';
  }
  if (typeof paramsSerializer === 'function') {
    return (paramsSerializer as CustomParamsSerializer)(params);
  }
  if (
    paramsSerializer &&
    typeof paramsSerializer === 'object' &&
    'serialize' in paramsSerializer &&
    typeof paramsSerializer.serialize === 'function'
  ) {
    return paramsSerializer.serialize(params);
  }
  const searchParams = new URLSearchParams();
  const appendValue = (key: string, value: unknown) => {
    if (value === undefined || value === null) {
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => appendValue(key, item));
      return;
    }
    if (value instanceof Date) {
      searchParams.append(key, value.toISOString());
      return;
    }
    if (typeof value === 'object') {
      searchParams.append(key, JSON.stringify(value));
      return;
    }
    searchParams.append(key, String(value));
  };
  Object.entries(params).forEach(([key, value]) => appendValue(key, value));
  return searchParams.toString();
};

const headersToPlainObject = (headers?: InternalAxiosRequestConfig['headers']): Record<string, string> => {
  if (!headers) {
    return {};
  }
  const normalizeEntries = () =>
    headers instanceof AxiosHeaders ? Object.entries(headers.toJSON()) : Object.entries(headers as Record<string, unknown>);
  const plain: Record<string, string> = {};
  normalizeEntries().forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    plain[key] = Array.isArray(value) ? value.join(', ') : String(value);
  });
  return plain;
};

const prepareBody = (data: unknown): BodyInit | null | undefined => {
  if (data === undefined || data === null) {
    return undefined;
  }
  if (
    typeof data === 'string' ||
    data instanceof Blob ||
    data instanceof URLSearchParams ||
    data instanceof FormData ||
    data instanceof ReadableStream
  ) {
    return data;
  }
  if (data instanceof ArrayBuffer) {
    return data;
  }
  if (ArrayBuffer.isView(data)) {
    return data as unknown as BodyInit;
  }
  const sharedBufferCtor = (globalThis as { SharedArrayBuffer?: typeof SharedArrayBuffer }).SharedArrayBuffer;
  if (sharedBufferCtor && data instanceof sharedBufferCtor) {
    return new Uint8Array(data as ArrayBufferLike) as unknown as BodyInit;
  }
  return JSON.stringify(data);
};

const parseBody = async (response: Response, responseType?: InternalAxiosRequestConfig['responseType']) => {
  if (response.status === 204 || response.status === 205) {
    return null;
  }

  if (responseType === 'arraybuffer') {
    return response.arrayBuffer();
  }

  if (responseType === 'blob') {
    if (typeof response.blob === 'function') {
      return response.blob();
    }
    const buffer = await response.arrayBuffer();
    return new Blob([buffer]);
  }

  if (responseType === 'text' || responseType === 'document') {
    return response.text();
  }

  if (responseType && responseType !== 'json') {
    return response.text();
  }

  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const createAxiosResponse = (
  config: InternalAxiosRequestConfig,
  response: Response,
  data: unknown,
): AxiosResponse => {
  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });

  return {
    data,
    status: response.status,
    statusText: response.statusText,
    headers,
    config,
    request: null,
  };
};

export const tauriAxiosAdapter: AxiosAdapter = async (config) => {
  const { fetch } = await import('@tauri-apps/plugin-http');

  const headers = headersToPlainObject(config.headers);

  const url = config.url ?? '';
  const fullPath = buildFullPath(config.baseURL, url);
  const query = serializeParams(config.params, config.paramsSerializer);
  const finalUrl = query ? `${fullPath}${fullPath.includes('?') ? '&' : '?'}${query}` : fullPath;

  const controller = new AbortController();

  const requestSignal = config.signal;
  if (requestSignal?.aborted) {
    controller.abort();
  } else if (requestSignal && typeof requestSignal.addEventListener === 'function') {
    requestSignal.addEventListener('abort', () => controller.abort());
  }

  let cancelReason: unknown;
  if (config.cancelToken) {
    config.cancelToken.promise.then((cancel) => {
      cancelReason = cancel;
      controller.abort();
    });
  }

  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  if (typeof config.timeout === 'number' && config.timeout > 0) {
    timeoutId = setTimeout(() => controller.abort(), config.timeout);
  }

  try {
    const response = await fetch(finalUrl, {
      method: (config.method ?? 'get').toUpperCase(),
      headers,
      body: prepareBody(config.data),
      signal: controller.signal,
      credentials: config.withCredentials === false ? 'same-origin' : 'include',
      connectTimeout: typeof config.timeout === 'number' ? config.timeout : undefined,
    });

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const data = await parseBody(response, config.responseType);
    const axiosResponse = createAxiosResponse(config, response, data);
    const validateStatus = config.validateStatus ?? axios.defaults.validateStatus;

    if (!validateStatus || validateStatus(response.status)) {
      return axiosResponse;
    }

    throw new AxiosError(
      `Request failed with status code ${response.status}`,
      response.status >= 500 ? 'ERR_BAD_RESPONSE' : 'ERR_BAD_REQUEST',
      config,
      null,
      axiosResponse,
    );
  } catch (error) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (cancelReason) {
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw cancelReason;
    }

    if (error instanceof AxiosError) {
      throw error;
    }

    throw new AxiosError((error as Error)?.message ?? 'Network Error', AxiosError.ERR_NETWORK, config);
  }
};


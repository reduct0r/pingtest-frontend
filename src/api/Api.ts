/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ## npm i swagger-typescript-api                             ##
 * ## https://github.com/acacode/swagger-typescript-api        ##
 * ---------------------------------------------------------------
 */

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type ResponseType } from 'axios';

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams extends Omit<AxiosRequestConfig, 'data' | 'params' | 'url'> {
  secure?: boolean;
  path: string;
  type?: ContentType;
  query?: QueryParamsType;
  format?: ResponseType;
  body?: unknown;
}

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>;

export interface ApiConfig<SecurityDataType = unknown> extends Omit<AxiosRequestConfig, 'data'> {
  securityWorker?: (securityData: SecurityDataType | null) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export const ContentType = {
  Json: 'application/json',
  FormData: 'multipart/form-data',
  UrlEncoded: 'application/x-www-form-urlencoded',
  Text: 'text/plain',
} as const;

export type ContentType = (typeof ContentType)[keyof typeof ContentType];

export interface ComponentDto {
  id?: number | null;
  title: string;
  description: string;
  longDescription: string;
  time: number;
  imageUrl?: string | null;
  isDataBaseUsage?: boolean | null;
}

export interface PingTimeItemDto {
  componentId: number;
  title: string;
  description: string;
  time: number;
  imageUrl?: string | null;
  quantity: number;
  subtotalTime: number;
}

export type PingTimeStatus = 'DRAFT' | 'DELETED' | 'FORMED' | 'COMPLETED' | 'REJECTED' | 'ARCHIVED';

export interface PingTimeDto {
  id?: number | null;
  status: PingTimeStatus | string;
  createdAt: string;
  creatorUsername: string;
  formationDate?: string | null;
  completionDate?: string | null;
  moderatorUsername?: string | null;
  totalTime?: number | null;
  items: PingTimeItemDto[];
  loadCoefficient?: number | null;
}

export interface TimePingIconDto {
  draftId?: number;
  itemCount?: number;
}

export interface PaginatedResponseDto<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
  queryTimeMs?: number | null;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface UserRegistrationDto {
  username: string;
  password: string;
}

export interface UserUpdateDto {
  username?: string | null;
  password?: string | null;
}

export interface UserDto {
  id: number;
  username: string;
  isModerator: boolean;
}

export interface ItemUpdateDto {
  quantity?: number | null;
}

export interface PingTimeUpdateDto {
  loadCoefficient?: number | null;
}

export interface ModerateActionDto {
  action: string;
}

export type MessageResponse = Record<string, string>;

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker'];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({ securityWorker, secure, format, ...axiosConfig }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      withCredentials: axiosConfig?.withCredentials ?? true,
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  private toFormData = (input: Record<string, unknown>): FormData =>
    Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];

      if (property instanceof Blob) {
        formData.append(key, property);
      } else if (typeof property === 'object' && property !== null) {
        formData.append(key, JSON.stringify(property));
      } else if (property !== undefined) {
        formData.append(key, String(property));
      }

      return formData;
    }, new FormData());

  public request = async <T = any, _E = any>({ secure, path, type, query, format, body, ...params }: FullRequestParams): Promise<T> => {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.secure) && this.securityWorker && (await this.securityWorker(this.securityData))) || {};

    const requestParams = {
      ...params,
      ...secureParams,
      headers: {
        ...(params.headers || {}),
        ...(secureParams?.headers || {}),
      },
    };

    const responseFormat = format ?? this.format ?? undefined;

    const preparedBody =
      type === ContentType.FormData && body && typeof body === 'object'
        ? this.toFormData(body as Record<string, unknown>)
        : type === ContentType.Text && body !== undefined
          ? typeof body === 'string'
            ? body
            : JSON.stringify(body)
          : body;

    const response: AxiosResponse<T> = await this.instance.request({
      ...requestParams,
      url: path,
      method: params.method,
      params: query,
      data: preparedBody,
      headers: {
        ...(requestParams.headers || {}),
        ...(type && type !== ContentType.FormData ? { 'Content-Type': type } : {}),
      },
      responseType: responseFormat,
    });

    return response.data;
  };
}

export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  auth = {
    /**
     * @description Authenticate user. JWT cookies are returned in Set-Cookie headers.
     */
    loginCreate: (data: LoginDto, params: RequestParams = {}) =>
      this.request<MessageResponse, any>({
        path: `/api/auth/login`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    logoutCreate: (params: RequestParams = {}) =>
      this.request<MessageResponse, any>({
        path: `/api/auth/logout`,
        method: 'POST',
        ...params,
      }),

    refreshCreate: (params: RequestParams = {}) =>
      this.request<MessageResponse, any>({
        path: `/api/auth/refresh`,
        method: 'POST',
        ...params,
      }),
  };

  users = {
    usersRegisterCreate: (data: UserRegistrationDto, params: RequestParams = {}) =>
      this.request<UserDto, any>({
        path: `/api/users/register`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    usersMeDetail: (params: RequestParams = {}) =>
      this.request<UserDto, any>({
        path: `/api/users/me`,
        method: 'GET',
        ...params,
      }),

    usersMeUpdate: (data: UserUpdateDto, params: RequestParams = {}) =>
      this.request<UserDto, any>({
        path: `/api/users/me`,
        method: 'PUT',
        body: data,
        type: ContentType.Json,
        ...params,
      }),
  };

  serverComponents = {
    serverComponentsList: (query?: { filter?: string }, params: RequestParams = {}) =>
      this.request<ComponentDto[], any>({
        path: `/api/server-components`,
        method: 'GET',
        query,
        ...params,
      }),

    serverComponentsDetail: (id: number, params: RequestParams = {}) =>
      this.request<ComponentDto, any>({
        path: `/api/server-components/${id}`,
        method: 'GET',
        ...params,
      }),

    serverComponentsAddToDraftCreate: (componentId: number, params: RequestParams = {}) =>
      this.request<PingTimeDto, any>({
        path: `/api/server-components/${componentId}/add-to-draft`,
        method: 'POST',
        ...params,
      }),
  };

  pingTime = {
    pingTimeCartIconList: (params: RequestParams = {}) =>
      this.request<TimePingIconDto, any>({
        path: `/api/ping-time/cart-icon`,
        method: 'GET',
        ...params,
      }),

    pingTimeList: (
      query?: {
        status?: PingTimeStatus | string;
        fromDate?: string;
        toDate?: string;
        page?: number;
        size?: number;
        sortBy?: string;
        sortDir?: string;
        useIndex?: boolean;
      },
      params: RequestParams = {}
    ) =>
      this.request<PingTimeDto[] | PaginatedResponseDto<PingTimeDto>, any>({
        path: `/api/ping-time`,
        method: 'GET',
        query,
        ...params,
      }),

    pingTimeListPaginated: (
      query?: {
        status?: PingTimeStatus | string;
        fromDate?: string;
        toDate?: string;
        page?: number;
        size?: number;
        sortBy?: string;
        sortDir?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedResponseDto<PingTimeDto>, any>({
        path: `/api/ping-time/paginated`,
        method: 'GET',
        query,
        ...params,
      }),

    pingTimeDetail: (id: number, params: RequestParams = {}) =>
      this.request<PingTimeDto, any>({
        path: `/api/ping-time/${id}`,
        method: 'GET',
        ...params,
      }),

    pingTimeUpdate: (id: number, data: PingTimeUpdateDto, params: RequestParams = {}) =>
      this.request<PingTimeDto, any>({
        path: `/api/ping-time/${id}`,
        method: 'PUT',
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    pingTimeFormUpdate: (id: number, params: RequestParams = {}) =>
      this.request<PingTimeDto, any>({
        path: `/api/ping-time/${id}/form`,
        method: 'PUT',
        ...params,
      }),

    pingTimeDelete: (id: number, params: RequestParams = {}) =>
      this.request<MessageResponse, any>({
        path: `/api/ping-time/${id}`,
        method: 'DELETE',
        ...params,
      }),

    pingTimeItemsUpdate: (requestId: number, componentId: number, data: ItemUpdateDto, params: RequestParams = {}) =>
      this.request<PingTimeDto, any>({
        path: `/api/ping-time/${requestId}/items/${componentId}`,
        method: 'PUT',
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    pingTimeItemsDelete: (requestId: number, componentId: number, params: RequestParams = {}) =>
      this.request<PingTimeDto, any>({
        path: `/api/ping-time/${requestId}/items/${componentId}`,
        method: 'DELETE',
        ...params,
      }),

    pingTimeModerateUpdate: (id: number, data: ModerateActionDto, params: RequestParams = {}) =>
      this.request<PingTimeDto, any>({
        path: `/api/ping-time/${id}/moderate`,
        method: 'PUT',
        body: data,
        type: ContentType.Json,
        ...params,
      }),
  };
}


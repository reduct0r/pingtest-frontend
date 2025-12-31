import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ItemUpdateDto, ModerateActionDto, PaginatedResponseDto, PingTimeDto, PingTimeStatus, PingTimeUpdateDto, TimePingIconDto } from '../api/Api';
import { api } from '../api';
import type { AppDispatch, RootState } from '../store';
import axios from 'axios';

interface RequestFilters {
  status: PingTimeStatus | 'ALL';
  startDate: string | null;
  endDate: string | null;
  creatorFilter: string | null; // Фильтр по создателю (на фронтенде)
}

const isDateInputValue = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);
const formatDateForApi = (value: string | null, endOfDay = false) => {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (!isDateInputValue(trimmed)) {
    return trimmed;
  }
  const time = endOfDay ? '23:59:59' : '00:00:00';
  return `${trimmed}T${time}`;
};

const getTodayDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDefaultFilters = (): RequestFilters => {
  const today = getTodayDate();
  return {
    status: 'ALL',
    startDate: today,
    endDate: today,
    creatorFilter: null,
  };
};

interface RequestsState {
  cartInfo: TimePingIconDto | null;
  currentRequest: PingTimeDto | null;
  requests: PingTimeDto[];
  filters: RequestFilters;
  loadingCart: boolean;
  loadingCurrent: boolean;
  loadingList: boolean;
  mutationLoading: boolean;
  error: string | null;
  // Пагинация
  paginatedData: PaginatedResponseDto<PingTimeDto> | null;
  currentPage: number | null;
  pageSize: number | null;
}

const initialState: RequestsState = {
  cartInfo: null,
  currentRequest: null,
  requests: [],
  filters: getDefaultFilters(),
  loadingCart: false,
  loadingCurrent: false,
  loadingList: false,
  mutationLoading: false,
  error: null,
  paginatedData: null,
  currentPage: 0,
  pageSize: 20,
};

const mapError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? 'Ошибка API';
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Что-то пошло не так';
};

export const fetchCartIcon = createAsyncThunk<TimePingIconDto, void, { rejectValue: string }>('requests/fetchCartIcon', async (_, { rejectWithValue }) => {
  try {
    return await api.pingTime.pingTimeCartIconList();
  } catch (error) {
    return rejectWithValue(mapError(error));
  }
});

export const fetchRequestById = createAsyncThunk<PingTimeDto, number, { rejectValue: string }>('requests/fetchById', async (id, { rejectWithValue }) => {
  try {
    return await api.pingTime.pingTimeDetail(id);
  } catch (error) {
    return rejectWithValue(mapError(error));
  }
});

export const fetchRequests = createAsyncThunk<PingTimeDto[] | PaginatedResponseDto<PingTimeDto>, void, { state: RootState; rejectValue: string }>(
  'requests/fetchList',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const { filters, cartInfo, currentPage, pageSize } = state.requests;
      
      // Всегда используем пагинацию
      const query: {
        status?: PingTimeStatus | string;
        fromDate?: string;
        toDate?: string;
        page?: number;
        size?: number;
        sortBy?: string;
        sortDir?: string;
      } = {
        page: currentPage ?? 0,
        size: pageSize ?? 20,
        sortBy: 'formationDate',
        sortDir: 'DESC',
      };
        
        if (filters.status !== 'ALL') {
          query.status = filters.status;
        }
        const fromDate = formatDateForApi(filters.startDate, false);
        const toDate = formatDateForApi(filters.endDate, true);
        if (fromDate) {
          query.fromDate = fromDate;
        }
        if (toDate) {
          query.toDate = toDate;
        }

        const response = await api.pingTime.pingTimeList(query);
        
        // Проверяем, является ли ответ пагинированным
        if (response && typeof response === 'object' && 'content' in response && !Array.isArray(response)) {
          const paginatedResponse = response as PaginatedResponseDto<PingTimeDto>;
          
          // Фильтрация по создателю на фронтенде (если нужна)
          const { creatorFilter } = state.requests.filters;
          let filteredContent = paginatedResponse.content;
          if (creatorFilter && creatorFilter.trim() !== '') {
            filteredContent = filteredContent.filter((req: PingTimeDto) =>
              req.creatorUsername.toLowerCase().includes(creatorFilter.toLowerCase())
            );
          }
          
          // Добавляем черновик, если нужно
          if ((filters.status === 'ALL' || filters.status === 'DRAFT')) {
            let draftId = cartInfo?.draftId;
            if (!draftId) {
              try {
                const latestCart = await api.pingTime.pingTimeCartIconList();
                draftId = latestCart.draftId;
              } catch (cartError) {
                console.warn('[requests] failed to fetch cart icon for draft id', cartError);
              }
            }
            
            if (draftId) {
              const containsDraft = filteredContent.some((item: PingTimeDto) => item.id === draftId);
              if (!containsDraft) {
                try {
                  const draft = await api.pingTime.pingTimeDetail(draftId);
                  filteredContent = filters.status === 'DRAFT' ? [draft] : [draft, ...filteredContent];
                } catch (draftError) {
                  console.warn('[requests] failed to fetch draft details', draftError);
                }
              }
            }
          }
          
          return {
            ...paginatedResponse,
            content: filteredContent,
          };
        }
        
        // Если это массив (старый формат), преобразуем в пагинированный
        const list = Array.isArray(response) ? response : [];
        let requestsToReturn = list;
        
        // Фильтрация по создателю на фронтенде
        const { creatorFilter } = state.requests.filters;
        if (creatorFilter && creatorFilter.trim() !== '') {
          requestsToReturn = requestsToReturn.filter((req: PingTimeDto) =>
            req.creatorUsername.toLowerCase().includes(creatorFilter.toLowerCase())
          );
        }

        if ((filters.status === 'ALL' || filters.status === 'DRAFT')) {
          let draftId = cartInfo?.draftId;

          if (!draftId) {
            try {
              const latestCart = await api.pingTime.pingTimeCartIconList();
              draftId = latestCart.draftId;
            } catch (cartError) {
              console.warn('[requests] failed to fetch cart icon for draft id', cartError);
            }
          }

          if (draftId) {
            const containsDraft = list.some((item: PingTimeDto) => item.id === draftId);
            if (!containsDraft) {
              try {
                const draft = await api.pingTime.pingTimeDetail(draftId);
                requestsToReturn = filters.status === 'DRAFT' ? [draft] : [draft, ...list];
              } catch (draftError) {
                console.warn('[requests] failed to fetch draft details', draftError);
              }
            }
          }
        }

        return {
          content: requestsToReturn,
          totalElements: requestsToReturn.length,
          totalPages: 1,
          currentPage: 0,
          pageSize: requestsToReturn.length,
          hasNext: false,
          hasPrevious: false,
          queryTimeMs: null,
        } as PaginatedResponseDto<PingTimeDto>;
    } catch (error) {
      return rejectWithValue(mapError(error));
    }
  },
);

export const addComponentToDraft = createAsyncThunk<PingTimeDto, number, { rejectValue: string; dispatch: AppDispatch }>(
  'requests/addComponentToDraft',
  async (componentId, { rejectWithValue, dispatch }) => {
    try {
      const draft = await api.serverComponents.serverComponentsAddToDraftCreate(componentId);
      dispatch(fetchCartIcon());
      return draft;
    } catch (error) {
      return rejectWithValue(mapError(error));
    }
  },
);

export const updateItemQuantity = createAsyncThunk<PingTimeDto, { requestId: number; componentId: number; quantity: number }, { rejectValue: string }>(
  'requests/updateItemQuantity',
  async ({ requestId, componentId, quantity }, { rejectWithValue }) => {
    try {
      const payload: ItemUpdateDto = { quantity };
      return await api.pingTime.pingTimeItemsUpdate(requestId, componentId, payload);
    } catch (error) {
      return rejectWithValue(mapError(error));
    }
  },
);

export const deleteItemFromDraft = createAsyncThunk<PingTimeDto, { requestId: number; componentId: number }, { rejectValue: string }>(
  'requests/deleteItemFromDraft',
  async ({ requestId, componentId }, { rejectWithValue }) => {
    try {
      return await api.pingTime.pingTimeItemsDelete(requestId, componentId);
    } catch (error) {
      return rejectWithValue(mapError(error));
    }
  },
);

export const deleteRequest = createAsyncThunk<void, number, { rejectValue: string; dispatch: AppDispatch }>(
  'requests/deleteRequest',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await api.pingTime.pingTimeDelete(id);
      dispatch(fetchCartIcon());
      dispatch(fetchRequests());
    } catch (error) {
      return rejectWithValue(mapError(error));
    }
  },
);

export const formRequest = createAsyncThunk<PingTimeDto, number, { rejectValue: string; dispatch: AppDispatch }>(
  'requests/formRequest',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const updated = await api.pingTime.pingTimeFormUpdate(id);
      dispatch(fetchCartIcon());
      dispatch(fetchRequests());
      return updated;
    } catch (error) {
      return rejectWithValue(mapError(error));
    }
  },
);

export const updateLoadCoefficient = createAsyncThunk<PingTimeDto, { requestId: number; loadCoefficient: number }, { rejectValue: string }>(
  'requests/updateLoadCoefficient',
  async ({ requestId, loadCoefficient }, { rejectWithValue }) => {
    try {
      const payload: PingTimeUpdateDto = { loadCoefficient };
      return await api.pingTime.pingTimeUpdate(requestId, payload);
    } catch (error) {
      return rejectWithValue(mapError(error));
    }
  },
);

export const moderateRequest = createAsyncThunk<PingTimeDto, { requestId: number; action: 'COMPLETE' | 'REJECT' }, { rejectValue: string; dispatch: AppDispatch }>(
  'requests/moderateRequest',
  async ({ requestId, action }, { rejectWithValue, dispatch }) => {
    try {
      const payload: ModerateActionDto = { action };
      const updated = await api.pingTime.pingTimeModerateUpdate(requestId, payload);
      // При завершении заявки (COMPLETE) основной бэкенд автоматически вызывает асинхронный сервис
      dispatch(fetchRequests());
      return updated;
    } catch (error) {
      return rejectWithValue(mapError(error));
    }
  },
);


const requestsSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<RequestFilters>>) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
      // Фильтры сохраняются только в памяти (Redux state), не в localStorage
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    resetRequestsState: (state) => {
      const defaultFilters = getDefaultFilters();
      state.cartInfo = initialState.cartInfo;
      state.currentRequest = initialState.currentRequest;
      state.requests = [];
      state.loadingCart = false;
      state.loadingCurrent = false;
      state.loadingList = false;
      state.mutationLoading = false;
      state.error = null;
      state.filters = { ...defaultFilters };
    },
    clearRequestError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartIcon.pending, (state) => {
        state.loadingCart = true;
      })
      .addCase(fetchCartIcon.fulfilled, (state, action) => {
        state.loadingCart = false;
        state.cartInfo = action.payload;
      })
      .addCase(fetchCartIcon.rejected, (state, action) => {
        state.loadingCart = false;
        state.error = action.payload as string;
      })
      .addCase(fetchRequestById.pending, (state) => {
        state.loadingCurrent = true;
        state.error = null;
      })
      .addCase(fetchRequestById.fulfilled, (state, action) => {
        state.loadingCurrent = false;
        state.currentRequest = action.payload;
      })
      .addCase(fetchRequestById.rejected, (state, action) => {
        state.loadingCurrent = false;
        state.currentRequest = null;
        state.error = action.payload as string;
      })
      .addCase(fetchRequests.pending, (state) => {
        state.loadingList = true;
        state.error = null;
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.loadingList = false;
        if (Array.isArray(action.payload)) {
          // Старый формат без пагинации
          state.requests = action.payload;
          state.paginatedData = null;
        } else {
          // Новый формат с пагинацией
          state.paginatedData = action.payload;
          state.requests = action.payload.content;
          state.currentPage = action.payload.currentPage;
        }
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.loadingList = false;
        state.requests = [];
        state.paginatedData = null;
        state.error = action.payload as string;
      })
      .addCase(addComponentToDraft.pending, (state) => {
        state.mutationLoading = true;
        state.error = null;
      })
      .addCase(addComponentToDraft.fulfilled, (state, action) => {
        state.mutationLoading = false;
        state.currentRequest = action.payload;
      })
      .addCase(addComponentToDraft.rejected, (state, action) => {
        state.mutationLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateItemQuantity.fulfilled, (state, action) => {
        state.currentRequest = action.payload;
      })
      .addCase(updateItemQuantity.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteItemFromDraft.fulfilled, (state, action) => {
        state.currentRequest = action.payload;
      })
      .addCase(deleteItemFromDraft.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteRequest.pending, (state) => {
        state.mutationLoading = true;
      })
      .addCase(deleteRequest.fulfilled, (state) => {
        state.mutationLoading = false;
        state.currentRequest = null;
      })
      .addCase(deleteRequest.rejected, (state, action) => {
        state.mutationLoading = false;
        state.error = action.payload as string;
      })
      .addCase(formRequest.pending, (state) => {
        state.mutationLoading = true;
      })
      .addCase(formRequest.fulfilled, (state, action) => {
        state.mutationLoading = false;
        state.currentRequest = action.payload;
      })
      .addCase(formRequest.rejected, (state, action) => {
        state.mutationLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateLoadCoefficient.fulfilled, (state, action) => {
        state.currentRequest = action.payload;
      })
      .addCase(updateLoadCoefficient.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(moderateRequest.pending, (state) => {
        state.mutationLoading = true;
        state.error = null;
      })
      .addCase(moderateRequest.fulfilled, (state, action) => {
        state.mutationLoading = false;
        state.currentRequest = action.payload;
      })
      .addCase(moderateRequest.rejected, (state, action) => {
        state.mutationLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, resetRequestsState, clearRequestError, setPage } = requestsSlice.actions;
export default requestsSlice.reducer;


import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ItemUpdateDto, PingTimeDto, PingTimeStatus, PingTimeUpdateDto, TimePingIconDto } from '../api/Api';
import { api } from '../api';
import type { AppDispatch, RootState } from '../store';
import axios from 'axios';

const FILTER_STORAGE_KEY = 'pingtest:requests-filter';

interface RequestFilters {
  status: PingTimeStatus | 'ALL';
}

const readFilters = (): RequestFilters => {
  if (typeof window === 'undefined') {
    return { status: 'ALL' };
  }
  try {
    const stored = localStorage.getItem(FILTER_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as RequestFilters;
    }
  } catch (error) {
    console.warn('[requests] failed to read filters', error);
  }
  return { status: 'ALL' };
};

const persistFilters = (filters: RequestFilters) => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
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
}

const initialState: RequestsState = {
  cartInfo: null,
  currentRequest: null,
  requests: [],
  filters: readFilters(),
  loadingCart: false,
  loadingCurrent: false,
  loadingList: false,
  mutationLoading: false,
  error: null,
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

export const fetchRequests = createAsyncThunk<PingTimeDto[], void, { state: RootState; rejectValue: string }>(
  'requests/fetchList',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const { filters, cartInfo } = state.requests;
      const query =
        filters.status === 'ALL'
          ? undefined
          : {
              status: filters.status,
            };

      const list = await api.pingTime.pingTimeList(query);
      let requestsToReturn = list;

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
          const containsDraft = list.some((item) => item.id === draftId);
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

      return requestsToReturn;
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

const requestsSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<RequestFilters>) => {
      state.filters = action.payload;
      persistFilters(action.payload);
    },
    resetRequestsState: (state) => {
      persistFilters({ status: 'ALL' });
      state.cartInfo = initialState.cartInfo;
      state.currentRequest = initialState.currentRequest;
      state.requests = [];
      state.loadingCart = false;
      state.loadingCurrent = false;
      state.loadingList = false;
      state.mutationLoading = false;
      state.error = null;
      state.filters = { status: 'ALL' };
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
        state.requests = action.payload;
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.loadingList = false;
        state.requests = [];
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
      });
  },
});

export const { setFilters, resetRequestsState, clearRequestError } = requestsSlice.actions;
export default requestsSlice.reducer;


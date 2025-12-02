import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ComponentDto } from '../api/Api';
import { api } from '../api';
import type { RootState } from '../store';
import { COMPONENTS_MOCK } from '../modules/mock';

const FILTER_STORAGE_KEY = 'pingtest:catalog-filter';

const readFilter = () => {
  if (typeof window === 'undefined') {
    return '';
  }
  return localStorage.getItem(FILTER_STORAGE_KEY) ?? '';
};

const persistFilter = (value: string) => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(FILTER_STORAGE_KEY, value);
};

export interface CatalogState {
  items: ComponentDto[];
  searchValue: string;
  loading: boolean;
  error: string | null;
  lastUpdated?: string | null;
}

const initialState: CatalogState = {
  items: [],
  searchValue: readFilter(),
  loading: false,
  error: null,
  lastUpdated: null,
};

export const fetchComponents = createAsyncThunk<ComponentDto[], void, { state: RootState; rejectValue: ComponentDto[] }>(
  'catalog/fetchComponents',
  async (_, { getState, rejectWithValue }) => {
    const { searchValue } = (getState() as RootState).catalog;
    try {
      const result = await api.serverComponents.serverComponentsList({
        filter: searchValue || undefined,
      });
      if (!Array.isArray(result)) {
        throw new Error('Unexpected response shape');
      }
      return result;
    } catch (error) {
      console.warn('[catalog] Falling back to mock data', error);
      return rejectWithValue(
        COMPONENTS_MOCK.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          longDescription: item.longDescription,
          imageUrl: undefined,
          time: item.time,
        })),
      );
    }
  },
);

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    setSearchValue: (state, action: PayloadAction<string>) => {
      state.searchValue = action.payload;
      persistFilter(action.payload);
    },
    resetCatalog: () => {
      persistFilter('');
      return { ...initialState, searchValue: '' };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComponents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComponents.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchComponents.rejected, (state, action) => {
        state.loading = false;
        state.error = 'Не удалось получить список компонентов';
        if (action.payload) {
          state.items = action.payload;
        }
      });
  },
});

export const { setSearchValue, resetCatalog } = catalogSlice.actions;
export default catalogSlice.reducer;


import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { LoginDto, UserDto, UserRegistrationDto, UserUpdateDto } from '../api/Api';
import { api } from '../api';
import type { AppDispatch } from '../store';
import axios from 'axios';
import { resetCatalog } from './catalogSlice';
import { fetchCartIcon, fetchRequests, resetRequestsState } from './requestsSlice';


const mapErrorMessage = (message: unknown) => {
  if (axios.isAxiosError(message)) {
    return message.response?.data?.message ?? 'Ошибка при обращении к API';
  }
  if (typeof message === 'string') {
    return message;
  }
  return 'Произошла неизвестная ошибка';
};

const normalizeUser = (payload: unknown): UserDto => {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Некорректный ответ профиля');
  }
  const candidate = payload as Partial<UserDto>;
  if (typeof candidate.id !== 'number' || typeof candidate.username !== 'string' || candidate.username.trim() === '') {
    throw new Error('Некорректные данные пользователя');
  }
  if (typeof candidate.isModerator !== 'boolean') {
    candidate.isModerator = false;
  }
  return candidate as UserDto;
};

interface AuthState {
  user: UserDto | null;
  loading: boolean;
  error: string | null;
  registrationSuccess: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  registrationSuccess: false,
};

export const loginUser = createAsyncThunk<UserDto, LoginDto, { rejectValue: string; dispatch: AppDispatch }>(
  'auth/loginUser',
  async (credentials, { rejectWithValue, dispatch }) => {
    try {
      await api.auth.loginCreate(credentials);
      const profile = normalizeUser(await api.users.usersMeDetail());
      dispatch(fetchCartIcon());
      dispatch(fetchRequests());
      return profile;
    } catch (error) {
      return rejectWithValue(mapErrorMessage(error));
    }
  },
);

export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>('auth/logoutUser', async (_, { rejectWithValue, dispatch }) => {
  try {
    await api.auth.logoutCreate();
    dispatch(resetCatalog());
    dispatch(resetRequestsState());
  } catch (error) {
    return rejectWithValue(mapErrorMessage(error));
  }
});

export const registerUser = createAsyncThunk<UserDto, UserRegistrationDto, { rejectValue: string }>(
  'auth/registerUser',
  async (payload, { rejectWithValue }) => {
    try {
      const user = normalizeUser(await api.users.usersRegisterCreate(payload));
      return user;
    } catch (error) {
      return rejectWithValue(mapErrorMessage(error));
    }
  },
);

export const bootstrapAuth = createAsyncThunk<UserDto | null, void, { rejectValue: string; dispatch: AppDispatch }>(
  'auth/bootstrapAuth',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const profile = normalizeUser(await api.users.usersMeDetail());
      dispatch(fetchCartIcon());
      dispatch(fetchRequests());
      return profile;
    } catch (error) {
      return rejectWithValue(mapErrorMessage(error));
    }
  },
);

export const updateProfile = createAsyncThunk<UserDto, UserUpdateDto, { rejectValue: string }>(
  'auth/updateProfile',
  async (dto, { rejectWithValue }) => {
    try {
      const profile = normalizeUser(await api.users.usersMeUpdate(dto));
      return profile;
    } catch (error) {
      return rejectWithValue(mapErrorMessage(error));
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<UserDto>) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.error = action.payload ?? 'Не удалось войти';
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.payload ?? 'Не удалось выйти';
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registrationSuccess = false;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<UserDto>) => {
        state.loading = false;
        state.registrationSuccess = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.registrationSuccess = false;
        state.error = action.payload ?? 'Не удалось зарегистрироваться';
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Не удалось обновить профиль';
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;


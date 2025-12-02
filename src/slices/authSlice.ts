import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { LoginDto, UserDto, UserRegistrationDto, UserUpdateDto } from '../api/Api';
import { api } from '../api';
import type { AppDispatch } from '../store';
import axios from 'axios';
import { resetCatalog } from './catalogSlice';
import { fetchCartIcon, fetchRequests, resetRequestsState } from './requestsSlice';

const LAST_USERNAME_KEY = 'pingtest:last-username';

const readLastUsername = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(LAST_USERNAME_KEY);
};

const persistLastUsername = (value: string | null) => {
  if (typeof window === 'undefined') {
    return;
  }
  if (value) {
    localStorage.setItem(LAST_USERNAME_KEY, value);
  } else {
    localStorage.removeItem(LAST_USERNAME_KEY);
  }
};

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
  lastUsername: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  registrationSuccess: false,
  lastUsername: readLastUsername(),
};

export const loginUser = createAsyncThunk<UserDto, LoginDto, { rejectValue: string; dispatch: AppDispatch }>(
  'auth/loginUser',
  async (credentials, { rejectWithValue, dispatch }) => {
    try {
      await api.auth.loginCreate(credentials);
      const profile = normalizeUser(await api.users.usersMeDetail());
      persistLastUsername(profile.username);
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
    persistLastUsername(null);
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
      persistLastUsername(user.username);
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
      persistLastUsername(profile.username);
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
      persistLastUsername(profile.username);
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
        state.lastUsername = null;
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
        state.lastUsername = action.payload.username;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.registrationSuccess = false;
        state.error = action.payload ?? 'Не удалось зарегистрироваться';
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.lastUsername = action.payload?.username ?? state.lastUsername;
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


import { configureStore } from '@reduxjs/toolkit';
import catalogReducer from './slices/catalogSlice';
import authReducer from './slices/authSlice';
import requestsReducer from './slices/requestsSlice';

export const store = configureStore({
  reducer: {
    catalog: catalogReducer,
    auth: authReducer,
    requests: requestsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
import { configureStore } from '@reduxjs/toolkit';
import { uiReducer } from './slices/ui.slice';
import { authReducer } from './slices/auth.slice';

export function makeStore() {
  return configureStore({
    reducer: {
      ui: uiReducer,
      auth: authReducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

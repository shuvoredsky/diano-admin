import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type TableDensity = 'compact' | 'standard' | 'comfortable';

export interface UiPreferencesState {
  isSidebarCollapsed: boolean;
  isMobileSidebarOpen: boolean;
  tableDensity: TableDensity;
  isCommandPaletteOpen: boolean;
}

const initialState: UiPreferencesState = {
  isSidebarCollapsed: false,
  isMobileSidebarOpen: false,
  tableDensity: 'standard',
  isCommandPaletteOpen: false,
};

/**
 * Client-only UI state slice.
 * Rule: Server data (products, orders, analytics, users) belongs strictly in TanStack Query, never here.
 */
export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.isSidebarCollapsed = !state.isSidebarCollapsed;
    },
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.isSidebarCollapsed = action.payload;
    },
    setMobileSidebarOpen(state, action: PayloadAction<boolean>) {
      state.isMobileSidebarOpen = action.payload;
    },
    setTableDensity(state, action: PayloadAction<TableDensity>) {
      state.tableDensity = action.payload;
    },
    setCommandPaletteOpen(state, action: PayloadAction<boolean>) {
      state.isCommandPaletteOpen = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  setMobileSidebarOpen,
  setTableDensity,
  setCommandPaletteOpen,
} = uiSlice.actions;

export const uiReducer = uiSlice.reducer;


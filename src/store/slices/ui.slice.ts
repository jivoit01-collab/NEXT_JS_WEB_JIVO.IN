import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  mobileNavOpen: boolean;
  activeModal: string | null;
  theme: 'light' | 'dark' | 'system';
}

const initialState: UIState = {
  mobileNavOpen: false,
  activeModal: null,
  theme: 'system',
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleMobileNav: (state) => {
      state.mobileNavOpen = !state.mobileNavOpen;
    },
    closeMobileNav: (state) => {
      state.mobileNavOpen = false;
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.activeModal = action.payload;
    },
    closeModal: (state) => {
      state.activeModal = null;
    },
    setTheme: (state, action: PayloadAction<UIState['theme']>) => {
      state.theme = action.payload;
    },
  },
});

export const { toggleMobileNav, closeMobileNav, openModal, closeModal, setTheme } =
  uiSlice.actions;

import { createSlice } from '@reduxjs/toolkit';

interface CartUIState {
  sidebarOpen: boolean;
}

const initialState: CartUIState = {
  sidebarOpen: false,
};

export const cartUISlice = createSlice({
  name: 'cartUI',
  initialState,
  reducers: {
    openCartSidebar: (state) => {
      state.sidebarOpen = true;
    },
    closeCartSidebar: (state) => {
      state.sidebarOpen = false;
    },
    toggleCartSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
  },
});

export const { openCartSidebar, closeCartSidebar, toggleCartSidebar } = cartUISlice.actions;

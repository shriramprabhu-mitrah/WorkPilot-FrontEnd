import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserState {
  name: string | null;
  username: string | null;
  email: string | null;
  role: string | null;
  avatar_url: string | null;
  is_active: boolean | null;
  color:string | null;
}

const initialState: UserState = {
  name: null,
  username: null,
  email: null,
  role: null,
  avatar_url: null,
  is_active: null,
  color:null
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Partial<UserState>>) => {
      if (action.payload.name !== undefined) state.name = action.payload.name;
      if (action.payload.username !== undefined) state.username = action.payload.username;
      if (action.payload.email !== undefined) state.email = action.payload.email;
      if (action.payload.role !== undefined) state.role = action.payload.role;
      if (action.payload.avatar_url !== undefined) state.avatar_url = action.payload.avatar_url;
      if (action.payload.is_active !== undefined) state.is_active = action.payload.is_active;
      if (action.payload.color !== undefined) state.color = action.payload.color
    },
    clearUser: (state) => {
      state.name = null;
      state.username = null;
      state.email = null;
      state.role = null;
      state.avatar_url = null;
      state.is_active = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;

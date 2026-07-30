import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OrganizationResponse } from '@/src/types/organization';

interface OrganizationState extends OrganizationResponse {
  isLoading: boolean;
}

const initialState: OrganizationState = {
  name: '',
  id: '',
  created_by: '',
  is_active: '',
  slug: '',
  domain: '',
  industry: '',
  team_size: '',
  country: '',
  logo_url: '',
  created_at: '',
  updated_at: '',
  isLoading: false,
};

const organizationSlice = createSlice({
  name: 'organization',
  initialState,
  reducers: {
    setOrganization: (state, action: PayloadAction<OrganizationResponse>) => {
      return {
        ...state,
        ...action.payload,
        isLoading: false,
      };
    },
    updateOrganization: (state, action: PayloadAction<Partial<OrganizationResponse>>) => {
      return {
        ...state,
        ...action.payload,
        isLoading: false,
      };
    },
    setOrganizationLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    clearOrganization: () => initialState,
  },
});

export const { setOrganization, updateOrganization, setOrganizationLoading, clearOrganization } =
  organizationSlice.actions;

export default organizationSlice.reducer;

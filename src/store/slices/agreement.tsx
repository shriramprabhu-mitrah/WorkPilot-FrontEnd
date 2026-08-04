import { createSlice } from '@reduxjs/toolkit';

interface AgreementState {
  termsAccepted: boolean;
  privacyAccepted: boolean;
}

const initialState: AgreementState = {
  termsAccepted: false,
  privacyAccepted: false,
};

const agreementSlice = createSlice({
  name: 'agreement',
  initialState,
  reducers: {
    setTermsAccepted: (state, action) => {
      state.termsAccepted = action.payload;
    },
    setPrivacyAccepted: (state, action) => {
      state.privacyAccepted = action.payload;
    },
  },
});

export const { setTermsAccepted, setPrivacyAccepted } = agreementSlice.actions;

export default agreementSlice.reducer;

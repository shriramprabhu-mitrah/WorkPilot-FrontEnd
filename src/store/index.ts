import { combineReducers, configureStore } from '@reduxjs/toolkit';
import storage from './storage';
import { persistReducer, persistStore } from 'redux-persist';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import userReducer from './slices/users';
import organizationReducer from './slices/organization';

const rootReducer = combineReducers({
  user: userReducer,
  organization: organizationReducer,
});

const persitConfig = {
  key: 'root',
  storage,
  whitelist: ['user', 'organization'],
};

const persistedReducer = persistReducer(persitConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: true,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

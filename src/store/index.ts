import { combineReducers, configureStore } from "@reduxjs/toolkit";
import storage from "./storage";
import { persistReducer, persistStore } from "redux-persist";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import userReducer from "./slices/users";

const rootReducer = combineReducers({
  user: userReducer,
})

const persitConfig={
    key:'root',
    storage,
    whitelist:['user']
}

const persistedReducer=persistReducer(persitConfig,rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: true
});

export const persistor =persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
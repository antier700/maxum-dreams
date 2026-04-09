import { configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  createTransform,
  PersistConfig,
  Persistor,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import { reducers } from "./Reducers/reducers";
import storage from "./storage";

const rootReducer = reducers;
type RootReducerState = ReturnType<typeof rootReducer>;

const authTransform = createTransform(
  (inboundState: any, key) => {
    if (key !== "auth" || !inboundState) return inboundState;
    return {
      ...inboundState,
      isLoading: false,
      error: null,
    };
  },
  (outboundState: any, key) => {
    if (key !== "auth" || !outboundState) return outboundState;
    return {
      ...outboundState,
      isLoading: false,
      error: null,
    };
  }
);

const persistConfig: PersistConfig<RootReducerState> = {
  key: "root_v2",
  storage,
  // whitelist: ["auth"],
  // blacklist: ["loading", "token"],
  transforms: [authTransform as any],
  throttle: 7000,
};

const persistedReducer = persistReducer<RootReducerState>(persistConfig, rootReducer);

// Configure the store
export const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(),
});

// Create the persistor
export const persistor: Persistor = persistStore(store);

// Define the RootState type
export type RootState = ReturnType<typeof rootReducer>;

// Export AppDispatch so useDispatch can be typed for thunks
export type AppDispatch = typeof store.dispatch;

// Export the persistedReducer state type
export type PersistedReducerState = ReturnType<typeof persistedReducer>;

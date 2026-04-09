import { combineReducers } from "@reduxjs/toolkit";
import { loadingSlice } from "../slices/loaderSlice";
import { TokenSlice } from "../slices/tokenSlice";
import authReducer from "../slices/authSlice";

// Combine all reducers
export const reducers = combineReducers({
  loading: loadingSlice.reducer,
  token: TokenSlice.reducer,
  auth: authReducer,
});

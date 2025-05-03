import { configureStore } from '@reduxjs/toolkit';
import countriesReducer from './countriesSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    countries: countriesReducer,
    auth: authReducer,
  },
});

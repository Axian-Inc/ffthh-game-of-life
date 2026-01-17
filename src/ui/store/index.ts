import { configureStore } from "@reduxjs/toolkit";
import gameReducer from "./lifeSlice";

export const store = configureStore({
  reducer: {
    life: gameReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

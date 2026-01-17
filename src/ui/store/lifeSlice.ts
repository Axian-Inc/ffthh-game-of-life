import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LifeState {
  running: boolean;
  speed: number;
  size: number;
  seedDensity: number;
}

const initialState: LifeState = {
  running: false,
  speed: 6,
  size: 22,
  seedDensity: 0.35
};

const lifeSlice = createSlice({
  name: "life",
  initialState,
  reducers: {
    toggleRunning(state) {
      state.running = !state.running;
    },
    setSpeed(state, action: PayloadAction<number>) {
      state.speed = action.payload;
    },
    setSize(state, action: PayloadAction<number>) {
      state.size = action.payload;
    },
    setSeedDensity(state, action: PayloadAction<number>) {
      state.seedDensity = action.payload;
    }
  }
});

export const { toggleRunning, setSpeed, setSize, setSeedDensity } =
  lifeSlice.actions;

export default lifeSlice.reducer;

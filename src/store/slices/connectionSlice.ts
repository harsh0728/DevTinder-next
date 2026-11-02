import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FeedData } from "@/types/feed";

const connectionSlice = createSlice({
  name: 'connection',
  initialState:[] as FeedData[],
  reducers: {
    addConnection: (state, action: PayloadAction<FeedData[]>) => {
      return action.payload;
    },
    removeConnection: (state) => {
      return [];
    },
  },
});

export const { addConnection, removeConnection } = connectionSlice.actions;
export default connectionSlice.reducer;
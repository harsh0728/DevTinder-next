import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {FeedData} from "@/types/feed"

const feedSlice = createSlice({
  name: 'feed',
  initialState:[] as FeedData[],
  reducers: {
    setFeed: (state, action: PayloadAction<FeedData[]>) => {
      return action.payload;
    },
    removeUserFromFeed: (state,action:PayloadAction<string>) => {
      return state.filter((user)=>user._id!=action.payload)
    },
  },
});

export const { setFeed, removeUserFromFeed } = feedSlice.actions;
export default feedSlice.reducer;
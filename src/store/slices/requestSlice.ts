import { createSlice,PayloadAction } from "@reduxjs/toolkit";
import {User} from "@/types/user"


interface ConnectionRequestState {
    _id:string;
    status:string;
    fromUserId:User;
    toUserId:string;
    createdAt:string;
    updatedAt:string;
}   

const requestSlice = createSlice({
  name: 'requests',
  initialState:[] as ConnectionRequestState[],
  reducers: {
    addRequests: (state, action: PayloadAction<ConnectionRequestState[]>) => {return action.payload},
    removeRequest: (state,action:PayloadAction<string>) => {
      return state.filter((r)=>r._id!=action.payload);
    }
  },
});

export const { addRequests, removeRequest } = requestSlice.actions;
export default requestSlice.reducer;
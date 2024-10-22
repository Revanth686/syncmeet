import { createSlice } from "@reduxjs/toolkit";

const testSlice = createSlice({
  name: "test",
  initialState: { test: "test" },
  reducers: {
    addTest: (state, action) => {
      state.test = action.payload;
    },
  },
});

export const { addTest } = testSlice.actions;
export default testSlice.reducer;

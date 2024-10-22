import { configureStore } from "@reduxjs/toolkit";
import testReducer from "./testSlice.js";
import roomReducer from "./RoomSlice.js";

const appStore = configureStore({
  reducer: { test: testReducer, room: roomReducer },
});

export default appStore;

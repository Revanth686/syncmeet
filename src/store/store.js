import { configureStore } from "@reduxjs/toolkit";
import testReducer from "./testSlice.js";
import roomReducer from "./RoomSlice.js";
import appReducer from "./AppSlice.js";

const appStore = configureStore({
  reducer: { test: testReducer, room: roomReducer, app: appReducer },
});

export default appStore;

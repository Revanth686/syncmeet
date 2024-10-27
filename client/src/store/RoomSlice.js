import { createSlice } from "@reduxjs/toolkit";

const roomSlice = createSlice({
  name: "room",
  initialState: {
    isRoomHost: false,
    connectOnlyWithAudio: false,
    roomId: null,
    identity: "",
    showOverlay: true,
    participants: [],
    messages: [],
    editorDisplay: "none",
  },
  reducers: {
    setIsRoomHost: (state, action) => {
      state.isRoomHost = action.payload;
    },
    setConnectOnlyWithAudio: (state, action) => {
      state.connectOnlyWithAudio = action.payload;
    },
    setRoomId: (state, action) => {
      state.roomId = action.payload;
    },
    setIdentity: (state, action) => {
      state.identity = action.payload;
    },
    setShowOverlay: (state, action) => {
      state.showOverlay = action.payload;
    },
    setParticipants: (state, action) => {
      state.participants = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    setEditorDisplay: (state, action) => {
      state.editorDisplay = action.payload;
    },
  },
});

export const {
  setIsRoomHost,
  setConnectOnlyWithAudio,
  setRoomId,
  setIdentity,
  setShowOverlay,
  setParticipants,
  setMessages,
  setEditorDisplay,
} = roomSlice.actions;
export default roomSlice.reducer;

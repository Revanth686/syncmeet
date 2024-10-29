import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import JoinRoomPage from "./JoinRoomPage/JoinRoomPage";
import RoomPage from "./RoomPage/RoomPage";
import Introduction from "./Introduction/Introduction";
import { useEffect } from "react";
import { connectWithSocketIOServer } from "./utils/wss";

function App() {
  useEffect(() => {
    connectWithSocketIOServer();
  }, []);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Introduction />} />
        <Route path="/join-room" element={<JoinRoomPage />} />
        <Route path="/room" element={<RoomPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

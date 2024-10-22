import React, { useEffect } from "react";
import ChatSection from "./ChatSection/ChatSection";
import VideoSection from "./VideoSection/VideoSection";
import ParticipantsSection from "./ParticipantsSection/ParticipantsSection";
import RoomLabel from "./RoomLabel";
import { useSelector } from "react-redux";
import * as webRTCHandler from "../utils/webRTCHandler.js";
import Overlay from "./Overlay.jsx";
import "./RoomPage.css";

const RoomPage = () => {
  const roomId = useSelector((store) => store.room.roomId);
  const identity = useSelector((store) => store.room.identity);
  const isRoomHost = useSelector((store) => store.room.isRoomHost);
  const connectOnlyWithAudio = useSelector(
    (store) => store.room.connectOnlyWithAudio,
  );
  const showOverlay = useSelector((store) => store.room.showOverlay);

  useEffect(() => {
    if (!isRoomHost && !roomId) {
      const siteUrl = window.location.origin;
      window.location.href = siteUrl;
    } else {
      webRTCHandler.getLocalPreviewAndInitRoomConnection(
        isRoomHost,
        identity,
        roomId,
        connectOnlyWithAudio,
      );
    }
  }, []);
  return (
    <div className="room_container">
      <ParticipantsSection />
      <VideoSection />
      <ChatSection />
      <RoomLabel roomId={roomId} />
      {showOverlay && <Overlay />}
    </div>
  );
};

export default RoomPage;

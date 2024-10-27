import React from "react";
import CameraButton from "./CameraButton";
import LeaveRoomButton from "./LeaveRoomButton";
import MicButton from "./MicButton";
import SwitchToScreenSharingButton from "./SwitchToScreenSharingButton";
import { useSelector } from "react-redux";
import EditorButton from "./EditorButton";
import CanvasButton from "./CanvasButton";

const VideoButtons = () => {
  // const { connectOnlyWithAudio } = props;
  const connectOnlyWithAudio = useSelector(
    (store) => store.room.connectOnlyWithAudio,
  );

  return (
    <div className="video_buttons_container">
      <CanvasButton />
      <EditorButton />
      <MicButton />
      {!connectOnlyWithAudio && <CameraButton />}
      <LeaveRoomButton />
      {!connectOnlyWithAudio && <SwitchToScreenSharingButton />}
    </div>
  );
};

export default VideoButtons;

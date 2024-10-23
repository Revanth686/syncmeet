import React from "react";
import VideoButtons from "./VideoButtons";

const VideoSection = () => {
  return (
    <div className="video_section_container">
      {/* <div id="videos_portal"></div> */}
      <div className="video-call-container">
        <div className="main-video-wrapper"></div>
        <div className="side-videos-wrapper"></div>
      </div>
      <VideoButtons />
    </div>
  );
};

export default VideoSection;

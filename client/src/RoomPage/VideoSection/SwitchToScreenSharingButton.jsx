import React, { useState } from "react";
import SwitchImg from "../../resources/images/switchToScreenSharing.svg";

const SwitchToScreenSharingButton = () => {
  const [isScreenSharingActive, setIsScreenSharingActive] = useState(false);
  const handleScreenShareToggle = async () => {
    console.log(`clicked on screen share button`);
    setIsScreenSharingActive((prev) => !prev);
  };
  return (
    <div className="video_button_container">
      <img
        src={SwitchImg}
        onClick={handleScreenShareToggle}
        className="video_button_image"
      />
    </div>
  );
};

export default SwitchToScreenSharingButton;

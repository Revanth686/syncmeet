import React from "react";
import CanvasImg from "../../resources/images/canvas.png";

const handleCanvasPressed = () => {
  console.log(`canvas pressed`);
  //launch canvas component
};
const CanvasButton = () => {
  return (
    <div className="video_button_container">
      <img
        src={CanvasImg}
        onClick={handleCanvasPressed}
        className="video_button_image"
      />
    </div>
  );
};

export default CanvasButton;

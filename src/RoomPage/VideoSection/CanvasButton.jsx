import React, { useState } from "react";
import CanvasImg from "../../resources/images/canvas.png";
import { useDispatch } from "react-redux";
import { setCanvasDisplay } from "../../store/RoomSlice";

const CanvasButton = () => {
  const dispatch = useDispatch();
  const [canvasDisp, setCanvasDisp] = useState("none");
  const handleCanvasPressed = () => {
    console.log(`canvas pressed`);
    const disp = canvasDisp == "none" ? "block" : "none";
    setCanvasDisp(disp);
    dispatch(setCanvasDisplay(disp));
  };
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

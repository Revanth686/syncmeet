import React, { useState } from "react";
import CodeImg from "../../resources/images/code.png";
import { setEditorDisplay } from "../../store/RoomSlice";
import { useDispatch } from "react-redux";

const EditorButton = () => {
  const dispatch = useDispatch();
  const [editorDisp, setEditorDisp] = useState("none");
  const handleCodePressed = () => {
    console.log(`code pressed`);
    const disp = editorDisp == "none" ? "block" : "none";
    setEditorDisp(disp);
    dispatch(setEditorDisplay(disp));
  };
  return (
    <div className="video_button_container">
      <img
        src={CodeImg}
        onClick={handleCodePressed}
        className="video_button_image"
      />
    </div>
  );
};

export default EditorButton;

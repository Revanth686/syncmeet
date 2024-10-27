import React from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { useSelector } from "react-redux";
import Editor from "../../Editor/EditorApp";

const EditorPopup = () => {
  const editorDisplay = useSelector((store) => store.room.editorDisplay);
  const popupRef = useRef(null);
  const headerRef = useRef(null);
  useEffect(() => {
    const header = headerRef.current;
    const popup = popupRef.current;
    let isDragging = false;
    let offsetX, offsetY;

    const handleMouseDown = (e) => {
      isDragging = true;
      offsetX = e.clientX - popup.getBoundingClientRect().left;
      offsetY = e.clientY - popup.getBoundingClientRect().top;
    };
    const handleMouseMove = (e) => {
      if (isDragging) {
        popup.style.left = `${e.clientX - offsetX}px`;
        popup.style.top = `${e.clientY - offsetY}px`;
      }
    };
    const handleMouseUp = () => {
      isDragging = false;
    };
    if (header) {
      header.addEventListener("mousedown", handleMouseDown);
    }
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      if (header) {
        header.removeEventListener("mousedown", handleMouseDown);
      }
      document.removeEventListener("mousemovw", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);
  return (
    <>
      <div
        id="popup"
        className="popup"
        style={{ display: `${editorDisplay}` }}
        ref={popupRef}
      >
        <div className="popup-header" ref={headerRef}>
          <span>Collaborative Component</span>
          <button id="close-popup">X</button>
        </div>
        <div className="popup-content">
          <Editor />
          <textarea placeholder=""></textarea>
        </div>
      </div>
    </>
  );
};

export default EditorPopup;

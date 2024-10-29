import React, { useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import Canvas from "../../Canvas/CanvasApp";

const CanvasPopup = () => {
  const canvasDisplay = useSelector((store) => store.room.canvasDisplay);
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
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);
  return (
    <>
      <div
        id="popup"
        className="popup"
        style={{ display: `${canvasDisplay}` }}
        ref={popupRef}
      >
        <div className="popup-header" ref={headerRef}></div>
        <div className="popup-content">
          <Canvas />
        </div>
      </div>
    </>
  );
};

export default CanvasPopup;

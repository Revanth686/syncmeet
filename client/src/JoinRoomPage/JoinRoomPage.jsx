import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setIsRoomHost } from "../store/RoomSlice";
import { useSearchParams } from "react-router-dom";
import JoinRoomTitle from "./JoinRoomTitle";
import JoinRoomContent from "./JoinRoomContent";
import "./JoinRoom.css";

const JoinRoomPage = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const isRoomHost = searchParams.get("host");

  useEffect(() => {
    console.log(`host from searchParams is ${isRoomHost}`);
    dispatch(setIsRoomHost(isRoomHost == "true" ? true : false));
  }, []);

  return (
    <div className="join_room_page_container">
      <div className="join_room_page_panel">
        <JoinRoomTitle isRoomHost={isRoomHost} />
        <JoinRoomContent />
      </div>
    </div>
  );
};

export default JoinRoomPage;

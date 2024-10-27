import React, { useState } from "react";
import JoinRoomInputs from "./JoinRoomInputs";
import OnlyWithAudioCheckbox from "./OnlyWithAudioCheckbox";
// import {
//   setConnectOnlyWithAudio,
//   setIdentity,
//   setRoomId,
// } from "../store/actions";
import ErrorMessage from "./ErrorMessage";
import JoinRoomButtons from "./JoinRoomButtons";
import { useNavigate } from "react-router-dom";
//import { getRoomExists } from "../utils/api";
import { useSelector, useDispatch } from "react-redux";
import {
  setConnectOnlyWithAudio,
  setIdentity,
  setRoomId,
} from "../store/RoomSlice";
import { getRoomExists } from "../utils/api";

const JoinRoomContent = (props) => {
  const dispatch = useDispatch();
  const isRoomHost = useSelector((store) => store.room.isRoomHost);
  const connectOnlyWithAudio = useSelector(
    (store) => store.room.connectOnlyWithAudio,
  );
  const [roomIdValue, setRoomIdValue] = useState("");
  const [nameValue, setNameValue] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  //HACK:
  const setConnectOnlyWithAudioOpt = (opt) => {
    dispatch(setConnectOnlyWithAudio(opt));
  };

  const handleJoinRoom = async () => {
    dispatch(setIdentity(nameValue));
    if (isRoomHost) {
      createRoom();
    } else {
      await joinRoom();
    }
  };
  const joinRoom = async () => {
    const responseMessage = await getRoomExists(roomIdValue);
    const { roomExists, full } = responseMessage;
    if (roomExists) {
      if (full) {
        setErrorMessage("Meeting is full. Please try again later.");
      } else {
        dispatch(setRoomId(roomIdValue));
        navigate("/room");
      }
    } else {
      setErrorMessage("Meeting not found. Check your meeting id.");
    }
  };
  const createRoom = () => {
    navigate("/room");
  };
  return (
    <>
      <JoinRoomInputs
        roomIdValue={roomIdValue}
        setRoomIdValue={setRoomIdValue}
        nameValue={nameValue}
        setNameValue={setNameValue}
        isRoomHost={isRoomHost}
      />
      <OnlyWithAudioCheckbox
        setConnectOnlyWithAudio={setConnectOnlyWithAudioOpt}
        connectOnlyWithAudio={connectOnlyWithAudio}
      />
      <ErrorMessage errorMessage={errorMessage} />
      <JoinRoomButtons
        handleJoinRoom={handleJoinRoom}
        isRoomHost={isRoomHost}
      />
    </>
  );
};
export default JoinRoomContent;

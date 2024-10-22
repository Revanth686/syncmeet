import React from "react";
import { useSelector } from "react-redux";

const SingleParticipant = (props) => {
  const { identity, lastItem, participant } = props;

  return (
    <>
      <p className="participants_paragraph">{identity}</p>
      {!lastItem && <span className="participants_separator_line"></span>}
    </>
  );
};

const Participants = ({}) => {
  const dummyParticipants = [
    { identity: "User1" },
    { identity: "User2" },
    { identity: "User3" },
    { identity: "User4" },
  ];
  const participants = useSelector((store) => store.room.participants);
  return (
    <div className="participants_container">
      {participants?.map((participant, index) => {
        return (
          <SingleParticipant
            key={participant.identity}
            lastItem={dummyParticipants.length === index + 1}
            participant={participant}
            identity={participant.identity}
          />
        );
      })}
    </div>
  );
};

export default Participants;

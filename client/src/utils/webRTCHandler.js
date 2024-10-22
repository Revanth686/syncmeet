//all webrtc related logic
import { setShowOverlay } from "../store/RoomSlice";
import appStore from "../store/store";
import * as wss from "./wss";
import Peer from "simple-peer";

const defaultConstraints = {
  audio: true,
  video: {
    width: "480",
    height: "360",
  },
};
const onlyAudioConstraints = {
  audio: true,
  video: false,
};
let localStream,
  streams = [],
  peers = {};

/*fired first after roomJoining->getStream*/
export const getLocalPreviewAndInitRoomConnection = async (
  isRoomHost,
  identity,
  roomId = null,
  onlyAudio,
) => {
  const constraints = onlyAudio ? onlyAudioConstraints : defaultConstraints;
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => {
      console.log("successfuly received local stream");
      localStream = stream;
      showLocalVideoPreview(localStream);
      // dispatch an action to hide overlay
      appStore.dispatch(setShowOverlay(false));

      isRoomHost
        ? wss.createNewRoom(identity, onlyAudio)
        : wss.joinRoom(identity, roomId, onlyAudio);
    })
    .catch((err) => {
      console.log(
        "error occurred when trying to get an access to local stream",
      );
      console.log(err);
    });
};

const getConfiguration = () => {
  // const turnIceServers = getTurnIceServers();
  // if (turnIceServers) {
  return {
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:global.stun.twilio.com:3478",
        ],
      },
      // ...turnIceServers,
    ],
  };
  // } else {
  //   console.warn("Using only STUN server");
  //   return {
  //     iceServers: [
  //       {
  //         urls: "stun:stun.l.google.com:19302",
  //       },
  //     ],
  //   };
  // }
};
/*called if new user joined our room*/
export const prepareNewPeerConnection = (connUserSocketId, isInitiator) => {
  console.log(
    `preparing connection with ${connUserSocketId} hostSide ${!isInitiator}`,
  );
  const configuration = getConfiguration();

  // === newRTCPeerConnection()
  peers[connUserSocketId] = new Peer({
    initiator: isInitiator,
    config: configuration,
    stream: localStream,
    // channelName: messengerChannel,
  });

  // === peerConnection.on('track',()=>{})
  peers[connUserSocketId].on("stream", (stream) => {
    console.log("new stream came");
    addStream(stream, connUserSocketId);
    //streams = [...streams, stream];
    streams.push(stream);
  });

  /*if were initiator ? automatically triggered : triggered with sender's offer*/
  peers[connUserSocketId].on("signal", (data) => {
    // webRTC offer, webRTC Answer (SDP informations), ice candidates
    const signalData = {
      signal: data,
      connUserSocketId: connUserSocketId,
    };

    wss.signalPeerData(signalData);
  });
};

/*endpoint that handles received signal(offer/answer) */
export const handleSignalingData = (data) => {
  //add signal data to peer connection
  peers[data.connUserSocketId].signal(data.signal);
};

export const removePeerConnection = (data) => {
  const { socketId } = data;
  //const videoContainer = document.getElementById(socketId);
  const videoContainer = document.querySelector(".video_track_container");
  const videoEl = document.getElementById(`${socketId}-video`);

  if (videoContainer && videoEl) {
    const tracks = videoEl.srcObject.getTracks();

    tracks.forEach((t) => t.stop());

    videoEl.srcObject = null;
    videoContainer.removeChild(videoEl);

    //HACK: as we altered video styling for fullscreen
    //videoContainer.parentNode.removeChild(videoContainer);

    if (peers[socketId]) {
      peers[socketId].destroy();
    }
    delete peers[socketId];
  }
};

//////////////video ui////////////

//NOTE: using vanilla js coz more generic
const showLocalVideoPreview = (stream) => {
  const videosContainer = document.getElementById("videos_portal");
  videosContainer.classList.add("videos_portal_styles");
  const videoContainer = document.createElement("div");
  videoContainer.classList.add("video_track_container");
  const videoElement = document.createElement("video");
  videoElement.autoplay = true;
  videoElement.muted = true;
  videoElement.srcObject = stream;

  videoElement.onloadedmetadata = () => {
    videoElement.play();
  };

  videoContainer.appendChild(videoElement);

  // if (appStore.getState().connectOnlyWithAudio) {
  //   videoContainer.appendChild(getAudioOnlyLabel());
  // }

  videosContainer.appendChild(videoContainer);
};

const addStream = (stream, connUserSocketId) => {
  const videosContainer = document.getElementById("videos_portal");
  // HACK:
  // const videoContainer = document.createElement("div");
  // videoContainer.id = connUserSocketId;
  // videoContainer.classList.add("video_track_container");
  const videoContainer = document.querySelector(".video_track_container");
  const videoElement = document.createElement("video");
  videoElement.autoplay = true;
  videoElement.srcObject = stream;
  videoElement.classList.add("vid");
  videoElement.id = `${connUserSocketId}-video`;

  videoElement.onloadedmetadata = () => {
    videoElement.play();
  };

  videoElement.addEventListener("click", () => {
    if (videoElement.classList.contains("full_screen")) {
      //FIX: fix styling
      //new videocontainer with class video_track_container is getting created for each new user
      videoElement.classList.remove("full_screen");
    } else {
      videoElement.classList.add("full_screen");
    }
  });

  videoContainer.appendChild(videoElement);
  //videosContainer.appendChild(videoContainer);
};

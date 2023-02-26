import React, { useRef, useEffect, useState } from "react";
import io from "socket.io-client";
import styles from "./MeetingRoom.module.css";
import UserVideo from "../../components/user_video/UserVideo";
import PartnerVideo from "../../components/partner_video/PartnerVideo";
import { useParams } from "react-router";

let peer = null;

function MeetingRoom(props) {
  const { setJoinRoom } = props;
  const { meetId } = useParams();

  const [isUserMute, setIsUserMute] = useState(false);
  const [isUserVideoMute, setIsUserVideoMute] = useState(false);
  const [isPartnerVideoMute, setIsPartnerVideoMute] = useState(false);
  const [isScreenShared, setIsScreenShared] = useState(false);
  const [isPartnerMute, setIsPartnerMute] = useState(false);
  const [isRoomFilled, setIsRoomFilled] = useState(false);

  const userVideoRef = useRef();
  const partnerVideoRef = useRef();
  const peerRef = useRef();
  const socketRef = useRef();
  const otherUser = useRef();
  const userStream = useRef();
  const initialRender = useRef(true);

  const handleNegotiationNeededEvent = (userID) => {
    peerRef.current
      .createOffer()
      .then((offer) => {
        return peerRef.current.setLocalDescription(offer);
      })
      .then(() => {
        const payload = {
          target: userID,
          caller: socketRef.current.id,
          sdp: peerRef.current.localDescription,
        };
        socketRef.current.emit("offer", payload);
      })
      .catch((e) => console.log(e));
  };

  const handleICECandidateEvent = (e) => {
    if (e.candidate) {
      const payload = {
        target: otherUser.current,
        candidate: e.candidate,
      };
      socketRef.current.emit("ice-candidate", payload);
    }
  };

  function handleTrackEvent(e) {
    partnerVideoRef.current.srcObject = e.streams[0];
  }

  const createPeer = (userID) => {
    peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.stunprotocol.org",
        },
        {
          urls: "turn:numb.viagenie.ca",
          credential: "muazkh",
          username: "webrtc@live.com",
        },
      ],
    });

    peer.onicecandidate = handleICECandidateEvent;
    peer.ontrack = handleTrackEvent;
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(userID);

    return peer;
  };

  const callUser = (userID) => {
    peerRef.current = createPeer(userID);
    userStream.current
      .getTracks()
      .forEach((track) => peerRef.current.addTrack(track, userStream.current));
  };

  const handleRecieveCall = (incoming) => {
    peerRef.current = createPeer();
    const desc = new RTCSessionDescription(incoming.sdp);
    peerRef.current
      .setRemoteDescription(desc)
      .then(() => {
        userStream.current
          .getTracks()
          .forEach((track) =>
            peerRef.current.addTrack(track, userStream.current)
          );
      })
      .then(() => {
        return peerRef.current.createAnswer();
      })
      .then((answer) => {
        return peerRef.current.setLocalDescription(answer);
      })
      .then(() => {
        const payload = {
          target: incoming.caller,
          caller: socketRef.current.id,
          sdp: peerRef.current.localDescription,
        };
        socketRef.current.emit("answer", payload);
      });
  };

  const handleAnswer = (message) => {
    const desc = new RTCSessionDescription(message.sdp);
    peerRef.current.setRemoteDescription(desc).catch((e) => console.log(e));
  };

  const handleNewICECandidateMsg = (incoming) => {
    const candidate = new RTCIceCandidate(incoming);

    peerRef.current.addIceCandidate(candidate).catch((e) => console.log(e));
  };

  const getInitialSocketUtils = () => {
    console.log("sdf23423dfssd423fdsf");
    socketRef.current.emit("join room", meetId);
    socketRef.current.on("room filled", (roomStatus) => {
      console.log("room filled", roomStatus);
      setIsRoomFilled(roomStatus);
    });

    socketRef.current.on("room overflow", () => {
      alert("Room name not available");
      setJoinRoom(false);
    });

    socketRef.current.on("other user", (userID) => {
      callUser(userID);
      otherUser.current = userID;
    });

    socketRef.current.on("user joined", (userID) => {
      setIsRoomFilled(true);
      otherUser.current = userID;
    });

    socketRef.current.on("offer", handleRecieveCall);

    socketRef.current.on("answer", handleAnswer);

    socketRef.current.on("ice-candidate", handleNewICECandidateMsg);

    socketRef.current.on("toggleUserMic", (micStatus) => {
      console.log("toggleUserMic", micStatus);
      setIsPartnerMute(micStatus);
    });

    socketRef.current.on("toggleUserVideo", (videoStatus) => {
      console.log("toggleUserVideo", videoStatus);
      setIsPartnerVideoMute(videoStatus);
    });

    socketRef.current.on("other user leave", () => {
      peerRef.current = null;
      otherUser.current = null;
    });
  };

  const handleEndCall = () => {
    if (userStream?.current) {
      userStream.current.getTracks().forEach((track) => {
        track.stop();
      });
      socketRef.current.disconnect();
    }
  };

  useEffect(() => {
    console.log("sdf23423dfssd423fdsf useeffect");
    if (initialRender?.current) {
      if (socketRef.current && userStream.current) return;
      socketRef.current = io.connect("http://localhost:8080");

      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          console.log("stream: ", stream);
          userStream.current = stream;
          userVideoRef.current.srcObject = stream;
          getInitialSocketUtils();
        })
        .catch((error) => {
          console.log("error: ", error);
          userStream.current = null;
          getInitialSocketUtils();
        });
      initialRender.current = false;
    }

    return () => {
      handleEndCall();
    };
  }, []);

  const toggleMyVideo = (videoStatus) => {
    if (isScreenShared) {
      alert("stop screen sharing to use video");
      return;
    }

    const payload = {
      target: otherUser.current,
      videoStatus: videoStatus,
    };

    if (userStream.current) {
      let vidTrack = userStream.current.getVideoTracks()[0];
      let sender = null;
      if (peerRef.current) {
        sender = peerRef.current
          .getSenders()
          .find((s) => s.track.kind === vidTrack.kind);
      }

      if (videoStatus) {
        vidTrack.stop();
        if (sender) {
          sender.replaceTrack(vidTrack);
        }
        setIsUserVideoMute(videoStatus);
        socketRef.current.emit("toggleUserVideo", payload);
      } else {
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then((stream) => {
            userVideoRef.current.srcObject = stream;
            userStream.current = stream;
            vidTrack = userStream.current.getVideoTracks()[0];
            if (sender) {
              sender.replaceTrack(vidTrack);
            }
            setIsUserVideoMute(videoStatus);
            socketRef.current.emit("toggleUserVideo", payload);
          })
          .catch(() => {
            alert("something went wrong!");
          });
      }
    }
  };

  const toggleMyMic = (micStatus) => {
    const payload = {
      target: otherUser.current,
      micStatus: micStatus,
    };

    if (userStream.current && peerRef.current) {
      let audTrack = userStream.current.getAudioTracks()[0];
      const sender = peerRef.current
        .getSenders()
        .find((s) => s.track.kind === audTrack.kind);
      if (micStatus) {
        audTrack.enabled = false;
      } else {
        audTrack.enabled = true;
      }
      sender.replaceTrack(audTrack);
    }

    setIsUserMute(micStatus);
    socketRef.current.emit("toggleUserMic", payload);
  };

  const handleShareScreen = async () => {
    if (peerRef.current) {
      navigator.mediaDevices
        .getDisplayMedia({
          video: {
            cursor: "always",
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
          },
        })
        .then((stream) => {
          const displayMediaStream = stream.getVideoTracks()[0];
          const sender = peerRef.current
            .getSenders()
            .find((s) => s.track.kind === displayMediaStream.kind);
          sender.replaceTrack(displayMediaStream);
          setIsScreenShared(true);
          setIsUserVideoMute(true);
          if (partnerVideoRef) {
            partnerVideoRef.current.play();
          }
        });
    } else {
      alert("No user found to share the screen");
    }
  };

  const stopScreenShare = () => {
    const videoTrack = userStream.current.getVideoTracks()[0];
    const sender = peerRef.current
      .getSenders()
      .find((s) => s.track.kind === videoTrack.kind);
    sender.replaceTrack(videoTrack);
    setIsScreenShared(false);
    setIsUserVideoMute(false);
  };

  return (
    <div className={styles.MeetingRoomContainer}>
      <UserVideo
        toggleMyMic={toggleMyMic}
        toggleMyVideo={toggleMyVideo}
        autoPlay={true}
        socketRef={socketRef}
        isVideoMuted={isUserVideoMute}
        isMuted={isUserMute}
        isScreenShared={isScreenShared}
        stopScreenShare={stopScreenShare}
        handleShareScreen={handleShareScreen}
        handleEndCall={handleEndCall}
        videoRef={userVideoRef}
      />
      <div style={{ display: isRoomFilled ? "block" : "none" }}>
        <PartnerVideo
          socketRef={socketRef}
          autoPlay={true}
          isMuted={isPartnerMute}
          videoRef={partnerVideoRef}
          isVideoMuted={isPartnerVideoMute}
          isRoomFilled={isRoomFilled}
        />
      </div>
    </div>
  );
}

export default MeetingRoom;

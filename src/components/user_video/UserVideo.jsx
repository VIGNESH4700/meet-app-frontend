import React from "react";
import cx from "clsx";
import styles from "./UserVideo.module.css";
import { FaMicrophone } from "react-icons/fa";
import { FaMicrophoneSlash } from "react-icons/fa";
import { MdCallEnd } from "react-icons/md";
import { MdScreenShare } from "react-icons/md";
import { MdStopScreenShare } from "react-icons/md";
import { FaVideo } from "react-icons/fa";
import { FaVideoSlash } from "react-icons/fa";

const UserVideo = (props) => {
  const muteMic = () => {
    props.toggleMyMic(true);
  };

  const unMuteMic = () => {
    props.toggleMyMic(false);
  };

  const shareScreen = () => {
    props.handleShareScreen();
  };

  const stopScreenShare = () => {
    props.stopScreenShare();
  };

  const endCall = () => {
    props.handleEndCall();
  };

  const unMuteVideo = () => {
    props.toggleMyVideo(false);
  };

  const muteVideo = () => {
    props.toggleMyVideo(true);
  };

  return (
    <div className={styles.UserVideoContainer}>
      <div className={styles.ParticipantsVideoDiv}>
        {props.isVideoMuted && <div className={styles.UserVideo} />}
        <video
          autoPlay={props.autoPlay}
          muted={props.isMuted}
          ref={props.videoRef}
          className={cx(styles.UserVideo, props.isVideoMuted && styles.DisplayNone)}
        />

        {props.isVideoMuted && <div className={styles.avatar}>V</div>}
      </div>
      <div className={styles.VideoOptionsDiv}>
        <div className={styles.ActionIconDiv}>
          {props.isVideoMuted ? (
            <FaVideoSlash className={styles.ActionIcon} onClick={unMuteVideo} />
          ) : (
            <FaVideo className={styles.ActionIcon} onClick={muteVideo} />
          )}
        </div>
        <div className={styles.ActionIconDiv}>
          {props.isMuted ? (
            <FaMicrophoneSlash
              className={styles.ActionIcon}
              onClick={unMuteMic}
            />
          ) : (
            <FaMicrophone className={styles.ActionIcon} onClick={muteMic} />
          )}
        </div>
        <div className={styles.ActionIconDiv}>
          {props.isScreenShared ? (
            <MdStopScreenShare
              className={styles.ActionIcon}
              onClick={stopScreenShare}
            />
          ) : (
            <MdScreenShare
              className={styles.ActionIcon}
              onClick={shareScreen}
            />
          )}
        </div>
        <div className={styles.ActionIconDiv}>
          <MdCallEnd className={styles.ActionCallIcon} onClick={endCall} />
        </div>
      </div>
    </div>
  );
};
export default UserVideo;

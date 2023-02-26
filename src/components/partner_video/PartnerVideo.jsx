import React from "react";
import cx from "clsx";
import styles from "./PartnerVideo.module.css";
import { FaMicrophone } from "react-icons/fa";
import { FaMicrophoneSlash } from "react-icons/fa";
import { FaVideo } from "react-icons/fa";
import { FaVideoSlash } from "react-icons/fa";

const ParticipantsVideo = (props) => {
  return (
    <div className={styles.ParticipantsVideoContainer}>
      <div className={styles.ParticipantsVideoDiv}>
        {props.isVideoMuted && <div className={styles.ParticipantsVideo} />}
        <video
          autoPlay={props.autoPlay}
          muted={props.isMuted}
          ref={props.videoRef}
          className={cx(styles.ParticipantsVideo, props.isVideoMuted && styles.DisplayNone)}
        />

        {props.isVideoMuted && <div className={styles.avatar}>S</div>}
      </div>
      <div className={styles.PartnerVideoOptionsDiv}>
        <div className={styles.ActionIconDiv}>
          {props.isVideoMuted ? (
            <FaVideoSlash className={styles.ActionIcon} />
          ) : (
            <FaVideo className={styles.ActionIcon} />
          )}
        </div>
        <div className={styles.ActionIconDiv}>
          {props.isMuted ? (
            <FaMicrophoneSlash className={styles.ActionIcon} />
          ) : (
            <FaMicrophone className={styles.ActionIcon} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantsVideo;

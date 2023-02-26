import React, { useState } from "react";
import styles from "./LandingPage.module.css";
import logo from "../../assets/logo.jpg";
import twoPerson from "../../assets/two-person.png";
import { useHistory } from "react-router";

function LandingPage() {
  const history = useHistory();

  const headerContainer = (
    <div className={styles.HeaderContainer}>
      <img src={logo} alt="app-logo" className={styles.LogoContainer} />
    </div>
  );
  const leftContainer = (
    <div className={styles.LeftContainer}>
      <img src={twoPerson} alt="app-logo" className={styles.TwoPersonImage} />
    </div>
  );
  const rightContainer = (
    <div className={styles.RightContainer}>
      <button
        className={styles.JoinNowButton}
        onClick={() => history.push("/chat/wh-meet-id")}
      >
        Join now
      </button>
    </div>
  );

  return (
    <div>
      {headerContainer}
      <div className={styles.BodyContainer}>
        {leftContainer}
        {rightContainer}
      </div>
    </div>
  );
}

export default LandingPage;

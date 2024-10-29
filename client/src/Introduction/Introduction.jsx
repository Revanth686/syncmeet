import React, { useEffect } from "react";
import "./Introduction.css";
import logo from "../resources/images/logo.png";
import ConnectingButtons from "./ConnectingButtons";

const Introduction = () => {
  return (
    <div className="introduction_page_container">
      <div className="introduction_page_panel">
        <img src={logo} className="introduction_page_image"></img>
        <ConnectingButtons />
      </div>
    </div>
  );
};

export default Introduction;

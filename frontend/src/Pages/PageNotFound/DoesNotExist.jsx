import React from "react";
import "../../Main.css";
import "./PageNotFound.css";

export default function DoesNotExist() {
  return (
    <div className="page-not-found-page">
      <div className="page-not-found-box">
        <img className="page-not-found-logo" src={"././img/searten_logo.jpg"} />
        <p className="default-heading">Does Not Exist</p>
        <p>&nbsp;</p>
        <p className="default-paragraph">
          The item you are trying to open doesn't exist. Please check the
          address and try again.
        </p>
      </div>
    </div>
  );
}

import React from "react";
import "../../Main.css";
import "./PageNotFound.css";

export default function PageNotFound() {
  return (
    <div className="page-not-found-page">
      <div className="page-not-found-box">
        <img className="page-not-found-logo" src={"././img/searten_logo.jpg"} />
        <p className="default-heading">Permission Needed</p>
        <p>&nbsp;</p>
        <p className="default-paragraph">
          You don't have permission to view this item. Please ask for access or
          switch to an account that has access.
        </p>
      </div>
    </div>
  );
}

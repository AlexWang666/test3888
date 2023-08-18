import React from "react";
import "../../Main.css";
import "./PageNotFound.css";

export default function PageNotFound() {
  return (
    <div className="page-not-found-page">
      <div className="page-not-found-box">
        <img className="page-not-found-logo" src={"././img/searten_logo.jpg"} />
        <p className="default-heading">Error 404</p>
        <p>&nbsp;</p>
        <p className="default-paragraph">
          We cannot find the page you are looking for!
          {/* I promise you it worked the last time I checked. */}
        </p>
      </div>
    </div>
  );
}

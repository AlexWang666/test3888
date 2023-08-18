import "./Header.css";
import React from "react";
import Logo from "../../../img/searten_logo.jpg";

export default function Header() {
  return (
    <div className="header">
      <img className="logo" src={Logo} alt="Searten Logo" />

      <h1 className="title">Searten</h1>

      <div className="user-photo"></div>

      <div className="username"></div>
    </div>
  );
}

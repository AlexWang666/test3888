/*
  RESET PASSWORD
  The user resets there password by entering their email.
*/

import "./LoginPage.css";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


export default function ResetPassword() {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [uid, setUid] = useState(-1);
  const [loginStatus, setLoginStatus] = useState("");

  let navigate = useNavigate();

  const [img, setImg] = useState();

  const fetchImage = async () => {
    await fetch("/api/logo")
      .then(response => response.blob())
      .then(imageBlob => setImg(URL.createObjectURL(imageBlob)))
      .catch(err => {
        console.log(err);
        console.log(err.message);
        throw Error(err.message);
      });
  };

  useEffect(() => {
    fetchImage();
  }, []);

  // Checks the email is in the system
  const emailExists = async () => {
    const params = {"email": credentials.email};
    await axios.get("/api/does-email-exist", { params }).then((response) => {
      console.log(response)
      if (response.data.length !== 0) {
        setLoginStatus("Password reset email has been sent.");
        setUid(response.data[0]["uid"]);
        return true;
      } else {
        return false;
      }
    });
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    if (emailExists() === true) {
      // Send email
      setLoginStatus("Password reset email has been sent.");
    } else {
      setLoginStatus("Invalid email.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        {/* <img className="login-logo" src={"../../img/searten_logo.jpg"} /> */}
        <img className="login-logo" src={img} />

        <div className="upper-elements-centered" id="login-text">
          <p className="incorrect-login-text">{loginStatus}</p>
        </div>

        <div className="login-form">
          <div className="login-form">
            <input
              type="text"
              id="Email"
              name="Email"
              className="text-input"
              onChange={(event) => {
                setCredentials({
                  ...credentials,
                  email: event.target.value,
                });
              }}
              placeholder="Email address"
            />
            <br />

            <button
              className="login-button-2"
              text="Login"
              type="submit"
              onClick={handleSubmit}
            >
              Reset
            </button>

            <div className="register-text">
              Remembered your password?&nbsp;
              <button
                className="register-button"
                type="submit"
                onClick={() => {
                  navigate("/login", { replace: true });
                }}
              >
                Login here.
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

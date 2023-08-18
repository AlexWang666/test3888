/*
  LOGIN FORM
  The place where the user types their login details.
*/

import "./LoginForm.css";
import axios from "axios";
import React, { useState } from "react";
import Button from "../../BasicComponents/Button";
import { useNavigate } from "react-router-dom";

const validateEmail = (email) => {
  /*
   * Uses regex to check if an email is of a valid format.
   *
   * @param {String} email The email entered by the user
   * @return {Array}       An array with the regex matches. Else, null.
   */

  return email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/);
};

export default function LoginForm({
  setUserId,
  setFirstName,
  setLastName,
  setAccessToken,
}) {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const [loginStatus, setLoginStatus] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validateEmail(credentials.email)) {
      setLoginStatus("");

      axios
        .post("/api/login", credentials)
        .then((response) => {
          if (response?.data["status"] == 1) {
            setUserId(response?.data["id"]);
            setFirstName(response?.data["first_name"]);
            setLastName(response?.data["last_name"]);
            setAccessToken(response?.data["access_token"]);
            localStorage.setItem("accessToken", response?.data["access_token"]);
            navigate("/projects");
            window.location.reload();
          } else {
            setLoginStatus(response?.data["message"]);
            // Inform user email/password combo doesn't exist
            //setLoginStatus("The login details were incorrect.");
          }
        })
        .catch((e) => {
          console.log(e);
          setLoginStatus("A server error occurred.");
        });
    } else {
      // Inform user email not of correct format
      setLoginStatus("The login details were incorrect.");
    }
  };

  return (
    <>
      <div className="upper-elements-centered" id="login-text">
        <p className="incorrect-login-text">{loginStatus}</p>
      </div>

      <div className="login-form">
        <form onSubmit={handleSubmit} className="login-form">
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
          <input
            type="password"
            id="password"
            name="password"
            className="text-input"
            onChange={(event) => {
              setCredentials({
                ...credentials,
                password: event.target.value,
              });
            }}
            placeholder="Password"
          />

          <br />

          <button
            className="login-button-2"
            text="Login"
            type="submit"
            onClick={handleSubmit}
          >
            Log in
          </button>

          <div className="register-text">
            Forgot password?&nbsp;
            <button
              className="register-button"
              type="submit"
              onClick={() => {
                navigate("/reset-password");
              }}
            >
              Reset.
            </button>
          </div>

          <div className="register-text">
            Don't have an account?&nbsp;
            <button
              className="register-button"
              type="submit"
              onClick={() => {
                navigate("/register", { replace: true });
              }}
            >
              Register here.
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

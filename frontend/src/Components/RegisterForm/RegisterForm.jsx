import "../LoginForm/LoginForm.css";
import { Select } from "antd";
import axios from "axios";
import React, { useState } from "react";
import Button from "../../BasicComponents/Button";
import { useNavigate } from "react-router-dom";
import { message } from "antd";

const validateEmail = (email) => {
  /*
   * Uses regex to check if an email is of a valid format.
   *
   * @param {String} email The email entered by the user
   * @return {Array}       An array with the regex matches. Else, null.
   */

  return email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/);
};

export default function RegisterForm({ setUserId, setFirstName, setLastName }) {
  const [messageApi, contextHolder] = message.useMessage();
  const [credentials, setCredentials] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    org_id: null,
  });

  const [registerStatus, setRegisterStatus] = useState("");
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validateEmail(credentials.email)) {
      axios
        .post("/api/register", credentials)
        .then((response) => {
          if (response) {
            // setRegisterStatus(response?.data["msg"]);
            setCredentials({
              first_name: "",
              last_name: "",
              email: "",
              password: "",
              org_id: null,
            });
            messageApi.success("Successfully registered, please login");
          } else {
            messageApi.error("Something went wrong, please try again");
          }
        })
        .catch((error) => {
          messageApi.error("Something went wrong, please try again");
        });
    } else {
      // Use <small> to inform user email not of correct format
      // setRegisterStatus("Email is not of the correct format.");
      messageApi.error("Email is not of the correct format");
    }
  };

  const fetch = async (newValue, callback) => {
    let res = await axios.get(
      `/api/search/organization?query=${newValue}&limit=10`
    );
    setData(res.data.data);
  };

  const handleSearch = (newValue) => {
    fetch(newValue, setData);
  };

  const handleChange = (newValue) => {
    setCredentials({
      ...credentials,
      org_id: newValue,
    });
  };

  return (
    <>
      <div className="upper-elements-centered" id="login-text">
        <p className="incorrect-login-text">{registerStatus}</p>
      </div>

      <div className="login-form">
        {contextHolder}
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            id="Fname"
            name="Fname"
            className="text-input"
            value={credentials.first_name}
            onChange={(event) => {
              setCredentials({
                ...credentials,
                first_name: event.target.value,
              });
            }}
            placeholder="First name"
          />
          <input
            type="text"
            id="Lname"
            name="Lname"
            className="text-input"
            value={credentials.last_name}
            onChange={(event) => {
              setCredentials({
                ...credentials,
                last_name: event.target.value,
              });
            }}
            placeholder="Last name"
          />
          <input
            type="text"
            id="Email"
            name="Email"
            className="text-input"
            value={credentials.email}
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
            value={credentials.password}
            onChange={(event) => {
              setCredentials({
                ...credentials,
                password: event.target.value,
              });
            }}
            placeholder="Password"
          />
          <Select
            showSearch
            value={credentials.org_id}
            defaultActiveFirstOption={false}
            showArrow={false}
            filterOption={false}
            onSearch={handleSearch}
            onChange={handleChange}
            notFoundContent={null}
            options={(data || []).map((d) => ({
              value: d.id,
              label: d.name,
            }))}
            placeholder="Select Organisation"
            style={{ width: 192, marginLeft: 7 }}
          />

          <br />

          <button
            className="login-button-2"
            text="Login"
            type="submit"
            onClick={handleSubmit}
          >
            Register
          </button>

          <div className="register-text">
            Already have an account?&nbsp;
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
        </form>
      </div>
    </>
  );
}

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { extractCSRFRefreshToken } from "../../BasicComponents/Cookie";

import "../../Main.css";
import "./Profile.css";

// import Button from "../../BasicComponents/Button";
import ProfileInformation from "../../Components/ProfileComponents/ProfileInformation";
import SearchBar from "../../Components/SearchComponents/SearchBar";
import { Button, Typography } from "antd";
import axios from "axios";
import { decodeToken } from "react-jwt";

const { Paragraph, Title } = Typography;

export default function Profile({
  userId,
  firstName,
  lastName,
  setAccessToken,
}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setAccessToken(null);

    // These two lines are causing an error on logout, preventing the page from refreshing
    // Are these necessary?
    //var headers = { "X-CSRF-TOKEN": extractCSRFRefreshToken() };
    //axios.post("/api/logout", {}, { headers: headers }).then((response) => {});

    navigate("/login");
    window.location.reload();
  };

  // Gets the user id for use everywhere on the page
  const getUserId = () => {
    const token = localStorage.getItem("accessToken");
    var decodedAccessToken = decodeToken(token);
    var user = decodedAccessToken["sub"]["id"];

    return user;
  };
  userId = getUserId();

  const [profileInfo, setProfileInfo] = useState({
    bio: "",
    education: "",
    link: "",
    org_id: "",
    org_name: "",
  });

  // Gets the user's profile info based on their id
  useEffect(() => {
    const getCurrentUserProfileInfo = async () => {
      userId = getUserId();
      const params = { uid: userId };
      await axios
        .get("/api/get-current-user-info", { params })
        .then((response) => {
          setProfileInfo(response.data.data[0]);
        });
    };
    getCurrentUserProfileInfo();
  }, []);

  // PROFILE EDITING FUNCTIONALITY
  const [editing, setEditing] = useState(false);
  const toggleEdit = () => {
    // Changes between edit and save mode
    if (editing === false) {
      setEditing(true);
    } else {
      // Pushes the user's changes to the backend
      const params = { uid: userId, profileInfo };
      axios.post("/api/add-current-user-profile-info", { params });

      setEditing(false);
    }
  };

  let editSaveButton = <p></p>;
  if (editing === true) {
    // Switches the button
    editSaveButton = (
      // <div className="default-button" id="align-right" onClick={toggleEdit}>
      <Button onClick={toggleEdit}> Save Edits</Button>
      // </div>
    );
  } else {
    editSaveButton = (
      // <div className="default-button" id="align-right" onClick={toggleEdit}>
      <Button onClick={toggleEdit}> Edit Profile</Button>

      // </div>
    );
  }

  const saveEdits = (edits) => {
    setProfileInfo(edits);
  };

  return (
    <div className="projects-page">
      <div className="upper-elements">
        {/* <h1 className="default-heading">Profile</h1> */}
        <Title level={3}>Profile</Title>

        <SearchBar />
      </div>

      <p>&nbsp;</p>

      <div className="upper-elements-centred">
        <div className="profile-picture" id="author-marketplace-pfp"></div>

        {/* <p className="default-heading-4">
          {firstName} {lastName}
        </p> */}
        <Paragraph>
          {" "}
          {firstName} {lastName}{" "}
        </Paragraph>
        {/* <p>&nbsp;&nbsp; Current Affiliated Uni</p> */}

        <div className="profile-top-buttons" id="align-right">
          {editSaveButton}

          {/* <div
            className="default-button-4"
            id="align-right"
            onClick={handleLogout}
          >
            Logout
          </div> */}
          <Button
            onClick={handleLogout}
            type="primary"
            style={{ marginLeft: 10 }}
          >
            Logout
          </Button>
        </div>
      </div>

      <p>&nbsp;</p>

      <ProfileInformation
        profileInfo={profileInfo}
        editing={editing}
        saveEdits={saveEdits}
      />
    </div>
  );
}

/* PROFILE OTHER PAGE */
/*
   Displays the profile of a different user to oneself.
*/

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import "../../Main.css";
import "./Profile.css";

import ActiveProjects from "../../Components/ProjectLists/ActiveProjects";
import { GetUserId } from "../../BasicComponents/GenericFunctions";
import ProfileInformation from "../../Components/ProfileComponents/ProfileInformation";
import SearchBar from "../../Components/SearchComponents/SearchBar";

import axios from "axios";

export default function ProfileOther() {

  const { state } = useLocation();
  const { userId } = state || {};

  const [currentUser, setCurrentUser] = useState(GetUserId());
  const [profileName, setProfileName] = useState({firstname: "", lastname: ""});
  const [profileInfo, setProfileInfo] = useState({
    bio: "",
    education: "",
    link: "",
  });
  const [projectList, setProjectList] = useState([]);


  useEffect(() => {
    // Gets the user's profile info based on their id
    const getCurrentUserProfileInfo = async () => {
      const params = {"uid": userId};
      await axios.get("/api/get-user-name", {params}).then((response) => {
        setProfileName(response.data[0]);
      });
      await axios.get("/api/get-current-user-info", {params}).then((response) => {
        setProfileInfo(response.data[0]);
      });
    }

    // Gets the list of public projects for the user you are viewing
    const getCurrentUserActiveProjects = async () => {
      const params = {"uid": userId};
      await axios.get("/api/get-public-projects", {params}).then((response) => {
        setProjectList(response.data);
      });
    }

    getCurrentUserProfileInfo();
    getCurrentUserActiveProjects();
  }, []);


  let navigate = useNavigate();

  const goToChat = () => {
    var current = new Date();
    const params = {"uid": currentUser, "friend": userId,
    "name": profileName.firstname + ' ' + profileName.lastname,
    "date": current};

    axios.post("/api/create-chat-with-user", {params}).then((response) => { });

    navigate("/chat");
  }

  const saveEdits = () => {
    // Do nothing
  }

  // Called when the user clicks on a particular project icon
  const goToProjectDesc = (clickid) => {
    navigate("/project-description",
      {state: {"projid": clickid, "type": "project"}});
  }

  return (
    <div className="projects-page">
      <div className="upper-elements">
        <h1 className="default-heading">Profile</h1>

        <SearchBar />
      </div>

      <p>&nbsp;</p>

      <div className="upper-elements-centred">
         <div className="profile-picture" id="author-marketplace-pfp">
         </div>

          <p className="default-heading-4">
            {profileName.firstname}&nbsp;{profileName.lastname}
          </p>
         <p>&nbsp;&nbsp; Current Affiliated Uni</p>

         <div className="profile-top-buttons" id="align-right">
           <div className="default-button" id="align-right" onClick={goToChat}>
              Chat
           </div>
         </div>
      </div>

      <p>&nbsp;</p>

      <ProfileInformation
        profileInfo={profileInfo}
        editing={false}
        saveEdits={saveEdits}
      />

      <p>&nbsp;</p>
      <div className="default-heading-2">
        Current Projects
      </div>

      <ActiveProjects
        activeProjectsList={projectList}
        goToProject={goToProjectDesc}
      />

    </div>
  );

}

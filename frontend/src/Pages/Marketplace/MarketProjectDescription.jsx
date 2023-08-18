/* MARKET PROJECT DESCRIPTION */
/*
   A description of the project clicked on in the marketplace.
*/

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

import "../../Main.css";

import ProjectDescription from "../../Components/MarketplaceComponents/ProjectDescription";
import SearchBar from "../../Components/SearchComponents/SearchBar";

export default function MarketProjectDescription() {
  const { state } = useLocation();
  const { projid } = state || {};

  const [projectInfo, setProjectInfo] = useState([]);
  const [projectDetails, setProjectDetails] = useState([]);
  const [numTeamMembers, setNumTeamMembers] = useState(0);

  useEffect (() => {
    const getProjectInfo = async () => {
      const params = {"projid": projid}

      await axios.get("/api/get-project-basic-info", {params}).then((response) => {
        setProjectInfo(response.data[0]);
      });

      await axios.get("/api/get-project-details", {params}).then((response) => {
        setProjectDetails(response.data[0]);
      });

      await axios.get("/api/get-num-team-members", {params}).then((response) => {
        setNumTeamMembers(response.data[0]);
      });
    }

    getProjectInfo();
  }, []);

  const getProjDate = (projDate) => {
    if (typeof(projDate) !== 'undefined') {
      let words = projDate.split(' ');
      let dateOnly = words[1]+' '+words[2]+' '+words[3];
      return dateOnly;
    }
  };

  // Navigation functions
  let navigate = useNavigate();

  // Called after viewing the members
  const goToMembers = () => {
    navigate("/project-members", {state: {"projid": projid}});
  }

  // Called after clicking "contact"
  const goToChat = () => {
    navigate("/chat");
  }

  // Called after clicking the author's name
  const goToPerson = (author_id) => {
    navigate("/profile-other", {state: {"userId": author_id}});
  }

  return (
    <div className="projects-page">

      <div className="upper-elements">
         <h1 className="default-heading">{projectInfo.name}</h1>

         <SearchBar />
      </div>

      <p>&nbsp;</p>

      <div className="upper-elements-centred">
        <div className="profile-picture" id="author-marketplace-pfp">
        </div>

        <p className="default-paragraph-5">Created by&nbsp;</p>
        <p className="default-paragraph-5" id="link"
            onClick={() => goToPerson(projectInfo.author_id)}>
            {projectInfo.author}
        </p>
        <p>&nbsp;&nbsp; {getProjDate(projectInfo.date)}</p>

         <div className="button-bois" id="align-right">
            <div className="default-button" id="align-right"
              onClick={goToMembers}>
               {numTeamMembers.num} Members
            </div>

            <div className="default-button" id="align-right"
              onClick={goToChat}>
               Contact
            </div>

            <div className="default-button-4" id="align-right">
               $ FUND
            </div>
         </div>
      </div>

      <p>&nbsp;</p>

      <ProjectDescription
        projectDetails={projectDetails}
      />

    </div>
  );
}

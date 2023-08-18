/* PLANNER SELECT PAGE */
/*
   A list of the user's projects to view the planner for that project.
*/

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { decodeToken } from "react-jwt";
import axios from "axios";
import "../../Main.css";

import ActiveProjects from "../../Components/ProjectLists/ActiveProjects";
import SearchBar from "../../Components/SearchComponents/SearchBar";

export default function PlannerSelect() {
  const [projectsList, setProjectsList] = useState([]);
  useEffect(() => {
    const getProjects = async () => {
      const token = localStorage.getItem("accessToken");
      var decodedAccessToken = decodeToken(token);
      var user = decodedAccessToken["sub"]["id"];
      const params = { uid: user };
      await axios.get("/api/get-projects", { params }).then((response) => {
        setProjectsList(response.data.data);
      });
    };

    getProjects();
  }, []);

  // Navigation functions
  let navigate = useNavigate();

  const goToPlanner = (projid) => {
    navigate("/project-planner", { state: { projid: projid } });
  };

  return (
    <div className="projects-page">
      <div className="upper-elements">
        <h1 className="default-heading">View a Planner</h1>
        <SearchBar />
      </div>

      <p>&nbsp;</p>

      <ActiveProjects
        activeProjectsList={projectsList}
        goToProject={goToPlanner}
      />
    </div>
  );
}

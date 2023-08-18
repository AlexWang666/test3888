/* BUDGET PAGE */
/*
  The list of categories and budget items
*/

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import "../../Main.css"

import { GetUserId } from "../../BasicComponents/GenericFunctions";
import SearchBar from "../../Components/SearchComponents/SearchBar";

export default function Insights() {
  const { state } = useLocation();
  const { projid } = state || {};

  const [currentUser, setCurrentUser] = useState(GetUserId());
  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    let params = {"projid": projid};
    const getProjectName = async () => {
      await axios.get("/api/get-project-name", {params}).then((response) => {
        setProjectName(response.data[0]);
      });
    }

    getProjectName();
  }, []);


  // Navigation functions
  let navigate = useNavigate();

  const goToBudget = () => {
    navigate("/budget", {state: {projid: projid} });
  }

  const goToProject = () => {
    navigate("/dashboard", {state: {projid: projid}});
  }


  return (
    <div className="projects-page">

      <div className="upper-elements">
        <h1 className="default-heading"
          id="link"
          onClick={goToProject}>
          {projectName.name}
        </h1>
        <h1 className="default-heading">
          &nbsp;- Budget Insights
        </h1>

        <SearchBar />
      </div>

      <div className="upper-elements">
        <button className="default-button-3"
          id="member-display-button"
          onClick={goToBudget}>
            Table
        </button>

        <button className="default-button-2"
          id="member-display-button-2">
            Insights
        </button>
      </div>

    </div>
  );
}

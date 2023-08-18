/* MARKETPLACE HOME PAGE */
/*
   A feed of all the projects in the marketplace.
*/

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "../../Main.css"
import "./MarketplacePage.css"

import ProjectBoxes from "../../Components/MarketplaceComponents/ProjectBoxes";
import SearchBar from "../../Components/SearchComponents/SearchBar";

export default function MarketplaceHome() {

  const [allProjects, setAllProjects] = useState([]);
  useEffect(() => {
    const getAllProjects = async () => {
      await axios.get("/api/get-all-projects").then((response) => {
        setAllProjects(response.data);
      });
    }

    getAllProjects();
  }, []);

  // Navigation functions
  let navigate = useNavigate();

  // Called when the user clicks on a particular project icon
  const goToProjectDesc = (clickid) => {
    navigate("/project-description", {state: {"projid": clickid}});
  }

  return (
    <div className="projects-page">
      <div className="upper-elements">
        <h1 className="default-heading">Marketplace</h1>

        <SearchBar />
      </div>

      <ProjectBoxes
        projectsList={allProjects}
        goToProjectDesc={goToProjectDesc}
      />
    </div>
  );
}

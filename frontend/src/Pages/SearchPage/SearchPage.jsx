/* SEARCH PAGE */
/*
   A page displaying all search results.
*/

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import "../../Main.css";

import ProjectBoxes from "../../Components/MarketplaceComponents/ProjectBoxes";
import PeopleSearchResults from "../../Components/SearchComponents/PeopleSearchResults";
import SearchBar from "../../Components/SearchComponents/SearchBar";

export default function SearchPage() {

  const { state } = useLocation();
  const { search_query } = state || {};

  const [projectsResults, setProjectsResults] = useState([]);
  const [peopleResults, setPeopleResults] = useState([]);

  useEffect(() => {
  const params = {"search_query": search_query};

  // Gets the search results for the projects
  const getProjectSearchResults = async () => {
    await axios.get("/api/search-for-projects", {params}).then((response) => {
      setProjectsResults(response.data);
    });
  }

  // Gets the search results for the people
  const getPeopleSearchResults = async () => {
    await axios.get("/api/search-for-people", {params}).then((response) => {
      setPeopleResults(response.data);
    });
  }

  getProjectSearchResults();
  getPeopleSearchResults();
  }, []);


  // Navigation functions
  let navigate = useNavigate();

  // Called when the user clicks on a particular project icon
  const goToProjectDesc = (clickid, type) => {
    navigate("/project-description", {state: {"projid": clickid}});
  }

  // Called when the user clicks on a Searten user
  const goToProfile = (clickid) => {
    navigate("/profile-other", {state: {"userId": clickid}});
  }


  return (
    <div className="projects-page">

      <div className="upper-elements">
        <h1 className="default-heading">Search Results</h1>

        <SearchBar
          isSearchPage={true} />
      </div>

      <p>&nbsp;</p>
      <h2 className="default-heading-2">
        Projects and Projects
      </h2>
      <ProjectBoxes
        projectsList={projectsResults}
        goToProjectDesc={goToProjectDesc}
      />

      <p>&nbsp;</p>
      <h2 className="default-heading-2">
        Users
      </h2>
      <PeopleSearchResults
        peopleList={peopleResults}
        goToProfile={goToProfile}
      />

    </div>
  );
}

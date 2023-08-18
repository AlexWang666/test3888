/* PROJECT DATA FILES PAGE */
/*
   Information about the project's files.
*/

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

import "../../Main.css"

import DataFilesTable from "../../Components/ProgramDataComponents/DataFilesTable"
import DataFilesSearch from "../../Components/ProgramDataComponents/DataFilesSearch"
import SearchBar from "../../Components/SearchComponents/SearchBar";

export default function ProgramFiles() {

  // Hardcoded values
  const filesList = [
   {id: 0, fileName: "Team Information", numCollaborators: 12, createDate: "18th May, 2020"},
   {id: 1, fileName: "Budget and Expenditure", numCollaborators: 4, createDate: "11th December, 2021"},
   {id: 2, fileName: "Partners", numCollaborators: 6, createDate: "14th November, 2021"},
   {id: 3, fileName: "Publications", numCollaborators: 8, createDate: "6th January, 2022"}
  ];

  const {state} = useLocation();
  const {progid} = state || {};
  // Navigation functions
  let navigate = useNavigate();
  const goToData = () => {
    navigate("/program-data", {state:{"progid": progid}});
  }

  // Called after clicking the Projects top right button
  const goToProjectList = () => {
    navigate("/projects-in-program", {state:{"progid": progid}});
  }

    return (
        <div className="projects-page">

            <div className="upper-elements">
              <h1 className="default-heading">
                Searten Research Platform - Files
              </h1>

               <SearchBar />
            </div>

            <div className="upper-elements">
              <button className="default-button-3" id="member-display-button"
               onClick={goToData}>
                 Dashboard
              </button>

              <button className="default-button-2" id="member-display-button-2">
                 Files
              </button>

              <button className="default-button-3" id="member-display-button-2"
                onClick={goToProjectList}>
                Projects
              </button>
            </div>

            <DataFilesSearch />

            <DataFilesTable
               filesList={filesList}
            />

        </div>
    );
}

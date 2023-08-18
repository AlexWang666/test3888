/* DRIVE NAVIGATION PAGE */
/*
   A table showing subfolders and files.
   Clicking on a file or folder repeats the instance of this page
   and displays the new subfolders.
*/

import React from "react";
import { useNavigate } from "react-router-dom";
import "../../Main.css";

import SubfoldersFilesTable from "../../Components/DriveComponents/SubfoldersFilesTable";
import DriveNavigationChain from "../../Components/DriveComponents/DriveNavigationChain";
import SearchBar from "../../Components/SearchComponents/SearchBar";

//constants
const URL_PARAMS = new URLSearchParams(window.location.search);

export default function DriveNavigation() {
  // Hardcoded values
  const folderFilesList = [
    { id: 0, name: "Projects" },
    { id: 1, name: "Test Bio" },
  ];

  const subfoldersList = [
    {
      id: 0,
      name: "Experiment 1",
      type: "sheet",
      numCollaborators: 12,
      lastEdited: "22-05-2022",
    },
    {
      id: 1,
      name: "Results",
      type: "doc",
      numCollaborators: 12,
      lastEdited: "22-05-2022",
    },
    {
      id: 2,
      name: "Milestone Report",
      type: "doc",
      numCollaborators: 12,
      lastEdited: "22-05-2022",
    },
    {
      id: 3,
      name: "Project Admin",
      type: "folder",
      numCollaborators: 12,
      lastEdited: "22-05-2022",
    },
    {
      id: 4,
      name: "Project Plan",
      type: "doc",
      numCollaborators: 12,
      lastEdited: "22-05-2022",
    },
    {
      id: 5,
      name: "Budget",
      type: "sheet",
      numCollaborators: 12,
      lastEdited: "22-05-2022",
    },
    {
      id: 6,
      name: "Research Projects",
      type: "folder",
      numCollaborators: 12,
      lastEdited: "22-05-2022",
    },
  ];

  // Navigation functions
  let navigate = useNavigate();

  const goToFolder = () => {
    navigate("/drive-navigate");
  };

  return (
    <div className="projects-page">
      <div className="upper-elements">
        <h1 className="default-heading">Drive</h1>

        <SearchBar />
      </div>

      <p>&nbsp;</p>

      <div className="upper-elements">
        <DriveNavigationChain folderFilesList={folderFilesList} />

        <button className="default-button" id="align-right">
          + Create
        </button>
      </div>

      <SubfoldersFilesTable
        subfoldersList={subfoldersList}
        goToFolder={goToFolder}
      />
    </div>
  );
}

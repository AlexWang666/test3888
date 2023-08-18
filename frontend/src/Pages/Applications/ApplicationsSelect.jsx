/* APPLICATIONS SELECT PAGE */
/*
   A list of the user's programs to view the application for that program.
*/

import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { decodeToken } from "react-jwt";
import axios from "axios";
import "../../Main.css"

import ApplicationTables from "../../Components/ApplicationsComponents/ApplicationTables";
import SearchBar from "../../Components/SearchComponents/SearchBar";

export default function ApplicationSelect() {

  // Hardcoded values
  const notStarted = [
    {id: 0, name: "Test Bio", status: "Not Started"},
  ]

  const inProgress = [
    {id: 0, name: "Robotics", status: "Pre Approval"},
    {id: 1, name: "Solve World Hunger", status: "Review Awards"},
    {id: 2, name: "Another Program", status: "Sign Contract"},
  ]

  const completed = [
    {id: 0, name: "Prosthetics", status: "Completed 23/08/2021"},
  ]

  // Navigation functions
  let navigate = useNavigate();

  const goToApplication = () => {
    navigate("/application-details");
  }

    return (
        <div className="projects-page">

            <div className="upper-elements">
               <h1 className="default-heading">My Applications</h1>

               <SearchBar />
            </div>

            <p>&nbsp;&nbsp;</p>

            <p className="default-heading-2">Not Started</p>
            <ApplicationTables
              applicationType={"notStarted"}
              programList={notStarted}
              goToApplication={goToApplication}
            />

            <p>&nbsp;&nbsp;</p>

            <p className="default-heading-2">In Progress</p>
            <ApplicationTables
              applicationType={"inProgress"}
              programList={inProgress}
              goToApplication={goToApplication}
            />

            <p>&nbsp;&nbsp;</p>

            <p className="default-heading-2">Completed</p>
            <ApplicationTables
              applicationType={"completed"}
              programList={completed}
              goToApplication={goToApplication}
            />

        </div>
    );
}

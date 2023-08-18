/* PROJECT DATA DATA PAGE */
/*
   The project data.
*/

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import "../../Main.css"

import ProjectCompletionBar from "../../Components/ProjectTables/ProjectCompletionBar";
import ProjectDataTeam from "../../Components/ProgramDataComponents/ProjectDataTeam";
import ProjectDataBudget from "../../Components/ProgramDataComponents/ProjectDataBudget";
import ProjectDataOutcomes from "../../Components/ProgramDataComponents/ProjectDataOutcomes";
import ProgramDescription from "../../Components/MarketplaceComponents/ProjectDescription";
import SearchBar from "../../Components/SearchComponents/SearchBar";

export default function ProgramData() {
  const { state } = useLocation();
  const { progid } = state || {};

  const cashMoney = [
    {id: 0, institution: "ARC", cash: 1000000, inKind: 0},
    {id: 1, institution: "USYD", cash: 100000, inKind: 300000},
    {id: 2, institution: "UTS", cash: 100000, inKind: 300000},
    {id: 3, institution: "AMPC", cash: 300000, inKind: 100000}
  ];


  const [programName, setProgramName] = useState("");
  const [programTopInfo, setProgramTopInfo] = useState({});
  const [programMembers, setProgramMembers] = useState([]);
  const [projectCompletion, setProjectCompletion] = useState({});

  useEffect(() => {
   const params = {"progid": progid};

   const getProgramName = async () => {
     await axios.get("/api/get-program-name", {params}).then((response) => {
       setProgramName(response.data[0]);
     });
   }

   const getProgramTopInfo = async () => {
     await axios.get("/api/get-program-top-info", {params}).then((response) => {
       setProgramTopInfo(response.data[0]);
     });
   }

   const getProgramMembers = async () => {
     await axios.get("/api/get-program-members", {params}).then((response) => {
       setProgramMembers(response.data);
     });
   }

   const getProjectCompletion = async () => {
     await axios.get("/api/get-project-completion", {params}).then((response) => {
       setProjectCompletion(response.data[0]);
     });
   }

   getProgramName();
   getProgramTopInfo();
   getProgramMembers();
   getProjectCompletion();
  }, []);

  // Navigation functions
  let navigate = useNavigate();

  // Called after clicking the Projects top right button
  const goToProjectList = () => {
   navigate("/projects-in-program", {state: {"progid":progid}});
  }

  /* FEATURE INCOMPLETE
  // Called after clicking the Files top right button
  const goToFiles = () => {
   navigate("/program-files", {state: {"progid":progid}});
  }
  */

  // Called when the planner widget is clicked on
  const goToPlanner = () => {
   navigate("/program-planner", {state: {"progid":progid}});
  }

  const goToTeam = () => {
   navigate("/program-members", {state: {"progid":progid}});
  }


  return (
    <div className="projects-page">

      <div className="upper-elements">
        <h1 className="default-heading">
          {programName.name} - Dashboard
        </h1>

         <SearchBar />
      </div>

      <div className="upper-elements">
        <button className="default-button-2" id="member-display-button">
          Dashboard
        </button>

        <button className="default-button-3" id="member-display-button-2"
          onClick={goToProjectList}>
          Projects
        </button>
      </div>

      <p>&nbsp;</p>

      <ProgramDescription
        programDetails={programTopInfo}
      />

      <div className="boxes-holder">
        <ProjectCompletionBar
            projectCompletion={projectCompletion}
            goToData={goToPlanner}
        />

        <ProjectDataTeam
          membersList={programMembers}
          goToTeam={goToTeam}
        />
      </div>
    </div>
  );
}

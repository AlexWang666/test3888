/* APPLICATION DETAILS PAGE */
/*
   The ARC application details for the selected program.
*/

import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { decodeToken } from "react-jwt";
import axios from "axios";
import "../../Main.css"

import ApplicationInformation from "../../Components/ApplicationsComponents/ApplicationInformation";
import SearchBar from "../../Components/SearchComponents/SearchBar";

export default function ApplicationDetails() {

  // Hardcoded values
  const applicationInfo = {
    description: "This is a short description of the project yeah. Anyway I am actually pretty hungry.",
    members: 12,
    documents: [
      {id: 0, name: "application.docx"}, {id: 1, name: "slides.pptx"}
    ]
  }

  // Navigation functions
  let navigate = useNavigate();

  const openApplication = () => {
    console.log("TODO: Make this open the application doc");
  }

    return (
        <div className="projects-page">

            <div className="upper-elements-centred">
               <h1 className="default-heading">Program Name</h1>

               <SearchBar />
            </div>

            <div className="upper-elements-centred">
               <p>Australian Research Council Linkage</p>

               <p className="default-paragraph-5" id="align-right">Due 23/08/2021</p>
            </div>

            <p>&nbsp;&nbsp;</p>

            <p className="default-heading-2">Application Information</p>
            <ApplicationInformation
              applicationInformation={applicationInfo}
              openApplication={openApplication}
            />

            <p>&nbsp;&nbsp;</p>

            <p className="default-heading-2">Pre-Award Approvals</p>

        </div>
    );
}

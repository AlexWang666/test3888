/*
  PROGRAM DESCRIPTION
  Used on the page after you click a project in the marketplace.
  Also displayed on the project dashboard.
*/

import React from 'react';
import axios from 'axios';

import "../../Main.css";
import "./Marketplace.css";
import "../../Pages/Marketplace/MarketplacePage.css";

export default function ProjectDescription({ projectDetails,
  showComplete=false }) {
  // projectInfo: Information about a project
  // - funded: Amount raised
  // - budget: Project budget
  // - shortdesc: The short description
  // - longdesc: The long description
  // - completed: Whether or not it has been completed
  // - type: The type of thing (project or project)

  // showComplete: When set to true, shows the mark as completed button

  // Sets the thing as complete or not in the backend
  const onComplete = async (id, type) => {
    const params = {pid: id};
    await axios.post("/api/toggle-completion-of-project", {params});
  }

  let completedButton = <p></p>;
  if (showComplete === true) {
    completedButton = (
      <div className="upper-elements-centred">
        <p className="default-heading-3">
          Completed:
        </p>

        <input
          type="checkbox"
          className="task-checkbox"
          defaultChecked={projectDetails.completed}
          onClick={()=>onComplete(projectDetails.id, projectDetails.type)}>
        </input>
      </div>
    );
  }

  return (
    <div className="marketplace-project-desc">

      <p className="default-heading-3">
        Funding
      </p>

      <div className="upper-elements-centred">
        <progress className="default-progress-bar"
                 id="marketplace-progress"
                 value={10}
                 max={100} />
        <p className="default-paragraph-5">
           ${projectDetails.funded} / ${projectDetails.budget} raised.
        </p>
      </div>

      <p>&nbsp;</p>

      <p className="default-heading-3">
        Short Description
      </p>
      <p>
        {projectDetails.shortdesc}
      </p>

      <p>&nbsp;</p>

      <p className="default-heading-3">
        Long Description
      </p>
      <p>
        {projectDetails.longdesc}
      </p>

      <p>&nbsp;</p>

      {completedButton}

    </div>
  );
}

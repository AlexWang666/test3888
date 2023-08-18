/*
  PROJECT BOXES
  The preview of a project / grant in the marketplace.
*/

import React from 'react'

import "../../Main.css";
import "./Marketplace.css"

export default function ProjectBoxes({ projectsList, goToProjectDesc }) {
  // projectsList: The list of projects to be displayed in the market
  // - name: Title
  // - type: Type
  // - author: Author
  // - pfp: Author profile picture
  // - budget: Money
  // - image: Project picture
  // - shortdesc: Short description

  // goToProjectDesc: Takes the user to the description of the project.

  return (
    <div className="boxes-holder">
      {projectsList.map((projectInfo) => (

        <div key={projectInfo.id}
          className="marketplace-box-rectangle"
          onClick={() => goToProjectDesc(projectInfo.id, projectInfo.type)}>
          <div className="upper-elements">
            <p className="project-name">{projectInfo.name}</p>

            <div className="project-type-icon" id={projectInfo.type+"-type"}>
              <p>{projectInfo.type.toUpperCase()}</p>
            </div>
          </div>

          <div className="upper-elements-centred">
            <div className="profile-picture" id="marketplace-pfp">
              {projectInfo.pfp}
            </div>
            <p className="marketplace-author-name">
              {projectInfo.author}
            </p>
            <p className="project-name" id="align-right">
              ${projectInfo.budget}
            </p>
          </div>

          <div className="upper-elements">
            <div className="project-box-picture">
              {projectInfo.image}
            </div>
          </div>

          <div className="upper-elements">
            <p className="marketplace-box-paragraph">
              {projectInfo.shortdesc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

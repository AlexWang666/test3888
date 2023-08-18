/*
  APPLICATION TABLES
  The list of programs and their application status.
*/

import React from "react";

import "./ApplicationComponents.css";
import "../../Main.css";

export default function ApplicationTables({
  applicationType,
  programList,
  goToApplication,
}) {
  // applicationType: Whether the application is "notStarted", "inProgress" or
  // "completed"

  // programList: The list of programs and applications for the current user
  // - name: Program title
  // - status: Current stage of the application; If completed, this is the
  // completion date

  // - goToApplication: The function called on clicking the row to take you to the
  // application dashboard

  let actionButton = <p></p>;
  if (applicationType === "notStarted") {
    actionButton = <p>Start Application </p>;
  } else {
    actionButton = <p>View Application </p>;
  }

  return (
    <div className="projects-div">
      <table className="default-table" id="clickable-table">
        <tbody>
          <tr>
            <td id="profile-pic-column"></td>
            <td>Program</td>
            <td>Current Stage</td>
            <td>Action</td>
          </tr>

          {programList.map((program) => (
            <tr key={program.id} onClick={() => goToApplication(program.id)}>
              <td>
                <div className="profile-picture"></div>
              </td>

              <th>{program.name}</th>
              <td>{program.status}</td>
              <td>{actionButton}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

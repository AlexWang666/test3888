/*
  APPLICATION INFORMATION
  The program pitch and members.
*/


import React from 'react'

import "./ApplicationComponents.css";
import "../../Main.css";

export default function ApplicationInformation({ applicationInformation, openApplication }) {

  // applicationInformation: The list of info about an application
  // - description: Self-explanatory
  // - members: The number of team members
  // - documents: The list of document names

  // - openApplication: The function to actually open the application document

    return (
        <div className="projects-div">
            <table className="default-table">
                <tbody>

                <tr>
                  <td className="header-datum-applications">
                    <p className="default-paragraph-4">Description</p>
                  </td>
                  <td>{applicationInformation.description}</td>
                </tr>

                <tr>
                  <td className="header-datum-applications">
                    <p className="default-paragraph-4">Members</p>
                  </td>
                  <td>
                    <p className="app-members-button">
                      {applicationInformation.members} Members
                    </p>
                  </td>
                </tr>

                <tr>
                  <td className="header-datum-applications">
                    <p className="default-paragraph-4">Documents</p>
                  </td>
                  <td>

                    <div className="upper-elements-centred">
                      {applicationInformation.documents.map((doc) => (
                        <>
                        <p key={doc.id} className="app-members-button">
                          {doc.name}
                        </p>
                        <p>&nbsp;&nbsp;</p>
                        </>
                      ))}
                    </div>

                  </td>
                </tr>

                </tbody>
            </table>
        </div>
    );
}

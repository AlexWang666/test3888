/*
  SUBFOLDERS FILES TABLE
  The table containing all subfolders and files within a folder.
*/

import React from "react";

import "./DriveComponents.css";
import "../../Main.css";

export default function SubfoldersFilesTable({ subfoldersList, goToFolder }) {
  // subfoldersList: The list of subfolders and files within a folder
  // - name: Title
  // - type: Type
  // - numCollaborators: Number of people shared with
  // - lastEdited: Last edited

  // - goToFolder: The function to navigate into a folder.

  return (
    <div className="projects-div">
      <table className="default-table" id="clickable-table">
        <tbody>
          <tr>
            <td id="file-icon-column"></td>
            <td>Title</td>
            <td>Collaborators</td>
            <td>Last Edited</td>
          </tr>

          {subfoldersList.map((subfolder) => (
            <tr key={subfolder.id} onClick={goToFolder}>
              <td>
                <div className="upper-elements">
                  <div
                    className="file-folder-icon"
                    id={subfolder.type + "-file-type"}
                  >
                    <p>{subfolder.type.toUpperCase()}</p>
                  </div>
                </div>
              </td>
              <th>{subfolder.name}</th>
              <td>{subfolder.numCollaborators}</td>
              <td>{subfolder.lastEdited}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

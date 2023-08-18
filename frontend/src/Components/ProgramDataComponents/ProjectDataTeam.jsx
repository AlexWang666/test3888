/*
  PROJECT DATA TEAM
  The overview of the team working on a program.
*/


import React from 'react'

import "../../Main.css";
import "./ProjectDataWidgets.css"

import RoleConstants from "../../BasicComponents/RoleConstants";

export default function ProjectDataTeam({ membersList, goToTeam }) {
    // membersList: Information about the team
    // - role: Role
    // - pfp: Profile Picture

    // goToTeam: Navigates to the team members page.


    // Counts the number of each role
    var numRoles = {};
    membersList.forEach(function(x) { numRoles[x.role] = (numRoles[x.role] || 0) + 1; });


    // Gets the list of PFP's for display
    var pfpList = [];
    var moreMessage = "";   // Message to be displayed if there are too many
    var count=1;

    for(var i=0; i<membersList.length; i++) {
      pfpList.push({id: membersList[i].id, pfp: membersList[i].pfp});

      // Loop must break after 18 iterations
      if(count===20) {
        break;
      } else {
        count = count+1;
      }
    }


    return (
        <div className="team-data-rectangle" id="clickable-widget-right"
          onClick={goToTeam}>

            <div className="upper-elements">
                <p className="default-heading-3">Team</p>

                <p id="align-right">
                    Total Size: <b>{membersList.length}</b>
                </p>
            </div>

            <table className="invisible-table">
            <tbody>
                <tr>
                    <td className="role-row">
                        {Object.entries(numRoles).map(([role, n]) => (
                            <p id="team-member-p" key={role}>
                                {RoleConstants(role)}: <b>{n}</b>
                            </p>
                        ))}
                    </td>

                    <td className="boxes-holder">
                        {pfpList.map((profilePicture) => (
                            <div className="profile-picture"
                              id="team-pfp"
                              key={profilePicture.id}>

                            </div>
                        ))}

                    </td>
                </tr>
            </tbody>
            </table>
        </div>
    );
}

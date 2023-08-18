import React, { useState } from 'react'

import "../../Main.css";
import "./OrganisationMembersTable.css"

import RoleConstants from "../../BasicComponents/RoleConstants";

export default function OrganisationMembersTable({ projectMembersList,
  tentativeMember, goToProfile, addMember }) {
    // projectMembersList: The list of project members for the current project
    // - name: Member Name
    // - role: Role
    // - Profile Picture (TODO)

    // tentativeMember: The project member which hasn't been added yet
    // - name: Member name

    // goToProfile: A function which takes user to profile of the clicked row

    // addMember: Adds the member to the table and pushes to db

    const [chosenRole, setChosenRole] = useState("");

    // Selects the chosen role in the frontend
    const selectRole = () => {
      setChosenRole(event.target.value);
    }

    // Adds roles to the drop down menu from RoleConstants
    let dropDownMenu = [];
    for (const [key, value] of Object.entries(RoleConstants("ALL"))) {
      dropDownMenu.push(<option value={key}>{value}</option>)
    };

    // Adds the tentative member row (user hasn't been added yet)
    let tentativeMembersTable = <></>;
    if (tentativeMember.id !== undefined) {
      tentativeMembersTable = (
        <div className="organisation-rectangle"
          key={tentativeMember.id}>
          <table><tbody><tr>
            <td>
              <div className="profile-picture">
              </div>
            </td>
            <td className="member-datum">
              <p className="member-name">{tentativeMember.name}</p>
              <p>
                <select onChange={selectRole}>
                  {dropDownMenu}
                </select>
              </p>
            </td>
            <td>
              <div
                onClick={() => addMember(tentativeMember.id,
                  tentativeMember.name, chosenRole)}>
                &#9989;
              </div>
            </td>
          </tr></tbody></table>
        </div>
      );
    }


    return (
        <div className="boxes-holder">
          {tentativeMembersTable}

          {projectMembersList.map((member) => (
            <div className="organisation-rectangle"
              key={member.id}
              onClick={() => goToProfile(member.id)}>

                <table>
                <tbody>

                  <tr>
                    <td>
                      <div className="profile-picture">
                      </div>
                    </td>
                    <td className="member-datum">
                      <p className="member-name">{member.name}</p>
                      <p>{RoleConstants(member.role)}</p>
                    </td>
                  </tr>

                </tbody>
                </table>
            </div>
          ))}
        </div>
    );
}

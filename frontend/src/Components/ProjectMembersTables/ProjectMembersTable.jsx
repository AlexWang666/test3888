import React, { useState } from "react";
import { Table, Tag } from "antd";
import "./OrganisationMembersTable.css";
import "../../Main.css";

import RoleConstants from "../../BasicComponents/RoleConstants";

export default function ProjectMembersTable({
  projectMembersList,
  tentativeMember,
  goToProfile,
  addMember,
}) {
  // projectMembersList: The list of project members for the current project
  // - name: Member Name
  // - role: Role
  // - streams: List of Streams

  // tentativeMember: The project member which hasn't been added yet
  // - name: Member name

  // goToProfile: A function which takes user to profile of the clicked row

  // addMember: Adds the member to the table and pushes to db

  const [chosenRole, setChosenRole] = useState("");

  const columns = [
    {
      title: "Member",
      dataIndex: "name",
      key: "name",
      width: "160px",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (prop) => <>{RoleConstants(prop)}</>,
    },
    {
      title: "Organisation",
      dataIndex: "organization",
      key: "organization",
      render: (prop) => <>{prop.name}</>,
    },
    {
      title: "Streams",
      dataIndex: "streams",
      key: "streams",
      render: (props) => (
        <>
          {props.length ? (
            <>
              {props.map((e) => (
                <Tag key={e.id}>{e.name}</Tag>
              ))}
            </>
          ) : null}
        </>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
  ];

  // Selects the chosen role in the frontend
  const selectRole = (event) => {
    setChosenRole(event.target.value);
  };

  // Adds roles to the drop down menu from RoleConstants
  let dropDownMenu = [];
  for (const [key, value] of Object.entries(RoleConstants("ALL"))) {
    dropDownMenu.push(<option value={key}>{value}</option>);
  }

  // Adds the tentative member row (user hasn't been added yet)
  // let tentativeMembersTable = <></>;
  // if (tentativeMember.id !== undefined) {
  //   tentativeMembersTable = (
  //     <tr key={tentativeMember.id}>
  //       <td>
  //           <div className="profile-picture">
  //           </div>
  //         </td>
  //       <th>{tentativeMember.name}</th>

  //       <td>
  //         <p>Select a role:&nbsp;</p>
  //         <select onChange={selectRole}>{dropDownMenu}</select>
  //       </td>

  //       <td>
  //         <button
  //           className="default-button-4"
  //           onClick={() =>
  //             addMember(tentativeMember.id, tentativeMember.name, chosenRole)
  //           }
  //         >
  //           +
  //         </button>
  //       </td>
  //     </tr>
  //   );
  // }

  // let projectMembers = projectMembersList.map((member) => (
  //   <tr key={member.id} onClick={() => goToProfile(member.id)}>
  //     <td>
  //         <div className="profile-picture">
  //         </div>
  //       </td>
  //     <th>{member.name}</th>
  //     <td>{RoleConstants(member.role)}</td>
  //     <td>
  //       <div className="upper-elements-overflow">
  //         {member.streams.map((stream) => (
  //           <div key={stream.id} className="stream-icon">
  //             {stream.name}
  //           </div>
  //         ))}
  //       </div>
  //     </td>
  //   </tr>
  // ));

  return (
    <div className="projects-div">
      {/* <table className="default-table" id="clickable-table">
        <tbody>
          <tr>
            <td id="profile-pic-column"></td>
            <td>Member</td>
            <td>Role</td>
            <td>Streams</td>
            <td id="profile-pic-column"></td>
          </tr>

          {tentativeMembersTable}
          {projectMembers}
        </tbody>
      </table> */}
      <Table
        dataSource={projectMembersList}
        columns={columns}
        onRow={(record, index) => {
          return {
            onClick: () => {
              goToProfile(record.id);
            },
          };
        }}
      />
    </div>
  );
}

import React from "react";
import { Table, Typography } from "antd";
import "../ProjectMembersTables/OrganisationMembersTable.css";
import "../../Main.css";

import RoleConstants from "../../BasicComponents/RoleConstants";

const { Title, Paragraph } = Typography;

export default function ProjectMembersListWidget({
  projectMembersList,
  goToMembers,
}) {
  // projectMembersList: The list of project members for the current project
  // - pfp: Profile Picture
  // - name: Member Name
  // - role: Role
  // - currentTask: Current Task worked on

  // - goToMembers: Navigates to the list of project members

  const columns = [
    {
      title: "Member/Role",
      dataIndex: "name",
      key: "name",
      render: (prop, data) => (
        <>
          <p>
            <b>{prop}</b>
          </p>
          <p className="default-paragraph">{RoleConstants(data.role)}</p>
        </>
      ),
    },
    {
      title: "Current Task",
      dataIndex: "currenttask",
      key: "currenttask",
    },
  ];

  return (
    <div className="milestone-table-widget" onClick={goToMembers}>
      <div
        className="upper-elements"
        style={{ justifyContent: "space-between" }}
      >
        {/* <p className="default-heading-3">Project Members</p> */}
        <Title level={4}>Project Members</Title>
        {/* <p className="default-heading-4" id="align-right">
          <b>{projectMembersList.length}</b> Members
        </p> */}
        <Paragraph>
          {" "}
          <b>{projectMembersList.length}</b> Members{" "}
        </Paragraph>
      </div>

      {/* <table className="default-table" id="clickable-table">
        <tbody>
          <tr> */}
      {/* <td id="profile-pic-column"></td> */}
      {/* <td>Member/Role</td>
            <td>Current Task</td>
          </tr>

          {projectMembersList.map((member) => (
            <tr key={member.id}> */}
      {/* <td>
                <div className="profile-picture"></div>
              </td> */}
      {/* <td>
                <p>
                  <b>{member.name}</b>
                </p>
                <p className="default-paragraph">
                  {RoleConstants(member.role)}
                </p>
              </td>
              <td>{member.currenttask}</td>
            </tr>
          ))}
        </tbody>
      </table> */}
      <Table dataSource={projectMembersList} columns={columns} />
    </div>
  );
}

import React from "react";
import { Table, Typography } from "antd";
import "./ActiveProjects.css";
import "../../Main.css";

import { GetDateString } from "../../BasicComponents/GenericFunctions";

const { Paragraph } = Typography;

export default function CompletedProjects({
  completedProjectsList,
  goToProject,
}) {
  // completedProjectsList: The list of completed projects for the current user
  // - name: Project Title
  // - completeDate: Project Completion date

  // - goToProject: The function called on clicking the row to take you to the
  // Project's dashboard.

  let privacyDict = {
    true: <td>&#x1F512;</td>, // Private (lock)
    false: <td>&#x1F513;</td>, // Public (unlocked)
  };

  const columns = [
    {
      title: "Project",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Completed Date",
      dataIndex: "completedate",
      key: "completedate",
      render: (prop) => (
        <>
          <Paragraph> {GetDateString(prop)}</Paragraph>
        </>
      ),
    },
  ];

  return (
    <div className="projects-div">
      {/* <table className="default-table" id="clickable-table">
        <tbody>

        <tr>
          <td id="profile-pic-column"></td>
          <td>Project</td>
          <td></td>
          <td>Date Completed</td>
          <td id="profile-pic-column"></td>
        </tr>

        {completedProjectsList.map((completedProject) => (
          <tr key={completedProject.id}
            onClick={() => goToProject(completedProject.id)}>

            <td>
              <div className="profile-picture">
              </div>
            </td>

            <th>{completedProject.name}</th>
            <td></td>
            <td>Completed:&nbsp;
              <b>{GetDateString(completedProject.completedate)}</b>
            </td>

            {privacyDict[completedProject.private]}
          </tr>
        ))}

        </tbody>
      </table> */}
      <Table
        dataSource={completedProjectsList}
        columns={columns}
        onRow={(record, index) => {
          return {
            onClick: () => {
              goToProject(record.id);
            },
          };
        }}
      />
    </div>
  );
}

import React from "react";
import { Table, Progress } from "antd";

import "./ActiveProjects.css";
import "../../Main.css";

import { GetPercentage } from "../../BasicComponents/GenericFunctions";

export default function ActiveProjects({ activeProjectsList, goToProject }) {
  // activeProjectsList: The list of active projects for the current user
  // - name: Project Title
  // - status: Project Status
  // - completion: Percentage completed (as a decimal)
  // - private: Private (true) or public (false)

  // - goToProject: The function called on clicking the row to take you to the
  // Project's dashboard.

  let privacyDict = {
    true: <td>&#x1F512;</td>, // Private (lock)
    false: <td>&#x1F513;</td>, // Public (unlocked)
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Current Milestone",
      dataIndex: "current_milestone",
      key: "current_milestone",
    },
    {
      title: "Last Modified",
      dataIndex: "last_modified",
      key: "last_modified",
    },
    {
      title: "Sharing",
      dataIndex: "sharing",
      key: "sharing",
    },
    {
      title: "Completion",
      dataIndex: "completion",
      key: "completion",
      render: (prop) => (
        <>
          <div className="completion-cell">
            {/* <div style={{ width: 230 }}>
              {GetPercentage(prop, 1)}% complete{" "}
            </div>
            <p>&nbsp;</p> */}
            <Progress
              percent={GetPercentage(prop, 1)}
              size="small"
              status="active"
            />
            {/* <progress className="default-progress-bar" value={prop} max={1} /> */}
          </div>
        </>
      ),
    },
  ];

  return (
    <div className="projects-div">
      {/* <table className="default-table" id="clickable-table">
        <tbody>
          <tr> */}
      {/* <td id="profile-pic-column"></td> */}
      {/* <td>Project</td>
            <td>Current Milestone</td>
            <td>Completion</td>
            <td id="profile-pic-column"></td>
          </tr>

          {activeProjectsList.map((activeProject) => (
            <tr
              key={activeProject.id}
              onClick={() => goToProject(activeProject.id)}
            > */}
      {/* <td>
              <div className="profile-picture">
              </div>
            </td> */}
      {/* <th>{activeProject.name}</th>
              <td>{activeProject.status}</td>
              <td className="completion-cell">
                {GetPercentage(activeProject.completion, 1)}% complete
                <p>&nbsp;</p>
                <progress
                  className="default-progress-bar"
                  value={activeProject.completion}
                  max={1}
                />
              </td>

              {privacyDict[activeProject.private]}
            </tr>
          ))}
        </tbody>
      </table> */}
      <Table
        dataSource={activeProjectsList}
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

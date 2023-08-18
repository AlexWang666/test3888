import React from "react";
import { Typography, Table } from "antd";
import "../../Main.css";
import "./ProjectDashboardWidgets.css";

import { GetDateString } from "../../BasicComponents/GenericFunctions";

const { Paragraph, Title } = Typography;

export default function MilestoneTasksCompleted({
  milestoneList,
  goToPlanner,
}) {
  // milestoneList: Information about the current milestones (completed))
  // - name: Milestone name
  // - completeDate: Date Completed
  // - description: Task description
  // - assigned: Person assigned
  // - type: task or milestone

  // goToPlanner: Takes the user to the planner for the program.

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Due",
      dataIndex: "duein",
      key: "due",
      render: (prop, data) => (
        <>
          <div
            className="upper-elements"
            style={{ justifyContent: "space-between" }}
          >
            {/* <p className={"heading-" + milestone.type}>
                    {milestone.name}
                  </p> */}
            <Paragraph>{data.name} </Paragraph>
            {/* <p id="align-right">
                    Completed On:&nbsp;
                    <b>{GetDateString(milestone.completedate)}</b>
                  </p> */}
            <Paragraph>
              {" "}
              Completed On:&nbsp;
              <b>{GetDateString(data.completedate)}</b>{" "}
            </Paragraph>
          </div>

          <p>&nbsp;</p>

          <div className="upper-elements">
            {/* <p className="default-paragraph">{milestone.description}</p> */}
            <Paragraph>{data.description} </Paragraph>
            {/* <p className="default-paragraph" id="align-right">
                    Assigned to {milestone.assigned}
                  </p> */}
            <Paragraph> Assigned to {data.assigned} </Paragraph>
          </div>
        </>
      ),
    },
  ];

  return (
    <div className="milestone-table-widget" onClick={goToPlanner}>
      {/* <p className="default-heading-3">Recently Completed</p> */}
      <Title level={4}>Recently Completed</Title>

      {/* <table className="invisible-table" id="clickable-table-allrows">
        <tbody>
          {milestoneList.map((milestone) => (
            <tr key={milestone.id}>
              <td>
                <div className="upper-elements">
                  <p className={"heading-" + milestone.type}>
                    {milestone.name}
                  </p>
                  <p id="align-right">
                    Completed On:&nbsp;
                    <b>{GetDateString(milestone.completedate)}</b>
                  </p>
                </div>

                <p>&nbsp;</p>

                <div className="upper-elements">
                  <p className="default-paragraph">{milestone.description}</p>
                  <p className="default-paragraph" id="align-right">
                    Assigned to {milestone.assigned}
                  </p>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table> */}
      <Table dataSource={milestoneList} columns={columns} />
    </div>
  );
}

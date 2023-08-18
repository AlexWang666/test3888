import React from "react";
import { Table, Typography } from "antd";
import "../../Main.css";
import "./ProjectDashboardWidgets.css";

const { Title, Paragraph } = Typography;

export default function MilestoneTasks({ milestoneList, goToPlanner }) {
  // milestoneList: Information about the current milestones (to be done)
  // - name: Milestone name
  // - duein: Due in n days
  // - description: Short description
  // - assigned: Person assigned

  // goToPlanner: Takes the user to the planner for the program.

  // Determines the colour of the "due in" bit
  for (var i = 0; i < milestoneList.length; i++) {
    if (milestoneList[i].duein < 0) {
      milestoneList[i].colour = "scary-text";
    } else if (milestoneList[i].duein <= 3 && milestoneList[i].duein >= 0) {
      milestoneList[i].colour = "red-text";
    } else if (milestoneList[i].duein > 3 && milestoneList[i].duein <= 7) {
      milestoneList[i].colour = "orange-text";
    } else {
      milestoneList[i].colour = "green-text";
    }
  }

  let msgPrefix = ["Due ", "Due In "];
  let msgSuffix = [" Days Ago", " Days"];

  // Negative days due get index 0, positive days due get 1
  const getIndex = (daysDue) => {
    if (daysDue === 0) {
      return 1;
    } else {
      return parseInt((daysDue / Math.abs(daysDue) + 1) / 2);
    }
  };

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
            {/* <p className={"heading-" + data.type}>{data.name}</p> */}
            <Paragraph>{data.name} </Paragraph>
            {/* <p className={data.colour} id="align-right">
              {msgPrefix[getIndex(data.duein)]}
              <b>{Math.abs(data.duein)}</b>
              {msgSuffix[getIndex(data.duein)]}
            </p> */}
            <Paragraph>
              {msgPrefix[getIndex(data.duein)]}
              <b>{Math.abs(data.duein)}</b>
              {msgSuffix[getIndex(data.duein)]}{" "}
            </Paragraph>
          </div>

          {/* <p>&nbsp;</p> */}

          <div className="upper-elements">
            {/* <p className="default-paragraph">{data.description}</p> */}
            {/* <Paragraph> {data.description}</Paragraph> */}
            {/* <p className="default-paragraph" id="align-right">
              Assigned to {data.assigned}
            </p> */}
            <Paragraph> Assigned to {data.assigned} </Paragraph>
          </div>
        </>
      ),
    },
  ];

  return (
    <div className="milestone-table-widget" onClick={goToPlanner}>
      {/* <p className="default-heading-3">Tasks and Milestones Remaining</p> */}
      <Title level={4}>Tasks and Milestones Remaining</Title>
      {/* <table className="invisible-table" id="clickable-table-allrows">
        <tbody>
          {milestoneList.map((milestone) => (
            <tr key={milestone.id}>
              <td>
                <div className="upper-elements">
                  <p className={"heading-" + milestone.type}>
                    {milestone.name}
                  </p>
                  <p className={milestone.colour} id="align-right">
                    {msgPrefix[getIndex(milestone.duein)]}
                    <b>{Math.abs(milestone.duein)}</b>
                    {msgSuffix[getIndex(milestone.duein)]}
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

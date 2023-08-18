/*
  PROJECT DATA STATUS
  The breakdown of the milestone and task completion for a program.
*/

import React from "react";
import { GetPercentage } from "../../BasicComponents/GenericFunctions";
import { Typography, Progress } from "antd";
import "../../Main.css";
import "../ProjectTables/ProjectDashboardWidgets.css";

const { Title, Paragraph } = Typography;

export default function ProjectDataStatus({
  taskCompletion,
  milestoneCompletion,
  goToPlanner,
}) {
  // taskCompletion: Information about the completion of the tasks
  // - completed: Number of tasks completed
  // - expected: Number of tasks which are overdue
  // - totaltasks: Total tasks in the project

  // milestoneCompletion: Information about the completion of milestones

  // goToPlanner: The planner for this program.
  var percentComplete = GetPercentage(
    taskCompletion.completed,
    taskCompletion.totaltasks
  );
  var percentCompleteMS = GetPercentage(
    milestoneCompletion.completed,
    milestoneCompletion.totalmilestones
  );

  return (
    <div
      className="milestone-table-widget"
      id="clickable-widget"
      onClick={goToPlanner}
    >
      {/* <p className="default-heading-3">
              Planner
            </p> */}
      <Title level={4}>Planner</Title>

      {/* <p>&nbsp;</p> */}
      {/* <p>
        <b>Completion</b>
      </p> */}
      <Paragraph> Completion</Paragraph>
      {/* <p>&nbsp;</p> */}

      <div className="upper-elements">
        {/* <progress
          className="default-progress-bar"
          id="progress-bar-status-widget"
          value={taskCompletion.completed}
          max={taskCompletion.totaltasks}
        /> */}
        <Progress percent={percentComplete} status="active" size="small" />

        {/* <p id="align-right">
          {taskCompletion.completed}/{taskCompletion.totaltasks}
          &nbsp;Tasks Completed &nbsp;(<b>{percentComplete}%</b>)
        </p> */}
        <Paragraph>
          {" "}
          {taskCompletion.completed}/{taskCompletion.totaltasks}
          &nbsp;Tasks Completed &nbsp;(<b>{percentComplete}%</b>){" "}
        </Paragraph>
      </div>

      <div className="upper-elements">
        {/* <p className="orange-text" id="align-right">
          {taskCompletion.expected} tasks overdue.
        </p> */}
        <Paragraph style={{ color: "orange" }}>
          {" "}
          {taskCompletion.expected} tasks overdue.{" "}
        </Paragraph>
      </div>

      <p>&nbsp;</p>
      {/* <p>
        <b>Milestones</b>
      </p> */}
      <Paragraph> Milestones</Paragraph>
      {/* <p>&nbsp;</p> */}

      <div className="upper-elements">
        {/* <progress
          className="default-progress-bar"
          id="progress-bar-status-widget"
          value={milestoneCompletion.completed}
          max={milestoneCompletion.totalmilestones}
        /> */}
        <Progress percent={percentCompleteMS} size="small" />

        {/* <p id="align-right">
          {milestoneCompletion.completed}/{milestoneCompletion.totalmilestones}
          &nbsp;Milestones Completed &nbsp;(<b>{percentCompleteMS}%</b>)
        </p> */}
        <Paragraph>
          {milestoneCompletion.completed}/{milestoneCompletion.totalmilestones}
          &nbsp;Milestones Completed &nbsp;(<b>{percentCompleteMS}%</b>)
        </Paragraph>
      </div>

      <div className="upper-elements">
        {/* <p className="orange-text" id="align-right">
          {milestoneCompletion.expected} milestones overdue.
        </p> */}
        <Paragraph style={{ color: "orange" }}>
          {" "}
          {milestoneCompletion.expected} milestones overdue{" "}
        </Paragraph>
      </div>
    </div>
  );
}

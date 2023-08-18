import React, { useState, useEffect } from "react";
import axios from "axios";
import { Typography, Progress } from "antd";
import "../../Main.css";
import "./../ProgramDataComponents/ProjectDataWidgets.css";

import { GetPercentage } from "../../BasicComponents/GenericFunctions";

const { Title, Paragraph } = Typography;

export default function ProjectCompletionBar({ projectCompletion, goToData }) {
  // projectCompletion: Information about the rate of program completion
  // - totalproj: The total number of projects in the program
  // - completed: The number of projects completed

  // goToData: A function which goes to the tasks page.
  var completion = GetPercentage(
    projectCompletion.completed / projectCompletion.totalproj
  );

  return (
    <div className="progress-bar-widget" onClick={goToData}>
      <div
        className="upper-elements"
        style={{ justifyContent: "space-between" }}
      >
        {/* <p className="default-heading-3">Project Completion</p> */}
        <Title level={4}>Project Completion</Title>
        {/* <p className="default-heading-4" id="align-right">
          <b>{projectCompletion.totalproj-projectCompletion.completed}</b>
          &nbsp;Projects Remaining
        </p> */}
        <Paragraph>
          {" "}
          <b>{projectCompletion.totalproj - projectCompletion.completed}</b>
          &nbsp;Projects Remaining{" "}
        </Paragraph>
      </div>

      {/* <progress
        className="default-progress-bar"
        id="progress-progress-bar"
        value={projectCompletion.completed}
        max={projectCompletion.totalproj}
      /> */}

      <Progress
        percent={GetPercentage(
          projectCompletion.completed,
          projectCompletion.totalproj
        )}
        status="active"
      />
      {/* <p className="default-paragraph">
        Completed {projectCompletion.completed} projects out of{" "}
        {projectCompletion.totalproj}
        &nbsp; (
        {GetPercentage(
          projectCompletion.completed,
          projectCompletion.totalproj
        )}
        %)
      </p> */}
      <Paragraph>
        Completed {projectCompletion.completed} projects out of{" "}
        {projectCompletion.totalproj}
        &nbsp; (
        {GetPercentage(
          projectCompletion.completed,
          projectCompletion.totalproj
        )}
        %)
      </Paragraph>
    </div>
  );
}

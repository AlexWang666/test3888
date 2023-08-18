/*
  PROJECTS TASKS TABLE
  The list of the users projects and tasks / milestones within each project.
*/

import React, { useEffect, useState } from "react";
import { GetDateString } from "../../BasicComponents/GenericFunctions";

import "./PlannerComponents.css";
import "../../Main.css";
import { Button, Typography, Select } from "antd";
import CreateTask from "./CreateTask";
import CreateMilestone from "./CreateMilestone";
import CreateProjectModal from "../CreateProjectComponents/CreateProjectModal";

const { Paragraph } = Typography;
const { Option } = Select;

export default function ProjectsTasksTable({
  projectsList,
  goToCreateProject,
  goToCreateMilestone,
  goToCreateTask,
  goToTask,
  goToProject,
  getSideList,
  getItemsList,
}) {
  const [showTask, setShowTask] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [showProject, setShowProject] = useState(false);
  const [selectedProjectid, setSelectedProjectid] = useState("");
  const [parentProject, setParentProject] = useState();
  // projectsList: The list of projects within the program.
  // - name: Project, task or milstone name
  // - type: project, task or milestone
  // - startDate: Start date
  // - endDate: End date
  // - pfp: Picture of the project
  // - tasksMilestones: There are sub lists for tasks or milestones

  // goToCreate<Type>: Navigates to the create project / milestone / task
  // page for the parent.

  // goToTask: Opens the task pop-up for that task
  // goToProject: Goes back to the project dash

  useEffect(() => {
    setParentProject(projectsList?.[0]?.id);
  }, [projectsList]);

  const handleChange = (e, child, projectId) => {
    setSelectedProjectid(projectId);
    if (e === "task") {
      setShowTask(true);
    } else {
      setShowMilestone(true);
    }
  };

  let projies = projectsList.map((project) => (
    <>
      <tr
        key={project.id}
        id="hover-pointer"
        onClick={() => goToProject(project.id)}
      >
        <td
          className="planner-row"
          style={{
            padding: "4px 12px 5px 10px",
            width: 142,
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            overflow: "auto",
          }}
        >
          <div className="upper-elements-centred">
            <div>
              <Paragraph
                style={{
                  margin: 0,
                  fontWeight: 600,
                }}
              >
                {project.name}
              </Paragraph>
            </div>
          </div>
        </td>
      </tr>

      {project.tasksmilestones.map((task) => (
        <tr
          key={task.id}
          onClick={() => goToTask(task.id, task.type)}
          id="hover-pointer"
        >
          <td className="planner-row-tasks">
            <div className="upper-elements-centred">
              <div>
                <Paragraph style={{ margin: 0 }}>{task.name}</Paragraph>
              </div>
            </div>
          </td>
        </tr>
      ))}

      <tr style={{ height: 38 }}>
        <td
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: 140,
          }}
        >
          <Select
            defaultValue="+ Create"
            style={{ width: "100%", height: 34 }}
            onSelect={(e, child) => handleChange(e, child, project.id)}
            onChange={(e, child) => {
              handleChange(e, child, project.id);
            }}
          >
            <Option value="task" label="+ Add Task">
              + Add Task
            </Option>
            <Option value="milestone" label="+ Add Milestone">
              + Add Milestone
            </Option>
          </Select>
        </td>
      </tr>
    </>
  ));

  return (
    <div className="list-tasks-side">
      <table border="1" cellSpacing="0" cellPadding="0">
        <tbody>
          <tr style={{ height: 59 }}>
            <td className="planner-row">
              <div className="upper-elements-centred">
                <Button type="primary" onClick={() => setShowProject(true)}>
                  + New Project
                </Button>
              </div>
            </td>
          </tr>

          {projies}
        </tbody>
      </table>

      {showTask && (
        <CreateTask
          showTask={showTask}
          setShowTask={setShowTask}
          projid={selectedProjectid}
          parentProject={parentProject}
          getSideList={getSideList}
          getItemsList={getItemsList}
        />
      )}
      {showMilestone && (
        <CreateMilestone
          showMilestone={showMilestone}
          setShowMilestone={setShowMilestone}
          parentProject={parentProject}
          projid={selectedProjectid}
          getSideList={getSideList}
          getItemsList={getItemsList}
        />
      )}

      {showProject && (
        <CreateProjectModal
          from={"projectTable"}
          showProject={showProject}
          setShowProject={setShowProject}
          getSideList={getSideList}
          getItemsList={getItemsList}
          parentProject={parentProject}
        />
      )}
    </div>
  );
}

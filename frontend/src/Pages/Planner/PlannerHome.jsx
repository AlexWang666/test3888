/* PLANNER HOME PAGE */
/*
   A list of all projects, milestones and tasks for a project.
   With buttons to create new projects, milestones and tasks.
   Includes the timeline.
*/

import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../../Main.css";
import ProjectsTasksTable from "../../Components/PlannerComponents/ProjectsTasksTable";
import ActualPlanner from "../../Components/PlannerComponents/ActualPlanner";
import TaskInformation from "../../Components/TaskComponents/TaskInformation";
import SearchBar from "../../Components/SearchComponents/SearchBar";
import { Affix, Typography, Button, message } from "antd";

const { Title } = Typography;

export default function PlannerHome() {
  const { state } = useLocation();
  const { projid } = state || {};

  const [sideList, setSideList] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [taskInfo, setTaskInfo] = useState({});
  const [taskPopUp, setTaskPopUp] = useState(<p></p>);
  const [dateRange, setDateRange] = useState([]);
  const [itemsList, setItemsList] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [viewMode, setViewMode] = useState("Day"); //Quarter Day, Half Day, Day, Week, Month
  const params = { projid: projid };

  useEffect(() => {
    getProjectName();
    getSideList();
    getDateRange();
    getItemsList();
  }, []);

  const getDateRange = async () => {
    await axios
      .get("/api/get-project-date-range", { params })
      .then((response) => {
        setDateRange(response.data);
      });
  };

  const getItemsList = async () => {
    await axios.get("/api/get-planner-items", { params }).then((response) => {
      setItemsList(response.data.data);
    });
  };

  const getProjectName = async () => {
    await axios.get("/api/get-project-name", { params }).then((response) => {
      setProjectName(response.data.data[0]);
    });
  };

  const getSideList = async () => {
    let res = await axios.get("/api/get-project-list-planner", { params });
    if (res.status === 200) {
      setSideList(res.data.data);
    }
  };

  // Navigation functions
  let navigate = useNavigate();

  const goToCreateProject = () => {
    navigate("/create-project", { state: { projid: projid } });
  };

  const goToCreateMilestone = (clickid) => {
    navigate("/create-milestone", { state: { projid: clickid } });
  };

  const goToCreateTask = (clickid) => {
    navigate("/create-task", { state: { projid: clickid } });
  };

  const goToData = () => {
    navigate("/project-data", { state: { projid: projid } });
  };

  const goToProject = (clickid) => {
    navigate("/dashboard", { state: { projid: clickid } });
  };

  // Called after clicking the author's name
  const goToPerson = (clickid) => {
    navigate("/profile-other", { state: { userId: clickid } });
  };

  // Called after clicking out of the pop-up
  const closeBox = () => {
    setTaskPopUp(<p></p>);
  };

  // Called after clicking on the complete checkbox
  const onComplete = async (taskid, type, completed) => {
    // Sets the task as complete or not in the backend
    const params = { taskid: taskid, type: type };
    await axios.post("/api/toggle-completion-of-task", { params });
  };

  // Called when clicking on a particular task
  const goToTask = async (taskid, type) => {
    const params = { id: taskid };
    var responseInfo = {};

    if (type === "task") {
      await axios.get("/api/get-task-info-box", { params }).then((response) => {
        setTaskInfo(response.data[0]);
        responseInfo = response.data[0];
      });
    } else {
      await axios
        .get("/api/get-milestone-info-box", { params })
        .then((response) => {
          setTaskInfo(response.data[0]);
          responseInfo = response.data[0];
        });
    }

    setTaskPopUp(
      <TaskInformation
        taskInfo={responseInfo}
        goToPerson={goToPerson}
        onComplete={onComplete}
        closeBox={closeBox}
        messageApi={messageApi}
        getSideList={getSideList}
        getItemsList={getItemsList}
        projid={projid}
      />
    );
  };

  return (
    <div className="projects-page">
      <div className="upper-elements">
        {/* <h1 className="default-heading" id="link" onClick={goToData}>
          {projectName.name}
        </h1> */}
        <Title level={3} onClick={goToData}>
          Planner - {projectName.name}
        </Title>
        {/* <h1 className="default-heading">&nbsp;- Planner</h1> */}

        <SearchBar />
      </div>
      <p>&nbsp;</p>

      {taskPopUp}
      {contextHolder}
      <div className="upper-elements" style={{ height: 600, overflow: "auto" }}>
        <ProjectsTasksTable
          projectsList={sideList}
          goToCreateProject={goToCreateProject}
          goToCreateMilestone={goToCreateMilestone}
          goToCreateTask={goToCreateTask}
          goToTask={goToTask}
          goToProject={goToProject}
          getSideList={getSideList}
          getItemsList={getItemsList}
        />

        <ActualPlanner
          dateRange={dateRange}
          itemsList={itemsList}
          viewMode={viewMode}
        />
      </div>

      <Affix offsetBottom={20}>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            onClick={() => setViewMode("Day")}
            type={viewMode === "Day" ? "primary" : ""}
          >
            Day
          </Button>
          <Button
            onClick={() => setViewMode("Week")}
            type={viewMode === "Week" ? "primary" : ""}
          >
            Week
          </Button>
          <Button
            onClick={() => setViewMode("Month")}
            type={viewMode === "Month" ? "primary" : ""}
          >
            Month
          </Button>
        </div>
      </Affix>
    </div>
  );
}

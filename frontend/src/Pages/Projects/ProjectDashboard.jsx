/* PROJECTS DASHBOARD */
/*
   Information about the project displayed as widgets.
*/

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Tabs, Typography } from "antd";
import "./Projects.css";
import "../../Main.css";

import Navbar from "../../Components/Navbar/Navbar";
import SearchBar from "../../Components/SearchComponents/SearchBar";

import { GetUserId } from "../../BasicComponents/GenericFunctions";
import ProjectDescription from "../../Components/MarketplaceComponents/ProjectDescription";
import MilestoneTasks from "../../Components/ProjectTables/MilestoneTasks";
import MilestoneTasksCompleted from "../../Components/ProjectTables/MilestoneTasksCompleted";
import BudgetBar from "../../Components/ProjectTables/BudgetBar";
import ProjectCompletionBar from "../../Components/ProjectTables/ProjectCompletionBar";
import ProjectDataStatus from "../../Components/ProgramDataComponents/ProjectDataStatus";
import ProjectMembersListWidget from "../../Components/ProjectTables/ProjectMembersListWidget";
import { decodeToken } from "react-jwt";
import axios from "axios";

const { Title } = Typography;

export default function ProjectDashboard() {
  const { state } = useLocation();
  const { projid } = state || {};

  const [budgetInfo, setBudgetInfo] = useState({});
  const [currentUser, setCurrentUser] = useState(GetUserId());
  const [completeTasksList, setCompleteTasksList] = useState([]);
  const [parentProject, setParentProject] = useState({});
  const [projectCompletion, setProjectCompletion] = useState({});
  const [projectName, setProjectName] = useState("");
  const [projectTopInfo, setProjectTopInfo] = useState({});
  const [members, setMembers] = useState([]);
  const [milestoneCompletion, setMilestoneCompletion] = useState({});
  const [taskCompletion, setTaskCompletion] = useState({});
  const [tasksList, setTasksList] = useState([]);
  const [upperText, setUpperText] = useState(<></>);
  const [currentMenu, setCurrentMenu] = useState("dashboard");

  useEffect(() => {
    const params = { projid: projid };

    const getBudgetInfo = async () => {
      await axios.get("/api/get-budget-totals", { params }).then((response) => {
        setBudgetInfo(response.data);
      });
    };

    const getParentProject = async () => {
      await axios
        .get("/api/get-parent-project", { params })
        .then((response) => {
          if (response.data.data.length === 0) {
            setParentProject("");
          } else {
            setParentProject(response.data[0]);
            setUpperText(
              <>
                <p className="default-paragraph">A project within the&nbsp;</p>
                <p className="default-paragraph-5">{response.data[0].name}</p>
                <p className="default-paragraph">&nbsp;project.</p>
              </>
            );
          }
        });
    };

    const getMembers = async () => {
      await axios
        .get("/api/get-project-members-widget", { params })
        .then((response) => {
          setMembers(response.data.data);
        });
    };

    const getProjectName = async () => {
      await axios.get("/api/get-project-name", { params }).then((response) => {
        setProjectName(response.data.data[0]);
      });
    };

    const getProjectTopInfo = async () => {
      await axios
        .get("/api/get-project-top-info", { params })
        .then((response) => {
          setProjectTopInfo(response.data[0]);
        });
    };

    const getTasks = async () => {
      await axios
        .get("/api/get-tasks-in-project", { params })
        .then((response) => {
          setTasksList(response.data);
        });

      await axios
        .get("/api/get-tasks-and-milestones-completed", { params })
        .then((response) => {
          setCompleteTasksList(response.data);
        });
    };

    const getTasksRemaining = async () => {
      await axios
        .get("/api/get-tasks-remaining", { params })
        .then((response) => {
          setTaskCompletion(response.data.data[0]);
        });

      await axios
        .get("/api/get-milestone-completion", { params })
        .then((response) => {
          setMilestoneCompletion(response.data.data[0]);
        });
    };

    const getProjectCompletion = async () => {
      await axios
        .get("/api/get-project-completion", { params })
        .then((response) => {
          setProjectCompletion(response.data[0] ? response.data[0] : 0);
        });
    };

    getParentProject();
    getProjectTopInfo();
    getMembers();
    getProjectName();
    getTasks();
    getTasksRemaining();
    getBudgetInfo();
    getProjectCompletion();
  }, []);

  // Navigation functions
  let navigate = useNavigate();

  // Called after clicking the Tasks top right button
  const goToTasks = () => {
    navigate("/tasks-in-project", { state: { projid: projid } });
  };

  // Called after clicking the Projects top right button
  const goToProjects = () => {
    navigate("/projects", { state: { projid: projid } });
  };

  // Called after clicking the members widget
  const goToMembers = () => {
    navigate("/project-members", { state: { projid: projid } });
  };

  // Called after clicking the tasks remaining widgets
  const goToPlanner = () => {
    navigate("/program-planner", { state: { projid: parentProject.id } });
  };

  // Called after clicking the budget or completion
  const goToDashboard = () => {
    navigate("/dashboard", { state: { projid: parentProject.id } });
  };

  const goToBudget = () => {
    navigate("/budget", { state: { projid: projid } });
  };

  const menuItems = [
    {
      label: "Dashboard",
      key: "dashboard",
    },
    {
      label: "Tasks",
      key: "tasks",
    },
  ];

  const onMenuClick = (e) => {
    console.log("click ", e);
    // setCurrent(e.key);
    if (e === "tasks") {
      goToTasks();
    }
  };

  return (
    <div className="projects-page">
      <div className="upper-elements">
        <Title level={3}>{projectName.name} - Dashboard</Title>
        {/* <h1 className="default-heading">{projectName.name} - Dashboard</h1> */}

        <SearchBar />
      </div>

      <div
        className="upper-elements"
        style={{ justifyContent: "flex-end", paddingRight: 20 }}
      >
        {/* {upperText}

        <button className="default-button-2" id="member-display-button">
          Dashboard
        </button>

        <button
          className="default-button-3"
          id="member-display-button-2"
          onClick={goToTasks}
        >
          Tasks
        </button> */}
        <Tabs defaultActiveKey="1" items={menuItems} onChange={onMenuClick} />
      </div>

      <div className="boxes-holder">
        <p>&nbsp;</p>

        {/* <ProjectDescription
          projectDetails={projectTopInfo}
          showComplete={true}
        /> */}

        <div className="left-widgets">
          <BudgetBar budgetInfo={budgetInfo} goToData={goToBudget} />

          <MilestoneTasks milestoneList={tasksList} goToPlanner={goToTasks} />

          <MilestoneTasksCompleted
            milestoneList={completeTasksList}
            goToPlanner={goToTasks}
          />

          <ProjectCompletionBar
            projectCompletion={projectCompletion}
            goToData={goToProjects}
          />
        </div>

        <div className="right-widgets">
          <ProjectDataStatus
            taskCompletion={taskCompletion}
            milestoneCompletion={milestoneCompletion}
            goToPlanner={goToPlanner}
          />

          <ProjectMembersListWidget
            projectMembersList={members}
            goToMembers={goToMembers}
          />
        </div>
      </div>
    </div>
  );
}

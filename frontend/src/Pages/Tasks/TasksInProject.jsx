/* TASKS IN PROJECT */
/*
   The list of tasks within a project.
*/

import React, { useEffect } from "react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import "../../Main.css";

import ActiveTasks from "../../Components/TaskComponents/ActiveTasks";
import TaskInformation from "../../Components/TaskComponents/TaskInformation";
import SearchBar from "../../Components/SearchComponents/SearchBar";

import { decodeToken } from "react-jwt";
import axios from "axios";

export default function TasksInProject() {
  const { state } = useLocation();
  const { projid } = state || {};

  const [parentProject, setParentProject] = useState({});
  const [taskInfo, setTaskInfo] = useState({});
  const [taskList, setTaskList] = useState([]);
  const [completedTaskList, setCompletedTaskList] = useState([]);
  const [taskPopUp, setTaskPopUp] = useState(<p></p>);
  const [projectName, setProjectName] = useState("");
  const [upperText, setUpperText] = useState(<></>);

  useEffect(() => {
    const getParentProject = async () => {
      const params = { projid: projid };
      await axios
        .get("/api/get-parent-project", { params })
        .then((response) => {
          if (response.data.length === 0) {
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

    const getProjectName = async () => {
      const params = { projid: projid };
      await axios.get("/api/get-project-name", { params }).then((response) => {
        setProjectName(response.data[0]);
      });
    };

    const getTasksandMilestones = async () => {
      let params = { projid: projid, completed: false };
      await axios
        .get("/api/get-completion-tasks-and-milestones", { params })
        .then((response) => {
          setTaskList(response.data);
        });

      params = { projid: projid, completed: true };
      await axios
        .get("/api/get-completion-tasks-and-milestones", { params })
        .then((response) => {
          setCompletedTaskList(response.data);
        });
    };

    getParentProject();
    getProjectName();
    getTasksandMilestones();
  }, []);

  // NAVIGATION FUNCTIONS
  let navigate = useNavigate();

  // Called on clicking the Create Project button
  const goToCreateTask = () => {
    navigate("/create-task", { state: { projid: projid } });
  };

  // Called on clicking the Create Milestone button
  const goToCreateMilestone = () => {
    navigate("/create-milestone", { state: { projid: projid } });
  };

  // Called on clicking the dashboard top right button
  const goToDashboard = () => {
    navigate("/dashboard", { state: { projid: projid } });
  };

  // Called on clicking the dashboard top right button
  const goToParentDashboard = () => {
    navigate("/dashboard", { state: { projid: parentProject.id } });
  };

  const goToFiles = () => {
    navigate("/project-files");
  };

  // Called after clicking the author's name
  const goToPerson = (userid) => {
    navigate("/profile-other", { state: { userId: userid } });
  };

  // Called after clicking out of the pop-up
  const closeBox = () => {
    setTaskPopUp(<p></p>);
  };

  const toggleCompletion = async (taskid, type) => {
    // Sets the task as complete or not in the backend
    const params = { taskid: taskid, type: type };
    await axios.post("/api/toggle-completion-of-task", { params });
  };

  // Called after clicking on the complete checkbox
  const onComplete = (taskid, type, completed) => {
    var list = taskList;
    if (completed === true) {
      list = completedTaskList;
    }

    var taskToMove = new Object();
    for (var i = 0; i < list.length; i++) {
      // Find the object in the list
      if (list[i].id === taskid && list[i].type === type) {
        taskToMove = list[i];
        break;
      }
    }

    // Move the task from list the todo list to the completed list
    if (completed === false) {
      setTaskList(taskList.filter((t) => t.id !== taskid || t.type !== type));
      taskToMove.completed = !taskToMove.completed;
      setCompletedTaskList([...completedTaskList, taskToMove]);
    } else if (completed === true) {
      setCompletedTaskList(
        completedTaskList.filter((t) => t.id !== taskid || t.type !== type)
      );
      taskToMove.completed = !taskToMove.completed;
      setTaskList([...taskList, taskToMove]);
    }

    {
      toggleCompletion(taskid, type);
    }
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
      />
    );
  };

  return (
    <div className="projects-page">
      <div className="upper-elements">
        <h1 className="default-heading">{projectName.name} - Tasks</h1>

        <button
          className="default-button"
          id="new-project-button"
          onClick={goToCreateTask}
        >
          + New Task
        </button>

        <button
          className="default-button"
          id="new-project-button"
          onClick={goToCreateMilestone}
        >
          + New Milestone
        </button>

        <SearchBar />
      </div>

      <div className="upper-elements">
        {upperText}

        <button
          className="default-button-3"
          id="member-display-button"
          onClick={goToDashboard}
        >
          Dashboard
        </button>

        <button className="default-button-2" id="member-display-button-2">
          Tasks
        </button>
      </div>

      {taskPopUp}

      <div className="projects-box">
        <h2 className="default-heading-2">Active</h2>
        <ActiveTasks taskList={taskList} goToTask={goToTask} />
      </div>

      <div className="projects-box">
        <h2 className="default-heading-2">Completed</h2>
        <ActiveTasks taskList={completedTaskList} goToTask={goToTask} />
      </div>
    </div>
  );
}

/* PROJECTS */
/*
   The list of projects.
*/

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { decodeToken } from "react-jwt";
import axios from "axios";

import "../../Main.css";

import ActiveProjects from "../../Components/ProjectLists/ActiveProjects";
import CompletedProjects from "../../Components/ProjectLists/CompletedProjects";
import { GetUserId } from "../../BasicComponents/GenericFunctions";
import SearchBar from "../../Components/SearchComponents/SearchBar";
import { Typography, Button } from "antd";
import CreateProject from "../../Components/CreateProjectComponents/CreateProjectModal";
import InvitedProjects from "../../Components/ProjectLists/InvitedProjects";

const { Title } = Typography;

export default function MyProjects() {
  const { state } = useLocation();
  let { projid } = state || {};
  if (projid === undefined) {
    projid = -1;
  }

  const [completedProjects, setCompletedProjects] = useState([]);
  const [currentUser, setCurrentUser] = useState(GetUserId());
  const [projectName, setProjectName] = useState("");
  const [projectsList, setProjectsList] = useState([]);
  const [invitedList, setInvitedList] = useState([]);
  const [showCreateProject, setShowCreateProject] = useState(false);

  // Navigation functions
  let navigate = useNavigate();

  // Called on clicking the Create Project button
  const goToCreateProject = () => {
    navigate("/create-project", { state: { projid: projid } });
  };

  // Called on clicking on a project
  const goToProject = (clickid) => {
    navigate("/dashboard", { state: { projid: clickid } });
  };

  useEffect(() => {
    getProjects();
    getCompletedProjects();
    getInvitedProjects();
  }, []);

  const getProjects = async () => {
    const params = { uid: currentUser, parent: projid };
    await axios.get("/api/get-projects", { params }).then((response) => {
      setProjectsList(response.data.data);
    });
  };

  const getCompletedProjects = async () => {
    const params = { uid: currentUser, parent: projid };
    await axios
      .get("/api/get-completed-projects", { params })
      .then((response) => {
        setCompletedProjects(response.data.data);
      });
  };

  const getInvitedProjects = async () => {
    const res = await axios.get(
      `/api/get-project-invitations?uid=${currentUser}`
    );
    if (res.data.status_code === 200) {
      setInvitedList(res.data.data);
    }
  };

  return (
    <div className="projects-page">
      <div className="upper-elements">
        {/* <h1 className="default-heading"> */}
        <Title level={3}>Projects</Title>
        {/* </h1> */}

        {/* <button
          className="default-button"
          id="new-project-button"
          onClick={goToCreateProject}
        >
          + New Project
        </button> */}
        <Button
          type="primary"
          onClick={() => setShowCreateProject(true)}
          style={{ marginLeft: 10 }}
        >
          + New Project
        </Button>

        <SearchBar />
      </div>

      <div className="projects-box">
        {/* <h2 className="default-heading-2">Active</h2> */}
        <Title level={4}>Active</Title>

        <ActiveProjects
          activeProjectsList={projectsList}
          goToProject={goToProject}
        />
      </div>

      {invitedList.length > 0 ? (
        <div className="projects-box">
          <Title level={4}>Invited</Title>
          <InvitedProjects
            invitedList={invitedList}
            getProjects={() => getProjects()}
            getInvitedProjects={() => getInvitedProjects()}
          />
        </div>
      ) : null}

      {completedProjects.length > 0 ? (
        <div className="projects-box">
          {/* <h2 className="default-heading-2">Completed</h2> */}
          <Title level={4}>Completed</Title>

          <CompletedProjects
            completedProjectsList={completedProjects}
            goToProject={goToProject}
          />
        </div>
      ) : null}

      {showCreateProject && (
        <CreateProject
          from={"myProjects"}
          showProject={showCreateProject}
          setShowProject={setShowCreateProject}
          getSideList={getProjects}
          getItemsList={getCompletedProjects}
          parentProject={projid}
        />
      )}
    </div>
  );
}

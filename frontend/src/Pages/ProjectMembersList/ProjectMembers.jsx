/* PROJECT MEMBERS LIST PAGE */
/*
   The list of members who are working on a PROJECT.
*/

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Button, Typography, message } from "antd";
import "./ProjectMembersList.css";
import "../../Main.css";

import AddCollaborator from "../../Components/ProjectMembersTables/AddCollaborator";
import { GetUserId } from "../../BasicComponents/GenericFunctions";
import ProjectMembersTable from "../../Components/ProjectMembersTables/ProjectMembersTable";
import SearchBar from "../../Components/SearchComponents/SearchBar";

const { Title } = Typography;

export default function ProjectMembers() {
  const { state } = useLocation();
  const { projid } = state || {};

  const [currentUser, setCurrentUser] = useState(GetUserId());
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectMembers, setProjectMembers] = useState([]);
  const [tentativeMember, setTentativeMember] = useState({});
  const [pageAddCollab, setPageAddCollab] = useState(<></>);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    displayInviteButton();
    getProjectName();
    getProjectMembers();
  }, []);

  const getProjectMembers = async () => {
    await axios
      .get("/api/get-project-members-list", { params })
      .then((response) => {
        setProjectMembers(response?.data?.data);
      });
  };

  // Determines if the current user is in the project, and their role
  const displayInviteButton = async () => {
    let params = { uid: currentUser, pid: projid };
    await axios.get("/api/check-user-and-role", { params }).then((response) => {
      if (response.data.length !== 0) {
        setCurrentUserRole(response.data[0].user_role);
      }
    });
  };

  let params = { projid: projid };
  const getProjectName = async () => {
    await axios.get("/api/get-project-name", { params }).then((response) => {
      setProjectName(response.data.data[0]);
    });
  };

  // Navigation functions
  let navigate = useNavigate();

  const goToOrganisationMembers = () => {
    navigate("/project-organisations", { state: { projid: projid } });
  };

  const goToProfile = (clickid) => {
    navigate("/profile-other", { state: { userId: clickid } });
  };

  const goToProject = () => {
    navigate("/dashboard", { state: { projid: projid } });
  };

  // Adds the confirmed collaborator to the frontend table
  const addMember = (userid, username, role) => {
    const params = { uid: userid, projid: projid, role: role };

    // Adds the new note title to the backend for display on the side
    axios
      .post("/api/add-user-and-role-project", { params })
      .then((response) => {
        console.log(response);
      });

    setProjectMembers([
      ...projectMembers,
      { id: userid, name: username, role: role, streams: [] },
    ]);
    setTentativeMember({});
  };

  // Adds the pending collaborator to the frontend table
  const addCollaborToTable = async (userid) => {
    var username = "";
    const params = { uid: userid };
    await axios.get("/api/get-user-name", { params }).then((response) => {
      username = response.data[0].firstname + " " + response.data[0].lastname;
    });

    setTentativeMember({ id: userid, name: username });
  };

  const showAddCollaborator = () => {
    setPageAddCollab(
      <AddCollaborator
        addCollabor={addCollaborToTable}
        projid={projid}
        messageApi={messageApi}
        getProjectMembers={() => getProjectMembers()}
      />
    );
  };

  let inviteButton = <p></p>;
  if (currentUserRole === "O" || currentUserRole === "A") {
    inviteButton = (
      <Button
        // className="default-button"
        // id="invite-members-button"
        style={{ marginLeft: 10 }}
        type="primary"
        onClick={showAddCollaborator}
      >
        + Invite Member
      </Button>
    );
  }

  return (
    <div className="projects-page">
      {contextHolder}
      <div className="upper-elements">
        <Title level={3}>{projectName.name} - Members </Title>
        {/* <h1 className="default-heading" id="link" onClick={goToProject}>
          {projectName.name}
        </h1>
        <h1 className="default-heading">&nbsp;- Members</h1> */}

        {inviteButton}

        <SearchBar />
      </div>

      <div className="upper-elements">
        <button className="default-button-2" id="member-display-button">
          Member List
        </button>

        <button
          className="default-button-3"
          id="member-display-button-2"
          onClick={goToOrganisationMembers}
        >
          Organisation Structure
        </button>
      </div>

      {pageAddCollab}

      <ProjectMembersTable
        projectMembersList={projectMembers}
        tentativeMember={tentativeMember}
        goToProfile={goToProfile}
        addMember={addMember}
      />
    </div>
  );
}

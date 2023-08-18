/* ORGANISATION MEMBERS LIST PAGE */
/*
   The list of organisations who are involved with a PROJECT.
*/

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import "./ProjectMembersList.css";
import "../../Main.css";

import AddCollaborator from "../../Components/ProjectMembersTables/AddCollaborator";
import { GetUserId } from "../../BasicComponents/GenericFunctions";
import OrganisationMembersTable from "../../Components/ProjectMembersTables/OrganisationMembersTable";
import SearchBar from "../../Components/SearchComponents/SearchBar";

export default function OrganisationMembersList() {
  const { state } = useLocation();
  const { projid } = state || {};

  // Hardcoded values

  const projectMembersList3 = [
    { id: 0, name: "CSIRO", role: "Partner" },
    { id: 1, name: "University of Sydney", role: "Partner" },
    { id: 2, name: "Shell", role: "Partner" },
  ];

  const [currentUser, setCurrentUser] = useState(GetUserId());
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectMembers, setProjectMembers] = useState([]);
  const [pageAddCollab, setPageAddCollab] = useState(<></>);
  const [tentativeMember, setTentativeMember] = useState({});

  useEffect(() => {
    // Determines if the current user is in the project, and their role
    const displayInviteButton = async () => {
      let params = { uid: currentUser, pid: projid };
      await axios
        .get("/api/check-user-and-role", { params })
        .then((response) => {
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

    const getProjectMembers = async () => {
      await axios
        .get("/api/get-project-members-list", { params })
        .then((response) => {
          setProjectMembers(response.data.data);
        });
    };

    displayInviteButton();
    getProjectName();
    getProjectMembers();
  }, []);

  // Navigation functions
  let navigate = useNavigate();

  const goToProjectMembers = () => {
    navigate("/project-members", { state: { projid: projid } });
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
    setPageAddCollab(<AddCollaborator addCollabor={addCollaborToTable} />);
  };

  let inviteButton = <p></p>;
  if (currentUserRole === "O" || currentUserRole === "A") {
    inviteButton = (
      <button
        className="default-button"
        id="invite-members-button"
        onClick={showAddCollaborator}
      >
        + Invite Members
      </button>
    );
  }

  return (
    <div className="projects-page">
      <div className="upper-elements">
        <h1 className="default-heading" id="link" onClick={goToProject}>
          {projectName.name}
        </h1>
        <h1 className="default-heading">&nbsp;- Members</h1>

        {inviteButton}

        <SearchBar />
      </div>

      <div className="upper-elements">
        <button
          className="default-button-3"
          id="member-display-button"
          onClick={goToProjectMembers}
        >
          Member List
        </button>

        <button className="default-button-2" id="member-display-button-2">
          Organisation Structure
        </button>
      </div>

      {pageAddCollab}
      <p>&nbsp;</p>

      <div className="projects-div">
        <h2 className="default-heading-2">People</h2>
        <OrganisationMembersTable
          projectMembersList={projectMembers}
          tentativeMember={tentativeMember}
          goToProfile={goToProfile}
          addMember={addMember}
        />
      </div>

      <div className="projects-div">
        <h2 className="default-heading-2">Partners</h2>

        <OrganisationMembersTable
          projectMembersList={projectMembersList3}
          tentativeMember={{}}
          goToProfile={goToProfile}
          addMember={addMember}
        />
      </div>
    </div>
  );
}

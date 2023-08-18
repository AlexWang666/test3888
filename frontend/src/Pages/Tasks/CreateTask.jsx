/* CREATE TASK PAGE */
/*
   The form for creating a new task.
*/

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../Main.css";

import { GetUserId } from "../../BasicComponents/GenericFunctions";
import Navbar from "../../Components/Navbar/Navbar";
import SearchBar from "../../Components/SearchComponents/SearchBar";

import AddCollaborator from "../../Components/ProjectMembersTables/AddCollaborator";

import axios from "axios";
import { useLocation } from "react-router";

export default function CreateTask({userid}) {
  const {state} = useLocation();
  const {projid} = state || {};

  var id = userid;
  const [data, setData] = useState({
    title: "",
    description: "",
    s_date: new Date(),
    e_date: new Date(),
    responsible: GetUserId(),
  });
  const [assignedPerson, setAssignedPerson] = useState(<p></p>)
  const [currentUser, setCurrentUser] = useState(GetUserId());
  const [submitMsg, setSubmitMsg] = useState("");

  let navigate = useNavigate();

  const goToTasks = () => {
    navigate("/tasks-in-project", {state: {projid: projid}});
  }

  const addCollabor = async (userid) => {
    setData({
      ...data,
      responsible: userid,
    });

    const params = {uid: userid};
    await axios.get("/api/get-user-name", {params}).then((response) => {
      console.log(response.data);
      setAssignedPerson(<p>Added {response.data[0].firstname} {response.data[0].lastname} as assignee.</p>);
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (data.title !== "") {
      axios.post("/api/new-task", {"data":data, "uid":userid, "projid":projid}).then((response) => {
        if (response.data["msg"] == "success") {
          goToTasks();
        }
      });
    } else {
      setSubmitMsg("Task title cannot be blank.");
    }
  };


  return (
    <div className="projects-page">
      <div className="upper-elements">
        <h1 className="default-heading">Create Task</h1>

        <SearchBar />
      </div>

      <form onSubmit={e => { e.preventDefault(); }}
        className="project-form">

        <p>&nbsp;</p>
        <p className="default-heading-3">Task Title:</p>
        <div className="centred-div">
          <input
            type="text"
            className="default-form-text-small"
            onChange={(event) => {
              setData({
                ...data,
                title: event.target.value,
              });
            }}
          ></input>
        </div>

        <p>&nbsp;</p>
        <p className="default-heading-3">Task Description:</p>
        <div className="centred-div">
          <textarea
            type="textarea"
            className="default-form-text-large"
            onChange={(event) => {
              setData({
                ...data,
                description: event.target.value,
              });
            }}
          ></textarea>
        </div>


        <p>&nbsp;</p>
        <p className="default-heading-3">Dates:</p>
        <div className="centred-div">
          <p className="default-heading-4">
            Start Date:
          </p>

          <input
            type="date"
            className="create-project-date-left"
            onChange={(event) => {
              setData({
                ...data,
                s_date: event.target.value,
              });
            }}>
          </input>

          <p className="default-heading-4">
            End Date:
          </p>

          <input
            type="date"
            className="create-project-date-right"
            onChange={(event) => {
              setData({
                ...data,
                e_date: event.target.value,
              });
            }}>
          </input>
        </div>

        <p>&nbsp;</p>
        <p className="default-heading-3">Assign responsibility:</p>
        <div>
          <AddCollaborator
            addCollabor={addCollabor}
            searchType={"inProject"}
            thingId={projid}
          />
        </div>
        {assignedPerson}

        <p>&nbsp;</p>
        <div className="upper-elements">
          <p className="default-heading-3" id="align-centre">
            Upload an Image:
          </p>
          <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>

          <div>
            <button className="default-button-4">+ Add Image</button>
          </div>
        </div>


        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <div className="upper-elements">
          <button className="default-button"
            onClick={goToTasks}>
              Cancel
          </button>

          <button
            className="default-button"
            id="align-right"
            type="submit"
            onClick={handleSubmit}
          >
            Save
          </button>
        </div>

      </form>

      <p>&nbsp;</p>
      <p className="default-paragraph-5" id="align-right">
        {submitMsg}
      </p>

    </div>
  );
}

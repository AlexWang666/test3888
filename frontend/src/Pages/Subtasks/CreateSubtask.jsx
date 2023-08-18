/* CREATE SUBTASK PAGE */
/*
   The form for creating a new subtask.
*/

import React, { useState } from "react";
import "../../Main.css";

import Navbar from "../../Components/Navbar/Navbar";
import SearchBar from "../../Components/SearchComponents/SearchBar";

import axios from "axios";

export default function CreateSubtask({userid}) {
  var id = userid;
  const [data, setData] = useState({
    title: "",
    description: "",
  });

  const handleSubmit = (event) => {
    //setData({...data, uid: userid});
    event.preventDefault();
    //setData({...data, uid: userid});
    console.log(data);
    console.log(userid)
    axios.post("/api/new-subtask", {"data":data, "uid":userid, "taskid":"1"}).then((response) => { //TODO: projid hardcode
      if (response.data["msg"] == "success") {
        alert("SUCCESS");
      }
    });
  };


  return (
    <div className="projects-page">
      <div className="upper-elements">
        <h1 className="default-heading">Create Subtask</h1>

        <SearchBar />
      </div>

      <form onSubmit={handleSubmit} className="project-form">
        <p>&nbsp;</p>
        <p className="default-heading-3">Subtask Title:</p>
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
        <p className="default-heading-3">Subtask Description:</p>
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
        <p>&nbsp;</p>
        <div className="upper-elements">
          <button className="default-button">Cancel</button>

          <button
            className="default-button"
            id="align-right"
            type="submit"
            onSubmit={handleSubmit}
          >
            Save
          </button>
        </div>

        <p>&nbsp;</p>
      </form>

    </div>
  );
}

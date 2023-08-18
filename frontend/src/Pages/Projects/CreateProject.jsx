/* CREATE PROJECT PAGE */
/*
   The form for creating a new project.
*/

import React, { useState } from "react";
import "./Projects.css";
import "../../Main.css";

import Navbar from "../../Components/Navbar/Navbar";

import ResearcherRecommendationDashboard from '../../Components/CreateProjectComponents/ResearcherRecommenderDashboard';
import SearchBar from "../../Components/SearchComponents/SearchBar";

import axios from "axios";
import { useLocation } from "react-router";
import { useNavigate } from "react-router-dom";

export default function CreateProject({userid}) {
  var id = userid;

  const { state } = useLocation();
  let { projid } = state || {};
  if (projid === undefined) {
    projid = -1;
  }

  const [data, setData] = useState({
    title: "",
    private: false,
    description: "",
    long_description: "",
    s_date: new Date(),
    e_date: new Date(),
  });
  const [submitMsg, setSubmitMsg] = useState("");

  // open recommendation dashboard
  const [projectFingerprint, setProjectFingerprint] = React.useState([]);
  const [openRecomDashboard, SetOpenRecomDashboard] = React.useState(false);
  const [topResearchers, setTopResearchers] = React.useState({});

  let navigate = useNavigate();

  const goToProjects = () => {
    navigate("/projects", {state: {projid: projid}});
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    if (data.title !== "") {
      if (projid === undefined) {
        projid = -1;
      }
      axios.post("/api/new-project", {"data": data, "uid": userid,
                                      "parent": projid}).then((response) => {
        if (response.data["msg"] == "success") {
          goToProjects();
        }
      });
    } else {
      setSubmitMsg("Project title cannot be blank.");
    }
  };


  const openRecommendationDashboard = async () => {

    const params = {name: data['title'], shortDesc: "", longDesc: data['description']};
    var gotResearchers = false;
    var gotGraph = false;

    console.log(params);

    await axios.get("/api/get-project-fingerprint", {params}).then((response) => {
        setProjectFingerprint(response.data);
        console.log(response.data);
        gotGraph = true;

        }, (error) => {
            console.log(error);
        }
        );

    await axios.get("/api//get-top-researchers", {params}).then((response) => {
        setTopResearchers(response.data);
        gotResearchers = true;
      }, (error) => {
    });

    if (gotGraph && gotResearchers) {
        SetOpenRecomDashboard(true);
    }

  };



  return (
    <div className="projects-page">
      <div className="upper-elements">
        <h1 className="default-heading">Create Project</h1>

        <SearchBar />
      </div>

      <form onSubmit={handleSubmit} className="project-form">
        <p>&nbsp;</p>

        <div className="upper-elements">
          <div className="proj-title-input">
          <p className="default-heading-3">Project Title:</p>
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
          </div>

          <div>
          <p className="default-heading-3">Privacy Settings:</p>
            <select className="default-form-text-small"
            id="privacy-dropdown"
            onChange={(event) => {
              setData({
                ...data,
                private: event.target.value,
              });
            }}>
              <option value={false}>Public</option>
              <option value={true}>Private</option>
            </select>
          </div>
        </div>

        <p>&nbsp;</p>
        <p className="default-heading-3">Short Description:</p>
        <div className="centred-div">
          <textarea
            type="textarea"
            className="default-form-text-large"
            placeholder="This is the short description to appear in the project overview."
            onChange={(event) => {
              setData({
                ...data,
                description: event.target.value,
              });
            }}
          ></textarea>
        </div>

        <p>&nbsp;</p>
        <p className="default-heading-3">Long Description:</p>
        <div className="centred-div">
          <textarea
            type="textarea"
            className="default-form-text-large"
            placeholder="This is the long description to appear when the user clicks on the project."
            onChange={(event) => {
              setData({
                ...data,
                long_description: event.target.value,
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
        <p className="default-heading-3">Recommend Researchers:</p>

        <div className="centred-div">
            <button
              className="default-button"
              type="button"
              onClick={openRecommendationDashboard}
            >
              Recommend Researchers
            </button>
        </div>

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
      </form>

      <p className="default-paragraph-5" id="align-right">
        {submitMsg}
      </p>

      {ResearcherRecommendationDashboard(openRecomDashboard,
        SetOpenRecomDashboard, topResearchers, projectFingerprint)}
    </div>
  );
}

/* BUDGET PAGE */
/*
  The list of categories and budget items
*/

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import "../../Main.css"

import { GetUserId } from "../../BasicComponents/GenericFunctions";
import BudgetTable from "../../Components/BudgetComponents/BudgetTable";
import SearchBar from "../../Components/SearchComponents/SearchBar";

export default function Budget() {
  const { state } = useLocation();
  const { projid } = state || {};

  const [addCat, setAddCat] = useState(false);
  const [currentUser, setCurrentUser] = useState(GetUserId());
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectBudget, setProjectBudget] = useState([]);

  useEffect(() => {
    // Determines if the current user is in the project, and their role
    const displayInviteButton = async () => {
      let params = {"uid": currentUser, "pid": projid, "type": "project"};
      await axios.get("/api/check-user-and-role", {params}).then((response) => {
        if (response.data.length !== 0) {
          setCurrentUserRole(response.data[0].user_role);
        }
      });
    }

    let params = {"projid": projid};
    const getProjectName = async () => {
      await axios.get("/api/get-project-name", {params}).then((response) => {
        setProjectName(response.data[0]);
      });
    }

    const getProjectBudget = async () => {
      await axios.get("/api/get-all-budget", {params}).then((response) => {
        setProjectBudget(response.data);
      });
    }

    displayInviteButton();
    getProjectName();
    getProjectBudget();
  }, []);


  // Navigation functions
  let navigate = useNavigate();

  const goToInsights = () => {
    navigate("/insights", {state: {projid: projid} });
  }

  const goToProject = () => {
    navigate("/dashboard", {state: {projid: projid}});
  }


  // Adds the confirmed category to the frontend table
  const postCategory = (newCatName) => {
    const params = {projid: projid, name: newCatName};

    // Adds the new note title to the backend for display on the side
    var newId = 0;
    axios.post("/api/create-new-category", {params}).then((response) => {
      console.log(response.data.id);
      newId = response.data.id;
    });

    setProjectBudget([...projectBudget,
      {
        id: newId,
        name: newCatName,
        total_spent: 0,
        total_budgeted: 0,
        remaining: 0,
        items: []
      }]);
    setAddCat(false);
  }


  // Puts the add category bar on the screen
  let addCatButton = <p></p>;
  if (currentUserRole !== "") {
    addCatButton = (
      <button className="default-button"
        id="invite-members-button"
        onClick={()=>setAddCat(true)}>
        + Add Category
      </button>
    );
  }

  return (
    <div className="projects-page">

      <div className="upper-elements">
        <h1 className="default-heading"
          id="link"
          onClick={goToProject}>
          {projectName.name}
        </h1>
        <h1 className="default-heading">
          &nbsp;- Budget
        </h1>

        {addCatButton}

        <SearchBar />
      </div>

      <div className="upper-elements">
         <button className="default-button-2" id="member-display-button">
            Table
         </button>

         <button className="default-button-3"
          id="member-display-button-2"
          onClick={goToInsights}>
            Insights
         </button>
      </div>

      <BudgetTable
        projid={projid}
        projectBudget={projectBudget}
        addCat={addCat}
        postCategory={postCategory}
      />
    </div>
  );
}

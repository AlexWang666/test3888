import React, { useState, useEffect } from 'react'
import axios from "axios";

import "./Budget.css";
import "../../Main.css";

import RoleConstants from "../../BasicComponents/RoleConstants";

export default function BudgetTable({ projid, projectBudget, addCat,
  postCategory }) {
  // projectBudget: The list of budget items
  // addCat: True when adding a category
  // postCategory: The function for posting the new category

  const [currentAdding, setCurrentAdding] = useState(-1);
  const [newCatName, setNewCatName] = useState("");
  const [taskNames, setTaskNames] = useState([]);
  const [tentativeMoney, setTentativeMoney] = useState(
    {
      item: "",
      quantity: 0,
      cost_per: 0.00,
      spent: 0.00,
      cat_id: -1,
      projid: projid,
      taskid: null
    }
  );

  useEffect(() => {
    let params = {"projid": projid};
    const getTaskNames = async () => {
      await axios.get("/api/get-all-task-names", {params}).then((response) => {
        setTaskNames(response.data);
      });
    }

    getTaskNames();
  }, []);


  // Captures the category name as typed into the box
  const captureCat = (cat) => {
    setNewCatName(cat.target.value);
  }


  // Sends the new category name on the enter keypress
  const checkEnterKey = (e) => {
    if (e.key === "Enter") {
      postCategory(newCatName);
    }
  }


  // Creates the new category input box
  let addCategoryBox = <p></p>;
  if (addCat === true) {
    addCategoryBox = (
      <div className="upper-elements">
        <input
          className="default-form-text-small"
          id="add-cat-box"
          placeholder="New category name..."
          onChange={captureCat}
          value={newCatName}
          onKeyDown={checkEnterKey}>
        </input>
      </div>
    )
  }


  const postItem = () => {
    // Posts to db
    axios.post("/api/create-new-budget-item",
      {"params": tentativeMoney}).then((response) => {
        console.log(response.data);
    });

    // Adds to the relevant table in the frontend
    var index = 0;
    for (var i = 0; i < projectBudget.length; i++) {
      if (projectBudget[i].id === tentativeMoney.cat_id) {
        index = i;
      }
    }
    projectBudget[index].items.push(tentativeMoney);

    // Adds to the aggregates
    projectBudget[index].total_budgeted
      += tentativeMoney.quantity*tentativeMoney.cost_per;

    projectBudget[index].total_spent += tentativeMoney.spent;

    projectBudget[index].remaining
      += tentativeMoney.quantity*tentativeMoney.cost_per-tentativeMoney.spent;

    // Resets the tentatitive row
    setCurrentAdding(-1);
    setTentativeMoney(
      {
        item: "",
        quantity: 0,
        cost_per: 0.00,
        spent: 0.00,
        cat_id: -1,
        projid: projid,
        taskid: -1
      }
    );
  }


  // Posts the item on keypress
  const checkEnterKeyItem = (e) => {
    if (e.key === "Enter") {
      postItem();
    }
  }


  // Adds tasks to the drop down menu
  let dropDownMenu = [<option value={null}></option>];
  for (var i = 0; i < taskNames.length; i++) {
    dropDownMenu.push(<option value={taskNames[i].id}>{taskNames[i].name}</option>)
  }

  const getTaskName = (taskid) => {
    for (var i = 0; i < taskNames.length; i++) {
      if (taskNames[i].id === taskid) {
        return taskNames[i].name;
      }
    }

    return "";
  }


  let budget = projectBudget.map((category) => (
    <>
    <div className="upper-elements">
      <h1 className="default-heading-2">
        {category.name}
      </h1>

      <div className="default-button-4"
        id="align-right"
        onClick={()=>setCurrentAdding(category.id)}>
        + Add Item
      </div>
    </div>

    <table className="default-table" id="clickable-table">
    <tbody>

      <tr>
        <td>Item</td>
        <td>Associated Task</td>
        <td>Quantity</td>
        <td>Cost Per Item</td>
        <td>Budgeted</td>
        <td>Spent</td>
        <td>Remaining</td>
      </tr>

      <tr className={"show-budget-row-"+(category.id===currentAdding)}>
        <td>
          <input className="default-form-text-small"
            onChange={(t) => {
              setTentativeMoney({
                ...tentativeMoney,
                cat_id: category.id,
                item: t.target.value,
              });
            }}
            onKeyDown={checkEnterKeyItem}
            value={tentativeMoney.item}>
          </input>
        </td>

        <td>
          <select onChange={(t) => {
            setTentativeMoney({
              ...tentativeMoney,
              cat_id: category.id,
              taskid: t.target.value,
            });
          }}>
            {dropDownMenu}
          </select>
        </td>

        <td>
          <input className="default-form-text-small"
            onChange={(t) => {
              setTentativeMoney({
                ...tentativeMoney,
                cat_id: category.id,
                quantity: t.target.value,
              });
            }}
            onKeyDown={checkEnterKeyItem}
            value={tentativeMoney.quantity}>
          </input>
        </td>

        <td>
          <input className="default-form-text-small"
            onChange={(t) => {
              setTentativeMoney({
                ...tentativeMoney,
                cat_id: category.id,
                cost_per: t.target.value,
              });
            }}
            onKeyDown={checkEnterKeyItem}
            value={tentativeMoney.cost_per}>
          </input>
        </td>

        <td>
          {tentativeMoney.cost_per*tentativeMoney.quantity}
        </td>

        <td>
          <input className="default-form-text-small"
            onChange={(t) => {
              setTentativeMoney({
                ...tentativeMoney,
                cat_id: category.id,
                spent: t.target.value,
              });
            }}
            onKeyDown={checkEnterKeyItem}
            value={tentativeMoney.spent}>
          </input>
        </td>

        <td>
          {tentativeMoney.cost_per*tentativeMoney.quantity-tentativeMoney.spent}
        </td>

      </tr>

      {category.items.map((item) => (
        <tr>
          <td>{item.item}</td>
          <td>{getTaskName(item.taskid)}</td>
          <td>{item.quantity}</td>
          <td>{item.cost_per}</td>
          <td>
            {Number(item.quantity*item.cost_per).toFixed(2)}
          </td>
          <td>{item.spent}</td>
          <td id={"money-remaining-"+(item.quantity*item.cost_per-item.spent>=0)}>
            {Number((item.quantity*item.cost_per)-item.spent).toFixed(2)}
          </td>
        </tr>
      ))}

      <tr className="default-paragraph-4">
        <td>Totals</td>
        <td>
          <progress className="default-progress-bar"
            value={category.total_spent}
            max={category.total_budgeted}
          />
        </td>
        <td></td>
        <td></td>
        <td>{Number(category.total_budgeted).toFixed(2)}</td>
        <td>{category.total_spent}</td>
        <td id={"money-remaining-"+(category.remaining>=0)}>
          {Number(category.remaining).toFixed(2)}
        </td>
      </tr>

    </tbody>
    </table>

    <p>&nbsp;</p>

    </>

  ));

  return (
    <div className="projects-div">
      {addCategoryBox}
      <p>&nbsp;</p>
      {budget}
    </div>
  );
}

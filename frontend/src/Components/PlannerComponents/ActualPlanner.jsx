/*
  ACTUAL PLANNER
  The Gantt Chart.
*/

import React, { useState, useEffect } from "react";
// import { GetDateString } from "../../BasicComponents/GenericFunctions";
import "./PlannerComponents.css";
import "../../Main.css";
import dayjs from "dayjs";
import { FrappeGantt } from "frappe-gantt-react";
import axios from "axios";

export default function ActualPlanner({ dateRange, itemsList, viewMode }) {
  const [updateItemList, setUpdateItemList] = useState([]);

  // dateRange: The range of dates in the whole program

  // itemsList: The list of items for display
  // - name: The title of the thing
  // - type: task, milestone or project
  // - startdate: The initial date
  // - enddate: The final date

  // Gets the classname for the cell we are currently on in the mapping
  var count = 0;
  const createClassName = (start, end, currentDate, type) => {
    // Is the current cell (date) in the range of the task (start and end)?
    currentDate = Date.parse(currentDate);
    start = Date.parse(start);
    end = Date.parse(end);

    var inRange = currentDate >= start && currentDate <= end;
    return ["planner-datum-" + inRange + "-" + type, "gantt-row-" + inRange];
  };

  var itemsListMap = itemsList.map((item, index) => (
    <>
      {index != 0 && item.type === "project" && (
        <tr style={{ height: "32px" }}></tr>
      )}
      <tr className="task-planner-row">
        {dateRange.map((date) => (
          <td
            className={`${
              createClassName(item.startdate, item.enddate, date, item.type)[0]
            } plannerBlock`}
            id={
              createClassName(item.startdate, item.enddate, date, item.type)[1]
            }
          >
            <div className="planner-item-name">
              <p className="default-paragraph-3">{item.name}</p>
            </div>
          </td>
        ))}
      </tr>
    </>
  ));

  useEffect(() => {
    let arr = [];
    itemsList.map((item, index) => {
      if (index !== 0 && item.type === "project") {
        arr.splice(index, 0, {
          id: (index - 1).toString(),
          name: "",
          start: "",
          end: "",
          progress: 0,
        });
      }

      let stDate = new Date(item.startdate);
      let enDate = new Date(item.enddate);
      arr.push({
        ...item,
        id: item.id.toString(),
        start: `${stDate.getFullYear()}-${
          stDate.getMonth() + 1
        }-${stDate.getDate()}`,
        end: `${enDate.getFullYear()}-${
          enDate.getMonth() + 1
        }-${enDate.getDate()}`,
        custom_class:
          item.type === "project"
            ? "cc-blue"
            : item.type === "task"
            ? "cc-grey"
            : "cc-orange",
      });
    });
    setUpdateItemList(arr);
  }, [dateRange, itemsList]);

  var tasks = [
    {
      id: "Task 1",
      name: "Redesign website",
      start: "2016-12-28",
      end: "2016-12-31",
      progress: 20,
    },
  ];

  // useEffect(() => {
  // let divElement = document.querySelector(".gantt-container");
  // let parentElement = divElement.parentNode;
  // parentElement.style.overflow = "hidden";

  // let a = document.querySelector(".gantt");
  // console.log(updateItemList.length * 40 + 60);
  // a.style.height = updateItemList.length * 40 + 60;
  // a.style.height = 600;
  // a.style.overflow = "scroll";
  // }, [updateItemList]);

  const onPlannerDateChange = async (task, start, end) => {
    let arr = updateItemList;
    let modifyStart = dayjs(start).format("YYYY-MM-DD");
    let modifyEnd = dayjs(end).format("YYYY-MM-DD");
    arr.map((e) => {
      if (e.id === task.id) {
        e.start = modifyStart;
        e.end = modifyEnd;
      }
    });
    let params = {
      type: task.type,
      id: task.id,
      s_date: modifyStart,
      e_date: modifyEnd,
    };
    let res = await axios.put("/api/update-timeline", { params });

    if (res.data.status_code === 200) {
      console.log({ res });
    }
    setUpdateItemList(arr);
  };

  useEffect(() => {
    setTimeout(() => {
      let parentDiv = document.querySelector(".gantt-container");
      let today = document.querySelector(".today-highlight");

      // Calculate the scroll distance to the target rect
      const scrollDistance =
        today.getBoundingClientRect().left +
        parentDiv.getBoundingClientRect().left * 2 -
        80;

      parentDiv.scrollLeft = scrollDistance;
    }, 2000);
  }, [updateItemList, dateRange]);

  return (
    <div className="planner-section">
      {/* <table className="planner-table">
        <tbody>
          <tr>
            {console.log({ dateRange, itemsList })}
            {dateRange.map((date) => (
              <td className={"planner-datum"}>
                {GetDateString(date.toString())} */}

      {/* <div>{monthNames[dayjs(date).month()]}</div>

                <div>{dayjs(date).date()} </div> */}
      {/* </td>
            ))}
          </tr>
          {itemsListMap}
        </tbody>
      </table> */}
      <FrappeGantt
        tasks={updateItemList.length ? updateItemList : tasks}
        viewMode={viewMode}
        onDateChange={(task, start, end) =>
          onPlannerDateChange(task, start, end)
        }
      />
    </div>
  );
}

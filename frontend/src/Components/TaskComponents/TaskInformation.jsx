import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Typography, Tag, Checkbox, Button, Alert } from "antd";
import "./TaskComponents.css";
import "../../Main.css";

import { GetDateString } from "../../BasicComponents/GenericFunctions";
import EditTask from "../PlannerComponents/EditTask";
import EditMilestone from "../PlannerComponents/EditMilestone";

const { Paragraph, Title } = Typography;

export default function TaskInformation({
  taskInfo,
  goToPerson,
  onComplete,
  closeBox,
  messageApi,
  getSideList,
  getItemsList,
  projid,
}) {
  // taskInfo: The information about the task
  // - name: Title
  // - type: Type (task or milestone)
  // - author: Who the task is assigned to
  // - pfp: Profile picture of the author
  // - description: Short description
  // - s_date: Start date of the task
  // - e_date: End date of the task
  // - completed: Boolean about whether the task has been completed

  // goToPerson: Function called when clicking on the author name

  // onComplete: Function called when clicking on the completed button

  // closeBox: The function to close the pop-up

  const [subtasksList, setSubtasksList] = useState([]);
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showEditTask, setShowEditTask] = useState(false);
  const [showEditMil, setShowEditMil] = useState(false);
  const [loading, setLoading] = useState(false);

  var addNewSubtask = <p></p>;
  var subtaskHeading = <p></p>;
  if (taskInfo.type === "task") {
    useEffect(() => {
      const params = { id: taskInfo.id };

      const getSubtasksList = async () => {
        await axios
          .get("/api/get-subtasks-for-task", { params })
          .then((response) => {
            setSubtasksList(response.data);
          });
      };

      getSubtasksList();
    }, []);

    const postSubtask = async () => {
      const params = { taskid: taskInfo.id, title: subtaskTitle };

      // Adds the new subtask to the backend
      await axios.post("/api/add-new-subtask", { params }).then((response) => {
        const subtaskId = response.data;

        // Pushes to frontend for instant display
        setSubtasksList([
          ...subtasksList,
          { id: subtaskId, name: subtaskTitle, completed: false },
        ]);
        setSubtaskTitle("");
      });
    };

    // Adds the new subtask on enter
    const checkEnterKey = (e) => {
      if (e.key === "Enter") {
        postSubtask(subtaskTitle);
      }
    };

    // Gets the new subtask title
    const captureSubtask = (text) => {
      setSubtaskTitle(text.target.value);
    };

    // Toggles the new subtask textbox
    subtaskHeading = <p className="default-heading-4">Subtasks</p>;
    addNewSubtask = (
      <input
        type="text"
        onChange={captureSubtask}
        className="default-form-text-small"
        placeholder="Add new subtask..."
        value={subtaskTitle}
        onKeyDown={checkEnterKey}
      ></input>
    );
  }

  const deleteItem = () => {
    setShowDeletePopup(true);
  };

  const sureDelete = async (type, id) => {
    setLoading(true);
    let res;
    if (type === "task") {
      res = await axios.delete("/api/delete-task", { data: { id: id } });

      if (res.data.status_code === 200) {
        messageApi.success("Task got deleted successfully");
        setShowDeletePopup(false);
        getSideList();
        getItemsList();
        closeBox();
        setLoading(false);
      } else {
        messageApi.error("Some error occurred, please try again later");
      }
    } else {
      res = await axios.delete("/api/delete-milestone", { data: { id: id } });

      if (res.data.status_code === 200) {
        messageApi.success("Milestone got deleted successfully");
        setShowDeletePopup(false);
        getSideList();
        getItemsList();
        closeBox();
        setLoading(false);
      } else {
        messageApi.error("Some error occurred, please try again later");
      }
    }
  };

  const editItem = (type) => {
    if (type === "task") {
      setShowEditTask(true);
    } else {
      setShowEditMil(true);
    }
  };

  return (
    <div className="task-info-box">
      {/* <div className="upper-elements-centred">
        <div className="profile-picture" id="author-marketplace-pfp"></div>

        <p className="default-paragraph-5">Assigned to&nbsp;</p>

        <p
          className="default-paragraph-5"
          id="link"
          onClick={() => goToPerson(taskInfo.author_id)}
        >
          {taskInfo.author}
        </p>
      </div> */}
      <Modal
        open={true}
        title={taskInfo.name}
        onOk={closeBox}
        onCancel={closeBox}
        footer={[
          <Button key="submit" type="primary" onClick={closeBox}>
            Ok
          </Button>,
          <Button key="back" onClick={() => editItem(taskInfo.type)}>
            Edit
          </Button>,
          <Button key="delete" onClick={deleteItem} danger>
            Delete
          </Button>,
        ]}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Paragraph onClick={() => goToPerson(taskInfo.author_id)}>
            Assigned to {taskInfo.author}
          </Paragraph>

          <div>
            {taskInfo.type === "task" && (
              <Tag color="blue">{taskInfo.type.toUpperCase()}</Tag>
            )}
            {taskInfo.type === "milestone" && (
              <Tag color="orange">{taskInfo.type.toUpperCase()}</Tag>
            )}
          </div>
        </div>
        <Paragraph>
          {" "}
          {GetDateString(taskInfo.s_date)}{" "}
          {taskInfo.type === "task" && <> - {GetDateString(taskInfo.e_date)}</>}
        </Paragraph>
        {taskInfo.description && (
          <>
            {" "}
            <Paragraph> Description</Paragraph>
            <p> {taskInfo.description}</p>{" "}
          </>
        )}
        {/* {subtaskHeading}
        <div>
          {subtasksList.map((subtask) => (
            <p key={subtask.id}>- {subtask.name}</p>
          ))}
        </div>
        {addNewSubtask} */}

        <Paragraph>
          Completed :{" "}
          <Checkbox
            onChange={() =>
              onComplete(taskInfo.id, taskInfo.type, taskInfo.completed)
            }
            defaultChecked={taskInfo.completed}
          />
        </Paragraph>
      </Modal>

      {showDeletePopup && (
        <Modal
          open={showDeletePopup}
          onCancel={() => setShowDeletePopup(false)}
          onOk={() => sureDelete(taskInfo.type, taskInfo.id)}
          footer={[
            <Button key="back" onClick={() => setShowDeletePopup(false)}>
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={() => sureDelete(taskInfo.type, taskInfo.id)}
              danger
            >
              Delete
            </Button>,
          ]}
        >
          Are you sure you want to delete this {taskInfo.type}?
        </Modal>
      )}

      {showEditTask && (
        <EditTask
          taskDetails={taskInfo}
          showEditTask={showEditTask}
          setShowEditTask={setShowEditTask}
          getSideList={getSideList}
          getItemsList={getItemsList}
          projid={projid}
          closeTaskInfo={closeBox}
        />
      )}

      {showEditMil && (
        <EditMilestone
          taskDetails={taskInfo}
          showEditMil={showEditMil}
          setShowEditMil={setShowEditMil}
          getSideList={getSideList}
          getItemsList={getItemsList}
          projid={projid}
          closeTaskInfo={closeBox}
        />
      )}
    </div>
  );
}

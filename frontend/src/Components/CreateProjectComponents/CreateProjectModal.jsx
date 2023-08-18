import React, { useEffect, useState } from "react";
import { Form, Modal, Input, DatePicker, Button } from "antd";
import axios from "axios";
import { useLocation } from "react-router";
import { useNavigate } from "react-router-dom";

const { TextArea } = Input;
const { RangePicker } = DatePicker;

export default function CreateProject({
  from,
  showProject,
  setShowProject,
  parentProject,
  getItemsList,
  getSideList,
}) {
  let userid = localStorage.getItem("userid");
  const { state } = useLocation();
  let navigate = useNavigate();

  let { projid } = state || {};
  if (projid === undefined) {
    projid = -1;
  }

  const [data, setData] = useState({
    title: "",
    private: true,
    description: "",
    long_description: "",
    s_date: new Date(),
    e_date: new Date(),
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    setLoading(true);
    if (data.title !== "") {
      if (projid === undefined) {
        projid = -1;
      }

      let res = await axios.post("/api/new-project", {
        data: data,
        uid: userid,
        parent: projid,
      });
      if (res.data["msg"] == "success") {
        goToProjects();
      }
    } else {
      setSubmitMsg("Project title cannot be blank.");
    }
  };

  const goToProjects = async () => {
    setShowProject(false);
    if (getSideList && getItemsList) {
      await getSideList();
      await getItemsList();
    }
    if (from === "projectTable") {
      navigate("/project-planner", { state: { projid: parentProject } });
    }

    setLoading(false);
  };

  return (
    <>
      <Modal
        open={showProject}
        title="Create Project"
        onOk={handleSubmit}
        onCancel={() => setShowProject(false)}
        footer={[
          <Button key="back" onClick={() => setShowProject(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleSubmit}
          >
            Submit
          </Button>,
        ]}
      >
        <Form>
          <Form.Item label="Title">
            <Input
              onChange={(event) => {
                setData({
                  ...data,
                  title: event.target.value,
                });
              }}
            />
          </Form.Item>

          <Form.Item label="Short Description">
            <TextArea
              onChange={(event) => {
                setData({
                  ...data,
                  description: event.target.value,
                });
              }}
            />
          </Form.Item>

          <Form.Item label="Long Description">
            <TextArea
              onChange={(event) => {
                setData({
                  ...data,
                  long_description: event.target.value,
                });
              }}
            />
          </Form.Item>

          <Form.Item label="Date">
            <RangePicker
              onChange={(dates, dateString) =>
                setData({
                  ...data,
                  s_date: dateString[0],
                  e_date: dateString[1],
                })
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

import {
  Modal,
  Button,
  Form,
  DatePicker,
  message,
  Upload,
  Input,
  Select,
} from "antd";
import React, { useEffect, useState } from "react";
import { GetUserId } from "../../BasicComponents/GenericFunctions";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Dragger } = Upload;

const { RangePicker } = DatePicker;

export default function CreateTask(props) {
  let projid = props.projid;
  let parentProject = props.parentProject;
  let navigate = useNavigate();

  const [data, setData] = useState({
    title: "",
    description: "",
    s_date: new Date(),
    e_date: new Date(),
    responsible: GetUserId(),
  });
  const [userid, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);

  const elem = {
    name: "file",
    multiple: true,
    action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
    onChange(info) {
      const { status } = info.file;
      if (status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (status === "done") {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  useEffect(() => {
    setUserId(localStorage.getItem("userid"));
  }, []);

  const goToTasks = async () => {
    props.setShowTask(false);
    await props.getSideList();
    await props.getItemsList();
    navigate("/project-planner", { state: { projid: parentProject } });
    setLoading(false);
  };

  const handleSubmit = (event) => {
    setLoading(true);
    if (data.title !== "") {
      axios
        .post("/api/new-task", { data: data, uid: userid, projid: projid })
        .then((response) => {
          if (response.data["msg"] == "success") {
            goToTasks();
          }
        })
        .catch((error) => {
          console.log({ error });
        });
    }
    // else {
    //   setSubmitMsg("Task title cannot be blank.");
    // }
  };

  const handleSearch = (newValue) => {
    fetch(newValue, setData);
  };

  const fetch = async (newValue, callback) => {
    let res = await axios.get(
      `/api/get-project-members-list?projid=${projid}&status=accepted`
    );
    setMembers(res.data.data);
  };

  const handleChange = (value) => {
    setData({
      ...data,
      responsible: value,
    });
  };

  return (
    <Modal
      open={props.showTask}
      title="Create Task"
      onOk={handleSubmit}
      onCancel={() => props.setShowTask(false)}
      footer={[
        <Button key="back" onClick={() => props.setShowTask(false)}>
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
        <Form.Item
          label="Title"
          rules={[
            {
              required: true,
            },
          ]}
          required={true}
        >
          <Input
            onChange={(event) => {
              setData({
                ...data,
                title: event.target.value,
              });
            }}
          />
        </Form.Item>

        <Form.Item label="Description">
          <Input.TextArea
            onChange={(event) => {
              setData({
                ...data,
                description: event.target.value,
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

        <Form.Item label="Assign Responsibility">
          <Select
            showSearch
            defaultActiveFirstOption={false}
            showArrow={false}
            filterOption={false}
            onSearch={handleSearch}
            onChange={handleChange}
            notFoundContent={null}
            options={(members || []).map((d) => ({
              value: d.id,
              label: `${d.name}`,
            }))}
            placeholder="Search User"
            style={{ width: 192, marginLeft: 7 }}
          />
        </Form.Item>

        {/* <Form.Item label="Upload">
          <Dragger {...elem}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Support for a single or bulk upload. Strictly prohibited from
              uploading company data or other banned files.
            </p>
          </Dragger>
        </Form.Item> */}
      </Form>
    </Modal>
  );
}

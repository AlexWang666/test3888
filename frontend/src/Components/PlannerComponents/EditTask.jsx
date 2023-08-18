import { Modal, Button, Form, DatePicker, Input, Select } from "antd";
import React, { useEffect, useState } from "react";
import { GetUserId } from "../../BasicComponents/GenericFunctions";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

export default function EditTask({
  taskDetails,
  showEditTask,
  setShowEditTask,
  getSideList,
  getItemsList,
  projid,
  closeTaskInfo,
}) {
  let navigate = useNavigate();

  const [data, setData] = useState({
    title: "",
    description: "",
    s_date: "",
    e_date: "",
    responsible: GetUserId(),
  });
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    setData({
      ...data,
      title: taskDetails.name,
      description: taskDetails.description,
      s_date: dayjs(taskDetails.s_date).format("YYYY-MM-DD"),
      e_date: dayjs(taskDetails.e_date).format("YYYY-MM-DD"),
      responsible: taskDetails.author_id,
    });
    fetch();
  }, []);

  const goToTasks = async () => {
    await getSideList();
    await getItemsList();
    navigate("/project-planner", { state: { projid: projid } });
    setLoading(false);
    setShowEditTask(false);
    closeTaskInfo();
  };

  const handleSubmit = async () => {
    setLoading(true);
    if (data.title !== "") {
      let res = await axios.put("/api/edit-task", {
        id: taskDetails.id,
        data: {
          title: data.title,
          task_desc: data.description,
          s_date: data.s_date,
          e_date: data.e_date,
          responsible: data.responsible,
        },
      });
      if (res.data.status_code === 200) {
        goToTasks();
      }
    }
  };

  const handleSearch = () => {
    fetch();
  };

  const fetch = async () => {
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
      open={showEditTask}
      title="Edit Task"
      onOk={handleSubmit}
      onCancel={() => setShowEditTask(false)}
      footer={[
        <Button key="back" onClick={() => setShowEditTask(false)}>
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
            value={data.title}
          />
        </Form.Item>
        <Form.Item label="Description">
          <Input.TextArea
            value={data.description}
            onChange={(event) => {
              setData({
                ...data,
                description: event.target.value,
              });
            }}
          />
        </Form.Item>
        <Form.Item>
          Current Date: {"   "}
          {data.s_date} - {data.e_date}
          <br />
        </Form.Item>
        <Form.Item label="Update Date">
          <RangePicker
            // format={"YYYY-MM-DD"}
            // value={[
            //   dayjs(data.s_date).format("YYYY-MM-DD"),
            //   dayjs(data.e_date).format("YYYY-MM-DD"),
            // ]}
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
            value={data.responsible}
            options={(members || []).map((d) => ({
              value: d.id,
              label: `${d.name}`,
            }))}
            placeholder="Search User"
            style={{ width: 192, marginLeft: 7 }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

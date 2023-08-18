import { Modal, Button, Form, DatePicker, Input, Select } from "antd";
import React, { useState, useEffect } from "react";
import { GetUserId } from "../../BasicComponents/GenericFunctions";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

export default function EditMilestone({
  taskDetails,
  showEditMil,
  setShowEditMil,
  getSideList,
  getItemsList,
  projid,
  closeTaskInfo,
}) {
  const [data, setData] = useState({
    title: "",
    description: "",
    s_date: "",
    responsible: GetUserId(),
  });
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  let navigate = useNavigate();

  useEffect(() => {
    setData({
      ...data,
      title: taskDetails.name,
      description: taskDetails.description,
      s_date: dayjs(taskDetails.s_date).format("YYYY-MM-DD"),
      responsible: taskDetails.author_id,
    });
    fetch();
  }, []);

  const onChange = (date, dateString) => {
    setData({
      ...data,
      s_date: dateString,
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    if (data.title !== "") {
      let res = await axios.put("/api/edit-milestone", {
        id: taskDetails.id,
        data: {
          title: data.title,
          mile_desc: data.description,
          s_date: data.s_date,
          responsible: data.responsible,
        },
      });
      if (res.data.status_code === 200) {
        goToTasks();
      }
    }
  };

  const goToTasks = async () => {
    await getSideList();
    await getItemsList();
    navigate("/project-planner", { state: { projid: projid } });
    setLoading(false);
    setShowEditMil(false);
    closeTaskInfo();
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
      open={showEditMil}
      title="Edit Milestone"
      onOk={handleSubmit}
      onCancel={() => setShowEditMil(false)}
      footer={[
        <Button key="back" onClick={() => setShowEditMil(false)}>
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
            value={data.title}
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
          {data.s_date}
          <br />
        </Form.Item>

        <Form.Item label="Update Date">
          <DatePicker onChange={onChange} />
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

import React from "react";
import { Table, Typography, Button } from "antd";
import axios from "axios";

export default function InvitedProjects({
  invitedList,
  getProjects,
  getInvitedProjects,
}) {
  const updateInvitation = async (status, projid, uid) => {
    const res = await axios.put("/api/update-invite-member-to-project", {
      params: {
        uid: uid,
        projid: projid,
        status: status,
      },
    });
    if (res.data.status_code === 200) {
      getProjects();
      getInvitedProjects();
    }
  };

  const columns = [
    {
      title: "Project",
      dataIndex: "project_name",
      key: "project_name",
    },
    {
      title: "Owner",
      dataIndex: "owner_name",
      key: "owner_name",
    },
    {
      title: "Invitation",
      render: (props) => (
        <>
          <Button
            type="primary"
            onClick={() =>
              updateInvitation("accepted", props.project_id, props.user_id)
            }
          >
            Accept
          </Button>
          <Button
            danger
            onClick={() =>
              updateInvitation("rejected", props.project_id, props.user_id)
            }
          >
            Reject
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="projects-div">
      <Table dataSource={invitedList} columns={columns} />
    </div>
  );
}

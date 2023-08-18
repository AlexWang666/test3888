/*
  PROFILE INFORMATION
  Public-facing information about a user. Used when looking at one's own profile
  and someone else's.
*/

import React, { useState, useEffect } from "react";
import { Typography, Result, Select, Input } from "antd";
import axios from "axios";
import { InfoCircleOutlined } from "@ant-design/icons";
import "./ProfileComponents.css";
import "../../Main.css";

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

export default function ProfileInformation({
  profileInfo,
  editing,
  saveEdits,
}) {
  // profileInfo: A list of information for the profile.
  // - bio: The user's bio describing themselves
  // - education: The user's education history (a list of unis)
  // - link: A link to the user's uni page

  // editing: Are we currently in edit mode?

  // saveEdits: A function to save the current edits

  let userProfile = <p></p>;
  const [currentProfile, setCurrentProfile] = useState({});
  const [data, setData] = useState([]);

  useEffect(() => {
    saveEdits(currentProfile);
    fetch("");
  }, [currentProfile]);

  // Captures the text as typed into the box for saving
  const captureBio = async (text) => {
    await setCurrentProfile({ ...profileInfo, bio: text.target.value });
  };

  const captureEducation = async (text) => {
    await setCurrentProfile({ ...profileInfo, education: text.target.value });
  };

  const captureLink = async (text) => {
    await setCurrentProfile({ ...profileInfo, link: text.target.value });
  };

  const fetch = async (newValue) => {
    let res = await axios.get(
      `/api/search/organization?query=${newValue}&limit=10`
    );
    setData(res.data.data);
  };

  const handleSearch = (newValue) => {
    fetch(newValue);
  };

  const handleChange = (newValue, data) => {
    setCurrentProfile({
      ...profileInfo,
      org_id: newValue,
      org_name: data.label,
    });
  };

  if (editing === true) {
    userProfile = (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          className="profile-desc"
          style={{ height: "max-content", width: "60%" }}
        >
          <Title level={4}>Affiliated University</Title>
          <Select
            showSearch
            value={profileInfo.org_id}
            defaultActiveFirstOption={false}
            showArrow={false}
            filterOption={false}
            onSearch={handleSearch}
            onChange={handleChange}
            notFoundContent={null}
            options={(data || []).map((d) => ({
              value: d.id,
              label: d.name,
            }))}
            placeholder="Select Organisation"
          />

          {/* <p className="default-heading-3">Bio</p> */}
          <Title level={4}>Bio</Title>

          {/* <div className="upper-elements-centred"> */}
          {/* <input
            type="text"
            className="default-form-text-small"
            defaultValue={profileInfo.bio}
            onChange={captureBio}
          ></input> */}
          <TextArea
            rows={4}
            onChange={captureBio}
            defaultValue={profileInfo.bio}
          />
          {/* </div> */}

          {/* <p>&nbsp;</p> */}

          {/* <p className="default-heading-3">Education</p> */}
          <Title level={4}>Education</Title>
          <input
            type="text"
            className="default-form-text-small"
            defaultValue={profileInfo.education}
            onChange={captureEducation}
          ></input>

          {/* <p>&nbsp;</p> */}

          {/* <p className="default-heading-3">Link</p> */}
          <Title level={4}>Link</Title>
          <input
            type="text"
            className="default-form-text-small"
            defaultValue={profileInfo.link}
            onChange={captureLink}
          ></input>
        </div>
      </div>
    );
  } else if (
    profileInfo.bio === "" &&
    profileInfo.education === "" &&
    profileInfo.link === "" &&
    profileInfo.org_name === ""
  ) {
    userProfile = (
      <Result
        icon={<InfoCircleOutlined />}
        title="Click Edit button to add bio and education information"
        // extra={<Button type="primary">Next</Button>}
      />
    );
  } else {
    userProfile = (
      <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
        <div className="profile-desc" style={{ width: "60%" }}>
          {/* <p className="default-heading-3">
          
          Bio
        </p> */}
          <Title level={4}>Affiliated University</Title>

          <div className="upper-elements-centred">
            <p>{profileInfo.org_name}</p>
          </div>

          <p>&nbsp;</p>
          <Title level={4}>Bio</Title>

          <div className="upper-elements-centred">
            <p>{profileInfo.bio}</p>
          </div>

          <p>&nbsp;</p>

          {/* <p className="default-heading-3">Education</p> */}
          <Title level={4}>Education</Title>
          <p>{profileInfo.education}</p>

          <p>&nbsp;</p>

          {/* <p className="default-heading-3">Link</p> */}
          <Title level={4}>Link</Title>
          <p>{profileInfo.link}</p>
        </div>
      </div>
    );
  }

  return <>{userProfile}</>;
}

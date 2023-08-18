import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Select } from "antd";
import "./OrganisationMembersTable.css";
import "../../Main.css";

import PeopleResultsList from "../../Components/SearchComponents/PeopleResultsList";
import RoleConstants from "../../BasicComponents/RoleConstants";

export default function AddCollaborator({
  addCollabor,
  searchType = "all",
  thingId = null,
  projid,
  messageApi,
  getProjectMembers,
}) {
  // addCollabor: Function which adds the selected user to the members table

  // searchType: Default is all to get all users in db, but you can make a more
  // specific type of search and then pass the id of the thing

  const [searchText, setSearchText] = useState("");
  const [peopleResults, setPeopleResults] = useState([]);
  const [data, setData] = useState([]);
  const [selectedUser, setSelectedUser] = useState();
  const [loading, setLoading] = useState(false);

  const searchDemPeople = async () => {
    if (searchType === "all") {
      // Gets the search results for all the people
      const params = { search_query: searchText };
      await axios.get("/api/search-for-people", { params }).then((response) => {
        setPeopleResults(response.data);
      });
    } else if (searchType === "inProject") {
      // Only gets the people within the current project
      const params = { search_query: searchText, projid: thingId };
      await axios
        .get("/api/search-for-people-in-project", { params })
        .then((response) => {
          setPeopleResults(response.data);
        });
    }
  };

  const captureSearch = (text) => {
    setSearchText(text.target.value);
  };

  const checkEnterKey = (e) => {
    if (e.key === "Enter") {
      {
        searchDemPeople();
      }
    }
  };

  const toggleResults = () => {
    setPeopleResults([]);
  };

  // Called when clicking on a search result
  const personAdded = (userid) => {
    setPeopleResults([]);
    {
      addCollabor(userid);
    }
  };

  const fetch = async (newValue, callback) => {
    let res = await axios.get(
      `/api/search/researchers?query=${newValue}&limit=30`
    );
    setData(res.data.data);
  };

  const handleSearch = (newValue) => {
    fetch(newValue, setData);
  };

  const handleChange = (value) => {
    setSelectedUser(value);
  };

  const inviteUserToProject = async () => {
    setLoading(true);
    let res = await axios.post("/api/invite-member-to-project", {
      params: {
        uid: selectedUser,
        projid: projid,
        role: "R",
      },
    });
    if (res.data.status_code === 200) {
      messageApi.success("Invitation sent to the user successfully");
      setData([]);
      setSelectedUser([]);
      getProjectMembers();
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="upper-elements">
        {/* <input className="search-bar"
          id="user-search-bar"
          placeholder="Find users..."
          onChange={captureSearch}
          value={searchText}
          onKeyDown={checkEnterKey}
          onClick={toggleResults}>
        </input> */}
        <Select
          showSearch
          defaultActiveFirstOption={false}
          showArrow={false}
          filterOption={false}
          onSearch={handleSearch}
          onChange={handleChange}
          notFoundContent={null}
          options={(data || []).map((d) => ({
            value: d.id,
            label: `${d.first_name} ${d.last_name} (${d.email})`,
          }))}
          placeholder="Search User"
          style={{ width: 192, marginLeft: 7 }}
        />
        <Button type="primary" onClick={inviteUserToProject} loading={loading}>
          Invite
        </Button>
      </div>

      {/* <PeopleResultsList peopleList={peopleResults} goToProfile={personAdded} /> */}
    </div>
  );
}

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "antd";
import "../../Main.css";
const { Search } = Input;

export default function SearchBar({ isSearchPage = false }) {
  // isSearchPage: Are we currently already in the search page?

  const [searchText, setSearchText] = useState("");

  // Captures the message text as typed into the search bar
  const captureSearch = (text) => {
    setSearchText(text.target.value);
  };

  // Navigation functions
  let navigate = useNavigate();

  // Called when the user clicks on a particular program icon
  const goToSearchPage = (searchText) => {
    navigate("/search-results", { state: { search_query: searchText } });
    if (isSearchPage === true) {
      navigate(0);
    }
  };

  // Begins the search on enter keypress
  const checkEnterKey = (e) => {
    if (e.key === "Enter") {
      {
        goToSearchPage(searchText);
      }
    }
  };

  return (
    <Search
      className="search-bar"
      placeholder="Search here"
      allowClear
      onSearch={goToSearchPage}
      style={{
        width: 200,
      }}
    />
  );
}

{
  /* <input className="search-bar"
      placeholder="&#x1F50E; search..."
      onChange={captureSearch}
      value={searchText}
      onKeyDown={checkEnterKey}>
    </input> */
}

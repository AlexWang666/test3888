import React from "react";
import "../../Main.css";

import SearchBar from "../../Components/SearchComponents/SearchBar";

export default function Home() {
  return (
    <div className="projects-page">
      <div className="upper-elements">
        <h1>PAGE: Home</h1>
        <SearchBar />
      </div>
    </div>
  );
}

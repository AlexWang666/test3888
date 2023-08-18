import "./DropDownMenu.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useComponentVisible from "../../BasicComponents/UseComponentVisible";
import { v4 as uuidv4 } from "uuid";
import { useState } from "react";

export default function DriveLocations({
  currentFolderPath,
  currentFolderName,
}) {
  const [showDriveLocations, setShowDriveLocations] = useState(false);
  const { visibleRef } = useComponentVisible([[setShowDriveLocations, false]]);

  const dropDownItems = [
    { name: "Drive Home", path: "/drive" },
    {
      name: "Shared With Me",
      path: "/drive-shared-with-me",
    },
    {
      name: currentFolderName,
      path: currentFolderPath,
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <button
        className="default-button"
        id="align-right"
        onClick={() => setShowDriveLocations(!showDriveLocations)}
      >
        {currentFolderName}
      </button>

      {showDriveLocations ? (
        <div className="dropdown-menu" ref={visibleRef}>
          {dropDownItems.map((item) => (
            <div
              className="dropdown-item"
              key={item.name}
              onClick={() => item.func(setShowDrive, userid, parentUUID)}
            >
              {item.icon}
              <a
                style={{
                  color: "black",
                  textDecoration: "none",
                  marginLeft: "0.5rem",
                }}
              >
                {item.name}
              </a>
            </div>
          ))}
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

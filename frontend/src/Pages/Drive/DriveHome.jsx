import "./DocumentEditor.css";
import "./DriveHome.css";
import useInterval from "../../BasicComponents/UseInterval";
import DropDownMenu from "../../Components/DriveComponents/DropDownMenu";
import DriveLocations from "../../Components/DriveComponents/DriveLocations";
import React, { useEffect, useState } from "react";
import ShareModal from "../../Components/DriveComponents/ShareModal";
import getUrlParam from "../../BasicComponents/GetUrlParam";
import { useNavigate, useLocation } from "react-router-dom";

import "../../Main.css";
import md5 from "md5-hash";
import axios from "axios";

import DriveFolderFiles from "../../Components/DriveComponents/DriveFolderFiles";
import SearchBar from "../../Components/SearchComponents/SearchBar";

// Global constants
const SAVE_RATE_MS = 30000;

export default function DriveHome() {
  // State, constants and helper functions
  // --------------------------------------------------------------------------
  const [driveItems, setDriveItems] = useState([]); // Items in the current folder
  const [filterString, setFilterString] = useState("");
  const [parentUUID, setParentUUID] = useState(null); // UUID of the current folder
  const [roleInFolder, setRoleInFolder] = useState(null);
  const [folderInfo, setFolderInfo] = useState({});
  const [intervalCount, setIntervalCount] = useState(0);

  const [isHome, setIsHome] = useState(null);

  // React router functions
  let navigate = useNavigate();
  let location = useLocation();

  const userid = parseInt(getUrlParam("userid"));

  const getDriveItems = (params) => {
    /*
      parent_uuid
      userid
      is_home
* */
    axios.get("/api/get-drive-items-in-folder", { params }).then((res) => {
      const folderInfo = res.data.folder_info; // Object
      const folderItems = res.data.folder_items; // Array of objects

      if (!folderInfo) {
        navigate("/does-not-exist");
      }

      setDriveItems(folderItems);
      setFolderInfo(folderInfo);
    });
  };
  const openItem = (fileInfo, userid) => {
    const uuid = fileInfo.uuid;
    const itemType = fileInfo.item_type;

    if (itemType == "document") {
      var docUrl = `/document-editor?uuid=${uuid}&userid=${userid}&home=${isHome}`;
      window.open(docUrl, "_blank").focus();
    } else {
      setParentUUID(uuid);
      setFolderInfo(fileInfo);
      navigate(`/drive?userid=${userid}&parent_uuid=${uuid}&home=${isHome}`);
    }
  };

  const performAuth = (uuid) => {
    // Perform authorization and authentification
    // uuid: The id of the drive item the user is trying to access.

    const urlParamId = getUrlParam("userid");

    // Authorization
    // [Local Storage Auth]
    // Make sure the user didn't change the userid url param
    // Not the best. Alternatives? Redux?
    const authentifiedId = localStorage.getItem("userid");
    if (!(urlParamId && authentifiedId && urlParamId === authentifiedId)) {
      console.log("[Drive] authentification failed");
      navigate("/no-permission");
    }

    // Authorization
    // Make sure the user has permission to view this folder
    // Why sending userid is faster than retrieving all userids with access?
    if (uuid) {
      axios
        .get("/api/check-drive-item-authorization", {
          params: { uuid: uuid, userid: urlParamId },
        })
        .then((res) => {
          if (!res.data.authorized) {
            console.log("[Drive] authorization failed");
            navigate("/no-permission");
          }
        });
    }
  };
  // --------------------------------------------------------------------------

  useEffect(() => {
    const newParentUUID = getUrlParam("parent_uuid");
    performAuth(newParentUUID);
  }, []);

  useInterval(() => {
    const params = {
      parent_uuid: parentUUID,
      userid: userid,
      is_home: isHome,
    };
    getDriveItems(params);
    setIntervalCount(intervalCount + SAVE_RATE_MS / 1000);
  }, SAVE_RATE_MS);

  useEffect(() => {
    // URL params are strings... RIP
    const newIsHome = getUrlParam("home") === "true";
    setIsHome(newIsHome);

    const newParentUUID = getUrlParam("parent_uuid");
    performAuth(newParentUUID);
    setParentUUID(newParentUUID);

    const params = {
      parent_uuid: newParentUUID,
      userid: userid,
      is_home: newIsHome,
    };
    getDriveItems(params);
  }, [location]);

  return (
    <div className="projects-page">
      <div className="upper-elements">
        <button
          className="default-button-5"
          onClick={() => {
            navigate(`/drive?userid=${userid}&parent_uuid=&home=true`);
          }}
        >
          <h1 className="default-heading">Drive</h1>
        </button>

        <SearchBar />
      </div>

      <p>&nbsp;</p>

      <div
        className="upper-elements"
        style={{ justifyContent: "space-between" }}
      >
        <div style={{ display: "flex" }}>
          <button
            className="default-button-5"
            style={{
              borderRadius: "0.5rem",
              backgroundColor: isHome ? "#E8F0FE" : "#FAFBFC",
            }}
            onClick={() => {
              var rootDriveHomeUrl = `/drive?userid=${userid}&parent_uuid=&home=true`;
              navigate(rootDriveHomeUrl);
            }}
          >
            <h2 id="drive-home" className="default-heading-2">
              My Files
            </h2>
          </button>
          <button
            className="default-button-5"
            style={{
              borderRadius: "0.2rem",
              backgroundColor: isHome ? "#FAFBFC" : "#E8F0FE",
            }}
            onClick={() => {
              var rootSharedDriveUrl = `/drive?userid=${userid}&parent_uuid=&home=false`;
              navigate(rootSharedDriveUrl);
            }}
          >
            <h2 id="drive-shared-with-me" className="default-heading-2">
              Shared with me
            </h2>
          </button>
        </div>

        {
          <DropDownMenu
            userid={userid}
            parentUUID={parentUUID}
            isHome={isHome}
            folderInfo={folderInfo}
          />
        }
      </div>

      <hr />

      <input
        type="text"
        placeholder={"Filter folders and documents"}
        style={{
          borderColor: "lightgrey",
          borderRadius: "0.3em",
          width: "50%",
          margin: "auto",
          border: "1px solid",
          marginTop: "1rem",
          marginBottom: "1rem",
        }}
        className="title-input"
        onChange={(e) => {
          setFilterString(e.target.value);
        }}
      />

      <h2
        id="drive-current-folder"
        style={{ textAlign: "center" }}
        className="default-heading-2"
      >
        {folderInfo.name ? folderInfo.name : ""}
      </h2>

      <DriveFolderFiles
        userid={userid}
        folderInfo={folderInfo}
        driveItems={
          filterString
            ? driveItems.filter(
                (item) =>
                  item.name &&
                  item.name.toLowerCase().includes(filterString.toLowerCase())
              )
            : driveItems
        }
        getDriveItems={getDriveItems}
        openItem={openItem}
      />
    </div>
  );
}

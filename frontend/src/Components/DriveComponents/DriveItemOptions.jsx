import { ROLES_WITH_EDIT_PRIVILEGES } from "../../BasicComponents/RoleConstants";
import "./DriveItemOptions.css";
import axios from "axios";
import useComponentVisible from "../../BasicComponents/UseComponentVisible";
import ShareModal from "./ShareModal";
import { useState } from "react";
import "./DropDownMenu.css";
import "../../Main.css";
import getUrlParam from "../../BasicComponents/GetUrlParam";

export default function DriveItemOptions({
  uuid,
  name,
  showOptionsMenu,
  setShowOptions,
  userid,
  folderInfo,
  folders,
  getDriveItems,
  pageX,
  pageY,
}) {
  const [showModal, setShowModal] = useState(false);
  const [showFolders, setShowFolders] = useState(false);
  const { visibleRef } = useComponentVisible([
    [setShowOptions, false],
    [setShowFolders, false],
  ]);

  const createParams = (userid, folderInfo, is_home) => {
    const parentUUID = folderInfo.uuid ? folderInfo.uuid : "";
    return {
      parent_uuid: parentUUID,
      userid: userid,
      is_home: is_home,
    };
  };

  const renameDriveItem = (uuid, newName) => {
    axios
      .put("/api/rename-drive-item", {
        uuid: uuid,
        new_name: newName,
        is_home: getUrlParam("home"),
      })
      .then(() => {
        const params = createParams(userid, folderInfo);
        getDriveItems(params);
      });
  };

  const deleteDriveItem = (uuid) => {
    axios
      .post("/api/delete-drive-item", {
        uuid: uuid,
      })
      .then(() => {
        const params = createParams(userid, folderInfo, getUrlParam("home"));
        getDriveItems(params);
      });
  };

  const moveDriveItem = (uuid, newParentUUID) => {
    axios
      .put("/api/move-drive-item", {
        drive_item_uuid: uuid,
        new_parent_uuid: newParentUUID,
      })
      .then(() => {
        const params = createParams(userid, folderInfo, getUrlParam("home"));
        getDriveItems(params);
      });
  };

  // Very long...
  // Should refactor to a few smaller components
  return showOptionsMenu ? (
    <div
      className="dropdown-menu"
      ref={visibleRef} //Might need to add another ref for react-dnd
      style={{ top: `${pageY}px`, left: `${pageX}px`, position: "fixed" }}
    >
      {showFolders ? (
        folders.map((folder) => {
          return (
            <div
              className="option-dropdown-item right-click-option"
              key={`${uuid}-${folder.uuid}-move`}
              onClick={() => {
                moveDriveItem(uuid, folder.uuid);
              }}
            >
              <a>{folder.name}</a>
            </div>
          );
        })
      ) : (
        <>
          <div
            className="option-dropdown-item right-click-option"
            key={`${uuid}-rename`}
            onClick={() => {
              var newName;
              var message = "Rename";
              do {
                newName = window.prompt(message);
                if (newName === null) return;
                else if (newName == "") message = "Please provide a name";
                else break;
              } while (newName === "");
              renameDriveItem(uuid, newName);
            }}
          >
            <a>Rename</a>
          </div>
          <div
            className="option-dropdown-item right-click-option"
            key={`${uuid}-delete`}
            onClick={() => {
              deleteDriveItem(uuid);
            }}
          >
            <a>Delete</a>
          </div>
          <div
            className="option-dropdown-item right-click-option"
            key={`${uuid}-move-to`}
            onClick={() => {
              setShowFolders(true);
            }}
          >
            <a>Move To</a>
          </div>
          <div
            className="option-dropdown-item right-click-option"
            key={`${uuid}-share`}
            onClick={() => {
              setShowOptions(false);
              setShowFolders(false);
              setShowModal(!showModal);
            }}
          >
            <a>Share</a>
          </div>
        </>
      )}
    </div>
  ) : (
    <ShareModal
      uuid={uuid}
      documentName={name}
      userid={userid}
      showModal={showModal}
      setShowModal={setShowModal}
    />
  );
}

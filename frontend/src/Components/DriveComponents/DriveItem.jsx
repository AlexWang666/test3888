import { ROLES_WITH_EDIT_PRIVILEGES } from "../../BasicComponents/RoleConstants";
import "./DriveComponents.css";
import { useState, useEffect } from "react";
import useComponentVisible from "../../BasicComponents/UseComponentVisible";
import DriveItemOptions from "./DriveItemOptions";
import axios from "axios";

export default function DriveItem({
  fileInfo,
  openItem,
  userid,
  folderInfo,
  folders,
  getDriveItems,
}) {
  const [selected, setSelected] = useState(false);
  const [showOptionsMenu, setShowOptions] = useState(false);
  const [pageX, setPageX] = useState(0);
  const [pageY, setPageY] = useState(0);
  const { visibleRef } = useComponentVisible([[setSelected, false]]);

  return (
    <div
      id={`${fileInfo.uuid}-drive-item`}
      ref={(element) => {
        visibleRef.current = element;
      }}
      className="file-folder-rectangle"
      style={{ backgroundColor: selected ? "#E8F0FE" : "" }}
      onContextMenu={(e) => {
        e.preventDefault();
        const params = { uuid: fileInfo.uuid, userid: userid };
        axios.get("/api/get-user-role", { params }).then((res) => {
          if (!ROLES_WITH_EDIT_PRIVILEGES.includes(res.data.user_role)) return;

          setSelected(true);
          setShowOptions(true);
          setPageX(e.pageX);
          setPageY(e.pageY);
        });
      }}
      onClick={(e) => {
        if (e.detail == 1) {
          //if (e.target != e.currentTarget) return;
          //TODO: Select multiple files/folders to perform action
          if (e.ctrlKey) console.log("ctrl + left click");
          setSelected(true);
        } else if (e.detail == 2) {
          setSelected(false);
          openItem(fileInfo, userid);
        }
      }}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <DriveItemOptions
          uuid={fileInfo.uuid}
          name={fileInfo.name}
          showOptionsMenu={showOptionsMenu}
          setShowOptions={setShowOptions}
          userid={userid}
          folderInfo={folderInfo}
          folders={folders}
          getDriveItems={getDriveItems}
          pageX={pageX}
          pageY={pageY}
        />
      </div>

      <div className="upper-elements">
        <p className="file-name" style={{ overflow: "hidden" }}>
          {fileInfo.name}
        </p>

        <div
          className="file-folder-icon"
          id={fileInfo.item_type + "-file-type"}
        >
          <p>{fileInfo.item_type.toUpperCase()}</p>
          <p>{fileInfo.owner_id !== userid ? fileInfo.user_role : ""}</p>
        </div>
      </div>
    </div>
  );
}

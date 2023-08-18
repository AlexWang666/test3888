import "../../Main.css";
import "./DriveComponents.css";
import DriveItem from "./DriveItem";
import { useState } from "react";

export default function DriveFolderFiles({
  userid,
  folderInfo,
  driveItems,
  getDriveItems,
  openItem,
}) {
  const filterFileType = (driveItems, fileType, selfUUID) => {
    return driveItems.filter((element) => {
      return element.item_type == fileType && element.uuid !== selfUUID;
    });
  };

  return (
    <div className="boxes-holder">
      {driveItems ? (
        driveItems
          .sort((firstObj, secondObj) => {
            if (
              firstObj.item_type == "folder" &&
              secondObj.item_type == "document"
            )
              return -1;
            else if (
              firstObj.item_type == "document" &&
              secondObj.item_type == "folder"
            )
              return 1;
            else {
              if (firstObj.name < secondObj.name) return -1;
              if (firstObj.name > secondObj.name) return 1;
              return 0;
            }
          })
          .map((fileInfo) => (
            <DriveItem
              fileInfo={fileInfo}
              openItem={openItem}
              userid={userid}
              folderInfo={folderInfo}
              folders={filterFileType(driveItems, "folder", fileInfo.uuid)}
              getDriveItems={getDriveItems}
              key={fileInfo.uuid}
            />
          ))
      ) : (
        <></>
      )}
    </div>
  );
}

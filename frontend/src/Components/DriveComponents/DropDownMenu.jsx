import { ROLES_WITH_EDIT_PRIVILEGES } from "../../BasicComponents/RoleConstants";
import "./DropDownMenu.css";
import { AiFillFileAdd, AiFillFolderAdd } from "react-icons/ai";
import axios from "axios";
import useComponentVisible from "../../BasicComponents/UseComponentVisible";
import { v4 as uuidv4 } from "uuid";
import { useState, useEffect } from "react";

const createFolder = (
  setShowDropDownMenu,
  userid,
  parentUUID,
  isHome,
  folderInfo
) => {
  setShowDropDownMenu(false);

  var uuid = uuidv4();
  // Replace this with a modal (popup) at some point
  var folderName;
  var message = "New folder";
  do {
    folderName = window.prompt(message);
    if (folderName === null) return;
    else if (folderName == "") message = "Please provide a name";
    else break;
  } while (folderName === "");

  const parentOwnerId =
    folderInfo && folderInfo.owner_id ? folderInfo.owner_id : null;
  const params = {
    uuid: uuid,
    item_type: "folder",
    name: folderName,
    userid: userid,
    parent_owner_id: parentOwnerId,
    contents: "\n",
    parent_uuid: parentUUID,
    is_home: isHome,
  };
  axios.post("/api/create-drive-item", { params }).then(() => {
    window.location.reload();
  });
};

const createDocument = (
  setShowDropDownMenu,
  userid,
  parentUUID,
  isHome,
  folderInfo
) => {
  setShowDropDownMenu(false);
  var uuid = uuidv4();
  var docUrl = `/document-editor?uuid=${uuid}&userid=${userid}&home=${isHome}`; // Including primary keys in url is probably not a good idea.

  const parentOwnerId =
    folderInfo && folderInfo.owner_id ? folderInfo.owner_id : null;
  const params = {
    uuid: uuid,
    item_type: "document",
    name: "Untitled Document",
    userid: userid,
    parent_owner_id: parentOwnerId,
    contents: "\n",
    parent_uuid: parentUUID,
    is_home: isHome,
  };

  axios.post("/api/create-drive-item", { params }).then(() => {
    window.open(docUrl, "_blank").focus();
  });
};

const getRoleInFolder = (userid, parentUUID, setRoleInFolder) => {
  const params = {
    userid: userid,
    uuid: parentUUID,
  };
  axios.get("/api/get-role-in-folder", { params }).then((res) => {
    setRoleInFolder(res.data.user_role);
  });
};

const dropDownItems = [
  { name: "Folder", func: createFolder, icon: <AiFillFolderAdd /> },
  { name: "Document", func: createDocument, icon: <AiFillFileAdd /> },
];

const DropDownMenu = ({ userid, parentUUID, isHome, folderInfo }) => {
  const [showDropDownMenu, setShowDropDownMenu] = useState(false);
  const [roleInFolder, setRoleInFolder] = useState(null);
  const { visibleRef } = useComponentVisible([[setShowDropDownMenu, false]]);
  if (!parentUUID) parentUUID = "";

  useEffect(() => {
    if (!isHome) {
      getRoleInFolder(userid, parentUUID, setRoleInFolder);
    }
  }, [parentUUID]);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <button
        id="align-right"
        disabled={
          !isHome && (!parentUUID ||
          ROLES_WITH_EDIT_PRIVILEGES.indexOf(roleInFolder) === -1)
        }
        className="default-button"
        onClick={() => {
          setShowDropDownMenu(!showDropDownMenu);
        }}
      >
        + Create New
      </button>

      {showDropDownMenu ? (
        <div className="dropdown-menu" ref={visibleRef}>
          {dropDownItems.map((item) => (
            <div
              className="dropdown-item"
              key={item.name}
              onClick={() =>
                item.func(
                  setShowDropDownMenu,
                  userid,
                  parentUUID,
                  isHome,
                  folderInfo
                )
              }
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
};

export default DropDownMenu;

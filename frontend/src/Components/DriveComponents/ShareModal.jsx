// Inspired by https://www.youtube.com/watch?v=9DwGahSqcEc
//
// Modal component that will be displayed when a user right clicks
// a drive item and selects the "Share" option or when they click the "Share" button inside a document

import { ROLES_WITH_EDIT_PRIVILEGES } from "../../BasicComponents/RoleConstants";
import axios from "axios";
import "./ShareModal.css";
import "./DropDownMenu.css";
import "../../Main.css";
import { useState, useEffect } from "react";
import useComponentVisible from "../../BasicComponents/UseComponentVisible";
import { AiFillCaretDown, AiFillEdit, AiFillEye } from "react-icons/ai";

// Should think about refactoring the 2 dropdowns (maybe move to new file)
// into less code, they look similar and are doing similar things
function NewRoleDropDown({ currentRole, setCurrentRole }) {
  const [showRoleOptions, setShowRoleOptions] = useState(false);
  const { visibleRef } = useComponentVisible([[setShowRoleOptions, false]]);

  return (
    <div
      style={{ display: "flex", margin: 0 }}
      ref={(element) => {
        visibleRef.current = element;
      }}
    >
      <button
        value={currentRole}
        className="default-button"
        onClick={() => setShowRoleOptions(!showRoleOptions)}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          {currentRole}
          <AiFillCaretDown style={{ marginLeft: "0.3rem" }} />
        </div>
      </button>
      {showRoleOptions ? (
        <div className="role-dropdown-menu">
          <div
            className="role-dropdown-item"
            onClick={() => {
              setCurrentRole("Viewer");
              setShowRoleOptions(!showRoleOptions);
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <AiFillEye style={{ marginRight: "0.3rem" }} />
              <p>Viewer</p>
            </div>
          </div>
          <div
            className="role-dropdown-item"
            onClick={() => {
              setCurrentRole("Editor");
              setShowRoleOptions(!showRoleOptions);
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <AiFillEdit style={{ marginRight: "0.3rem" }} />
              <p>Editor</p>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

function ExistingRoleDropDown({
  uuid,
  contributor,
  contributors,
  setContributors,
}) {
  const [showRoleOptions, setShowRoleOptions] = useState(false);
  const { visibleRef } = useComponentVisible([[setShowRoleOptions, false]]);

  const updateContributor = (contributors, uuid, user_id, newRole) => {
    var index = contributors.findIndex(
      (c) => c.uuid == uuid && c.user_id == user_id
    );

    if (index == -1) {
      //handle index doesn't exist
    } else {
      setContributors([
        ...contributors.slice(0, index),
        Object.assign({}, contributors[index], { user_role: newRole }),
        ...contributors.slice(index + 1),
      ]);
      console.log(
        Object.assign({}, contributors[index], { user_role: newRole })
      );
    }
  };

  return (
    <div
      style={{ display: "flex", margin: 0 }}
      ref={(element) => {
        visibleRef.current = element;
      }}
    >
      <button
        value=""
        className="default-button"
        onClick={() => setShowRoleOptions(!showRoleOptions)}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          {`${contributor.user_role}`}
          <AiFillCaretDown style={{ marginLeft: "0.3rem" }} />
        </div>
      </button>
      {showRoleOptions ? (
        <div className="role-dropdown-menu">
          <div
            className="role-dropdown-item"
            onClick={() => {
              updateContributor(contributors, uuid, contributor.id, "Viewer");
              setShowRoleOptions(!showRoleOptions);
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <AiFillEye style={{ marginRight: "0.3rem" }} />
              <p>Viewer</p>
            </div>
          </div>
          <div
            className="role-dropdown-item"
            onClick={() => {
              updateContributor(contributors, uuid, contributor.id, "Editor");
              setShowRoleOptions(!showRoleOptions);
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <AiFillEdit style={{ marginRight: "0.3rem" }} />
              <p>Editor</p>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export default function ShareModal({
  uuid,
  documentName,
  userid,
  showModal,
  setShowModal,
}) {
  const [currentRole, setCurrentRole] = useState("Viewer");
  const [currentEmail, setCurrentEmail] = useState("");
  const [contributors, setContributors] = useState([]);

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const getContributors = (uuid) => {
    axios
      .get("/api/get-existing-contributors", { params: { uuid: uuid } })
      .then((res) => {
        var existingContributors = res.data.existing_contributors;

        setContributors(existingContributors);
      });
  };

  const addContributor = (currentEmail, currentRole) => {
    // Check the email doesn't already belong to a contributor
    const found = contributors.some(
      (contributor) => contributor.email == currentEmail
    );
    if (found) {
      window.alert("This email already belongs to a contributor");
      return;
    }
    // Check the email belongs to a profile and its not own profile
    axios
      .get("/api/get-profile-by-email", {
        params: { email: currentEmail },
      })
      .then((res) => {
        const profile = res.data.profile;
        if (!profile) {
          window.alert("This email doesn't belong to a user");
          return;
        } else if (profile.id == userid) {
          window.alert("You already own this file");
          return;
        }
        setContributors([
          ...contributors,
          {
            id: profile.id,
            first_name: profile.first_name,
            last_name: profile.last_name,
            email: currentEmail,
            user_role: currentRole,
            status: "add",
          },
        ]);
      });
  };

  const removeContributor = (userid) => {
    // c.id here is referring to the id from the profile table.
    // Should we change the column name to be more explicit?
    var index = contributors.findIndex((c) => c.id == userid);
    console.log(userid);
    console.log("INDEX", contributors, index);

    if (index == -1) {
      //handle index doesn't exist
    } else {
      contributors[index].status == "add"
        ? setContributors([
            ...contributors.slice(0, index),
            ...contributors.slice(index + 1),
          ])
        : setContributors([
            ...contributors.slice(0, index),
            Object.assign({}, contributors[index], {
              status: "remove",
            }),
            ...contributors.slice(index + 1),
          ]);
    }
  };

  const upsertContributors = (uuid) => {
    axios.post("/api/upsert-contributors", {
      uuid: uuid,
      contributors: contributors.filter((c) => {
        return c.status !== "remove";
      }),
    });
    axios.post("/api/delete-contributors", {
      uuid: uuid,
      contributors: contributors.filter((c) => {
        return c.status === "remove";
      }),
    });
    setShowModal(!showModal);

    getContributors(uuid);
  };

  useEffect(() => {
    getContributors(uuid);
  }, []);

  return (
    <>
      {showModal && (
        <div className="modal" style={{ cursor: "auto" }}>
          <div onClick={toggleModal} className="overlay" />
          <div className="modal-content">
            <h2 style={{ margin: "2rem" }}>{`Share "${documentName}"`}</h2>
            <h4>Add contributors</h4>
            <div style={{ display: "flex", marginBottom: "2rem" }}>
              <input
                type="text"
                placeholder="Add users by email"
                className="share-with-input-box"
                onChange={(e) => {
                  setCurrentEmail(e.target.value);
                }}
              ></input>
              <NewRoleDropDown
                currentRole={currentRole}
                setCurrentRole={setCurrentRole}
              />
              <button
                style={{ marginLeft: "0.5rem" }}
                className="default-button"
                onClick={() => {
                  addContributor(currentEmail, currentRole);
                }}
              >
                Add
              </button>
            </div>
            <h4>Shared with</h4>
            {/*
                Shared with section
            */}
            <div
              style={{
                width: "90%",
                height: "50%",
                overflowY: "auto",
                overflowX: "hidden",
                marginBottom: "1rem",
              }}
            >
              {contributors.map((contributor) => {
                return (
                  <div
                    style={{
                      display: "flex",
                      width: "auto",
                      justifyContent: "space-between",
                      marginBottom: "0.2rem",
                    }}
                  >
                    <div
                      style={{
                        width: "50%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      {contributor.status ? (
                        contributor.status == "add" ? (
                          <p
                            style={{ marginRight: "0.3rem", color: "green" }}
                          >{`${contributor.first_name} ${contributor.last_name} (Pending addition)`}</p>
                        ) : (
                          <p
                            style={{ marginRight: "0.3rem", color: "red" }}
                          >{`${contributor.first_name} ${contributor.last_name} (Pending removal)`}</p>
                        )
                      ) : (
                        <p
                          style={{ marginRight: "0.3rem" }}
                        >{`${contributor.first_name} ${contributor.last_name}`}</p>
                      )}
                      <small>{`${contributor.email}`}</small>
                    </div>
                    <ExistingRoleDropDown
                      uuid={uuid}
                      contributor={contributor}
                      contributors={contributors}
                      setContributors={setContributors}
                    />
                    <button
                      id={`remove-contributor-${contributor.id}`}
                      className="default-button"
                      onClick={(e) => {
                        const contributorId = e.target.id.split(
                          "remove-contributor-"
                        )[1]; // Always at least 2 elements in the array?

                        removeContributor(contributorId);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex" }}>
              <button
                className="default-button"
                style={{ marginRight: "0.5rem" }}
                onClick={toggleModal}
              >
                Cancel
              </button>
              <button
                className="default-button"
                onClick={() => upsertContributors(uuid)}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import { HOST } from "../../BasicComponents/Environment";
import { ROLES_WITH_EDIT_PRIVILEGES } from "../../BasicComponents/RoleConstants";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageNotFound from "../PageNotFound/PageNotFound";
import ShareModal from "../../Components/DriveComponents/ShareModal";
Int16Array;
import Quill from "quill";
import "react-quill/dist/quill.snow.css";
import "../../Main.css";
import "./DocumentEditor.css";
import * as Y from "yjs";
import { QuillBinding } from "y-quill";
import { WebsocketProvider } from "y-websocket";
import QuillCursors from "quill-cursors";
import axios from "axios";
import { saveAs } from "file-saver";
import { pdfExporter } from "quill-to-pdf";
import * as quillToWord from "quill-to-word";
import { ImageDrop } from "quill-image-drop-module";
import getUrlParam from "../../BasicComponents/GetUrlParam";
import "../../Components/DriveComponents/DropDownMenu";
import useComponentVisible from "../../BasicComponents/UseComponentVisible";
import { AiFillFileWord, AiFillFilePdf } from "react-icons/ai";

Quill.register("modules/cursors", QuillCursors);
Quill.register("modules/imageDrop", ImageDrop);

// Miscellaneous Constants
const DEFAULT_NAME = "Untitled Document";
const YJS_TITLE_KEY = "title";
const TITLE_SUFFIX = " - Searten";
//const URL_PARAMS = new URLSearchParams(window.location.search);
const SAVE_RATE_MS = 5000;
// Quill and YJS Variables and Constants
const Y_DOC = new Y.Doc();

const Y_MAP = Y_DOC.getMap("map");
Y_MAP.set(YJS_TITLE_KEY, DEFAULT_NAME);

const disconnect = (provider) => {
  provider.disconnect();
  provider = null;
  console.log("Disconnected from Y-websocket");
  return provider;
};

var PROVIDER = null;
try {
  if (getUrlParam("uuid")) {
    PROVIDER = new WebsocketProvider(
      `ws://${HOST}:1234`,
      getUrlParam("uuid"),
      //URL_PARAMS.get("uuid"),
      Y_DOC
    );
    if (!PROVIDER.shouldConnect) {
      PROVIDER = disconnect(PROVIDER);
    }
  }
} catch (error) {
  PROVIDER = disconnect(PROVIDER);
}

const Y_TEXT = Y_DOC.getText("quill");

// The #editor selector doesn't exist in this context
var QUILL = null;
var BINDING = null;

export default function DocumentEditor() {
  // Doc name is stored as state purely to re-render the width of the Title input
  // Actual doc name value saved is the one in the YJS map.

  const [documentName, setDocumentName] = useState(DEFAULT_NAME);
  const [documentNameWidth, setDocumentNameWidth] = useState(0);
  const [roleInFolder, setRoleInFolder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const span = useRef();
  const navigate = useNavigate();

  const getRoleInFolder = (userid, parentUUID, rolesWithEditPrivilege) => {
    const params = {
      userid: userid,
      uuid: parentUUID,
    };
    axios.get("/api/get-role-in-folder", { params }).then((res) => {
      const role = res.data.user_role;
      setRoleInFolder(role);
    });
  };

  const exportAsPdf = async () => {
    const delta = QUILL.getContents(); // gets the Quill delta
    const pdfAsBlob = await pdfExporter.generatePdf(delta); // converts to PDF
    saveAs(pdfAsBlob, documentName + ".pdf"); // downloads from the browser
  };

  const exportAsWord = async () => {
    const delta = QUILL.getContents(); // gets the Quill delta
    const quillToWordConfig = {
      exportAs: "blob",
    };
    const docAsBlob = await quillToWord.generateWord(delta, quillToWordConfig); // converts to Word
    saveAs(docAsBlob, documentName + ".docx"); // downloads from the browser
  };

  const [showDropDownMenu, setShowDropDownMenu] = useState(false);
  const { visibleRef } = useComponentVisible([[setShowDropDownMenu, false]]);

  const dropDownItems = [
    { name: "PDF File", func: exportAsPdf, icon: <AiFillFilePdf /> },
    { name: "Word Document", func: exportAsWord, icon: <AiFillFileWord /> },
  ];

  useEffect(() => {
    if (QUILL && ROLES_WITH_EDIT_PRIVILEGES.indexOf(roleInFolder) === -1) {
      QUILL.disable();
    }
  }, [roleInFolder]);

  // Component did mount
  // Needs refactor... very long
  useEffect(() => {
    // TODO: Should check if user has permission to view this document
    Y_MAP.observe((ymapEvent) => {
      ymapEvent.changes.keys.forEach((_, key) => {
        if (key == YJS_TITLE_KEY) {
          setDocumentName(Y_MAP.get("title"));
          changeDocumentTitle(Y_MAP.get("title"));
        }
      });
    });

    var toolbarOptions = [
      ["bold", "italic", "underline", "strike"], // toggled buttons
      ["blockquote", "code"],
      [{ header: 1 }, { header: 2 }], // custom button values
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }], // superscript/subscript
      [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
      [{ direction: "rtl" }], // text direction
      [{ size: [] }], // custom dropdown
      [{ header: [] }],
      [{ color: [] }, { background: [] }], // dropdown with defaults from theme
      [{ font: ["Arial", "Comic Sans MC"] }],
      [{ align: [] }],
      ["link", "image", "video"],
      ["clean"], // remove formatting button
    ];

    QUILL = new Quill("#editor", {
      modules: {
        imageDrop: true,
        cursors: true,
        toolbar: toolbarOptions,
        history: {
          userOnly: true,
        },
      },
      placeholder: "Start collaborating...",
      theme: "snow",
    });

    getRoleInFolder(
      getUrlParam("userid"),
      getUrlParam("uuid"),
      ROLES_WITH_EDIT_PRIVILEGES
    );

    axios
      .get("/api/get-document-data", { params: { uuid: getUrlParam("uuid") } })
      .then((res) => {
        if (res && res.data) {
          QUILL.setText(res.data.contents);
          Y_MAP.set(YJS_TITLE_KEY, res.data.name);
        } else {
          navigate("/does-not-exist");
        }
      })
      .catch((error) => {
        console.log(error);
      });

    axios
      .get("/api/get-profile-info", {
        params: { userid: getUrlParam("userid") },
      })
      .then((res) => {
        if (PROVIDER) {
          const AWARENESS = PROVIDER.awareness;
          AWARENESS.setLocalStateField("user", {
            name: `${res.data.first_name} ${res.data.last_name}`,
          });
          BINDING = new QuillBinding(Y_TEXT, QUILL, AWARENESS);
        }
      });

    const interval = setInterval(() => {
      const documentText = QUILL.getText();
      const docName = Y_MAP.get(YJS_TITLE_KEY) || DEFAULT_NAME;
      //if (!(docName == DEFAULT_NAME && documentText == "\n")) {
      var params = {
        uuid: getUrlParam("uuid"),
        //uuid: URL_PARAMS.get("uuid"),
        contents: documentText,
        name: docName,
      };
      axios.post("/api/save-document", { params });
      //}
    }, SAVE_RATE_MS);

    // Component will unmount
    return () => {
      if (Y_DOC) {
        Y_DOC.destroy();
      }
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    setDocumentNameWidth(span.current.offsetWidth + 4);
  }, [documentName]);

  return (
    <div className="projects-page main-doc-div">
      <ShareModal
        uuid={getUrlParam("uuid")}
        //uuid={URL_PARAMS.get("uuid")}
        documentName={documentName}
        userid={getUrlParam("userid")}
        //userid={URL_PARAMS.get("userid")}
        showModal={showModal}
        setShowModal={setShowModal}
      />
      <span id="hide" ref={span}>
        {
          Y_MAP.get("title") ? documentName : DEFAULT_NAME
          /* Hacky way to set the width of the input box for the title */
        }
      </span>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width:"100vh",
          marginBottom: "2rem",
        }}
      >
        <input
          type="text"
          disabled={ROLES_WITH_EDIT_PRIVILEGES.indexOf(roleInFolder) === -1}
          placeholder={DEFAULT_NAME}
          style={{ width: documentNameWidth }}
          value={Y_MAP.get("title") === DEFAULT_NAME ? "" : documentName}
          className="title-input"
          onChange={(e) => {
            Y_MAP.set(YJS_TITLE_KEY, e.target.value);
          }}
        />
        <div>
          <button
            id="align-right"
            className="default-button"
            onClick={() => {
              setShowDropDownMenu(!showDropDownMenu);
            }}
          >
            Download As
          </button>
          {showDropDownMenu ? (
            <div className="dropdown-menu" ref={visibleRef}>
              {dropDownItems.map((item) => (
                <div
                  className="dropdown-item"
                  key={item.name}
                  onClick={() => item.func(setShowDropDownMenu)}
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
        <button
          disabled={ROLES_WITH_EDIT_PRIVILEGES.indexOf(roleInFolder) === -1}
          className="default-button"
          onClick={() => {
            setShowModal(!showModal);
          }}
        >
          Share
        </button>
      </div>
      <div id="editor-container">
        <div id="editor"> </div>
      </div>
    </div>
  );
}

const changeDocumentTitle = (docName) => {
  const titlePrefix = docName ? docName : DEFAULT_NAME;
  document.title = titlePrefix.concat(TITLE_SUFFIX);
};

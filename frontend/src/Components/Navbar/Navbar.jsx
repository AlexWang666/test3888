import "./Navbar.css";
import { IconContext } from "react-icons";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiSettings } from "react-icons/fi";
import { BiHomeAlt, BiUser } from "react-icons/bi";
import { TbUserSearch } from "react-icons/tb";
import {
  BsGrid1X2,
  BsChat,
  BsPencil,
  BsBarChart,
  BsPeople,
} from "react-icons/bs";
import {
  BsFillArrowRightCircleFill,
  BsFillArrowLeftCircleFill,
} from "react-icons/bs";
import {
  AiOutlineShop,
  AiOutlineCalendar,
  AiOutlineCloud,
  AiOutlineDashboard,
} from "react-icons/ai";
import logo from "../../../img/logo_withoutName.jpg";

export default function Navbar({ userId, firstName, lastName, isResearcher }) {
  const { state } = useLocation();
  const { projid } = state || {};

  let navigate = useNavigate();
  const goToProjectsList = () => {
    navigate("/projects", { state: { projid: -1 } });
    setBackBtn(<></>);
  };

  const navigateWithState = (link) => {
    navigate(link, { state: { projid: projid } });
  };

  const createNavbarItem = (fields, projid) => {
    if (typeof fields["icon"] === "string") {
      return (
        <div key={fields.text}>
          <li className="title-nav-item">
            <a className="nav-link">
              <div className="title-nav-icon">
                <span>{fields.icon}</span>
              </div>
              <span className="title-link-text">{fields.text}</span>
            </a>
          </li>
          <hr className="horizontal-line"></hr>
        </div>
      );
    }

    const isProfileIcon = fields["icon"] === BiUser ? true : false;
    if (typeof projid === "number" && projid !== -1) {
      return (
        <div key={fields.text}>
          <li className={isProfileIcon ? "profile" : "nav-item"}>
            <a
              onClick={() => navigateWithState(fields.link)}
              className="nav-link"
            >
              <fields.icon className="nav-icon" />
              <span className="link-text">{fields.text}</span>
            </a>
          </li>
        </div>
      );
    } else {
      return (
        <div key={fields.text}>
          <li className={isProfileIcon ? "profile" : "nav-item"}>
            <a href={fields.link} className="nav-link">
              <fields.icon className="nav-icon" />
              <span className="link-text">{fields.text}</span>
            </a>
          </li>
        </div>
      );
    }
  };

  // When we are inside a project, the navbar items change
  const [backBtn, setBackBtn] = useState(<></>);

  // Switch between open and close navbar on click
  const [open, setOpen] = useState("-open");
  const [openBtn, setOpenBtn] = useState(<BsFillArrowRightCircleFill />);

  useEffect(() => {
    if (typeof projid === "number" && projid !== -1) {
      setBackBtn(
        <div className="back-to-projects-btn" onClick={() => navigate(-1)}>
          Back
        </div>
      );
    } else {
      setBackBtn(<></>);
    }
  }, [projid]);

  const toggleOpen = () => {
    // We add '-open' to the className for different css properties when opened
    if (open === "-open") {
      // setOpen("");
      setOpenBtn(<BsFillArrowRightCircleFill />);

      if (typeof projid === "number" && projid !== -1) {
        setBackBtn(
          <div className="back-to-projects-btn" onClick={goToProjectsList}>
            Back
          </div>
        );
      } else {
        setBackBtn(<></>);
      }
    } else if (open === "") {
      setOpen("-open");
      setOpenBtn(<BsFillArrowLeftCircleFill />);

      if (typeof projid === "number" && projid !== -1) {
        setBackBtn(
          <div className="back-to-projects-btn" onClick={goToProjectsList}>
            Back to Projects
          </div>
        );
      } else {
        setBackBtn(<></>);
      }
    }
  };

  const researcherNavItems = [
    { icon: "S", text: "SPACES" },
    // { icon: BiHomeAlt, text: "Home", link: "/" },
    { icon: BsGrid1X2, text: "Projects", link: "/projects" },
    // { icon: AiOutlineShop, text: "Marketplace", link: "/marketplace" },
    { icon: TbUserSearch, text: "Expert Search", link: "/expert-search" },
    /*
    { icon: "A", text: "ADMIN" },
    { icon: BsBarChart, text: "Applications", link: "/applications" },
    */
    { icon: "P", text: "PROJECTS" },
    { icon: AiOutlineCalendar, text: "Planner", link: "/planner" },
    {
      icon: AiOutlineCloud,
      text: "Drive",
      link: `/drive?userid=${userId}&parent_uuid=&home=true`,
    },
    { icon: BsChat, text: "Chat", link: "/chat" },
    { icon: BsPencil, text: "Notes", link: "/notes" },
    { icon: "S", text: "SETTINGS" },
    { icon: FiSettings, text: "Settings", link: "/settings" },
    { icon: BiUser, text: firstName, link: "/profile" },
  ];

  const directorNavItems = [
    { icon: "S", text: "SPACES" },
    { icon: BiHomeAlt, text: "Home", link: "/" },
    { icon: BsGrid1X2, text: "Projects", link: "/projects" },
    { icon: AiOutlineShop, text: "Marketplace", link: "/marketplace" },
    { icon: TbUserSearch, text: "Expert Search", link: "/expert-search" },
    { icon: "A", text: "ADMIN" },
    { icon: BsBarChart, text: "Applications", link: "/applications" },
    { icon: "P", text: "PROJECTS" },
    { icon: AiOutlineCalendar, text: "Planner", link: "/planner" },
    { icon: AiOutlineCloud, text: "Drive", link: "/drive" },
    { icon: BsChat, text: "Chat", link: "/chat" },
    { icon: BsPencil, text: "Notes", link: "/notes" },
    { icon: "S", text: "SETTINGS" },
    { icon: FiSettings, text: "Settings", link: "/settings" },
    { icon: BiUser, text: firstName, link: "/profile" },
  ];

  const insideProgramNavItems = [
    { icon: "P", text: "PLACES" },
    { icon: AiOutlineDashboard, text: "Dashboard", link: "/dashboard" },
    { icon: BsGrid1X2, text: "Projects", link: "/projects" },
    { icon: AiOutlineCalendar, text: "Planner", link: "/project-planner" },
    { icon: BsChat, text: "Chat", link: "/chat" },
    { icon: "A", text: "ADMIN" },
    { icon: BsBarChart, text: "Applications", link: "/applications" },
    { icon: "D", text: "DOCUMENTS" },
    {
      icon: AiOutlineCloud,
      text: "Drive",
      link: `/drive?userid=${userId}&parent_uuid=&home=true`,
    },
    { icon: BsPencil, text: "Notes", link: "/notes" },
    { icon: "S", text: "SETTINGS" },
    { icon: BsPeople, text: "Members", link: "/project-members" },
  ];

  let navbarItems = isResearcher ? researcherNavItems : directorNavItems;
  if (typeof projid === "number" && projid !== -1) {
    navbarItems = insideProgramNavItems;
  }

  return (
    <nav className={"navbar" + open}>
      <div
        style={{
          display: "flex",
          justifyContent: "start",
          margin: "0px 25px",
          cursor: "pointer",
        }}
        onClick={goToProjectsList}
      >
        <img src={logo} width={30} />
      </div>
      <ul className="navbar-items">
        {backBtn}
        {navbarItems.map((fields) => createNavbarItem(fields, projid))}
        <p>&nbsp;</p>
        {/* <div className="open-button" onClick={toggleOpen}>
          {openBtn}
        </div> */}
      </ul>
    </nav>
  );
}

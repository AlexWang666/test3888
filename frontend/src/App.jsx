import { extractCSRFRefreshToken } from "./BasicComponents/Cookie";
import { useEffect, useState } from "react";
import Navbar from "./Components/Navbar/Navbar";
import Header from "./Components/Header/Header";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./Pages/Home/Home";

import ProjectDashboard from "./Pages/Projects/ProjectDashboard";
import Budget from "./Pages/Budget/Budget";
import Insights from "./Pages/Budget/Insights";
import TasksInProject from "./Pages/Tasks/TasksInProject";

import CreateProject from "./Pages/Projects/CreateProject";
import MyProjects from "./Pages/Projects/MyProjects";

import CreateMilestone from "./Pages/Milestones/CreateMilestone";
import CreateTask from "./Pages/Tasks/CreateTask";
import CreateSubtask from "./Pages/Subtasks/CreateSubtask";

import ProjectMembers from "./Pages/ProjectMembersList/ProjectMembers";
import OrganisationMembers from "./Pages/ProjectMembersList/OrganisationMembers";

import PageNotFound from "./Pages/PageNotFound/PageNotFound";
import NoPermission from "./Pages/PageNotFound/NoPermission";
import DoesNotExist from "./Pages/PageNotFound/DoesNotExist";
import Profile from "./Pages/Profile/Profile";
import ProfileOther from "./Pages/Profile/ProfileOther";

import ProgramData from "./Pages/Programs/ProgramData";
import ProgramFiles from "./Pages/Programs/ProgramFiles";

import LoginPage from "./Pages/LoginPage/LoginPage";
import RegisterPage from "./Pages/RegisterPage/RegisterPage";
import ResetPassword from "./Pages/LoginPage/ResetPassword";

import DocumentEditor from "./Pages/Drive/DocumentEditor";
import DriveHome from "./Pages/Drive/DriveHome";
import DriveNavigation from "./Pages/Drive/DriveNavigation";

import NotesPage from "./Pages/NotesPage/NotesPage";
import ChatPage from "./Pages/Chat/ChatPage";

import MarketplaceHome from "./Pages/Marketplace/MarketplaceHome";
import MarketProjectDescription from "./Pages/Marketplace/MarketProjectDescription";

import ExpertSearch from "./Pages/ExpertSearch/ExpertSearch";

import ApplicationsSelect from "./Pages/Applications/ApplicationsSelect";
import ApplicationDetails from "./Pages/Applications/ApplicationDetails";

import PlannerSelect from "./Pages/Planner/PlannerSelect";
import PlannerHome from "./Pages/Planner/PlannerHome";

import SettingsPage from "./Pages/Settings/SettingsPage";
import SearchPage from "./Pages/SearchPage/SearchPage";

import axios from "axios";
import "./Interceptors/Axios";
import { isExpired, decodeToken } from "react-jwt";

function App() {
  const [userId, setUserId] = useState(null);
  const [firstName, setFirstName] = useState(null);
  const [lastName, setLastName] = useState(null);
  const [profileType, setProfileType] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  const setupApp = () => {
    var accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      var decodedAccessToken = decodeToken(accessToken);
      setUserId(decodedAccessToken["sub"]["id"]);
      setFirstName(decodedAccessToken["sub"]["first_name"]);
      setLastName(decodedAccessToken["sub"]["last_name"]);

      // [Local Storage Auth]
      // Storing user id globally for authentification.
      // Using local storage isn't a good idea. Redux might be a better solution.
      localStorage.setItem("userid", decodedAccessToken["sub"]["id"]);
    }
  };

  useEffect(() => {
    setupApp();
  }, []);

  // There is a login screen artifact on page refresh
  // if we use a state variable for the access token
  return localStorage.getItem("accessToken") ? (
    <div>
      <Router>
        <div className="App">
          <Navbar
            userId={userId}
            firstName={firstName}
            lastName={lastName}
            isResearcher={true}
            /* To change isResearcher */
          />
          <Routes>
            // Navbar items
            {/* <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} /> */}
            <Route path="/" element={<MyProjects />} />
            <Route path="/projects" element={<MyProjects />} />
            {/* <Route path="/marketplace" element={<MarketplaceHome />} /> */}
            <Route path="/expert-search" element={<ExpertSearch />} />
            <Route path="/applications" element={<ApplicationsSelect />} />
            <Route path="/planner" element={<PlannerSelect />} />
            <Route path="/drive" element={<DriveHome />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            // End Navbar items // Creation forms
            <Route
              path="/create-project"
              element={<CreateProject userid={userId} />}
            />
            <Route
              path="/create-milestone"
              element={<CreateMilestone userid={userId} />}
            />
            <Route
              path="/create-task"
              element={<CreateTask userid={userId} />}
            />
            <Route
              path="/create-subtask"
              element={<CreateSubtask userid={userId} />}
            />
            // Other pages
            <Route
              path="/application-details"
              element={<ApplicationDetails />}
            />
            <Route path="/dashboard" element={<ProjectDashboard />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/projects-in-program" element={<MyProjects />} />
            <Route path="/tasks-in-project" element={<TasksInProject />} />
            <Route path="/project-members" element={<ProjectMembers />} />
            <Route
              path="/project-organisations"
              element={<OrganisationMembers />}
            />
            <Route path="/program-data" element={<ProgramData />} />
            <Route path="/program-files" element={<ProgramFiles />} />
            <Route path="/project-planner" element={<PlannerHome />} />
            <Route
              path="/project-description"
              element={<MarketProjectDescription />}
            />
            <Route path="/document-editor" element={<DocumentEditor />} />
            <Route path="/drive-navigate" element={<DriveNavigation />} />
            <Route path="/profile-other" element={<ProfileOther />} />
            <Route path="/search-results" element={<SearchPage />} />
            <Route
              path="/profile"
              element={
                <Profile
                  userId={userId}
                  firstName={firstName}
                  lastName={lastName}
                  setAccessToken={setAccessToken}
                />
              }
            />
            <Route path="/page-not-found" element={<PageNotFound />} />
            <Route path="/no-permission" element={<NoPermission />} />
            <Route path="/does-not-exist" element={<DoesNotExist />} />
            <Route
              path="*"
              element={
                <PageNotFound />
                // TODO: Page not found component needs rework
              }
            />
          </Routes>
        </div>
      </Router>
    </div>
  ) : (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <LoginPage
              setUserId={setUserId}
              setFirstName={setFirstName}
              setLastName={setLastName}
              setAccessToken={setAccessToken}
            />
          }
        />
        <Route
          path="/login"
          element={
            <LoginPage
              setUserId={setUserId}
              setFirstName={setFirstName}
              setLastName={setLastName}
              setAccessToken={setAccessToken}
            />
          }
        />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="*"
          element={
            <LoginPage
              setUserId={setUserId}
              setFirstName={setFirstName}
              setLastName={setLastName}
              setAccessToken={setAccessToken}
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

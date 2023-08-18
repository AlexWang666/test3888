/* NOTES PAGE */
/*
   A place to write notes about one's projects.
*/

import React, { useState, useEffect } from "react";
import axios from "axios";
import { decodeToken } from "react-jwt";

import "../../Main.css"

import NotesOptionsTop from "../../Components/NotesComponents/NotesOptionsTop"
import NotesFilesSide from "../../Components/NotesComponents/NotesFilesSide"
import NotesTypingArea from "../../Components/NotesComponents/NotesTypingArea"

import Navbar from "../../Components/Navbar/Navbar";
import SearchBar from "../../Components/SearchComponents/SearchBar";

export default function NotesPage() {

  // Gets the user id for use everywhere on the page
  const getUserId = () => {
    const token = localStorage.getItem("accessToken");
    var decodedAccessToken = decodeToken(token);
    var user = decodedAccessToken["sub"]["id"];

    return user;
  }
  const userId = getUserId();

  // Info about the current notes on the file the user is currently looking at
  const [currentNotes, setCurrentNotes] = useState({id: null, name: "",
    contents: ""});

  // The set of note titles which the user has created
  const [noteTitles, setNoteTitles] = useState([]);


  // Gets the note titles on page reload
  useEffect(() => {
    const getAllNoteTitles = async () => {
      // Gets the list of note names for the sidebar
      const params = {"uid": userId};
      await axios.get("/api/get-all-notes", {params}).then((response) => {
        setNoteTitles(response.data);
      });
    }
    getAllNoteTitles();
  }, []);


  // Pushes the new note file to the backend and appends to frontend
  const addNote = (noteTitle) => {
    const params = {"uid": userId, "newnotetitle": noteTitle};

    // Adds the new note title to the backend for display on the side
    axios.post("/api/create-new-note", {params}).then((response) => {
      const noteId = response.data;

      // Pushes to frontend for instant display
      setNoteTitles([...noteTitles, {id: noteId.id, name: noteTitle}]);
      setCurrentNotes({id: noteId.id, name: noteTitle, contents: ""});
    });
  }


  // Sets the current notes in the frontend
  const saveNotes = (note) => {
    setCurrentNotes({id: currentNotes.id, name: currentNotes.name,
      contents: note});
  }


  // Retrieves the note contents from the backend
  const onNoteClick = (noteId) => {
    const params = {"uid": userId, "noteid": noteId};
    axios.get("/api/get-notes-by-id", {params}).then((response) => {
      setCurrentNotes(response.data[0]);
    });
  }


  // Sends the notes to the backend for the current page
  const sendNotes = () => {
    if (currentNotes.id !== null) {
      const params = {"uid": userId, "id": currentNotes.id,
        "contents": currentNotes.contents};

      axios.post("/api/push-note-content", {params}).then((response) => {
        console.log(response.data);
      });
    }
  }


  return (
    <div className="projects-page">

      <div className="upper-elements">
        <h1 className="default-heading">Notes</h1>

        <SearchBar />
      </div>

      <p>&nbsp;</p>

      <NotesOptionsTop
         currentNotesPage={currentNotes}
         sendNotes={sendNotes}
      />

      <div className="upper-elements">
        <NotesFilesSide
          notesPagesList={noteTitles}
          addNote={addNote}
          onNoteClick={onNoteClick}
        />

        <NotesTypingArea
          currentNotes={currentNotes}
          saveNotes={saveNotes}
        />
      </div>

    </div>
  );
}

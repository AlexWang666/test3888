/*
  NOTES FILES SIDE
  The list of programs the user can take notes for.
*/

import React, { useState } from 'react'

import "./NotesComponents.css";
import "../../Main.css";

export default function NotesFilesSide({ notesPagesList, addNote,
  onNoteClick }) {
    // notesPagesList: The list of note page names.
    // - name: The name of the page

    // addNote: The function to push the new note to the backend

    // onNoteClick: The function called when you click a note on the side

    // Is a new note currently being created?
    const [newNoteMode, setNewNoteMode] = useState(false);

    // The title of the new note file
    const [noteTitle, setNoteTitle] = useState("");

    // The note we are currently viewing
    const [currentViewNote, setCurrentViewNote] = useState(-1);

    const captureNoteName = (text) => {
      setNoteTitle(text.target.value);
    };

    // Push the new note to the backend
    const checkEnterKey = (e) => {
      if (e.key === "Enter") {
        setNewNoteMode(false);
        setNoteTitle("");

        // Function in NotesPage, pushes to front and backend
        addNote(noteTitle);
      }
    };

    // Sets the new note mode to true; Gives the new note input box
    const createNewNote = () => {
      setNewNoteMode(true);
    };

    let newNoteBox = <></>
    if (newNoteMode === true) {
      newNoteBox = <tr><td><input type="text" value={noteTitle}
        onChange={captureNoteName} onKeyDown={checkEnterKey}></input></td></tr>;
    };


    // Changes the current note to the one clicked on
    const changeCurrentNote = (noteId) => {
      setCurrentViewNote(noteId);

      // Passes the information to the NotesPage
      onNoteClick(noteId);
    }


    let notesPagesSide = notesPagesList.map((page) => (
      <tr key={page.id}
        className={"reg-note-"+(page.id===currentViewNote).toString()}
        onClick={()=>changeCurrentNote(page.id)}>
        <td>
          {page.name}
        </td>
      </tr>
      ));

    return (
      <table className="notes-files-side">
      <tbody>
        <tr id="new-folder-row">
          <td>
            <button className="default-button-3" onClick={createNewNote}>
              + New File
            </button>
          </td>
        </tr>

        {newNoteBox}

        {notesPagesSide}

        <tr id="bottom-row-fill-space">
          <td>
            &nbsp;
          </td>
        </tr>
      </tbody>
      </table>
    );
}

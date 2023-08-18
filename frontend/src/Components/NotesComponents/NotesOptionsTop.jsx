/*
  NOTES OPTIONS TOP
  The text editing features along the top of the page.
*/


import React from 'react'

import "./NotesComponents.css";
import "../../Main.css";

export default function NotesOptionsTop({ currentNotesPage, sendNotes }) {
  // currentNotesPage: The name of the notes page the user is working on.
  // sendNotes: The function to send notes to the DB.

  // TODO: Add more features like uploading images.

  let saveButton = <p></p>;
  if (currentNotesPage.id !== null) {
    saveButton = (
      <div className="upper-elements">
        <button className="default-button"
          id="align-right"
          onClick={sendNotes}>
          Save Notes
        </button>
      </div>
    );
  }

  return (
    <table className="notes-options-table">
    <tbody>
      <tr>
        <td id="current-page-col">
          {currentNotesPage.name}
        </td>

        <td>
          <b>B</b>
        </td>

        <td>
          <i>i</i>
        </td>

        <td>
          <u>U</u>
        </td>

        <td>
          {saveButton}
        </td>

      </tr>
    </tbody>
    </table>
  );
}

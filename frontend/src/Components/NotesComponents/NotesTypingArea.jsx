/*
  NOTES TYPING AREA
  The text area where the user's notes can be found.
*/


import React, { useState, useEffect } from 'react'

import "./NotesComponents.css";
import "../../Main.css";

export default function NotesTypingArea({ currentNotes, saveNotes }) {
  // currentNotes: Gets the current notes for that page.
  // saveNotes: Pushes the notes to the NotesPage.

  const [notes, setNotes] = useState(currentNotes.contents);

  useEffect(() => {
    // Pushes the notes to the frontend of NotesPage
    saveNotes(notes);
  }, [notes]);

  // Captures the notes inputted for saving
  const captureNotes = (noteAddition) => {
    setNotes(noteAddition.target.value);
  }

  let typeyBox = <div className="notes-writey-boi"></div>;
  if (currentNotes.id !== null) {
    typeyBox = (
      <textarea
        className="notes-writey-boi"
        onChange={captureNotes}
        value={currentNotes.contents}>
      </textarea>
    );
  }

  return (
    <>
      {typeyBox}
    </>
  );
}

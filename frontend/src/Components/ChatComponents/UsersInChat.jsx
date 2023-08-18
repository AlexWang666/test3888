/*
  USERS IN CHAT
  The list of users in the chat.
*/

import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

import PeopleResultsList from "../../Components/SearchComponents/PeopleResultsList";

import "./ChatComponents.css";
import "../../Main.css";

export default function UsersInChat({ numPeople, people }) {
  // numPeople: The number of people in the chat
  // allUsers: The list of users in the chat (names only)

  const [displayPeople, setDisplayPeople] = useState(false);

  let navigate = useNavigate();

  // Called after clicking the user's name
  const goToPerson = (person_id) => {
    navigate("/profile-other", {state: {userId: person_id}});
  }

  let pplList = <></>;
  const displayList = () => {
    setDisplayPeople(!displayPeople);
  }

  if (displayPeople === true && typeof(people) !== undefined) {
    pplList = <div className="users-in-chat-list">
      {people.map((person) => (
        <p key={person.id}
          className="default-paragraph"
          id="link"
          onClick={()=>goToPerson(person.id)}>
          {person.name}
        </p>
      ))}
    </div>
  }

  return (
    <>
      <div id="link"
        onClick={()=>displayList()}>
        <p className="default-paragraph-5">
          {numPeople} people
        </p>
      </div>
      {pplList}
    </>
  );
}

/*
  CHAT HISTORY
  Consists of the chat history with the current selected chat in the message
  list.
*/

import React from 'react'

import "./ChatComponents.css";
import "../../Main.css";

export default function ChatHistory({ currentUser, messageHistory }) {
  // messageHistory: The list of past messages.
  // - author: Sender name
  // - pfp: Profile picture of sender
  // - message: The message itself
  // - date: Date sent

  let msgHistory = messageHistory.map((msg) => (
    <div className="chat-man" key={msg.id}>

      <div className="upper-elements"
        id={"chatticus-"+String(currentUser===msg.authorid)}>

        <div className="profile-picture"
          id={"pfp-isuser-"+String(currentUser===msg.authorid)}>
          {msg.pfp}
        </div>

        <div className="message-and-author">
          <div className="upper-elements" id="author-line">
            <p className="default-paragraph-4">
              {msg.author}
            </p>
            <p className="default-paragraph-3" id="align-right">
              {msg.date}
            </p>
          </div>

          <div className="chateal-buble"
            id={"chatael-buble-"+String(currentUser===msg.authorid)}>
            <p>
              {msg.message}
            </p>
          </div>
        </div>
      </div>
    </div>
  ));

  return (
    <>
      {msgHistory}
    </>
  );
}

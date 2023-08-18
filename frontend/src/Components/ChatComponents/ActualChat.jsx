/*
  ACTUAL CHAT
  The container with the message history list and the send button / typey box.
*/


import React, { useState } from 'react'

import "./ChatComponents.css";
import "../../Main.css";

import ChatHistory from "./ChatHistory";
import UsersInChat from "./UsersInChat";
import AddCollaborator from "../ProjectMembersTables/AddCollaborator";

export default function ActualChat({ currentUser, currentChat, allMessages,
  allUsers, sendMessage, addUser }) {
    // currentChat: The current chat
    // - id, name

    // allMessages: The list of past messages.
    // - author: Sender name
    // - pfp: Profile picture of sender
    // - message: The message itself
    // - date: Date sent

    // allUsers: The list of all users in the chat
    // - numpeople: The number of people
    // - people: A dict of people indexed by name

    // sendMessage: The function to post the message

    // addUser: The function to add the user to the group

    const [messageText, setMessageText] = useState("");

    // Captures the message text as typed into the box
    const captureMessage = (message) => {
      setMessageText(message.target.value);
    }

    // Performs actions to post the message
    const postMessage = (messageText) => {
      // Calls the sendMessage function in ChatPage to add the new message
      sendMessage(messageText);

      // Resets the text in the input box
      setMessageText("");
    }

    // Sends the message on the enter keypress
    const checkEnterKey = (e) => {
      if (e.key === "Enter") {
        postMessage(messageText);
      }
    }

    const addUserToGroup = (userid) => {
      addUser(userid);
    }

    let typeyBox = <p></p>;
    let topChatDeets = <td></td>;
    if (currentChat.id !== undefined) {
      topChatDeets = (
        <td className="upper-elements">
          <p className="default-heading-3">
            {currentChat.name}
          </p>

          <div className="users-in-chat">
            <UsersInChat
              numPeople={allUsers.numpeople}
              people={allUsers.people} />
          </div>

          <div className="search-results-chat" id="align-right">
            <AddCollaborator
              addCollabor={addUserToGroup}/>
          </div>
        </td>
      );
      typeyBox = (
        <div className="upper-elements">
          <input type="text"
                  className="default-form-text-small"
                  id="chat-input"
                  placeholder="Type a message..."
                  onChange={captureMessage}
                  value={messageText}
                  onKeyDown={checkEnterKey}>
          </input>

          <button className="default-button-4"
                  id="send-button"
                  onClick={()=>postMessage(messageText)}>
              Send
          </button>
        </div>
      );
    }

  return (
    <table className="message-history-table">
    <tbody>
      <tr>
        {topChatDeets}
      </tr>

      <tr className="chat-space">
        <td>
          <div className="chat-history-case">
            <ChatHistory
              currentUser={currentUser}
              messageHistory={allMessages} />
          </div>
        </td>
      </tr>

      <tr>
        <td>
          {typeyBox}
        </td>
      </tr>
    </tbody>
    </table>
  );
}

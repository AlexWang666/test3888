/*
  MESSAGE LIST
  The side bar containing the list of recent messages.
*/

import React, { useState } from 'react'

import "./ChatComponents.css";
import "../../Main.css";

export default function MessageList({ currentChat, chatList, addChat, onChatClick }) {
    // currentChat: id of the current chat being viewed

    // chatList: The list of past chats.
    // - name: Chat title
    // - lastMessage: Last message sent
    // - date: Date of last message

    // addChat: The function to push the new note to the backend

    // onChatClick: The function called when you click a note on the side

    // Is a new chat currently being created?
    const [newChatMode, setNewChatMode] = useState(false);

    // The title of the new chat
    const [chatTitle, setChatTitle] = useState("");

    // The chat we are currently viewing
    const cur = currentChat;
    const [currentViewChat, setCurrentViewChat] = useState(cur);

    const captureChatName = (text) => {
      setChatTitle(text.target.value);
    };

    // Push the new chat to the backend
    const checkEnterKey = (e) => {
      if (e.key === "Enter") {
        setNewChatMode(false);
        setChatTitle("");

        // Function in ChatPage, pushes to front and backend
        addChat(chatTitle);
      }
    };

    // Sets the new chat mode to true; Gives the new chat input box
    const createNewChat = () => {
      setNewChatMode(true);
    };

    let newChatBox = <></>
    if (newChatMode === true) {
      newChatBox = <tr><td>
          <input
            type="text"
            placeholder="Name the chatroom..."
            value={chatTitle}
            className="default-form-text-small"
            onChange={captureChatName}
            onKeyDown={checkEnterKey}>
          </input>
        </td></tr>;
    };

    // Changes the current chat to the one clicked on
    const changeCurrentChat = (chatId) => {
      setCurrentViewChat(chatId);

      // Passes the information to the ChatPage
      onChatClick(chatId);
    }

    return (
      <div className="list-messages-side">
      <table className="list-messages-table">
      <tbody>
        <tr>
          <td>
            <p className="upper-elements" id="message-top-row">
              &#x1F4AC; Messages
              <button className="default-button-4"
                id="align-right"
                onClick={createNewChat}>
                  +
              </button>
            </p>
          </td>
        </tr>

        {newChatBox}

        {chatList.map((chat) => (
          <tr key={chat.id}
            className={"reg-chat-"+(chat.id===currentViewChat).toString()}
            onClick={()=>changeCurrentChat(chat.id)}>
            <td>
              <p className="default-paragraph-4">{chat.name}</p>
              <div className="default-paragraph-3" id="message-preview">
                {chat.lastmessage}
              </div>

              <div className="upper-elements">
                <p className="default-paragraph-3" id="align-right">
                  {chat.date}
                </p>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
      </table>
      </div>
    );
}

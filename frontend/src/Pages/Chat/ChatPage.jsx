/* CHAT PAGE */
/*
   A place to chat lol.
*/

import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../Main.css"
import { decodeToken } from "react-jwt";

import { GetDateStringTime } from "../../BasicComponents/GenericFunctions";

import MessageList from "../../Components/ChatComponents/MessageList";
import ActualChat from "../../Components/ChatComponents/ActualChat";

import Navbar from "../../Components/Navbar/Navbar";
import SearchBar from "../../Components/SearchComponents/SearchBar";

export default function ChatPage() {

  // Gets the user id for use everywhere on the page
  const getUserId = () => {
    const token = localStorage.getItem("accessToken");
    var decodedAccessToken = decodeToken(token);
    var user = decodedAccessToken["sub"]["id"];

    return user;
  }
  const userId = getUserId();

  // The list of messages in the message history
  const [allMessages, setAllMessages] = useState([]);

  // Info about the current chat the user is currently looking at (id, name)
  const [currentChat, setCurrentChat] = useState({});
  const [allUsers, setAllUsers] = useState([]);

  // The set of chats which the user has created (id, name, date, latestmessage)
  const [chatTitles, setChatTitles] = useState([]);


  useEffect(() => {
    // Gets the list of chat names for the sidebar
    const getAllChatTitles = async () => {
      const params = {"uid": userId};
      await axios.get("/api/get-all-chats", {params}).then((response) => {
        setChatTitles(response.data);

        // The current chat is set to be the most recent one
        if (response.data.length !== 0) {
          var current = response.data[0];
          // var current = response.data.reduce(
          //   (max, chat) => max.date>chat.date ? max : chat
          // );
          setCurrentChat({id: current.id, name: current.name});
          onChatClick(current.id);
        }
      });
    }

    getAllChatTitles();
  }, []);


  // Sends the message by adding it to the allMessages list
  const sendMessage = (message) => {
    var current = new Date();
    const params = {"uid": userId, "chatid": currentChat.id, "message": message,
    "date": current};

    axios.post("/api/add-chat-message", {params}).then((response) => {
      // Pushes to frontend for instant display
      var newMessage = response.data;
      setAllMessages([...allMessages, newMessage]);
    });
  }


  // Pushes the new chatroom to the backend and appends to frontend
  const addChat = (chatTitle) => {
    var current = new Date();
    const params = {"uid": userId, "name": chatTitle, "lastmessage": '',
    "date": current};

    // Adds the new chat title to the backend for display on the side
    axios.post("/api/create-new-chat", {params}).then((response) => {
      const chatId = response.data;

      // Pushes to frontend for instant display
      setChatTitles([{id: chatId.id, name: chatTitle,
        date: GetDateStringTime(current.toString())},
        ...chatTitles]);

      setCurrentChat({id: chatId.id, name: chatTitle});
    });
  }


  // Retrieves the chat contents, called after clicking a chat on the sidebar
  const onChatClick = (chatId) => {
    const params = {"chatid": chatId};
    axios.get("/api/get-chat-by-id", {params}).then((response) => {
      setCurrentChat(response.data[0]);
    });

    axios.get("/api/get-all-messages", {params}).then((response) => {
      setAllMessages(response.data);
    });

    axios.get("/api/get-users-in-chat", {params}).then((response) => {
      setAllUsers(response.data);
    });
  }


  // Adds a user to the chatroom
  const addUser = (userId) => {
    let params = {"uid": userId, "chatid": currentChat.id};
    axios.post("/api/add-user-to-chat", {params});

    params = {"chatid": currentChat.id};
    axios.get("/api/get-users-in-chat", {params}).then((response) => {
      setAllUsers(response.data);
    });
  }


  return (
    <div className="projects-page">

      <div className="upper-elements">
        <h1 className="default-heading">Chat</h1>

        <SearchBar />
      </div>

      <p>&nbsp;</p>

      <div className="upper-elements">
        <MessageList
          currentChat={currentChat.id}
          chatList={chatTitles}
          addChat={addChat}
          onChatClick={onChatClick}
        />

        <ActualChat
          currentUser={userId}
          currentChat={currentChat}
          allMessages={allMessages}
          allUsers={allUsers}
          sendMessage={sendMessage}
          addUser={addUser}
        />
      </div>

    </div>
  );
}

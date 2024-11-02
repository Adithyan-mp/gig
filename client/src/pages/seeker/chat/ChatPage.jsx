import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

function ChatPage({ participantName }) {
  const { id: conversationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const navigate = useNavigate();
  const socketRef = useRef();

  // Fetch messages from the server when the component mounts
  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io("http://localhost:5001");

    // Join conversation room
    socketRef.current.emit("joinConversation", conversationId);

    // Fetch previous messages from API
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`/api/messages/${conversationId}`);
        const allMessages = [
          ...response.data.seekerMessages,
          ...response.data.providerMessages,
        ];

        // Sort messages by timestamp
        allMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        setMessages(allMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    // Listen for incoming messages
    socketRef.current.on('messageReceived', (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    });

    // Clean up on component unmount
    return () => {
      socketRef.current.emit("leaveConversation", conversationId); // Leave room
      socketRef.current.disconnect();
    };
  }, [conversationId]);

  // Send message to server
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const messageData = {
        conversationId,
        senderType: "seeker", // Adjust sender type as needed
        text: newMessage,
        timestamp: new Date().toISOString(),
      };

      // Emit new message
      socketRef.current.emit('sendMessage', messageData);
      setMessages((prevMessages) => [...prevMessages, messageData]);
      setNewMessage("");
    }
  };

  const handleBack = () => {
    navigate(-1); // Navigate back
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-gray-800 text-white p-4 flex items-center justify-between">
        <button onClick={handleBack} className="text-white text-lg font-bold">&larr; Back</button>
        <h1 className="text-xl font-semibold">Gig Chat with {participantName}</h1>
      </header>

      {/* Messages Display */}
      <div className="flex-grow p-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`mb-4 flex ${msg.senderType === "seeker" ? "justify-end" : "justify-start"}`} // Adjust alignment
          >
            <div className={`p-3 rounded-lg max-w-xs ${msg.senderType === "seeker" ? "bg-green-500 text-white" : "bg-gray-300 text-gray-900"}`}>
              <span className="block font-semibold">{msg.senderType === "seeker" ? "Seeker" : participantName}</span>
              <p>{msg.text}</p> {/* Display message text */}
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white border-t border-gray-200 flex items-center gap-3">
        <input 
          type="text" 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message here..." 
          className="flex-grow p-2 border border-gray-300 rounded-lg"
        />
        <button 
          onClick={handleSendMessage} 
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatPage;

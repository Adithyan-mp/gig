import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

function ChatPage({ participantName }) {
  const { id: conversationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const navigate = useNavigate();
  const socketRef = useRef(); // Create a ref to hold the socket instance

  // Fetch messages from the server when the component mounts
  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io("http://localhost:5001");

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

    // Clean up the effect when the component unmounts
    return () => {
      socketRef.current.off('messageReceived');
      socketRef.current.disconnect(); // Disconnect the socket here to clean up
    };
  }, [conversationId]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const messageData = {
        conversationId,
        senderType: "seeker", // Indicate the message sender as "seeker"
        text: newMessage, // Changed from 'content' to 'text'
        timestamp: new Date().toISOString(), // Add timestamp for sorting
      };

      // Emit the new message to the server
      if (socketRef.current) {
        socketRef.current.emit('sendMessage', messageData);
      }
      setMessages((prevMessages) => [...prevMessages, messageData]); // Add the new message locally for immediate feedback
      setNewMessage(""); // Clear the input field
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
            className={`mb-4 flex ${msg.senderType === "seeker" ? "justify-end" : "justify-start"}`} // Adjust alignment based on sender type
          >
            <div className={`p-3 rounded-lg max-w-xs ${msg.senderType === "seeker" ? "bg-green-500 text-white" : "bg-blue-500 text-white"}`}>
              <span className="block font-semibold">{msg.senderType === "seeker" ? "Seeker" : participantName}</span>
              <p>{msg.text}</p> {/* Display the message text */}
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

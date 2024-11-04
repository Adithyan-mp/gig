import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

function ChatPage({ participantName, senderType }) {
    const { id: conversationId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const navigate = useNavigate();
    const socketRef = useRef();
    const messagesEndRef = useRef();

    useEffect(() => {
        // Initialize the socket connection
        socketRef.current = io("http://localhost:5001");
        socketRef.current.emit("joinConversation", conversationId);

        // Fetch existing messages when the component mounts
        const fetchMessages = async () => {
            try {
                const response = await axios.get(`/api/messages/${conversationId}`);
                const allMessages = [
                    ...response.data.seekerMessages,
                    ...response.data.providerMessages,
                ];
                allMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                setMessages(allMessages);
                scrollToBottom();
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        fetchMessages();

        // Set up socket event listeners
        socketRef.current.on('messageReceived', (message) => {
            // Update the state directly
            setMessages(prevMessages => [...prevMessages, message]);
            scrollToBottom();
        });

        socketRef.current.on('messageDeleted', (messageId) => {
            setMessages(prevMessages => prevMessages.filter(msg => msg._id !== messageId));
        });

        return () => {
            socketRef.current.emit("leaveConversation", conversationId);
            socketRef.current.disconnect();
        };
    }, [conversationId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            const messageData = {
                conversationId,
                senderType,
                text: newMessage,
            };

            // Emit the message to the server
            socketRef.current.emit('sendMessage', messageData);
            setNewMessage(""); // Clear input after sending
            scrollToBottom(); // Scroll to bottom immediately after sending
        }
    };

    const handleDeleteMessage = (messageId) => {
        if (window.confirm("Are you sure you want to delete this message?")) {
            // Emit delete request to server
            socketRef.current.emit("deleteMessage", messageId, (success) => {
                if (success) {
                    console.log('Message deleted successfully');
                } else {
                    console.error('Failed to delete message');
                }
            });
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="h-screen flex flex-col bg-gray-100">
            <header className="bg-gray-800 text-white p-4 flex items-center justify-between">
                <button onClick={handleBack} className="text-white text-lg font-bold">&larr; Back</button>
                <h1 className="text-xl font-semibold">Gig Chat with {participantName}</h1>
            </header>

            <div className="flex-grow p-4 overflow-y-auto">
                {messages.map((msg) => (
                    <div 
                        key={msg._id} 
                        className={`mb-4 flex ${msg.senderType === senderType ? "justify-end" : "justify-start"}`}
                    >
                        <div className={`p-3 rounded-lg max-w-xs ${msg.senderType === senderType ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-900"}`}>
                            <span className="block font-semibold">{msg.senderType === senderType ? "You" : participantName}</span>
                            <p>{msg.text}</p>
                            <span className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                            {msg.senderType === senderType && (
                                <div className="text-right mt-1">
                                    <button onClick={() => handleDeleteMessage(msg._id)} className="text-xs text-red-500">Delete</button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

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
                    className={`py-2 px-4 rounded-lg ${newMessage.trim() ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                    disabled={!newMessage.trim()} // Disable if empty
                >
                    Send
                </button>
            </div>
        </div>
    );
}

export default ChatPage;

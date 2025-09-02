import React, { useState, useRef, useEffect } from 'react';

// The scraped data from Phase 1 is stored here.
const scrapedData = `
API Documentation
This document is a reference for using the Freshservice REST API.
This reference includes a set of all the available resources and their associated HTTP methods.
All API URLs have the following base:
For your US data center account, the URL is:
https://yourcompany.freshservice.com/api/v2
The API supports only HTTPS protocol. Requests made over HTTP will be redirected.
All API requests must be authenticated.
Authentication:
Use your Freshservice API Key and a password (you can use 'X' for the password) to authenticate yourself.
You can get your API Key from your profile settings page.
Then, under 'Your API Key' you will find your API key.
Example:
curl -v -u your_api_key:X -H "Content-Type: application/json" -X GET 'https://yourcompany.freshservice.com/api/v2/tickets/1'
For more information, please see Authentication.
Note: You can read more about API keys from here.
Ticket Attributes
A ticket is a record of an issue reported by a customer.
Creating a Ticket
To create a new ticket, you must provide values for the following attributes.
Mandatory attributes:
email_addresses, requester_id, subject, description
You must specify at least one of these two attributes:
email_addresses
(mandatory if requester_id is not specified)
The email address of the requester. If a contact with the given email address does not exist, a new contact will be created.
requester_id
(mandatory if email_addresses is not specified)
The ID of the requester.
subject
(mandatory)
Subject of the ticket.
description
(mandatory)
Description of the ticket.
Other attributes:
source
The channel through which the ticket was created. Default is 2 (Email).
1 - Email
2 - Portal
3 - Phone
4 - Chat
5 - Feedback
6 - Mails
7 - Twitter
8 - Facebook
9 - Mobile
10 - Walk-in
11 - Survey
12 - Bot
13 - Other
14 - E-Commerce
15 - Call
16 - SMS
17 - WhatsApp
18 - LinkedIn
19 - Website
20 - Other Social
21 - Google Business Messages
priority
The priority of the ticket. Default is 1 (Low).
1 - Low
2 - Medium
3 - High
4 - Urgent
status
The status of the ticket. Default is 2 (Open).
2 - Open
3 - Pending
4 - Resolved
5 - Closed
6 - Waiting on Customer
type
The type of the ticket. Default is Incident.
Due By
The timestamp of when the ticket is due.
fr_dueby
The timestamp of when the first response is due.
tags
The tags associated with the ticket.
Custom Fields
Custom fields associated with the ticket.
Example curl command to create a ticket:
curl -v -u your_api_key:X -H "Content-Type: application/json" -d '{ "email_addresses": ["email@example.com"], "subject": "Problem with my computer", "description": "My computer is not working as expected." }' -X POST 'https://yourcompany.freshservice.com/api/v2/tickets'
Example JSON payload for creating a ticket with more attributes:
{
"email_addresses": ["email@example.com"],
"subject": "Problem with my computer",
"description": "My computer is not working as expected.",
"status": 3,
"priority": 4,
"source": 5
}
`;

const getLLMResponse = async (query) => {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY

  if (!apiKey) {
    return 'Error: Gemini API key not configured.'
  }
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

  const userPrompt = `Based on the following documentation, answer my question. If the information is not present, say that you cannot answer based on the provided documentation.


${scrapedData}


${query}`;

  const payload = {
    contents: [{ parts: [{ text: userPrompt }] }],
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`API request failed with status: ${response.status}`);
  }

  const result = await response.json();
  return result?.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";
};

// Helper function to remove markdown list and formatting characters
const cleanText = (text) => {
  if (typeof text !== 'string') return '';
  return text
    .replace(/(\*\s*|\-\s*|\•\s*)/g, ' ')
    .replace(/\*+/g, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/\s+/g, ' ')
    .trim();
};

const ChatBubble = ({ text, isUser }) => (
  <div className={`p-4 rounded-3xl max-w-lg shadow-lg ${isUser ? 'bg-blue-500 text-white self-end rounded-br-none' : 'bg-gray-200 text-gray-800 self-start rounded-bl-none'}`}>
    <p className="whitespace-pre-wrap">{cleanText(text)}</p>
  </div>
);

const App = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!query.trim() || isLoading) return;

    const userMessage = { text: query, isUser: true };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setQuery('');
    setIsLoading(true);

    try {
      const llmResponse = await getLLMResponse(query);
      const botMessage = { text: llmResponse, isUser: false };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Failed to fetch response:", error);
      const errorMessage = { text: `An error occurred: ${error.message}`, isUser: false };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans p-4">
      <div className="flex-grow overflow-y-auto space-y-4 p-4 rounded-3xl shadow-lg bg-white bg-opacity-90 flex flex-col">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-6 drop-shadow-md">Freshservice RAG Assistant</h1>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-grow text-center text-gray-400 p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="text-xl">Ask me anything about the Freshservice API's ticket attributes!</p>
          </div>
        )}
        {messages.map((msg, index) => (
          <ChatBubble key={index} text={msg.text} isUser={msg.isUser} />
        ))}
        {isLoading && (
          <div className="flex items-center space-x-2 self-start p-4 rounded-3xl rounded-bl-none bg-gray-200 text-gray-800">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse-slow-1"></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse-slow-2"></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse-slow-3"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-center space-x-4 p-4 bg-white rounded-3xl shadow-xl mt-4">
        <textarea
          className="flex-grow p-4 border-2 border-gray-200 rounded-3xl focus:outline-none focus:border-blue-500 resize-none transition-all duration-300"
          placeholder="Type your query..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button
          className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
          onClick={handleSend}
          disabled={isLoading || !query.trim()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default App;
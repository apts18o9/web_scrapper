from rag_pipeline import get_rag_response
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# This is the scraped data from Phase 1.
scraped_data = """
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
API Key:
You can find your API key by navigating to Profile Settings from the top right corner of your Freshservice account.
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
Example `curl` command to create a ticket:
`curl -v -u your_api_key:X -H "Content-Type: application/json" -d '{ "email_addresses": ["email@example.com"], "subject": "Problem with my computer", "description": "My computer is not working as expected." }' -X POST 'https://yourcompany.freshservice.com/api/v2/tickets'`
Example JSON payload for creating a ticket with more attributes:
`{
  "email_addresses": ["email@example.com"],
  "subject": "Problem with my computer",
  "description": "My computer is not working as expected.",
  "status": 3,
  "priority": 4,
  "source": 5
}`
"""

# Example usage
query = "What are the mandatory attributes for creating a ticket?"

# Get API key from environment variable
api_key = os.getenv("GEMINI_API_KEY")

response = get_rag_response(query, scraped_data, api_key=api_key)
print(response)
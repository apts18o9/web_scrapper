import requests
import os
from dotenv import load_dotenv
import json

# Load environment variables from .env file
load_dotenv()

def get_rag_response(query, documentation, api_key=None):
    # Get API key from environment if not provided
    if api_key is None:
        api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        return "Error: GEMINI_API_KEY not found in environment variables."

    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key={api_key}"

    payload = {
        "contents": [{"parts": [{"text": query}]}],
        "systemInstruction": {
            "parts": [{
                "text": f"You are a helpful assistant with specialized knowledge. Answer the user's question ONLY using the following documentation about the Freshservice API's ticket attributes. If the information is not present in the documentation, respond with 'I cannot answer that question based on the provided documentation.'\n\n--- DOCUMENTATION ---\n{documentation}"
            }]
        }
    }

    try:
        response = requests.post(api_url, json=payload)
        response.raise_for_status()
        result = response.json()
        return result['candidates'][0]['content']['parts'][0]['text']
    except requests.exceptions.RequestException as e:
        return f"An error occurred: {e}"
    except (KeyError, IndexError) as e:
        return f"Error parsing API response: {e}. Full response: {result}"
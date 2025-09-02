import requests
from bs4 import BeautifulSoup

# The URL of the Freshservice API documentation, pointing to the 'ticket_attributes' section.
# The URL has a hash tag, so we need to request the full page and then find the relevant section.
URL = "https://api.freshservice.com/#ticket_attributes"

def scrape_documentation(url):
    """
    Scrapes the Freshservice API documentation and extracts content
    from the 'ticket_attributes' section.
    """
    print("Connecting to the Freshservice API documentation...")

    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
        }
        # Send an HTTP GET request to the URL.
        response = requests.get(url, headers=headers)

        # Check if the request was successful (status code 200).
        response.raise_for_status()

        # Parse the HTML content of the page using BeautifulSoup.
        soup = BeautifulSoup(response.content, 'html.parser')

        # Find the section with the 'id' attribute equal to 'ticket_attributes'.
        # This is how we target the specific part of the page required for Phase 1.
        ticket_attributes_section = soup.find(id="ticket_attributes")

        # Check if the section was found.
        if ticket_attributes_section:
            # Extract and print all the text content from within that section.
            # This is the raw scraped data you will use in Phase 2.
            print("\nSuccessfully found and scraped the 'ticket attributes' section!\n")
            print(ticket_attributes_section.get_text(separator="\n", strip=True))
            return ticket_attributes_section.get_text(separator="\n", strip=True)
        else:
            print(f"Error: Could not find the section with id='ticket_attributes' on the page.")
            return None

    except requests.exceptions.RequestException as e:
        print(f"An error occurred during the request: {e}")
        return None

if __name__ == "__main__":
    scraped_data = scrape_documentation(URL)
   
    # print("\nScraped data saved to scraped_data.txt")

# Lead Scoring API
This project is a backend service designed to process and score sales leads based on a combination of rule-based logic and AI reasoning. It accepts product/offer details and a CSV file of leads, then assigns each lead a score and a buying intent label (High, Medium, or Low).

## Features
~ Input APIs: Endpoints to accept product offer details via JSON and lead data via a CSV file upload.

~ Scoring Pipeline: A two-layer system that assigns a score from 0-100 to each lead.

~ Output APIs: Endpoints to trigger the scoring process and retrieve the final scored leads as a JSON array.

~ AI Integration: Utilizes an AI model (OpenAI in this case) to classify lead intent and provide reasoning.

## Getting Started
### Prerequisites
Node.js (version 14 or higher) npm

### Installation
Clone the repository:
Bash
git clone https://github.com/astha-issrani/lead-scoring-api.git 
cd lead-scoring-api 

### Install the dependencies:

Bash
npm install 
Create a .env file in the root directory and add your OpenAI API key:
OPENAI_API_KEY="your_secret_key_from_openai"

### Running the Server

Start the server from your terminal:
Bash
node server.js The API will be live at http://localhost:3001.

## API Usage Examples
You can use a tool like Postman to test the endpoints.

### POST /offer This endpoint accepts the product/offer details.

Method: POST

URL: http://localhost:3001/offer

Body: JSON

JSON

{ "name": "AI Outreach Automation", "value_props": ["24/7 outreach", "6x more meetings"], "ideal_use_cases": ["B2B SaaS mid-market"] }

Postman Steps:

Open Postman and create a new request.
Set the method to POST.
Enter the URL: http://localhost:3001/offer.
Go to the Headers tab and add: Content-Type with value application/json.
Go to the Body tab, select raw, and choose JSON from the dropdown.
Paste the JSON body provided above.
Click Send.

### POST /leads/upload 

This endpoint uploads a CSV file containing the lead data.
Method: POST

URL: http://localhost:3001/leads/upload

Body: form-data

Key: leads_file (type: File), Value: select your leads.csv file.

Postman Steps:

Open Postman and create a new request.
Set the method to POST.
Enter the URL: http://localhost:3001/leads/upload.
Go to the Body tab and select form-data.
Add a new key named leads_file and set its type to File (using the dropdown next to the key).
Click Select Files and choose your leads.csv file.
Click Send.

### POST /score 
This endpoint triggers the lead scoring pipeline. It must be called after both /offer and /leads/upload have been successfully executed.
Method: POST

URL: http://localhost:3001/score

Postman Steps:

Open Postman and create a new request.
Set the method to POST.
Enter the URL: http://localhost:3001/score.
No body or headers are required.
Click Send.

### GET /results 
This endpoint returns the final scored leads as a JSON array.
Method: GET

URL: http://localhost:3001/results

Postman Steps:

Open Postman and create a new request.
Set the method to GET.
Enter the URL: http://localhost:3001/results.
No body or additional headers are required.
Click Send.

## Scoring Logic Explained
Each lead's final score is the sum of a rule-based score (max 50 points) and an AI-based score (max 50 points).

~ Rule Layer (max 50 points)
This layer uses static rules to assign points based on lead data.

~ Role Relevance: +20 points for decision makers (e.g., CEO, Director), +10 for influencers (e.g., Manager), and 0 otherwise.

~ Industry Match: +20 points for an exact ICP match, +10 for an adjacent industry, and 0 otherwise.

~ Data Completeness: +10 points if all required fields are present.

~ AI Layer (max 50 points)
This layer sends the lead and offer details to an AI model to classify intent.

~ Prompt: The AI is asked to "Classify intent (High/Medium/Low) and explain in 1-2 sentences".

~ Intent to Points: The AI's classification is mapped to points: High = 50, Medium = 30, and Low = 10.

~ Reasoning: The AI's explanation is also saved for context.

## Deployment
This service is designed to be easily deployed to a cloud platform.

Platform: Render

Live API URL:
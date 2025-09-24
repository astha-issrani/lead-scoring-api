const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { OpenAI } = require('openai'); // Import the OpenAI library

const app = express();
const port = 3001;

// Load environment variables (e.g., your OpenAI API key)
require('dotenv').config();

// Initialize OpenAI client with your API key
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Middleware for parsing JSON and file uploads
app.use(express.json());
const upload = multer({ dest: 'uploads/' });

// In-memory storage for offer details, leads, and scored leads
let offerDetails = null;
let leadsToScore = [];
let scoredLeads = [];

// Helper function to get AI-based score and reasoning
const getAIResponse = async (lead, offer) => {
    const prompt = `Classify the buying intent (High/Medium/Low) for a lead with the following details:
    Role: ${lead.role}
    Industry: ${lead.industry}
    LinkedIn Bio: ${lead.linkedin_bio}
    
    The product being offered is: ${offer.name}
    Its ideal use cases are: ${offer.ideal_use_cases.join(', ')}
    
    Explain your classification in 1-2 sentences.`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 100,
        });

        const aiText = response.choices[0].message.content;
        const intent = aiText.match(/(High|Medium|Low)/i) ? aiText.match(/(High|Medium|Low)/i)[0] : 'Low';
        const reasoning = aiText;

        let aiPoints = 0;
        if (intent.toLowerCase() === 'high') {
            aiPoints = 50;
        } else if (intent.toLowerCase() === 'medium') {
            aiPoints = 30;
        } else {
            aiPoints = 10;
        }

        return { intent, aiPoints, reasoning };
    } catch (error) {
        console.error('Error calling AI:', error);
        return { intent: 'Low', aiPoints: 10, reasoning: 'AI call failed.' };
    }
};

// POST /offer
app.post('/offer', (req, res) => {
    offerDetails = req.body;
    if (offerDetails && offerDetails.name && offerDetails.value_props && offerDetails.ideal_use_cases) {
        res.status(200).json({ message: 'Offer details saved successfully.', data: offerDetails });
    } else {
        res.status(400).json({ message: 'Invalid or incomplete offer details provided.' });
    }
});

// POST /leads/upload
app.post('/leads/upload', upload.single('leads_file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    const leads = [];
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (row) => {
            leads.push(row);
        })
        .on('end', () => {
            leadsToScore = leads;
            res.status(200).json({ message: 'Leads uploaded successfully.', count: leads.length });
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting temp file:', err);
            });
        });
});

// POST /score (Only includes AI scoring)
app.post('/score', async (req, res) => {
    if (!offerDetails || leadsToScore.length === 0) {
        return res.status(400).json({ message: 'Please upload offer details and leads first.' });
    }

    const newScoredLeads = [];
    for (const lead of leadsToScore) {
        const { intent, aiPoints, reasoning } = await getAIResponse(lead, offerDetails);
        
        // Final score is based only on AI points
        const finalScore = aiPoints; 

        newScoredLeads.push({
            name: lead.name,
            role: lead.role,
            company: lead.company,
            intent: intent,
            score: finalScore,
            reasoning: reasoning
        });
    }

    scoredLeads = newScoredLeads;
    res.status(200).json({ message: 'Scoring complete.', count: scoredLeads.length });
});

// GET /results
app.get('/results', (req, res) => {
    if (scoredLeads.length === 0) {
        return res.status(404).json({ message: 'No results found. Please run the /score endpoint first.' });
    }
    res.status(200).json(scoredLeads);
});

app.get('/', (req, res) => {
    res.send('Lead Scoring API is running!');
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
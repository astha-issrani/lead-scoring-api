// Add these lines to the top of your server.js file
const multer = require('multer');
const { OpenAI } = require('openai');
require('dotenv').config();

const upload = multer({ dest: 'uploads/' });

// In-memory storage for offer details, leads, and scored leads
let offerDetails = null;
let leadsToScore = [];
let scoredLeads = [];

// POST /offer: Accepts JSON with product/offer details
app.post('/offer', (req, res) => {
    offerDetails = req.body;
    if (offerDetails && offerDetails.name && offerDetails.value_props && offerDetails.ideal_use_cases) {
        res.status(200).json({ message: 'Offer details saved successfully.', data: offerDetails });
    } else {
        res.status(400).json({ message: 'Invalid or incomplete offer details provided.' });
    }
});

// POST /leads/upload: Accepts a CSV file with lead data
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

// Add the middleware below the `app.use(express.json());` line
app.use(express.json());
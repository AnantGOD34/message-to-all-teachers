// Import Express and Cors
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// In-memory data store (In production, replace with MongoDB, PostgreSQL, etc.)
let vibeCount = 0;
let shoutouts = [
    { id: 1, text: "⭐ Shoutout to every teacher who goes the extra mile to help us learn. You're wonderful!" },
    { id: 2, text: "🎉 Happy Teachers Day! Thank you for your endless patience and guidance." }
];

// API Endpoint: Get current vibe count and shoutouts
app.get('/api/data', (req, res) => {
    res.json({
        vibeCount,
        shoutouts
    });
});

// API Endpoint: Increment vibe counter
app.post('/api/vibe', (req, res) => {
    vibeCount++;
    res.json({ success: true, vibeCount });
});

// API Endpoint: Post a new shoutout
app.post('/api/shoutouts', (req, res) => {
    const { text } = req.body;
    if (!text || text.trim() === '') {
        return res.status(400).json({ success: false, error: 'Message cannot be empty' });
    }

    const newShoutout = {
        id: Date.now(),
        text: text.trim()
    };

    shoutouts.unshift(newShoutout); // Add to the beginning of the array
    res.json({ success: true, shoutout: newShoutout, shoutouts });
});

// Serve frontend static files if hosted together
app.use(express.static(path.join(__dirname, 'public')));

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

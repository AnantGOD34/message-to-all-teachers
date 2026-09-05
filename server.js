// Import Express and Cors
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// In-memory data store (Counter starts at 0)
let vibeCount = 0;
let shoutouts = [
    { id: 1, text: "⭐ Shoutout to every teacher who goes the extra mile to help us learn. You're wonderful!" },
    { id: 2, text: "🎉 Happy Teachers Day! Thank you for your endless patience and guidance." }
];

// Keep track of connected SSE clients for real-time streaming
let clients = [];

// SSE Endpoint for real-time updates
app.get('/api/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Send current state on connection
    res.write(`data: ${JSON.stringify({ vibeCount, shoutouts })}\n\n`);

    clients.push(res);

    req.on('close', () => {
        clients = clients.filter(client => client !== res);
    });
});

// Helper function to broadcast updates to all connected clients
function broadcastUpdate() {
    clients.forEach(client => {
        client.write(`data: ${JSON.stringify({ vibeCount, shoutouts })}\n\n`);
    });
}

// Background automation: Increment vibe count and add random notes periodically
const randomNotes = [
    "🚀 Anonymous: 'Whichever teacher is reading this, you rock!'",
    "🌍 Someone from across the globe just sent a wave of appreciation!",
    "💡 'Your classes changed how I view the world. Thank you!' - Anonymous student",
    "⭐ High five to the educators burning the midnight oil grading papers!",
    "🍎 A secret admirer just dropped virtual support into the meter!"
];

setInterval(() => {
    vibeCount += Math.floor(Math.random() * 3) + 1; // Increment by 1 to 3
    
    // Occasionally add a random automatic thank-you note
    if (Math.random() > 0.6) {
        const randomText = randomNotes[Math.floor(Math.random() * randomNotes.length)];
        shoutouts.unshift({ id: Date.now(), text: randomText });
        if (shoutouts.length > 25) shoutouts.pop(); // Keep list size manageable
    }

    broadcastUpdate();
}, 4000); // Triggers every 4 seconds

// API Endpoint: Get current vibe count and shoutouts
app.get('/api/data', (req, res) => {
    res.json({
        vibeCount,
        shoutouts
    });
});

// API Endpoint: Increment vibe counter manually
app.post('/api/vibe', (req, res) => {
    vibeCount++;
    broadcastUpdate();
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
    broadcastUpdate();
    res.json({ success: true, shoutout: newShoutout, shoutouts });
});

// Serve frontend static files if hosted together
app.use(express.static(path.join(__dirname, 'public')));

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

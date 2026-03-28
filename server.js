// server.js
const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT || 3000;

// Put your API key here (or use env var)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'YOUR_OPENAI_KEY_HERE';

app.use(express.json());

// Serve static files from this folder (including Ai trainer.html)
app.use(express.static(__dirname));

// Root path serves Ai trainer page directly
app.get('/', (req, res) => {
  res.sendFile(require('path').join(__dirname, 'Ai trainer.html'));
});

// Allow local frontend (if you use another origin)
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.post('/proxy/gemini', async (req, res) => {
  try {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
      return res.status(401).json({ error: 'Missing GEMINI_API_KEY on server' });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      }
    );

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'proxy error' });
  }
});

app.post('/proxy/openai', async (req, res) => {
  try {
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'YOUR_OPENAI_KEY_HERE') {
      return res.status(401).json({ error: 'Missing OPENAI_API_KEY on server' });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'proxy error' });
  }
});

app.listen(port, () => {
  console.log(`Gemini proxy listening on http://localhost:${port}`);
});
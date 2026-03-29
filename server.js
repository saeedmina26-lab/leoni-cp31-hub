const express = require('express');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Handle CORS and preflight manually
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.get('/api/health', (req, res) => res.json({ ok: true, port: PORT }));

app.post('/api/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message) return res.status(400).json({ error: 'No message' });
    const prompt = context
      ? `You are LEONI AI for CP3.1 department.\n\nDOCS:\n${context}\n\nQuestion: ${message}`
      : message;
    const r = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }]
    });
    res.json({ response: r.content.find(b => b.type === 'text')?.text || '' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/summary', async (req, res) => {
  try {
    const { document: doc } = req.body;
    if (!doc) return res.status(400).json({ error: 'No document' });
    const prompt = `LEONI WSD expert. Explain this CP3.1 document in 3-5 sentences:\n${doc.type} ${doc.nr} - "${doc.title}"\nProcess: ${doc.process} | v${doc.version} | ${doc.date} | ISO: ${doc.iso}`;
    const r = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }]
    });
    res.json({ response: r.content.find(b => b.type === 'text')?.text || '' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ LEONI AI running on port ${PORT}`);
});

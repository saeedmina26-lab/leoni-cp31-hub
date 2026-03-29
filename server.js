const express = require('express');
const cors = require('cors');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();

// Railway injects PORT automatically - never hardcode it
const PORT = process.env.PORT;
if (!PORT) {
  console.error('ERROR: PORT environment variable not set!');
  process.exit(1);
}

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.get('/api/health', (req, res) => {
  res.json({ ok: true, port: PORT });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message) return res.status(400).json({ error: 'No message' });
    const prompt = context
      ? `You are LEONI AI for CP3.1 department. Answer concisely.\n\nDOCS:\n${context}\n\nQuestion: ${message}`
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
    const prompt = `Expert in LEONI WSD manufacturing. Explain this CP3.1 document in 3-5 sentences:\n${doc.type} ${doc.nr} - "${doc.title}"\nProcess: ${doc.process} | v${doc.version} | ${doc.date} | ISO: ${doc.iso}`;
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
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ LEONI AI running on port ${PORT}`);
});

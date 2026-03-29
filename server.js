const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function askGemini(prompt, maxTokens = 600) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: maxTokens }
    })
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || `HTTP ${response.status}`);
  }
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.';
}

app.get('/api/health', (req, res) => res.json({ ok: true, port: PORT }));

app.post('/api/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message) return res.status(400).json({ error: 'No message' });
    const prompt = context
      ? `You are LEONI AI, the intelligent assistant for LEONI Wiring Systems CP3.1 department. You have access to all 148 documents — 13 Procedural Instructions and 135 Technical Standards. Answer helpfully and concisely based on the document registry below.\n\nDOCUMENT REGISTRY:\n${context}\n\nQuestion: ${message}`
      : message;
    const text = await askGemini(prompt, 600);
    res.json({ response: text });
  } catch (e) {
    console.error('Chat error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/summary', async (req, res) => {
  try {
    const { document: doc } = req.body;
    if (!doc) return res.status(400).json({ error: 'No document' });
    const prompt = `You are an expert in LEONI Wiring Systems (WSD) quality management and manufacturing. Give a concise practical explanation (3-5 sentences) of what this CP3.1 document covers and why it matters for the team:\n\n${doc.type} ${doc.nr} - "${doc.title}"\nProcess: ${doc.process} | v${doc.version} | Released: ${doc.date} | ISO: ${doc.iso}`;
    const text = await askGemini(prompt, 300);
    res.json({ response: text });
  } catch (e) {
    console.error('Summary error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ LEONI AI running on port ${PORT}`);
});

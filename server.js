const express = require('express');
const cors = require('cors');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──
app.use(cors());
app.use(express.json());

// ── Serve static files from public folder (absolute path for Railway) ──
app.use(express.static(path.join(__dirname, 'public')));

// ── Anthropic client ──
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ── Health check ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'LEONI AI Server is running' });
});

// ── AI Chat endpoint ──
app.post('/api/chat', async (req, res) => {
  const { message, context } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: 'API key not configured.' });
  try {
    const prompt = context
      ? `You are LEONI AI, the intelligent assistant for LEONI Wiring Systems CP3.1 department. Answer helpfully and concisely.\n\nDOCUMENT REGISTRY (148 docs):\n${context}\n\nQuestion: ${message}`
      : message;
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    });
    const text = response.content?.find(b => b.type === 'text')?.text || 'No response.';
    res.json({ response: text });
  } catch (error) {
    console.error('Anthropic API error:', error.message);
    res.status(500).json({ error: `AI error: ${error.message}` });
  }
});

// ── AI Summary endpoint ──
app.post('/api/summary', async (req, res) => {
  const { document } = req.body;
  if (!document) return res.status(400).json({ error: 'Document info is required' });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: 'API key not configured.' });
  try {
    const prompt = `You are an expert in LEONI Wiring Systems (WSD) quality management and manufacturing. Give a concise practical explanation (3-5 sentences) of what this CP3.1 document covers and why it matters:\n\n${document.type === 'Procedural Instruction' ? 'PI' : 'TS'} ${document.nr} - "${document.title}"\nProcess: ${document.process} | v${document.version} | Released: ${document.date} | ISO: ${document.iso || 'N/A'}`;
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });
    const text = response.content?.find(b => b.type === 'text')?.text || 'No response.';
    res.json({ response: text });
  } catch (error) {
    console.error('Anthropic API error:', error.message);
    res.status(500).json({ error: `AI error: ${error.message}` });
  }
});

// ── Catch-all: serve index.html for any unmatched route ──
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start server ──
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ LEONI AI Server running on port ${PORT}`);
});

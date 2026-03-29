const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──
app.use(cors()); // Allow requests from your frontend
app.use(express.json());
app.use(express.static('public')); // Serve the dashboard HTML

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

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'API key not configured. Please set ANTHROPIC_API_KEY in your .env file.' });
  }

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

  if (!document) {
    return res.status(400).json({ error: 'Document info is required' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'API key not configured.' });
  }

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

// ── Start server ──
app.listen(PORT, () => {
  console.log(`\n✅ LEONI AI Server running at http://localhost:${PORT}`);
  console.log(`📋 Dashboard available at http://localhost:${PORT}`);
  console.log(`🤖 API endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/chat`);
  console.log(`   POST http://localhost:${PORT}/api/summary`);
  console.log(`   GET  http://localhost:${PORT}/api/health\n`);
});

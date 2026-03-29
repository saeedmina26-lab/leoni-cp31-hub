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

const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function askGroq(prompt, maxTokens = 400) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || `HTTP ${response.status}`);
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'No response.';
}

app.get('/api/health', (req, res) => res.json({ ok: true, port: PORT }));

app.post('/api/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message) return res.status(400).json({ error: 'No message' });

    // Search context for relevant docs only — keeps tokens low
    let relevantContext = '';
    if (context) {
      const lines = context.split('\n');
      const q = message.toLowerCase();
      const relevant = lines.filter(l =>
        l.toLowerCase().includes(q.split(' ')[0]) ||
        l.toLowerCase().includes(q.split(' ')[1] || '') ||
        l.toLowerCase().includes(q.split(' ')[2] || '')
      ).slice(0, 20);
      relevantContext = relevant.length > 0 ? relevant.join('\n') : lines.slice(0, 30).join('\n');
    }

    const prompt = relevantContext
      ? `You are LEONI AI for LEONI Wiring Systems CP3.1 department. Answer based on these relevant documents:\n\n${relevantContext}\n\nQuestion: ${message}\n\nGive a helpful, concise answer.`
      : `You are LEONI AI for LEONI Wiring Systems CP3.1 department. Answer this question: ${message}`;

    const text = await askGroq(prompt, 400);
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
    const prompt = `LEONI WSD expert. Explain this CP3.1 document in 3-4 sentences:\n${doc.type} ${doc.nr} - "${doc.title}"\nProcess: ${doc.process} | v${doc.version} | ISO: ${doc.iso}`;
    const text = await askGroq(prompt, 250);
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

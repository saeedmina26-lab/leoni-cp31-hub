# 🏭 LEONI CP3.1 — AI Department Hub

A full-stack web application for LEONI Wiring Systems CP3.1 department, featuring an AI assistant powered by Claude.

---

## 📋 What's Included

```
leoni-server/
├── server.js          ← Node.js backend (Express + Anthropic API)
├── .env.example       ← Environment variables template
├── package.json       ← Dependencies
├── README.md          ← This file
└── public/
    └── index.html     ← Full dashboard frontend
```

---

## 🚀 Setup (5 minutes)

### Step 1 — Install Node.js
Download from: https://nodejs.org (choose LTS version)

### Step 2 — Install dependencies
Open a terminal in this folder and run:
```bash
npm install
```

### Step 3 — Add your Anthropic API key
1. Copy the example file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` in any text editor
3. Replace `your_anthropic_api_key_here` with your real key
4. Get your key from: https://console.anthropic.com/

Your `.env` file should look like:
```
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxx
```

### Step 4 — Start the server
```bash
npm start
```

### Step 5 — Open in browser
Visit: **http://localhost:3000**

---

## 🌐 Deploy Online (share with your team)

### Option A — Railway (Recommended, Free tier available)
1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Upload this folder or connect GitHub
4. Add environment variable: `ANTHROPIC_API_KEY` = your key
5. Railway gives you a public URL like `https://leoni-ai.up.railway.app`

### Option B — Render (Free tier)
1. Go to https://render.com
2. New → Web Service → Connect your repo
3. Build command: `npm install`
4. Start command: `npm start`
5. Add `ANTHROPIC_API_KEY` in Environment settings

### Option C — Heroku
```bash
heroku create leoni-cp31-hub
heroku config:set ANTHROPIC_API_KEY=your_key_here
git push heroku main
```

---

## 🔑 Getting an Anthropic API Key
1. Go to https://console.anthropic.com/
2. Sign up / log in
3. Go to "API Keys" → "Create Key"
4. Copy the key (starts with `sk-ant-...`)
5. Paste it in your `.env` file

---

## 🛡️ Security Notes
- **Never** commit your `.env` file to GitHub (it's in `.gitignore`)
- The API key stays on the server — users never see it
- For extra security, add rate limiting before sharing publicly

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server status check |
| POST | `/api/chat` | AI chat with document context |
| POST | `/api/summary` | AI summary for a specific document |

---

## 💬 Support
Built for LEONI WSD · CP3.1 Department · IMS Level 48

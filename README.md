# TradeBuddy — AI for the Indian Investor

> Your mom could use this. That's the point.

TradeBuddy is an AI-powered stock market intelligence platform built for India's 14 crore+ demat holders who have zero knowledge of technical analysis. Instead of showing charts and jargon, TradeBuddy talks like a smart friend — in your language.

**Ask "Should I buy Reliance?" and get a clear YES/NO with reasons a 10-year-old could understand.**

## What Makes TradeBuddy Different

| Other Platforms | TradeBuddy |
|---|---|
| Show RSI, MACD, Bollinger Bands | Says "Stock went up too fast, wait for it to cool down" |
| English only | 8 Indian languages including Hinglish |
| Dashboards for experts | Conversational AI for everyone |
| You analyze the data | AI analyzes, you just decide |
| News summaries | Actionable signals: BUY at ₹X, Stop Loss ₹Y, Target ₹Z |

## Tech Stack

- **Frontend**: React 19, TypeScript, TailwindCSS 4, Framer Motion, Recharts
- **Backend**: Python FastAPI
- **AI**: Groq (Llama 3.3 70B) — sub-second responses
- **Data**: Groww API (real-time quotes), Upstox API (historical OHLCV), NSE API (FII/DII flows, bulk deals)
- **Auth**: Supabase (email/password)
- **Technical Analysis**: pandas + numpy (RSI, MACD, Bollinger Bands, ADX, Stochastic — calculated from raw price data)

## Agentic Architecture (3-Step Pipeline)

```
Step 1: DETECT → Scan 15 Nifty 50 stocks + NSE FII/DII data + bulk deals
Step 2: ANALYZE → Calculate technical indicators + identify patterns
Step 3: DECIDE → AI generates BUY/WAIT/AVOID with entry, stop-loss, target in user's language
```

No human input between steps. The agent runs autonomously.

## Features

### 1. "Should I Buy?" — AI Stock Verdict
- Type any NSE stock symbol
- Get instant BUY / WAIT / AVOID verdict
- Entry price, stop loss, target — all in plain language
- Expandable tabs: AI Verdict → Why? → Chart → Technicals → Volume

### 2. Morning Briefing — Opportunity Radar
- AI scans market every session
- Detects: price crashes, rallies, 52-week highs/lows, FII/DII activity
- Each signal explained: "What happened" + "What you should do"
- Beautiful carousel presentation

### 3. Big Money Tracker
- Real-time FII/DII flows from NSE
- Sentiment analysis: "Both FII and DII buying — bullish"
- Bulk/block deals with interactive carousel
- Everything explained in simple language

### 4. Multi-Language Support
- English, Hindi, Hinglish, Tamil, Telugu, Bengali, Marathi, Gujarati
- AI responds in your chosen language
- Language picker with animated mascot on first login

### 5. Authentication
- Supabase email/password auth
- Protected routes — login required for features
- Guest routes for login/signup pages

## Setup Instructions

### Prerequisites
- Node.js 18+, Python 3.10+, pnpm

### Backend
```bash
cd backend
pip install -r requirements.txt
# Add your keys to .env:
# GROQ_API_KEY=your_groq_key (free from https://console.groq.com)
python -m uvicorn main:app --port 8000
```

### Frontend
```bash
cd stocksignal
pnpm install
# Add Supabase keys to .env:
# VITE_SUPABASE_URL=your_url
# VITE_SUPABASE_ANON_KEY=your_key
pnpm dev
```

Frontend runs on http://localhost:3000, backend on http://localhost:8000.

## Data Sources (All Free, No API Keys Required)

| Source | Data | Rate Limit |
|---|---|---|
| Groww API | Real-time NSE quotes, search | None |
| Upstox API | Historical OHLCV (candles) | None |
| NSE India API | FII/DII flows, bulk/block deals | Cookie-based |

## Team
Built for the ET Markets Hackathon — "AI for the Indian Investor"

# TradeBuddy — Architecture Document

## System Overview

TradeBuddy is a full-stack AI-powered stock analysis platform with a 3-step agentic pipeline that runs autonomously without human intervention.

```
┌─────────────────────────────────────────────────────────────┐
│                        USER (Browser)                        │
│  React 19 + TypeScript + TailwindCSS + Framer Motion         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Analysis  │ │ Briefing │ │ Tracker  │ │   Chat   │       │
│  └─────┬────┘ └─────┬────┘ └─────┬────┘ └─────┬────┘       │
│        │             │            │             │             │
│        └─────────────┴────────────┴─────────────┘             │
│                          │ Vite Proxy /api/*                  │
└──────────────────────────┼───────────────────────────────────┘
                           │
┌──────────────────────────┼───────────────────────────────────┐
│                   FASTAPI BACKEND (:8000)                     │
│                          │                                    │
│  ┌───────────────────────┼───────────────────────────┐       │
│  │              API ROUTERS                           │       │
│  │  /api/analysis/{symbol}  — Stock analysis + AI     │       │
│  │  /api/signals/           — Agentic pipeline        │       │
│  │  /api/market/overview    — Market data             │       │
│  │  /api/tracker/           — FII/DII + bulk deals    │       │
│  │  /api/chat/              — Conversational AI       │       │
│  └───────────────────────┼───────────────────────────┘       │
│                          │                                    │
│  ┌───────────────────────┼───────────────────────────┐       │
│  │              SERVICES LAYER                        │       │
│  │                                                    │       │
│  │  stock_service.py    ← Groww API + Upstox API     │       │
│  │  technical_service.py ← pandas/numpy indicators   │       │
│  │  ai_service.py       ← Groq (Llama 3.3 70B)      │       │
│  │  signal_engine.py    ← 3-Step Agentic Pipeline    │       │
│  └───────────────────────┼───────────────────────────┘       │
│                          │                                    │
│  ┌───────────────────────┼───────────────────────────┐       │
│  │           EXTERNAL DATA SOURCES                    │       │
│  │                                                    │       │
│  │  Groww API ──── Real-time NSE quotes               │       │
│  │  Upstox API ── Historical OHLCV candles            │       │
│  │  NSE India ─── FII/DII flows, bulk/block deals     │       │
│  │  Groq AI ───── LLM for verdicts & explanations     │       │
│  └────────────────────────────────────────────────────┘       │
│                                                               │
│  ┌────────────────────────────────────────────────────┐       │
│  │           CACHING LAYER (TTLCache)                  │       │
│  │  Quotes: 5 min │ History: 5 min │ Signals: 15 min  │       │
│  └────────────────────────────────────────────────────┘       │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│                    SUPABASE (Auth)                             │
│  Email/Password authentication │ Session management           │
└───────────────────────────────────────────────────────────────┘
```

## The 3-Step Agentic Pipeline

This is the core differentiator. The agent completes 3 sequential analysis steps without human input:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   STEP 1:       │     │   STEP 2:       │     │   STEP 3:       │
│   DETECT        │────▶│   ANALYZE       │────▶│   DECIDE        │
│                 │     │                 │     │                 │
│ • Fetch quote   │     │ • Calculate RSI │     │ • AI generates  │
│   from Groww    │     │   MACD, ADX,    │     │   BUY/WAIT/     │
│ • Fetch history │     │   Bollinger,    │     │   AVOID verdict │
│   from Upstox   │     │   Stochastic    │     │ • Entry price   │
│ • Fetch FII/DII │     │ • Detect        │     │ • Stop loss     │
│   from NSE      │     │   patterns      │     │ • Target price  │
│ • Scan 15 Nifty │     │ • Score signals │     │ • Reasons in    │
│   50 stocks     │     │   bull vs bear  │     │   user's lang   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
     ~2 seconds              ~1 second              ~1.5 seconds
```

Total pipeline time: ~4.5 seconds for a complete autonomous analysis.

## Agent Roles

| Agent | Role | Input | Output |
|---|---|---|---|
| Data Agent | Fetches real-time + historical data | Stock symbol | Quote + OHLCV history |
| Analysis Agent | Calculates technical indicators | Price data | RSI, MACD, ADX, patterns |
| Decision Agent (LLM) | Generates human-friendly verdict | Indicators + patterns | BUY/WAIT/AVOID + reasons in user's language |
| Signal Scanner | Scans market for opportunities | Nifty 50 symbols | List of actionable signals |
| Briefing Agent | Explains signals in simple language | Raw signals | Human-friendly explanations |

## Error Handling

- **Data source failure**: Groww down → return cached data or empty state with user-friendly message
- **AI failure**: Groq unavailable → fall back to rule-based recommendation engine (instant, no AI dependency)
- **NSE blocked**: Cookie-based auth fails → skip FII/DII data, show "data unavailable during off-market hours"
- **Rate limits**: All responses cached with TTL (5-15 min) to minimize API calls

## Tool Integrations

| Tool | Purpose | Auth |
|---|---|---|
| Groww API | Real-time NSE stock quotes | None (public) |
| Upstox API | Historical candle data | None (public) |
| NSE India API | FII/DII flows, bulk deals | Cookie-based |
| Groq Cloud | LLM inference (Llama 3.3 70B) | API key |
| Supabase | User authentication | Project URL + anon key |

## Language Personalization

The AI agent adapts its output language based on user preference stored in localStorage:

```
User selects "Hinglish" → localStorage.tradebuddy_lang = "hinglish"
                        → API sends ?lang=hinglish
                        → Groq prompt includes: "RESPOND IN HINGLISH"
                        → Rule-based fallback also has Hinglish templates
```

Supported: English, Hindi, Hinglish, Tamil, Telugu, Bengali, Marathi, Gujarati

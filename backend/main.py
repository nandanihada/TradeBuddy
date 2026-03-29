"""
TradeBuddy Backend — FastAPI
AI-powered intelligence layer for Indian retail investors.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from routers import market, analysis, signals, tracker, chat

app = FastAPI(title="TradeBuddy API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173","https://tradebuddy-api-i6sm.onrender.com","https://tradebuddy-b3vd.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(market.router, prefix="/api/market", tags=["Market"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])
app.include_router(signals.router, prefix="/api/signals", tags=["Signals"])
app.include_router(tracker.router, prefix="/api/tracker", tags=["Tracker"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "TradeBuddy API"}

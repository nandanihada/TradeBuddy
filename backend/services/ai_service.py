"""
AI Service — Groq (Llama 3.1 70B).
Super fast, free, perfect for hackathon.
"""
import os
from groq import Groq

_client = None


def _get_client():
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY", "")
        if not api_key or api_key == "your_groq_api_key_here":
            return None
        _client = Groq(api_key=api_key)
    return _client


SYSTEM_PROMPT = """You are TradeBuddy AI — a friendly, smart stock market buddy for Indian investors.

YOUR PERSONALITY:
- Talk like a smart friend, NOT a finance textbook
- Use simple Hindi-English mix when natural (like "yeh stock abhi thoda overheated hai")
- Be direct: YES buy / NO don't buy / WAIT for better price
- Use ₹ for prices, Cr for crores
- Keep it short. No walls of text.

RESPONSE STYLE:
1. Quick Answer — One line: Buy / Wait / Avoid with one reason
2. Simple Explanation — 2-3 sentences in plain language
3. Offer to show more — chart analysis, detailed numbers

RULES:
- NEVER use jargon without explaining it
- Instead of "RSI is 72 indicating overbought" say "Stock went up too fast, usually takes a breather"
- Instead of "MACD bearish crossover" say "Momentum is slowing down"
- Always mention risk
- Use emojis naturally: ✅ ❌ ⚠️ 📈 📉
- Format with markdown
"""


async def chat_with_market_context(
    user_message: str,
    market_context: str = "",
    chat_history: list = None,
) -> str:
    """Chat with TradeBuddy AI via Groq."""
    client = _get_client()
    if client is None:
        return "⚠️ AI not configured. Add GROQ_API_KEY to backend/.env\n\nGet your free key at https://console.groq.com/keys"

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    if market_context:
        messages.append({"role": "system", "content": f"Current Market Data:\n{market_context}"})

    if chat_history:
        for msg in chat_history[-6:]:
            messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})

    messages.append({"role": "user", "content": user_message})

    try:
        response = client.chat.completions.create(
            model="llama-3.1-70b-versatile",
            messages=messages,
            temperature=0.8,
            max_tokens=2048,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"⚠️ AI error: {str(e)}"


async def get_buy_recommendation(symbol: str, stock_data: dict, technicals: dict) -> dict:
    """Should I buy this stock? Returns layered response via Groq AI."""
    client = _get_client()
    if client is None:
        return {"verdict": "WAIT", "quick": "⚠️ AI not available — using rule-based analysis", "explanation": "", "confidence": 0}

    price = stock_data.get("price", 0)
    change_pct = stock_data.get("change_pct", 0)
    high_52w = stock_data.get("fifty_two_week_high", 0)
    low_52w = stock_data.get("fifty_two_week_low", 0)
    ind = technicals.get("indicators", {})
    patterns = technicals.get("patterns", [])
    signal = technicals.get("signal_summary", "")

    context = f"""Stock: {symbol}
Price: ₹{price} | Change: {change_pct:+.2f}%
52W High: ₹{high_52w} | Low: ₹{low_52w}
RSI: {ind.get('rsi', 'N/A')} ({ind.get('rsi_signal', '')})
MACD: {ind.get('macd_crossover', 'N/A')}
ADX: {ind.get('adx', 'N/A')} ({ind.get('trend_strength', '')})
SMA20: ₹{ind.get('sma_20', 'N/A')} | SMA50: ₹{ind.get('sma_50', 'N/A')}
Patterns: {', '.join(p['name'] for p in patterns) if patterns else 'None'}
Signal: {signal}"""

    prompt = f"""Based on this data, should someone buy {symbol}?

{context}

Reply in this EXACT JSON format only:
{{"verdict":"BUY or WAIT or AVOID","quick":"one line answer like telling a friend","explanation":"2-3 simple sentences why","entry_price":"₹X","stop_loss":"₹X","target":"₹X","risk_level":"Low/Medium/High","confidence":70,"detailed_reasons":["reason 1","reason 2","reason 3"]}}

ONLY return valid JSON. No markdown. No explanation outside JSON."""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            temperature=0.5,
            max_tokens=512,
        )
        text = response.choices[0].message.content.strip()
        import json
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        return json.loads(text)
    except Exception as e:
        return {
            "verdict": "WAIT",
            "quick": f"AI couldn't analyze right now: {str(e)[:100]}",
            "explanation": "",
            "confidence": 0,
        }


async def generate_morning_briefing(market_data: dict, signals: list) -> str:
    """Generate conversational morning briefing via Groq."""
    client = _get_client()
    if client is None:
        return "⚠️ AI not available for briefing generation."

    prompt = f"""Write a morning market briefing for an Indian investor who knows NOTHING about stocks.

Market: {market_data}
Signals: {signals[:5]}

Format like a WhatsApp message from a smart friend:
- Greeting + market mood (1 line)
- 3 key things today (numbered, 2 lines each)
- One actionable suggestion
- Under 200 words, use emojis, mix Hindi-English naturally"""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            temperature=0.9,
            max_tokens=1024,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"⚠️ Couldn't generate briefing: {str(e)}"

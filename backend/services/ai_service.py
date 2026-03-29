"""
AI Service — Google Gemini integration.
Powers the Market ChatGPT, signal enrichment, and pattern explanations.
"""
import os
import google.generativeai as genai
from typing import Optional

_model = None


def _get_model():
    global _model
    if _model is None:
        api_key = os.getenv("GEMINI_API_KEY", "")
        if not api_key or api_key == "your_gemini_api_key_here":
            return None
        genai.configure(api_key=api_key)
        _model = genai.GenerativeModel("gemini-2.0-flash")
    return _model


SYSTEM_PROMPT = """You are TradeBuddy AI, an expert Indian stock market analyst.
You provide actionable insights for NSE/BSE stocks.

Rules:
- Always cite data sources (NSE, BSE, quarterly results, etc.)
- Give specific numbers — price levels, percentages, volumes
- Be direct and actionable — "Buy above ₹X with SL at ₹Y" style
- Mention risks alongside opportunities
- Use Indian market terminology (Nifty, Sensex, FII/DII, etc.)
- Format responses with clear sections
- If you don't have real-time data, say so clearly
- Never guarantee returns — always mention that markets carry risk
"""


async def chat_with_market_context(
    user_message: str,
    market_context: Optional[str] = None,
    chat_history: Optional[list] = None,
) -> str:
    """Send a message to Gemini with market context."""
    model = _get_model()
    if model is None:
        return "⚠️ AI service not configured. Please add your GEMINI_API_KEY to the .env file."

    prompt_parts = [SYSTEM_PROMPT]

    if market_context:
        prompt_parts.append(f"\n\nCurrent Market Context:\n{market_context}")

    if chat_history:
        prompt_parts.append("\n\nConversation History:")
        for msg in chat_history[-6:]:  # Keep last 6 messages for context
            role = msg.get("role", "user")
            content = msg.get("content", "")
            prompt_parts.append(f"{role}: {content}")

    prompt_parts.append(f"\n\nUser: {user_message}\n\nAssistant:")

    try:
        response = model.generate_content("\n".join(prompt_parts))
        return response.text
    except Exception as e:
        return f"Error generating response: {str(e)}"


async def enrich_signal(signal_data: dict) -> str:
    """AI enrichment step — takes a raw signal and adds context + actionable advice."""
    model = _get_model()
    if model is None:
        return "AI enrichment unavailable. Configure GEMINI_API_KEY."

    prompt = f"""{SYSTEM_PROMPT}

You are performing Step 2 of a 3-step agentic analysis pipeline.
Step 1 (Signal Detection) found the following signal:

Signal: {signal_data.get('title', 'Unknown')}
Type: {signal_data.get('type', 'Unknown')}
Stock: {signal_data.get('symbol', 'Unknown')}
Details: {signal_data.get('description', 'No details')}
Data: {signal_data.get('raw_data', '{}')}

Your job (Step 2 — Enrichment):
1. Explain WHY this signal matters in plain English
2. Provide historical context — what happened last time this signal appeared for this stock?
3. Assess the signal strength (Strong/Medium/Weak)
4. Give a specific actionable recommendation

Keep it concise — 3-4 paragraphs max. Use ₹ for prices."""

    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Enrichment failed: {str(e)}"


async def generate_alert(signal_data: dict, enrichment: str) -> dict:
    """Step 3 — Generate a structured actionable alert from enriched signal."""
    model = _get_model()
    if model is None:
        return {
            "alert_title": signal_data.get("title", "Signal Detected"),
            "action": "Review manually",
            "reasoning": "AI not configured",
            "risk_level": "Unknown",
        }

    prompt = f"""{SYSTEM_PROMPT}

You are performing Step 3 of a 3-step agentic analysis pipeline.

Original Signal: {signal_data.get('title', '')}
Stock: {signal_data.get('symbol', '')}
Enrichment Analysis: {enrichment}

Generate a structured JSON alert with these exact fields:
- alert_title: One-line alert headline
- action: Specific action (e.g., "BUY above ₹2450 with SL ₹2380, Target ₹2600")
- reasoning: 2-3 sentence reasoning
- risk_level: "Low", "Medium", or "High"
- time_horizon: "Intraday", "Short-term (1-2 weeks)", "Medium-term (1-3 months)"
- confidence: A number 1-100

Return ONLY valid JSON, no markdown formatting."""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        # Try to parse JSON from response
        import json
        # Remove markdown code blocks if present
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0]
        return json.loads(text)
    except Exception:
        return {
            "alert_title": signal_data.get("title", "Signal Detected"),
            "action": "Review the signal manually",
            "reasoning": enrichment[:200] if enrichment else "Analysis pending",
            "risk_level": "Medium",
            "time_horizon": "Short-term",
            "confidence": 50,
        }

"""Stock analysis routes."""
from fastapi import APIRouter, HTTPException
from services.stock_service import get_stock_detail, get_stock_history, get_quote
from services.technical_service import get_technical_analysis

router = APIRouter()


@router.get("/{symbol}")
async def stock_analysis(symbol: str):
    """Full analysis: quote + technicals. AI recommendation is separate."""
    try:
        quote = await get_quote(symbol)

        # Try technicals but don't block if history is unavailable
        try:
            technicals = await get_technical_analysis(symbol)
        except Exception:
            technicals = {"indicators": {}, "patterns": [], "signal_summary": "Technical data loading..."}

        rec = _simple_recommendation(symbol, quote, technicals)

        return {
            "stock": quote,
            "technicals": technicals,
            "recommendation": rec,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{symbol}/quick")
async def quick_verdict(symbol: str):
    """Quick verdict using AI (may be slow)."""
    try:
        from services.ai_service import get_buy_recommendation
        quote = await get_quote(symbol)
        technicals = await get_technical_analysis(symbol)
        rec = await get_buy_recommendation(symbol, quote, technicals)
        return rec
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{symbol}/history")
async def stock_history(symbol: str, period: str = "6mo"):
    try:
        return await get_stock_history(symbol, period)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _simple_recommendation(symbol: str, quote: dict, technicals: dict) -> dict:
    """Rule-based recommendation — instant, no AI needed."""
    ind = technicals.get("indicators", {})
    patterns = technicals.get("patterns", [])
    signal = technicals.get("signal_summary", "")
    price = quote.get("price", 0)
    change_pct = quote.get("change_pct", 0)
    high_52w = quote.get("fifty_two_week_high", 0)
    low_52w = quote.get("fifty_two_week_low", 0)

    bullish = 0
    bearish = 0

    rsi = ind.get("rsi", 50)
    if rsi > 70: bearish += 2
    elif rsi < 30: bullish += 2
    elif rsi < 45: bullish += 1
    elif rsi > 60: bearish += 1

    if ind.get("macd_crossover") == "Bullish": bullish += 1
    else: bearish += 1

    if ind.get("price_vs_sma20") == "Above": bullish += 1
    else: bearish += 1

    if ind.get("price_vs_sma50") == "Above": bullish += 1
    else: bearish += 1

    # Near 52W high = risky
    if high_52w and price > high_52w * 0.95: bearish += 1
    # Near 52W low = opportunity
    if low_52w and price < low_52w * 1.1: bullish += 1

    total = bullish + bearish
    score = (bullish / total * 100) if total > 0 else 50

    if score >= 65:
        verdict = "BUY"
        quick = f"✅ {symbol} looks good right now. Momentum is in your favor."
    elif score <= 35:
        verdict = "AVOID"
        quick = f"❌ {symbol} is not looking great. Better to wait for a dip."
    else:
        verdict = "WAIT"
        quick = f"⏳ {symbol} has mixed signals. Wait for a clearer picture."

    reasons = []
    if rsi > 70: reasons.append("Stock has gone up too fast recently (RSI overbought) — it usually takes a breather after this.")
    elif rsi < 30: reasons.append("Stock has dropped a lot (RSI oversold) — could bounce back from here.")
    if ind.get("macd_crossover") == "Bullish": reasons.append("Buying momentum is picking up — more people are buying than selling.")
    elif ind.get("macd_crossover") == "Bearish": reasons.append("Selling pressure is increasing — momentum is fading.")
    if high_52w and price > high_52w * 0.95: reasons.append(f"Price is very close to its 52-week high of ₹{high_52w}. Risky to buy at the top.")
    if low_52w and price < low_52w * 1.1: reasons.append(f"Price is near its 52-week low of ₹{low_52w}. Could be a good entry point.")
    if not reasons: reasons.append("No strong signals either way. The stock is in a neutral zone.")

    sma20 = ind.get("sma_20", price)
    explanation = f"{symbol} is at ₹{price}. "
    if verdict == "BUY":
        explanation += f"The stock is showing positive momentum and trading above key levels. A good time to consider buying."
    elif verdict == "AVOID":
        explanation += f"The stock is showing weakness. Better to wait for it to stabilize before buying."
    else:
        explanation += f"Signals are mixed right now. Neither strongly bullish nor bearish."

    return {
        "verdict": verdict,
        "quick": quick,
        "explanation": explanation,
        "entry_price": f"₹{round(sma20 * 0.98, 0)}" if sma20 else "N/A",
        "stop_loss": f"₹{round(price * 0.95, 0)}" if price else "N/A",
        "target": f"₹{round(price * 1.1, 0)}" if price else "N/A",
        "risk_level": "High" if abs(change_pct) > 3 else "Medium" if abs(change_pct) > 1 else "Low",
        "confidence": int(score),
        "detailed_reasons": reasons,
    }

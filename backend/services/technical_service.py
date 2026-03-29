"""
Technical analysis — calculated from price history.
Uses pandas + ta library for indicators.
"""
import pandas as pd
import numpy as np
from cachetools import TTLCache

_cache = TTLCache(maxsize=200, ttl=600)


async def get_technical_analysis(symbol: str) -> dict:
    """Calculate technical indicators from historical data."""
    cache_key = f"ta_{symbol}"
    if cache_key in _cache:
        return _cache[cache_key]

    from services.stock_service import get_stock_history
    history = await get_stock_history(symbol, "6mo")

    if not history or len(history) < 30:
        return {"error": "Not enough data", "indicators": {}, "patterns": [], "signal_summary": "Insufficient data"}

    df = pd.DataFrame(history)
    close = df["close"].astype(float)
    high = df["high"].astype(float)
    low = df["low"].astype(float)

    indicators = {}

    # RSI - manual calculation
    try:
        delta = close.diff()
        gain = delta.where(delta > 0, 0).rolling(14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(14).mean()
        rs = gain / loss
        rsi_series = 100 - (100 / (1 + rs))
        rsi = float(rsi_series.iloc[-1])
        indicators["rsi"] = round(rsi, 2)
        indicators["rsi_signal"] = "Overbought" if rsi > 70 else "Oversold" if rsi < 30 else "Neutral"
    except Exception:
        pass

    # MACD - manual calculation
    try:
        ema12 = close.ewm(span=12).mean()
        ema26 = close.ewm(span=26).mean()
        macd_line = ema12 - ema26
        signal_line = macd_line.ewm(span=9).mean()
        indicators["macd"] = round(float(macd_line.iloc[-1]), 2)
        indicators["macd_signal_line"] = round(float(signal_line.iloc[-1]), 2)
        indicators["macd_histogram"] = round(float((macd_line - signal_line).iloc[-1]), 2)
        indicators["macd_crossover"] = "Bullish" if float(macd_line.iloc[-1]) > float(signal_line.iloc[-1]) else "Bearish"
    except Exception:
        pass

    # Bollinger Bands - manual
    try:
        sma20 = close.rolling(20).mean()
        std20 = close.rolling(20).std()
        indicators["bb_upper"] = round(float((sma20 + 2 * std20).iloc[-1]), 2)
        indicators["bb_middle"] = round(float(sma20.iloc[-1]), 2)
        indicators["bb_lower"] = round(float((sma20 - 2 * std20).iloc[-1]), 2)
    except Exception:
        pass

    # ADX - simplified
    try:
        tr = pd.concat([high - low, (high - close.shift()).abs(), (low - close.shift()).abs()], axis=1).max(axis=1)
        atr = tr.rolling(14).mean()
        up = high.diff()
        down = -low.diff()
        plus_dm = pd.Series(np.where((up > down) & (up > 0), up, 0), index=close.index)
        minus_dm = pd.Series(np.where((down > up) & (down > 0), down, 0), index=close.index)
        plus_di = 100 * (plus_dm.rolling(14).mean() / atr)
        minus_di = 100 * (minus_dm.rolling(14).mean() / atr)
        dx = 100 * ((plus_di - minus_di).abs() / (plus_di + minus_di))
        adx = float(dx.rolling(14).mean().iloc[-1])
        indicators["adx"] = round(adx, 2)
        indicators["trend_strength"] = "Strong" if adx > 25 else "Weak"
    except Exception:
        pass

    # Stochastic - manual
    try:
        low14 = low.rolling(14).min()
        high14 = high.rolling(14).max()
        k = 100 * (close - low14) / (high14 - low14)
        d = k.rolling(3).mean()
        indicators["stoch_k"] = round(float(k.iloc[-1]), 2)
        indicators["stoch_d"] = round(float(d.iloc[-1]), 2)
    except Exception:
        pass

    # SMAs
    try:
        indicators["sma_20"] = round(float(close.rolling(20).mean().iloc[-1]), 2)
        indicators["sma_50"] = round(float(close.rolling(50).mean().iloc[-1]), 2)
        indicators["price_vs_sma20"] = "Above" if float(close.iloc[-1]) > indicators["sma_20"] else "Below"
        indicators["price_vs_sma50"] = "Above" if float(close.iloc[-1]) > indicators["sma_50"] else "Below"
    except Exception:
        pass

    # Detect patterns
    patterns = _detect_patterns(indicators)
    signal_summary = _generate_signal_summary(indicators, patterns)

    result = {
        "symbol": symbol,
        "indicators": indicators,
        "patterns": patterns,
        "signal_summary": signal_summary,
    }
    _cache[cache_key] = result
    return result


def _detect_patterns(ind: dict) -> list:
    patterns = []
    rsi = ind.get("rsi", 50)
    if rsi > 70:
        patterns.append({"name": "RSI Overbought", "type": "Bearish", "description": f"RSI at {rsi} — stock went up too fast, might take a breather.", "confidence": 70})
    elif rsi < 30:
        patterns.append({"name": "RSI Oversold", "type": "Bullish", "description": f"RSI at {rsi} — stock dropped a lot, could bounce back.", "confidence": 72})

    if ind.get("macd_crossover") == "Bullish":
        patterns.append({"name": "MACD Bullish", "type": "Bullish", "description": "Momentum is picking up — buyers are getting stronger.", "confidence": 68})
    elif ind.get("macd_crossover") == "Bearish":
        patterns.append({"name": "MACD Bearish", "type": "Bearish", "description": "Momentum is fading — sellers are taking over.", "confidence": 66})

    if ind.get("adx", 0) > 25:
        patterns.append({"name": "Strong Trend", "type": "Neutral", "description": f"ADX at {ind['adx']} — there's a strong trend happening.", "confidence": 65})

    return patterns


def _generate_signal_summary(ind: dict, patterns: list) -> str:
    bullish = bearish = 0
    if ind.get("rsi_signal") == "Oversold": bullish += 1
    elif ind.get("rsi_signal") == "Overbought": bearish += 1
    if ind.get("macd_crossover") == "Bullish": bullish += 1
    elif ind.get("macd_crossover") == "Bearish": bearish += 1
    if ind.get("price_vs_sma20") == "Above": bullish += 1
    else: bearish += 1
    for p in patterns:
        if p["type"] == "Bullish": bullish += 1
        elif p["type"] == "Bearish": bearish += 1

    total = bullish + bearish
    if total == 0: return "Neutral — No clear signals."
    pct = (bullish / total) * 100
    if pct >= 70: return f"Bullish — {bullish}/{total} signals say BUY."
    elif pct >= 55: return "Slightly Bullish — Leaning towards buy."
    elif pct <= 30: return f"Bearish — {bearish}/{total} signals say AVOID."
    elif pct <= 45: return "Slightly Bearish — Not the best time."
    return f"Mixed — {bullish} bullish, {bearish} bearish. Wait."

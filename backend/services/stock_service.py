"""
Stock data service using yfinance.
Fetches real NSE/BSE stock data, historical prices, and fundamentals.
Includes retry logic and rate-limit protection.
"""
import yfinance as yf
import pandas as pd
import asyncio
import time
from cachetools import TTLCache
from datetime import datetime, timedelta
from typing import Optional

# Cache stock data for 10 minutes to reduce Yahoo Finance hits
_cache = TTLCache(maxsize=500, ttl=600)

# Rate limiter: track last request time
_last_request_time = 0
_MIN_DELAY = 0.5  # 500ms between yfinance calls

NIFTY_50_SYMBOLS = [
    "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS",
    "HINDUNILVR.NS", "SBIN.NS", "BHARTIARTL.NS", "KOTAKBANK.NS", "ITC.NS",
    "LT.NS", "AXISBANK.NS", "BAJFINANCE.NS", "ASIANPAINT.NS", "MARUTI.NS",
    "TITAN.NS", "SUNPHARMA.NS", "ULTRACEMCO.NS", "NESTLEIND.NS", "WIPRO.NS",
    "HCLTECH.NS", "TATAMOTORS.NS", "POWERGRID.NS", "NTPC.NS", "M&M.NS",
    "TATASTEEL.NS", "ADANIENT.NS", "ADANIPORTS.NS", "BAJAJFINSV.NS", "TECHM.NS",
]

INDEX_SYMBOLS = {
    "NIFTY_50": "^NSEI",
    "SENSEX": "^BSESN",
    "NIFTY_BANK": "^NSEBANK",
    "NIFTY_IT": "^CNXIT",
}


def _rate_limit():
    """Simple rate limiter to avoid 429 errors."""
    global _last_request_time
    now = time.time()
    elapsed = now - _last_request_time
    if elapsed < _MIN_DELAY:
        time.sleep(_MIN_DELAY - elapsed)
    _last_request_time = time.time()


def _safe_history(symbol: str, period: str = "2d", retries: int = 2) -> pd.DataFrame:
    """Fetch history with retry, rate limiting, and download fallback."""
    for attempt in range(retries):
        try:
            _rate_limit()
            # Try yf.download first — uses a different API endpoint, less rate-limited
            df = yf.download(symbol, period=period, progress=False, threads=False)
            if not df.empty:
                return df
        except Exception:
            pass
        try:
            _rate_limit()
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period=period)
            if not hist.empty:
                return hist
        except Exception:
            if attempt < retries - 1:
                time.sleep(3 * (attempt + 1))
            continue
    return pd.DataFrame()


def _safe_info(symbol: str, retries: int = 2) -> dict:
    """Fetch ticker fast_info (lightweight, less rate-limited than .info)."""
    for attempt in range(retries):
        try:
            _rate_limit()
            ticker = yf.Ticker(symbol)
            fi = ticker.fast_info
            return {
                "currentPrice": getattr(fi, "last_price", 0),
                "previousClose": getattr(fi, "previous_close", 0),
                "open": getattr(fi, "open", 0),
                "dayHigh": getattr(fi, "day_high", 0),
                "dayLow": getattr(fi, "day_low", 0),
                "marketCap": getattr(fi, "market_cap", 0),
                "fiftyTwoWeekHigh": getattr(fi, "year_high", 0),
                "fiftyTwoWeekLow": getattr(fi, "year_low", 0),
                "currency": getattr(fi, "currency", "INR"),
            }
        except Exception:
            if attempt < retries - 1:
                time.sleep(2 * (attempt + 1))
            continue
    return {}


async def get_index_data() -> dict:
    """Fetch current data for major Indian indices."""
    cache_key = "indices"
    if cache_key in _cache:
        return _cache[cache_key]

    results = {}
    for name, symbol in INDEX_SYMBOLS.items():
        try:
            hist = _safe_history(symbol, "5d")
            if len(hist) >= 2:
                current = float(hist["Close"].iloc[-1])
                prev = float(hist["Close"].iloc[-2])
                change = current - prev
                change_pct = (change / prev) * 100
                results[name] = {
                    "symbol": symbol,
                    "name": name.replace("_", " "),
                    "price": round(current, 2),
                    "change": round(change, 2),
                    "change_pct": round(change_pct, 2),
                }
        except Exception:
            continue

    _cache[cache_key] = results
    return results


async def get_top_movers(limit: int = 10) -> dict:
    """Get top gainers and losers from Nifty 50 stocks."""
    cache_key = f"movers_{limit}"
    if cache_key in _cache:
        return _cache[cache_key]

    # Use batch download for efficiency — single request for all symbols
    try:
        _rate_limit()
        data = yf.download(
            " ".join(NIFTY_50_SYMBOLS),
            period="5d",
            group_by="ticker",
            threads=False,  # Sequential to avoid rate limits
            progress=False,
        )
    except Exception:
        return {"gainers": [], "losers": []}

    stocks = []
    for symbol in NIFTY_50_SYMBOLS:
        try:
            name = symbol.replace(".NS", "")
            ticker_data = data[symbol] if symbol in data.columns.get_level_values(0) else None
            if ticker_data is None or ticker_data.empty:
                continue
            close = ticker_data["Close"].dropna()
            if len(close) < 2:
                continue
            current = float(close.iloc[-1])
            prev = float(close.iloc[-2])
            change_pct = ((current - prev) / prev) * 100
            vol = ticker_data["Volume"].dropna()
            stocks.append({
                "symbol": name,
                "price": round(current, 2),
                "change": round(current - prev, 2),
                "change_pct": round(change_pct, 2),
                "volume": int(vol.iloc[-1]) if len(vol) > 0 else 0,
            })
        except Exception:
            continue

    stocks.sort(key=lambda x: x["change_pct"], reverse=True)
    result = {
        "gainers": stocks[:limit],
        "losers": stocks[-limit:][::-1],
    }
    _cache[cache_key] = result
    return result


async def get_stock_detail(symbol: str) -> dict:
    """Get detailed stock data. Uses fast_info + history (avoids heavy quoteSummary endpoint)."""
    ns_symbol = f"{symbol}.NS" if not symbol.endswith(".NS") else symbol
    cache_key = f"detail_{ns_symbol}"
    if cache_key in _cache:
        return _cache[cache_key]

    # Get history first (most reliable)
    hist = _safe_history(ns_symbol, "1y")

    # Try fast_info (lightweight endpoint)
    info = _safe_info(ns_symbol)

    # Derive prices from history as fallback
    current_price = info.get("currentPrice") or 0
    prev_close = info.get("previousClose") or 0

    if not current_price and not hist.empty:
        current_price = float(hist["Close"].iloc[-1])
    if not prev_close and len(hist) >= 2:
        prev_close = float(hist["Close"].iloc[-2])

    # Derive 52W from history
    week_52_high = info.get("fiftyTwoWeekHigh") or 0
    week_52_low = info.get("fiftyTwoWeekLow") or 0
    if not week_52_high and not hist.empty:
        week_52_high = round(float(hist["High"].max()), 2)
        week_52_low = round(float(hist["Low"].min()), 2)

    # Derive volume from history
    volume = 0
    avg_volume = 0
    if not hist.empty:
        volume = int(hist["Volume"].iloc[-1])
        avg_volume = int(hist["Volume"].tail(20).mean())

    result = {
        "symbol": symbol.replace(".NS", ""),
        "name": symbol.replace(".NS", ""),
        "sector": "NSE",
        "industry": "N/A",
        "price": round(current_price, 2) if current_price else 0,
        "prev_close": round(prev_close, 2) if prev_close else 0,
        "open": info.get("open") or (round(float(hist["Open"].iloc[-1]), 2) if not hist.empty else 0),
        "day_high": info.get("dayHigh") or (round(float(hist["High"].iloc[-1]), 2) if not hist.empty else 0),
        "day_low": info.get("dayLow") or (round(float(hist["Low"].iloc[-1]), 2) if not hist.empty else 0),
        "volume": volume,
        "avg_volume": avg_volume,
        "market_cap": info.get("marketCap", 0),
        "pe_ratio": 0,
        "pb_ratio": 0,
        "dividend_yield": 0,
        "fifty_two_week_high": week_52_high,
        "fifty_two_week_low": week_52_low,
        "beta": 0,
        "eps": 0,
    }

    if not hist.empty:
        result["history"] = [
            {
                "date": d.strftime("%Y-%m-%d"),
                "open": round(float(row["Open"]), 2),
                "high": round(float(row["High"]), 2),
                "low": round(float(row["Low"]), 2),
                "close": round(float(row["Close"]), 2),
                "volume": int(row["Volume"]),
            }
            for d, row in hist.tail(90).iterrows()
        ]

    _cache[cache_key] = result
    return result


async def get_stock_history(symbol: str, period: str = "6mo") -> list:
    """Get historical price data for charting."""
    ns_symbol = f"{symbol}.NS" if not symbol.endswith(".NS") else symbol
    cache_key = f"hist_{ns_symbol}_{period}"
    if cache_key in _cache:
        return _cache[cache_key]

    hist = _safe_history(ns_symbol, period)

    if hist.empty:
        return []

    data = [
        {
            "date": d.strftime("%Y-%m-%d"),
            "open": round(float(row["Open"]), 2),
            "high": round(float(row["High"]), 2),
            "low": round(float(row["Low"]), 2),
            "close": round(float(row["Close"]), 2),
            "volume": int(row["Volume"]),
        }
        for d, row in hist.iterrows()
    ]
    _cache[cache_key] = data
    return data

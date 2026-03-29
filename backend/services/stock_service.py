"""
Stock data service using yfinance.
Fetches real NSE/BSE stock data, historical prices, and fundamentals.
"""
import yfinance as yf
import pandas as pd
from cachetools import TTLCache
from datetime import datetime, timedelta
from typing import Optional

# Cache stock data for 5 minutes to avoid rate limits
_cache = TTLCache(maxsize=200, ttl=300)

# Major NSE indices and popular stocks
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


def _get_ticker(symbol: str) -> yf.Ticker:
    return yf.Ticker(symbol)


async def get_index_data() -> dict:
    """Fetch current data for major Indian indices."""
    cache_key = "indices"
    if cache_key in _cache:
        return _cache[cache_key]

    results = {}
    for name, symbol in INDEX_SYMBOLS.items():
        try:
            ticker = _get_ticker(symbol)
            hist = ticker.history(period="2d")
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

    stocks = []
    for symbol in NIFTY_50_SYMBOLS:
        try:
            ticker = _get_ticker(symbol)
            hist = ticker.history(period="2d")
            if len(hist) >= 2:
                current = float(hist["Close"].iloc[-1])
                prev = float(hist["Close"].iloc[-2])
                change_pct = ((current - prev) / prev) * 100
                name = symbol.replace(".NS", "")
                stocks.append({
                    "symbol": name,
                    "price": round(current, 2),
                    "change": round(current - prev, 2),
                    "change_pct": round(change_pct, 2),
                    "volume": int(hist["Volume"].iloc[-1]),
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
    """Get detailed stock data including fundamentals."""
    ns_symbol = f"{symbol}.NS" if not symbol.endswith(".NS") else symbol
    cache_key = f"detail_{ns_symbol}"
    if cache_key in _cache:
        return _cache[cache_key]

    ticker = _get_ticker(ns_symbol)
    info = ticker.info
    hist = ticker.history(period="1y")

    result = {
        "symbol": symbol.replace(".NS", ""),
        "name": info.get("longName", symbol),
        "sector": info.get("sector", "N/A"),
        "industry": info.get("industry", "N/A"),
        "price": info.get("currentPrice", info.get("regularMarketPrice", 0)),
        "prev_close": info.get("previousClose", 0),
        "open": info.get("open", 0),
        "day_high": info.get("dayHigh", 0),
        "day_low": info.get("dayLow", 0),
        "volume": info.get("volume", 0),
        "avg_volume": info.get("averageVolume", 0),
        "market_cap": info.get("marketCap", 0),
        "pe_ratio": info.get("trailingPE", 0),
        "pb_ratio": info.get("priceToBook", 0),
        "dividend_yield": info.get("dividendYield", 0),
        "fifty_two_week_high": info.get("fiftyTwoWeekHigh", 0),
        "fifty_two_week_low": info.get("fiftyTwoWeekLow", 0),
        "beta": info.get("beta", 0),
        "eps": info.get("trailingEps", 0),
    }

    # Historical data for charts
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

    ticker = _get_ticker(ns_symbol)
    hist = ticker.history(period=period)

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

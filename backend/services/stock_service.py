"""
Stock data service using Groww API (free, no key, Indian stocks).
Falls back to yfinance for historical data.
"""
import httpx
from cachetools import TTLCache
from datetime import datetime

_cache = TTLCache(maxsize=500, ttl=300)  # 5 min cache

GROWW_BASE = "https://groww.in/v1/api"
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

# Symbol to Groww ID mapping (populated on first search)
_symbol_map = {}

NIFTY_50 = [
    "RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK",
    "HINDUNILVR", "SBIN", "BHARTIARTL", "KOTAKBANK", "ITC",
    "LT", "AXISBANK", "BAJFINANCE", "ASIANPAINT", "MARUTI",
    "TITAN", "SUNPHARMA", "ULTRACEMCO", "NESTLEIND", "WIPRO",
    "HCLTECH", "TATAMOTORS", "POWERGRID", "NTPC", "TATASTEEL",
]


async def _groww_get(url: str) -> dict | list | None:
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(url, headers=HEADERS)
            if r.status_code == 200:
                return r.json()
    except Exception:
        return None


async def _resolve_groww_id(symbol: str) -> str | None:
    """Search Groww for a stock and get its ID."""
    if symbol in _symbol_map:
        return _symbol_map[symbol]

    data = await _groww_get(
        f"{GROWW_BASE}/search/v1/entity?app=false&entity_type=stocks&page=0&q={symbol}&size=3"
    )
    if data and "content" in data and len(data["content"]) > 0:
        for item in data["content"]:
            nse_symbol = item.get("nse_scrip_code", "")
            groww_id = item.get("id", "")
            bse_code = item.get("bse_scrip_code", "")
            name = item.get("company_short_name", "")
            if nse_symbol.upper() == symbol.upper() or symbol.upper() in name.upper():
                _symbol_map[symbol] = nse_symbol
                _symbol_map[f"{symbol}_id"] = groww_id
                _symbol_map[f"{symbol}_name"] = name
                _symbol_map[f"{symbol}_bse"] = bse_code
                _symbol_map[f"{symbol}_isin"] = item.get("isin", "")
                return nse_symbol
    return symbol


async def get_quote(symbol: str) -> dict:
    """Get real-time quote from Groww."""
    cache_key = f"quote_{symbol}"
    if cache_key in _cache:
        return _cache[cache_key]

    nse_sym = await _resolve_groww_id(symbol)
    data = await _groww_get(
        f"{GROWW_BASE}/stocks_data/v1/accord_points/exchange/NSE/segment/CASH/latest_prices_ohlc/{nse_sym}"
    )

    if not data or "ltp" not in data:
        return {"symbol": symbol, "name": symbol, "price": 0, "error": "No data found"}

    result = {
        "symbol": nse_sym or symbol,
        "name": _symbol_map.get(f"{symbol}_name", symbol),
        "price": float(data.get("ltp", 0)),
        "open": float(data.get("open", 0)),
        "high": float(data.get("high", 0)),
        "low": float(data.get("low", 0)),
        "prev_close": float(data.get("close", 0)),
        "change": float(data.get("dayChange", 0)),
        "change_pct": round(float(data.get("dayChangePerc", 0)), 2),
        "volume": int(data.get("volume", 0)) if data.get("volume") else 0,
        "fifty_two_week_high": float(data.get("highPriceRange", 0)),
        "fifty_two_week_low": float(data.get("lowPriceRange", 0)),
    }
    _cache[cache_key] = result
    return result


async def get_stock_detail(symbol: str) -> dict:
    """Alias for get_quote."""
    return await get_quote(symbol)


async def get_stock_history(symbol: str, period: str = "6mo") -> list:
    """Get historical data from Upstox free API (no auth needed)."""
    cache_key = f"hist_{symbol}_{period}"
    if cache_key in _cache:
        return _cache[cache_key]

    # Resolve ISIN for Upstox
    await _resolve_groww_id(symbol)
    isin = _symbol_map.get(f"{symbol}_isin", "")

    if not isin:
        # Search Groww to get ISIN
        data = await _groww_get(
            f"{GROWW_BASE}/search/v1/entity?app=false&entity_type=stocks&page=0&q={symbol}&size=1"
        )
        if data and "content" in data and data["content"]:
            isin = data["content"][0].get("isin", "")
            _symbol_map[f"{symbol}_isin"] = isin

    if not isin:
        return []

    from datetime import timedelta
    days_map = {"1mo": 30, "3mo": 90, "6mo": 180, "1y": 365}
    days = days_map.get(period, 180)

    end_date = datetime.now().strftime("%Y-%m-%d")
    start_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(
                f"https://api.upstox.com/v2/historical-candle/NSE_EQ%7C{isin}/day/{end_date}/{start_date}",
                headers={"Accept": "application/json"},
            )
            if r.status_code == 200:
                resp = r.json()
                candles = resp.get("data", {}).get("candles", [])
                result = [
                    {
                        "date": c[0][:10],
                        "open": round(c[1], 2),
                        "high": round(c[2], 2),
                        "low": round(c[3], 2),
                        "close": round(c[4], 2),
                        "volume": int(c[5]),
                    }
                    for c in reversed(candles)  # oldest first
                ]
                _cache[cache_key] = result
                return result
    except Exception:
        pass

    return []


async def get_index_data() -> dict:
    """Get market overview from top stock movements."""
    cache_key = "indices"
    if cache_key in _cache:
        return _cache[cache_key]

    results = {}
    for sym in ["RELIANCE", "TCS", "HDFCBANK"]:
        q = await get_quote(sym)
        if q.get("price"):
            results[sym] = {
                "name": q.get("name", sym),
                "price": q["price"],
                "change": q.get("change", 0),
                "change_pct": q.get("change_pct", 0),
            }

    _cache[cache_key] = results
    return results



async def get_top_movers(limit: int = 5) -> dict:
    """Get top gainers/losers by fetching quotes for Nifty 50 stocks."""
    cache_key = f"movers_{limit}"
    if cache_key in _cache:
        return _cache[cache_key]

    stocks = []
    for sym in NIFTY_50[:15]:  # Top 15 for speed
        q = await get_quote(sym)
        if q.get("price", 0) > 0:
            stocks.append(q)

    stocks.sort(key=lambda x: x.get("change_pct", 0), reverse=True)
    result = {
        "gainers": stocks[:limit],
        "losers": stocks[-limit:][::-1] if len(stocks) >= limit else [],
    }
    _cache[cache_key] = result
    return result

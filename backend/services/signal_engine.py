"""
Signal Engine — 3-step agentic pipeline.
Step 1: Detect signals from market data
Step 2: Rule-based enrichment (instant, no AI dependency)
Step 3: Actionable alert
"""
import httpx
from datetime import datetime
from cachetools import TTLCache
from services.stock_service import NIFTY_50, get_quote

_cache = TTLCache(maxsize=50, ttl=900)


async def _fetch_nse_data(url: str) -> dict | list | None:
    """Fetch data from NSE India website."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
        "Referer": "https://www.nseindia.com/",
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            await client.get("https://www.nseindia.com/", headers=headers)
            resp = await client.get(url, headers=headers)
            if resp.status_code == 200:
                return resp.json()
    except Exception:
        return None


async def detect_stock_signals() -> list:
    """Scan top stocks for price-based signals (fast, no history needed)."""
    cache_key = "stock_signals"
    if cache_key in _cache:
        return _cache[cache_key]

    signals = []
    for sym in NIFTY_50[:15]:
        try:
            q = await get_quote(sym)
            if not q or not q.get("price"):
                continue

            price = q["price"]
            change = q.get("change_pct", 0)
            high52 = q.get("fifty_two_week_high", 0)
            low52 = q.get("fifty_two_week_low", 0)
            name = q.get("name", sym)

            # Big drop signal
            if change <= -3:
                signals.append({
                    "type": "price_drop",
                    "symbol": sym,
                    "title": f"📉 {sym} crashed {change:.1f}% today",
                    "description": f"{name} dropped sharply to ₹{price:,.1f}. This could be a buying opportunity if fundamentals are strong, or a warning sign.",
                    "severity": "high" if change <= -5 else "medium",
                    "change_pct": change,
                    "price": price,
                    "timestamp": datetime.now().isoformat(),
                })

            # Big rally signal
            if change >= 3:
                signals.append({
                    "type": "price_rally",
                    "symbol": sym,
                    "title": f"📈 {sym} surged +{change:.1f}% today",
                    "description": f"{name} rallied to ₹{price:,.1f}. Strong buying interest. But be careful buying after a big jump.",
                    "severity": "high" if change >= 5 else "medium",
                    "change_pct": change,
                    "price": price,
                    "timestamp": datetime.now().isoformat(),
                })

            # Near 52-week high
            if high52 and price > high52 * 0.97:
                signals.append({
                    "type": "near_52w_high",
                    "symbol": sym,
                    "title": f"🔝 {sym} near 52-week high",
                    "description": f"{name} at ₹{price:,.1f} is very close to its 52-week high of ₹{high52:,.1f}. Could break out higher or face resistance.",
                    "severity": "medium",
                    "price": price,
                    "timestamp": datetime.now().isoformat(),
                })

            # Near 52-week low
            if low52 and price < low52 * 1.05:
                signals.append({
                    "type": "near_52w_low",
                    "symbol": sym,
                    "title": f"⬇️ {sym} near 52-week low",
                    "description": f"{name} at ₹{price:,.1f} is near its 52-week low of ₹{low52:,.1f}. Could be a value buy or a falling knife.",
                    "severity": "high",
                    "price": price,
                    "timestamp": datetime.now().isoformat(),
                })

        except Exception:
            continue

    signals.sort(key=lambda x: abs(x.get("change_pct", 0)), reverse=True)
    _cache[cache_key] = signals
    return signals


async def detect_fii_dii_signals() -> list:
    """Detect FII/DII activity signals from NSE."""
    cache_key = "fii_dii_signals"
    if cache_key in _cache:
        return _cache[cache_key]

    signals = []
    data = await _fetch_nse_data("https://www.nseindia.com/api/fiidiiTradeReact")

    if data and isinstance(data, list):
        for entry in data:
            category = entry.get("category", "")
            net_val = float(entry.get("netValue", 0))

            if abs(net_val) > 500:
                direction = "buying" if net_val > 0 else "selling"
                signals.append({
                    "type": "fii_dii",
                    "symbol": "MARKET",
                    "title": f"{'🏦' if 'FII' in category else '🏠'} {category}: Heavy {direction.title()}",
                    "description": f"{category} net {direction} of ₹{abs(net_val):,.0f} Cr today. {'Bullish signal.' if net_val > 0 else 'Bearish signal.'}",
                    "net_value_cr": net_val,
                    "timestamp": datetime.now().isoformat(),
                    "severity": "high" if abs(net_val) > 2000 else "medium",
                })

    _cache[cache_key] = signals
    return signals


async def run_full_pipeline() -> list:
    """Run the signal detection pipeline — fast, no AI dependency."""
    cache_key = "full_pipeline"
    if cache_key in _cache:
        return _cache[cache_key]

    all_signals = []

    # Stock price signals (fast — just quotes)
    stock_signals = await detect_stock_signals()
    all_signals.extend(stock_signals)

    # FII/DII signals (may fail if NSE blocks, that's ok)
    try:
        fii_signals = await detect_fii_dii_signals()
        all_signals.extend(fii_signals)
    except Exception:
        pass

    all_signals.sort(key=lambda x: (0 if x.get("severity") == "high" else 1))

    _cache[cache_key] = all_signals
    return all_signals

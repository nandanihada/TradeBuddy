"""
Signal Engine — The Agentic Pipeline.
Implements the 3-step autonomous flow:
  Step 1: Detect signals (bulk deals, insider trades, technical patterns)
  Step 2: Enrich with AI context
  Step 3: Generate actionable alerts

This is the core differentiator for the hackathon.
"""
import yfinance as yf
import httpx
from datetime import datetime, timedelta
from cachetools import TTLCache
from services.ai_service import enrich_signal, generate_alert

_cache = TTLCache(maxsize=50, ttl=900)  # 15 min cache


async def _fetch_nse_data(url: str) -> dict | list | None:
    """Fetch data from NSE India website."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
        "Referer": "https://www.nseindia.com/",
    }
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            # First hit the main page to get cookies
            await client.get("https://www.nseindia.com/", headers=headers)
            resp = await client.get(url, headers=headers)
            if resp.status_code == 200:
                return resp.json()
    except Exception:
        return None


async def detect_bulk_deal_signals() -> list:
    """Step 1: Detect signals from bulk/block deals on NSE."""
    cache_key = "bulk_deals"
    if cache_key in _cache:
        return _cache[cache_key]

    signals = []
    data = await _fetch_nse_data("https://www.nseindia.com/api/snapshot-capital-market-largedeal")

    if data and isinstance(data, dict):
        deals = data.get("BULK_DEALS_DATA", []) + data.get("BLOCK_DEALS_DATA", [])
        for deal in deals[:20]:
            symbol = deal.get("symbol", "")
            client = deal.get("clientName", "Unknown")
            qty = deal.get("qty", 0)
            price = deal.get("wAvgPrice", 0)
            buy_sell = deal.get("buySell", "")

            if qty and price:
                value_cr = (float(qty) * float(price)) / 10000000
                if value_cr > 5:  # Only significant deals > 5 Cr
                    signals.append({
                        "type": "bulk_deal",
                        "symbol": symbol,
                        "title": f"{'🟢 Large Buy' if buy_sell == 'BUY' else '🔴 Large Sell'}: {symbol}",
                        "description": f"{client} {'bought' if buy_sell == 'BUY' else 'sold'} {qty:,} shares at ₹{float(price):.2f} (₹{value_cr:.1f} Cr)",
                        "value_cr": round(value_cr, 1),
                        "client": client,
                        "buy_sell": buy_sell,
                        "raw_data": deal,
                        "timestamp": datetime.now().isoformat(),
                        "severity": "high" if value_cr > 50 else "medium",
                    })

    _cache[cache_key] = signals
    return signals


async def detect_technical_signals() -> list:
    """Step 1: Scan Nifty 50 stocks for technical pattern signals."""
    cache_key = "tech_signals"
    if cache_key in _cache:
        return _cache[cache_key]

    from services.stock_service import NIFTY_50_SYMBOLS
    from services.technical_service import get_technical_analysis

    signals = []
    # Scan a subset for speed
    scan_symbols = NIFTY_50_SYMBOLS[:15]

    for sym in scan_symbols:
        try:
            name = sym.replace(".NS", "")
            analysis = await get_technical_analysis(name)
            if "error" in analysis:
                continue

            for pattern in analysis.get("patterns", []):
                signals.append({
                    "type": "technical",
                    "symbol": name,
                    "title": f"{'📈' if pattern['type'] == 'Bullish' else '📉' if pattern['type'] == 'Bearish' else '⚡'} {pattern['name']}: {name}",
                    "description": pattern["description"],
                    "pattern_type": pattern["type"],
                    "confidence": pattern["confidence"],
                    "backtest_winrate": pattern["backtest_winrate"],
                    "raw_data": {
                        "indicators": analysis["indicators"],
                        "support_resistance": analysis["support_resistance"],
                    },
                    "timestamp": datetime.now().isoformat(),
                    "severity": "high" if pattern["confidence"] > 70 else "medium",
                })
        except Exception:
            continue

    _cache[cache_key] = signals
    return signals


async def detect_fii_dii_signals() -> list:
    """Step 1: Detect unusual FII/DII activity signals."""
    cache_key = "fii_dii_signals"
    if cache_key in _cache:
        return _cache[cache_key]

    signals = []
    data = await _fetch_nse_data("https://www.nseindia.com/api/fiidiiTradeReact")

    if data and isinstance(data, list):
        for entry in data:
            category = entry.get("category", "")
            buy_val = float(entry.get("buyValue", 0))
            sell_val = float(entry.get("sellValue", 0))
            net_val = float(entry.get("netValue", 0))

            if abs(net_val) > 1000:  # Significant activity > 1000 Cr
                direction = "buying" if net_val > 0 else "selling"
                signals.append({
                    "type": "fii_dii",
                    "symbol": "MARKET",
                    "title": f"{'🏦' if 'FII' in category else '🏠'} {category}: Heavy {direction.title()}",
                    "description": f"{category} net {direction} of ₹{abs(net_val):,.0f} Cr. Buy: ₹{buy_val:,.0f} Cr, Sell: ₹{sell_val:,.0f} Cr.",
                    "net_value_cr": net_val,
                    "category": category,
                    "raw_data": entry,
                    "timestamp": datetime.now().isoformat(),
                    "severity": "high" if abs(net_val) > 3000 else "medium",
                })

    _cache[cache_key] = signals
    return signals


async def run_full_pipeline() -> list:
    """
    Run the complete 3-step agentic pipeline:
    1. Detect all signals
    2. Enrich top signals with AI
    3. Generate actionable alerts
    """
    cache_key = "full_pipeline"
    if cache_key in _cache:
        return _cache[cache_key]

    # Step 1: Detect signals from all sources
    all_signals = []

    bulk_signals = await detect_bulk_deal_signals()
    all_signals.extend(bulk_signals)

    tech_signals = await detect_technical_signals()
    all_signals.extend(tech_signals)

    fii_signals = await detect_fii_dii_signals()
    all_signals.extend(fii_signals)

    # Sort by severity
    all_signals.sort(key=lambda x: (0 if x.get("severity") == "high" else 1))

    # Step 2 & 3: Enrich and generate alerts for top signals
    enriched_alerts = []
    for signal in all_signals[:8]:  # Process top 8 signals
        try:
            # Step 2: AI Enrichment
            enrichment = await enrich_signal(signal)
            signal["ai_enrichment"] = enrichment

            # Step 3: Generate Alert
            alert = await generate_alert(signal, enrichment)
            signal["alert"] = alert

            enriched_alerts.append(signal)
        except Exception:
            signal["ai_enrichment"] = "Enrichment pending"
            signal["alert"] = {"alert_title": signal["title"], "action": "Review manually"}
            enriched_alerts.append(signal)

    # Add remaining signals without AI enrichment
    for signal in all_signals[8:]:
        signal["ai_enrichment"] = None
        signal["alert"] = None
        enriched_alerts.append(signal)

    _cache[cache_key] = enriched_alerts
    return enriched_alerts

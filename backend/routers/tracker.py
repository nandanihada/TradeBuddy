"""Big Money Tracker routes — FII/DII flows, institutional activity."""
from fastapi import APIRouter
from services.signal_engine import _fetch_nse_data

router = APIRouter()


@router.get("/fii-dii")
async def fii_dii_data():
    """Get FII/DII trading activity."""
    data = await _fetch_nse_data(
        "https://www.nseindia.com/api/fiidiiTradeReact"
    )
    if data:
        return {"data": data}
    # Fallback with sample structure if NSE is unreachable
    return {
        "data": [],
        "note": "NSE data temporarily unavailable. Try again shortly.",
    }


@router.get("/bulk-deals")
async def bulk_deals():
    """Get recent bulk and block deals."""
    data = await _fetch_nse_data(
        "https://www.nseindia.com/api/snapshot-capital-market-largedeal"
    )
    if data:
        return data
    return {"BULK_DEALS_DATA": [], "BLOCK_DEALS_DATA": []}


@router.get("/institutional")
async def institutional_activity():
    """Get institutional investor activity summary."""
    fii_data = await _fetch_nse_data(
        "https://www.nseindia.com/api/fiidiiTradeReact"
    )

    result = {"fii": None, "dii": None, "summary": ""}
    if fii_data and isinstance(fii_data, list):
        for entry in fii_data:
            cat = entry.get("category", "")
            if "FII" in cat or "FPI" in cat:
                result["fii"] = entry
            elif "DII" in cat:
                result["dii"] = entry

        if result["fii"] and result["dii"]:
            fii_net = float(result["fii"].get("netValue", 0))
            dii_net = float(result["dii"].get("netValue", 0))
            if fii_net > 0 and dii_net > 0:
                result["summary"] = "Both FII and DII are net buyers — bullish sentiment."
            elif fii_net < 0 and dii_net > 0:
                result["summary"] = "FII selling, DII buying — mixed signals, domestic support."
            elif fii_net > 0 and dii_net < 0:
                result["summary"] = "FII buying, DII selling — foreign money flowing in."
            else:
                result["summary"] = "Both FII and DII are net sellers — bearish sentiment."

    return result

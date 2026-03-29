"""Market ChatGPT — conversational AI for stock advice."""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.ai_service import chat_with_market_context
from services.stock_service import get_index_data, get_top_movers

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    history: Optional[list] = None
    portfolio: Optional[list] = None


@router.post("/")
async def market_chat(req: ChatRequest):
    """Chat with TradeBuddy AI."""
    context_parts = []

    try:
        indices = await get_index_data()
        if indices:
            idx_str = ", ".join(
                f"{v['name']}: ₹{v['price']:,.2f} ({v['change_pct']:+.2f}%)"
                for v in indices.values()
            )
            context_parts.append(f"Indices: {idx_str}")
    except Exception:
        pass

    try:
        movers = await get_top_movers(3)
        if movers.get("gainers"):
            g = ", ".join(f"{s['symbol']} ({s['change_pct']:+.2f}%)" for s in movers["gainers"][:3])
            context_parts.append(f"Top Gainers: {g}")
        if movers.get("losers"):
            l = ", ".join(f"{s['symbol']} ({s['change_pct']:+.2f}%)" for s in movers["losers"][:3])
            context_parts.append(f"Top Losers: {l}")
    except Exception:
        pass

    if req.portfolio:
        p_str = ", ".join(f"{s.get('symbol')} ({s.get('qty')} shares)" for s in req.portfolio)
        context_parts.append(f"User Portfolio: {p_str}")

    context = "\n".join(context_parts) if context_parts else ""

    response = await chat_with_market_context(req.message, context, req.history)
    return {"response": response}

"""
Market ChatGPT routes — AI-powered market Q&A.
Portfolio-aware, source-cited, multi-step analysis.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.ai_service import chat_with_market_context
from services.stock_service import get_index_data, get_top_movers

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    history: Optional[list] = None
    portfolio: Optional[list] = None  # User's portfolio for personalization


@router.post("/")
async def market_chat(req: ChatRequest):
    """Chat with TradeBuddy AI — portfolio-aware market assistant."""
    # Build market context for the AI
    context_parts = []

    try:
        indices = await get_index_data()
        if indices:
            idx_str = ", ".join(
                f"{v['name']}: ₹{v['price']:,.2f} ({v['change_pct']:+.2f}%)"
                for v in indices.values()
            )
            context_parts.append(f"Current Indices: {idx_str}")
    except Exception:
        pass

    try:
        movers = await get_top_movers(limit=3)
        if movers.get("gainers"):
            top = movers["gainers"][:3]
            g_str = ", ".join(
                f"{s['symbol']} ({s['change_pct']:+.2f}%)" for s in top
            )
            context_parts.append(f"Top Gainers: {g_str}")
        if movers.get("losers"):
            bottom = movers["losers"][:3]
            l_str = ", ".join(
                f"{s['symbol']} ({s['change_pct']:+.2f}%)" for s in bottom
            )
            context_parts.append(f"Top Losers: {l_str}")
    except Exception:
        pass

    # Add portfolio context if provided
    if req.portfolio:
        portfolio_str = ", ".join(
            f"{s.get('symbol', '?')} ({s.get('qty', 0)} shares @ ₹{s.get('avg_price', 0)})"
            for s in req.portfolio
        )
        context_parts.append(f"User's Portfolio: {portfolio_str}")

    market_context = "\n".join(context_parts) if context_parts else None

    response = await chat_with_market_context(
        user_message=req.message,
        market_context=market_context,
        chat_history=req.history,
    )

    return {
        "response": response,
        "market_context_used": bool(market_context),
    }

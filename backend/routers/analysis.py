"""Stock analysis routes — technical analysis, patterns, stock details."""
from fastapi import APIRouter
from services.stock_service import get_stock_detail, get_stock_history
from services.technical_service import get_technical_analysis

router = APIRouter()


@router.get("/{symbol}")
async def stock_analysis(symbol: str):
    """Get full stock analysis with technicals."""
    detail = await get_stock_detail(symbol)
    technicals = await get_technical_analysis(symbol)
    return {
        "stock": detail,
        "technicals": technicals,
    }


@router.get("/{symbol}/detail")
async def stock_detail(symbol: str):
    return await get_stock_detail(symbol)


@router.get("/{symbol}/technicals")
async def stock_technicals(symbol: str):
    return await get_technical_analysis(symbol)


@router.get("/{symbol}/history")
async def stock_history(symbol: str, period: str = "6mo"):
    return await get_stock_history(symbol, period)

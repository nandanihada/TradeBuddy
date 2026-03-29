"""Market overview routes."""
from fastapi import APIRouter
from services.stock_service import get_index_data, get_top_movers

router = APIRouter()


@router.get("/overview")
async def market_overview():
    indices = await get_index_data()
    movers = await get_top_movers(5)
    return {"indices": indices, "gainers": movers["gainers"], "losers": movers["losers"]}


@router.get("/indices")
async def indices():
    return await get_index_data()


@router.get("/movers")
async def movers(limit: int = 10):
    return await get_top_movers(limit)

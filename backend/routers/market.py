"""Market overview routes — indices, top movers, market summary."""
from fastapi import APIRouter
from services.stock_service import get_index_data, get_top_movers

router = APIRouter()


@router.get("/overview")
async def market_overview():
    """Get market overview with indices and top movers."""
    indices = await get_index_data()
    movers = await get_top_movers(limit=5)
    return {
        "indices": indices,
        "gainers": movers["gainers"],
        "losers": movers["losers"],
    }


@router.get("/indices")
async def indices():
    return await get_index_data()


@router.get("/movers")
async def movers(limit: int = 10):
    return await get_top_movers(limit=limit)

"""Signal routes — Opportunity Radar."""
from fastapi import APIRouter
from services.signal_engine import run_full_pipeline, detect_stock_signals, detect_fii_dii_signals

router = APIRouter()


@router.get("/")
async def get_all_signals():
    return await run_full_pipeline()


@router.get("/stocks")
async def stock_signals():
    return await detect_stock_signals()


@router.get("/fii-dii")
async def fii_dii_signals():
    return await detect_fii_dii_signals()

"""
Signal routes — Opportunity Radar.
The agentic pipeline: detect → enrich → alert.
"""
from fastapi import APIRouter
from services.signal_engine import (
    run_full_pipeline,
    detect_bulk_deal_signals,
    detect_technical_signals,
    detect_fii_dii_signals,
)

router = APIRouter()


@router.get("/")
async def get_all_signals():
    """Run the full 3-step agentic pipeline and return enriched signals."""
    return await run_full_pipeline()


@router.get("/bulk-deals")
async def bulk_deals():
    """Get bulk/block deal signals only."""
    return await detect_bulk_deal_signals()


@router.get("/technical")
async def technical_signals():
    """Get technical pattern signals from Nifty 50 scan."""
    return await detect_technical_signals()


@router.get("/fii-dii")
async def fii_dii_signals():
    """Get FII/DII activity signals."""
    return await detect_fii_dii_signals()

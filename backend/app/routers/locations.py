from typing import List
from fastapi import APIRouter, HTTPException, Path
from app.schemas.locations import LocationSummary, LocationDetail
from app.services.data_service import data_service

router = APIRouter(prefix="/locations", tags=["Locations"])


@router.get("", response_model=List[LocationSummary])
def get_locations():
    """Retrieve all monitored landslide risk sites in the North Eastern Region."""
    return data_service.get_locations()


@router.get("/{location_id}", response_model=LocationDetail)
def get_location_by_id(
    location_id: str = Path(..., description="Unique slug or ID of the monitored site")
):
    """Retrieve detailed sensory readings and risk assessment for a specific location."""
    loc = data_service.get_location_detail(location_id)
    if not loc:
        raise HTTPException(status_code=404, detail=f"Location '{location_id}' not found.")
    return loc

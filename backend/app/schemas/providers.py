from typing import List, Optional
from pydantic import BaseModel, Field


class ProviderStatus(BaseModel):
    id: str
    name: str
    provides: str
    mode: str = Field(..., description="demo | planned | live")
    last_fetch: Optional[str] = None
    message: str


class DataSourcesResponse(BaseModel):
    active_mode: str
    providers: List[ProviderStatus]

from datetime import date, datetime
from pydantic import BaseModel, Field, ConfigDict


class PlotCreate(BaseModel):
    farmer_id: str
    plot_nickname: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    location_precision: str = "gps"
    village_name: str | None = None
    crop_type: str = Field(..., min_length=2)
    plot_size_declared: float | None = None
    sowing_date: date | None = None


class PlotRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    plot_id: str
    farmer_id: str
    plot_nickname: str | None = None
    location_precision: str
    village_name: str | None = None
    buffer_polygon: str | None = None
    crop_type: str
    plot_size_declared: float | None = None
    sowing_date: date | None = None
    status: str
    created_at: datetime
    updated_at: datetime

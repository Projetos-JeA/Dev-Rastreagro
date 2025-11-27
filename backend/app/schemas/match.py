"""Schemas Pydantic para matches (Deu Agro)"""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Optional

from pydantic import BaseModel, Field

from app.models.match import MatchStatus

if TYPE_CHECKING:
    from app.schemas.quotation import QuotationResponse
else:
    # Importação real para runtime
    from app.schemas.quotation import QuotationResponse


class MatchBase(BaseModel):
    quotation_id: int = Field(..., description="ID da cotação")
    score: Optional[float] = Field(None, ge=0, le=100, description="Score de relevância")


class MatchCreate(MatchBase):
    pass


class MatchResponse(MatchBase):
    id: int
    buyer_id: int
    status: MatchStatus
    created_at: datetime
    updated_at: datetime
    quotation: Optional[QuotationResponse] = None  # Para exibição completa

    class Config:
        from_attributes = True


class MatchUpdate(BaseModel):
    status: Optional[MatchStatus] = None


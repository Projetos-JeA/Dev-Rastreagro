"""Schemas Pydantic para cotações"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.quotation import QuotationCategory, QuotationStatus


class QuotationBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=255, description="Título da cotação")
    description: Optional[str] = Field(None, description="Descrição detalhada")
    category: QuotationCategory = Field(..., description="Categoria da cotação")
    product_type: Optional[str] = Field(None, max_length=100, description="Tipo de produto/serviço")
    location_city: Optional[str] = Field(None, max_length=100, description="Cidade")
    location_state: Optional[str] = Field(None, max_length=2, description="Estado (UF)")
    price: Optional[float] = Field(None, ge=0, description="Preço unitário")
    quantity: Optional[float] = Field(None, ge=0, description="Quantidade disponível")
    unit: Optional[str] = Field(None, max_length=50, description="Unidade (kg, unidade, lote, etc)")
    expires_at: Optional[datetime] = Field(None, description="Data de expiração")
    image_url: Optional[str] = Field(None, max_length=500, description="URL da imagem principal")
    images: Optional[list[str]] = Field(None, description="Lista de URLs de imagens")
    free_shipping: bool = Field(default=False, description="Frete grátis")
    discount_percentage: Optional[int] = Field(None, ge=0, le=100, description="Percentual de desconto")
    installments: Optional[int] = Field(None, ge=1, description="Número de parcelas")
    stock: Optional[int] = Field(None, ge=0, description="Estoque disponível")


class QuotationCreate(QuotationBase):
    quotation_type: Optional[str] = Field(
        default="offer",
        description="Tipo: 'offer' (oferta - todos criam) ou 'quotation' (cotação - apenas compradores)"
    )


class QuotationUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = None
    category: Optional[QuotationCategory] = None
    product_type: Optional[str] = Field(None, max_length=100)
    location_city: Optional[str] = Field(None, max_length=100)
    location_state: Optional[str] = Field(None, max_length=2)
    price: Optional[float] = Field(None, ge=0)
    quantity: Optional[float] = Field(None, ge=0)
    unit: Optional[str] = Field(None, max_length=50)
    expires_at: Optional[datetime] = None
    image_url: Optional[str] = Field(None, max_length=500)
    images: Optional[list[str]] = None
    free_shipping: Optional[bool] = None
    discount_percentage: Optional[int] = Field(None, ge=0, le=100)
    installments: Optional[int] = Field(None, ge=1)
    stock: Optional[int] = Field(None, ge=0)
    status: Optional[QuotationStatus] = None


class QuotationResponse(QuotationBase):
    id: int
    type: str  # "quotation" ou "offer"
    seller_id: Optional[int] = None  # NULL se for cotação
    buyer_id: Optional[int] = None  # NULL se for oferta
    seller_type: Optional[str] = None  # NULL se for cotação
    status: QuotationStatus
    created_at: datetime
    updated_at: datetime
    seller_nickname: Optional[str] = None  # Para exibição (se for oferta)
    buyer_nickname: Optional[str] = None  # Para exibição (se for cotação)

    class Config:
        from_attributes = True


class QuotationWithScore(QuotationResponse):
    score: Optional[float] = Field(None, description="Score de relevância calculado pela IA (0-100)")


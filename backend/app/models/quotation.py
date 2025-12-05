"""Modelo representando cotações/ofertas do sistema"""

from datetime import datetime
from enum import Enum

from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    DateTime,
    Enum as SQLEnum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.database import Base


class QuotationStatus(str, Enum):
    ACTIVE = "active"
    RESERVED = "reserved"
    SOLD = "sold"
    EXPIRED = "expired"
    CANCELLED = "cancelled"


class QuotationCategory(str, Enum):
    AGRICULTURE = "agriculture"
    LIVESTOCK = "livestock"
    SERVICE = "service"
    BOTH = "both"  # Agricultura e pecuária


class QuotationType(str, Enum):
    QUOTATION = "quotation"  # Cotação criada por COMPRADOR (o que ele precisa)
    OFFER = "offer"  # Oferta criada por VENDEDOR (o que ele tem para vender)


class Quotation(Base):
    __tablename__ = "quotations"

    id = Column(BigInteger, primary_key=True, index=True)
    type = Column(
        String(20), 
        default=QuotationType.OFFER.value, 
        nullable=False,
        index=True
    )  # "quotation" (comprador) ou "offer" (vendedor) - String para compatibilidade com SQL Server
    seller_id = Column(BigInteger, ForeignKey("users.id"), nullable=True, index=True)  # NULL se for cotação
    buyer_id = Column(BigInteger, ForeignKey("users.id"), nullable=True, index=True)  # NULL se for oferta
    seller_type = Column(String(50), nullable=True)  # "company" ou "service_provider" (apenas para ofertas)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(SQLEnum(QuotationCategory, name="quotation_category"), nullable=False)
    product_type = Column(String(100), nullable=True)  # Ex: "boi", "defensivo", "pulverização"
    location_city = Column(String(100), nullable=True)
    location_state = Column(String(2), nullable=True)
    price = Column(Float, nullable=True)  # Preço unitário (opcional)
    quantity = Column(Float, nullable=True)  # Quantidade disponível
    unit = Column(String(50), nullable=True)  # Ex: "kg", "unidade", "lote", "hectare"
    status = Column(
        SQLEnum(QuotationStatus, name="quotation_status"), default=QuotationStatus.ACTIVE, nullable=False
    )
    expires_at = Column(DateTime, nullable=True)  # Data de expiração (opcional)
    image_url = Column(String(500), nullable=True)  # URL da imagem principal
    images = Column(Text, nullable=True)  # JSON array de URLs de imagens
    free_shipping = Column(Boolean, default=False, nullable=False)
    discount_percentage = Column(Integer, nullable=True)  # Percentual de desconto
    installments = Column(Integer, nullable=True)  # Número de parcelas
    stock = Column(Integer, nullable=True)  # Estoque disponível
    embedding = Column(Text, nullable=True)  # JSON array do embedding (para IA matching)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    seller = relationship("User", foreign_keys=[seller_id], backref="seller_quotations")
    buyer = relationship("User", foreign_keys=[buyer_id], backref="buyer_quotations")
    matches = relationship("Match", back_populates="quotation", cascade="all, delete-orphan")


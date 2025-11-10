from datetime import date, datetime

from sqlalchemy import BigInteger, Column, Date, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship

from app.database import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)

    nome_propriedade = Column(String(255), nullable=False)
    inicio_atividades = Column(Date, nullable=True)
    ramo_atividade = Column(String(255), nullable=True)
    cnaes = Column(String(255), nullable=True)
    cnpj_cpf = Column(String(20), nullable=False)
    insc_est_identidade = Column(String(50), nullable=True)
    endereco = Column(String(255), nullable=False)
    cep = Column(String(12), nullable=False)
    cidade = Column(String(100), nullable=False)
    estado = Column(String(2), nullable=False)
    email = Column(String(255), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="company")
    activities = relationship("CompanyActivity", back_populates="company", cascade="all, delete-orphan")


class CompanyActivity(Base):
    __tablename__ = "company_activities"

    id = Column(BigInteger, primary_key=True, index=True)
    company_id = Column(BigInteger, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(BigInteger, ForeignKey("activity_category.id", ondelete="NO ACTION"), nullable=False)
    group_id = Column(BigInteger, ForeignKey("activity_group.id", ondelete="NO ACTION"), nullable=True)
    item_id = Column(BigInteger, ForeignKey("activity_item.id", ondelete="SET NULL"), nullable=True)

    company = relationship("Company", back_populates="activities")
    category = relationship("ActivityCategory")
    group = relationship("ActivityGroup")
    item = relationship("ActivityItem")

from sqlalchemy import BigInteger, Column, ForeignKey, String
from sqlalchemy.orm import relationship

from app.database import Base


class ActivityCategory(Base):
    __tablename__ = "activity_category"

    id = Column(BigInteger, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)

    groups = relationship("ActivityGroup", back_populates="category", cascade="all, delete-orphan")


class ActivityGroup(Base):
    __tablename__ = "activity_group"

    id = Column(BigInteger, primary_key=True, index=True)
    category_id = Column(BigInteger, ForeignKey("activity_category.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)

    category = relationship("ActivityCategory", back_populates="groups")
    items = relationship("ActivityItem", back_populates="group", cascade="all, delete-orphan")


class ActivityItem(Base):
    __tablename__ = "activity_item"

    id = Column(BigInteger, primary_key=True, index=True)
    group_id = Column(BigInteger, ForeignKey("activity_group.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)

    group = relationship("ActivityGroup", back_populates="items")

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr

from app.models.user import UserRole


class UserBase(BaseModel):
    id: int
    email: EmailStr
    role: UserRole
    nickname: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserWithCompany(UserBase):
    company: Optional["CompanyResponse"] = None
    service_profile: Optional["ServiceProviderResponse"] = None
    buyer_profile: Optional["BuyerProfileResponse"] = None


from app.schemas.company import CompanyResponse  # noqa: E402  # pylint: disable=wrong-import-position
from app.schemas.service_provider import ServiceProviderResponse  # noqa: E402  # pylint: disable=wrong-import-position
from app.schemas.buyer_profile import BuyerProfileResponse  # noqa: E402  # pylint: disable=wrong-import-position

UserWithCompany.model_rebuild()

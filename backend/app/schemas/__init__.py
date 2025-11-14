# Pacote que reúne os esquemas Pydantic

from app.schemas.auth import (
    CompanyActivitySelection,
    CompanyData,
    LoginRequest,
    RegisterRequest,
    TokenPair,
    RefreshRequest,
)
from app.schemas.user import UserBase, UserWithCompany
from app.schemas.company import (
    CompanyResponse,
    ActivityCategoryResponse,
    ActivityGroupResponse,
    ActivityItemResponse,
    CompanyActivityResponse,
)
from app.schemas.activity import (
    ActivityCategoryOut,
    ActivityGroupOut,
    ActivityItemOut,
    ActivityCategoryList,
    ActivityGroupList,
    ActivityItemList,
)
from app.schemas.service_provider import ServiceProviderData, ServiceProviderResponse

__all__ = [
    "CompanyActivitySelection",
    "CompanyData",
    "LoginRequest",
    "RegisterRequest",
    "TokenPair",
    "RefreshRequest",
    "UserBase",
    "UserWithCompany",
    "CompanyResponse",
    "ActivityCategoryResponse",
    "ActivityGroupResponse",
    "ActivityItemResponse",
    "CompanyActivityResponse",
    "ActivityCategoryOut",
    "ActivityGroupOut",
    "ActivityItemOut",
    "ActivityCategoryList",
    "ActivityGroupList",
    "ActivityItemList",
    "ServiceProviderData",
    "ServiceProviderResponse",
]

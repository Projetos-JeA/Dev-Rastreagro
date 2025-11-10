from typing import List

from pydantic import BaseModel


class ActivityCategoryOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class ActivityGroupOut(BaseModel):
    id: int
    name: str
    category_id: int

    class Config:
        from_attributes = True


class ActivityItemOut(BaseModel):
    id: int
    name: str
    group_id: int

    class Config:
        from_attributes = True


class ActivityCategoryList(BaseModel):
    categories: List[ActivityCategoryOut]


class ActivityGroupList(BaseModel):
    groups: List[ActivityGroupOut]


class ActivityItemList(BaseModel):
    items: List[ActivityItemOut]

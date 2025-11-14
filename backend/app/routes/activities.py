from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.schemas.activity import ActivityCategoryList, ActivityGroupList, ActivityItemList
from app.services.activity_service import ActivityService

router = APIRouter(prefix="/activities", tags=["Activities"])


@router.get(
    "/categories", response_model=ActivityCategoryList, summary="Listar categorias de atividade"
)
def list_categories(db: Session = Depends(get_db)):
    service = ActivityService(db)
    categories = service.list_categories()
    return ActivityCategoryList(categories=categories)


@router.get("/groups", response_model=ActivityGroupList, summary="Listar grupos por categoria")
def list_groups(category_id: int, db: Session = Depends(get_db)):
    service = ActivityService(db)
    groups = service.list_groups(category_id)
    return ActivityGroupList(groups=groups)


@router.get("/items", response_model=ActivityItemList, summary="Listar itens por grupo")
def list_items(group_id: int, db: Session = Depends(get_db)):
    service = ActivityService(db)
    items = service.list_items(group_id)
    return ActivityItemList(items=items)

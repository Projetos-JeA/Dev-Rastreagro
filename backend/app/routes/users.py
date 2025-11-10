from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.schemas.user import UserWithCompany
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserWithCompany)
def get_me(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    service = UserService(db)
    return service.get_me(current_user.id)

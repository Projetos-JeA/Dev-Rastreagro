from sqlalchemy.orm import Session

from app.repositories.activity_repository import ActivityRepository


class ActivityService:
    def __init__(self, db: Session):
        self.repo = ActivityRepository(db)

    def list_categories(self):
        return self.repo.list_categories()

    def list_groups(self, category_id: int):
        return self.repo.list_groups(category_id)

    def list_items(self, group_id: int):
        return self.repo.list_items(group_id)

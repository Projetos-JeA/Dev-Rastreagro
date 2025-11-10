from typing import List

from sqlalchemy.orm import Session

from app.models.activity import ActivityCategory, ActivityGroup, ActivityItem


class ActivityRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_categories(self) -> List[ActivityCategory]:
        return self.db.query(ActivityCategory).order_by(ActivityCategory.name).all()

    def list_groups(self, category_id: int) -> List[ActivityGroup]:
        return (
            self.db.query(ActivityGroup)
            .filter(ActivityGroup.category_id == category_id)
            .order_by(ActivityGroup.name)
            .all()
        )

    def list_items(self, group_id: int) -> List[ActivityItem]:
        return (
            self.db.query(ActivityItem)
            .filter(ActivityItem.group_id == group_id)
            .order_by(ActivityItem.name)
            .all()
        )

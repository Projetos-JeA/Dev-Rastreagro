from typing import Optional

from sqlalchemy.orm import Session

from app.models.service_provider import ServiceProvider


class ServiceProviderRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user_id(self, user_id: int) -> Optional[ServiceProvider]:
        return self.db.query(ServiceProvider).filter(ServiceProvider.user_id == user_id).first()

    def create(self, profile: ServiceProvider) -> ServiceProvider:
        self.db.add(profile)
        self.db.commit()
        self.db.refresh(profile)
        return profile

    def update(self, profile: ServiceProvider, data: dict) -> ServiceProvider:
        for key, value in data.items():
            setattr(profile, key, value)
        self.db.commit()
        self.db.refresh(profile)
        return profile

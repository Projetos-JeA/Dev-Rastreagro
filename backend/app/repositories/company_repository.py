from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.company import Company, CompanyActivity


class CompanyRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, company_id: int) -> Optional[Company]:
        return self.db.get(Company, company_id)

    def get_by_user_id(self, user_id: int) -> Optional[Company]:
        return self.db.query(Company).filter(Company.user_id == user_id).first()

    def create(self, company: Company, activities: List[CompanyActivity]) -> Company:
        self.db.add(company)
        self.db.flush()
        for activity in activities:
            activity.company_id = company.id
            self.db.add(activity)
        self.db.commit()
        self.db.refresh(company)
        return company

    def update(self, company: Company, data: dict, activities: List[CompanyActivity]) -> Company:
        for key, value in data.items():
            setattr(company, key, value)

        # Substitui as atividades atuais pelas novas selecionadas
        self.db.query(CompanyActivity).filter(CompanyActivity.company_id == company.id).delete()
        for activity in activities:
            activity.company_id = company.id
            self.db.add(activity)

        self.db.commit()
        self.db.refresh(company)
        return company

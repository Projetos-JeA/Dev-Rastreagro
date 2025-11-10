"""Serviços responsáveis por autenticação e cadastro de usuários"""

from typing import Optional, Tuple

from email_validator import EmailNotValidError, validate_email
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    verify_password,
    decode_refresh_token,
)
from app.models import User, UserRole, Company, CompanyActivity, ServiceProvider
from app.repositories.activity_repository import ActivityRepository
from app.repositories.company_repository import CompanyRepository
from app.repositories.user_repository import UserRepository
from app.repositories.service_provider_repository import ServiceProviderRepository
from app.schemas import RegisterRequest, LoginRequest
from app.services.nickname_blacklist import BLACKLISTED_NICKNAMES


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.company_repo = CompanyRepository(db)
        self.activity_repo = ActivityRepository(db)
        self.service_provider_repo = ServiceProviderRepository(db)

    def _validate_email(self, email: str) -> None:
        try:
            validate_email(email, check_deliverability=False)
        except EmailNotValidError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    def _validate_nickname(self, nickname: str) -> None:
        normalized = nickname.strip().lower()
        if normalized in BLACKLISTED_NICKNAMES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Apelido inválido, escolha outro",
            )

    def _build_company(self, user_id: int, company_data) -> Tuple[Company, list[CompanyActivity]]:
        categories = {c.id for c in self.activity_repo.list_categories()}
        for selection in company_data.activities:
            if selection.category_id not in categories:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Categoria inválida")

        activities: list[CompanyActivity] = []

        # Valida relacionamentos entre categoria, grupo e item antes de salvar
        for selection in company_data.activities:
            if selection.item_id and not selection.group_id:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Item informado sem grupo")

            if selection.group_id:
                groups = self.activity_repo.list_groups(selection.category_id)
                group_ids = {g.id for g in groups}
                if selection.group_id not in group_ids:
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Grupo inválido")

            if selection.item_id:
                items = self.activity_repo.list_items(selection.group_id)
                item_ids = {i.id for i in items}
                if selection.item_id not in item_ids:
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Item inválido")

            activities.append(
                CompanyActivity(
                    category_id=selection.category_id,
                    group_id=selection.group_id,
                    item_id=selection.item_id,
                )
            )

        company = Company(
            user_id=user_id,
            nome_propriedade=company_data.nome_propriedade,
            inicio_atividades=company_data.inicio_atividades,
            ramo_atividade=company_data.ramo_atividade,
            cnaes=company_data.cnaes,
            cnpj_cpf=company_data.cnpj_cpf,
            insc_est_identidade=company_data.insc_est_identidade,
            endereco=company_data.endereco,
            cep=company_data.cep,
            cidade=company_data.cidade,
            estado=company_data.estado,
            email=company_data.email,
        )

        return company, activities

    def _build_service_provider(self, user_id: int, data) -> ServiceProvider:
        return ServiceProvider(
            user_id=user_id,
            nome_servico=data.nome_servico,
            descricao=data.descricao,
            telefone=data.telefone,
            email_contato=data.email_contato,
            cidade=data.cidade,
            estado=data.estado,
        )

    def register(self, payload: RegisterRequest) -> User:
        self._validate_email(payload.email)

        existing_user = self.user_repo.get_by_email(payload.email)
        if existing_user:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email já cadastrado")

        role = UserRole(payload.role)
        nickname = payload.nickname.strip() if payload.nickname else None
        if role == UserRole.BUYER:
            if not nickname:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Apelido é obrigatório")
            self._validate_nickname(nickname)

        user = User(
            email=payload.email,
            password_hash=get_password_hash(payload.password),
            role=role,
            nickname=nickname,
        )

        try:
            self.db.add(user)
            self.db.flush()
        except IntegrityError as exc:
            self.db.rollback()
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email já cadastrado") from exc

        if role == UserRole.SELLER and payload.company:
            company, activities = self._build_company(user.id, payload.company)
            try:
                self.company_repo.create(company, activities)
                self.db.refresh(user)
            except IntegrityError as exc:
                self.db.rollback()
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Erro ao salvar empresa") from exc
        elif role == UserRole.SERVICE_PROVIDER and payload.service_provider:
            profile = self._build_service_provider(user.id, payload.service_provider)
            try:
                self.service_provider_repo.create(profile)
                self.db.refresh(user)
            except IntegrityError as exc:
                self.db.rollback()
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Erro ao salvar prestador") from exc
        else:
            self.db.commit()
            self.db.refresh(user)

        return user

    def authenticate(self, payload: LoginRequest) -> Tuple[str, str, User]:
        user = self.user_repo.get_by_email(payload.email)
        if not user or not verify_password(payload.password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas")

        access_token = create_access_token(str(user.id), {"role": user.role.value})
        refresh_token = create_refresh_token(str(user.id))
        return access_token, refresh_token, user

    def refresh(self, refresh_token: str) -> str:
        try:
            payload = decode_refresh_token(refresh_token)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc

        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh inválido")

        user = self.user_repo.get_by_id(int(user_id))
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")

        return create_access_token(str(user.id), {"role": user.role.value})


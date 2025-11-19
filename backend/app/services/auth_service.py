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
from datetime import datetime, timedelta

from app.models import (
    User,
    UserRole,
    Company,
    CompanyActivity,
    ServiceProvider,
    BuyerProfile,
    EmailVerificationToken,
)
from app.repositories.activity_repository import ActivityRepository
from app.repositories.company_repository import CompanyRepository
from app.repositories.user_repository import UserRepository
from app.repositories.service_provider_repository import ServiceProviderRepository
from app.repositories.buyer_profile_repository import BuyerProfileRepository
from app.repositories.email_verification_repository import EmailVerificationRepository
from app.schemas import RegisterRequest, LoginRequest
from app.services.nickname_blacklist import BLACKLISTED_NICKNAMES
from app.services.email_service import EmailService
from app.services.document_validation_service import DocumentValidationService


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.company_repo = CompanyRepository(db)
        self.activity_repo = ActivityRepository(db)
        self.service_provider_repo = ServiceProviderRepository(db)
        self.buyer_profile_repo = BuyerProfileRepository(db)
        self.email_verification_repo = EmailVerificationRepository(db)
        self.email_service = EmailService()
        self.document_validator = DocumentValidationService()

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
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, detail="Categoria inválida"
                )

        activities: list[CompanyActivity] = []

        # Valida relacionamentos entre categoria, grupo e item antes de salvar
        for selection in company_data.activities:
            if selection.item_id and not selection.group_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, detail="Item informado sem grupo"
                )

            if selection.group_id:
                groups = self.activity_repo.list_groups(selection.category_id)
                group_ids = {g.id for g in groups}
                if selection.group_id not in group_ids:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST, detail="Grupo inválido"
                    )

            if selection.item_id:
                items = self.activity_repo.list_items(selection.group_id)
                item_ids = {i.id for i in items}
                if selection.item_id not in item_ids:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST, detail="Item inválido"
                    )

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
            tipo_servico=data.tipo_servico,
            endereco=data.endereco,
            cep=data.cep,
            cnpj_cpf=data.cnpj_cpf,
            insc_est_identidade=data.insc_est_identidade,
        )

    def _build_buyer_profile(self, user_id: int, data) -> BuyerProfile:
        return BuyerProfile(
            user_id=user_id,
            nome_completo=data.nome_completo,
            data_nascimento=data.data_nascimento,
            cpf=data.cpf,
            identidade=data.identidade,
            estado_civil=data.estado_civil,
            naturalidade=data.naturalidade,
            endereco=data.endereco,
            cep=data.cep,
            cidade=data.cidade,
            estado=data.estado,
        )

    def _validate_document_duplicates(self, payload: RegisterRequest) -> None:
        """Valida se CPF/CNPJ já está cadastrado"""
        role = UserRole(payload.role)
        
        if role == UserRole.BUYER and payload.buyer_profile and payload.buyer_profile.cpf:
            existing_buyer = self.buyer_profile_repo.get_by_cpf(payload.buyer_profile.cpf)
            if existing_buyer:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="CPF já cadastrado"
                )
        
        elif role == UserRole.SELLER and payload.company:
            existing_company = self.company_repo.get_by_cnpj_cpf(payload.company.cnpj_cpf)
            if existing_company:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="CNPJ/CPF já cadastrado"
                )
        
        elif role == UserRole.SERVICE_PROVIDER and payload.service_provider and payload.service_provider.cnpj_cpf:
            existing_provider = self.service_provider_repo.get_by_cnpj_cpf(payload.service_provider.cnpj_cpf)
            if existing_provider:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="CNPJ/CPF já cadastrado"
                )

    async def _create_and_send_verification_email(self, user: User) -> None:
        """Cria token de verificação e envia email"""
        # Remove token anterior se existir
        existing_token = self.email_verification_repo.get_by_user_id(user.id)
        if existing_token:
            self.email_verification_repo.delete(existing_token)
        
        # Gera novo token
        token = self.email_service.generate_verification_token()
        expires_at = datetime.utcnow() + timedelta(hours=48)  # Token expira em 48 horas
        
        verification_token = EmailVerificationToken(
            user_id=user.id,
            token=token,
            expires_at=expires_at
        )
        
        self.email_verification_repo.create(verification_token)
        
        # Envia email de verificação
        user_name = user.nickname or user.email.split("@")[0]
        try:
            await self.email_service.send_verification_email(user.email, token, user_name)
        except HTTPException:
            # Se falhar ao enviar email, não bloqueia o cadastro
            # O usuário pode solicitar reenvio depois
            pass

    async def register(self, payload: RegisterRequest) -> User:
        self._validate_email(payload.email)

        existing_user = self.user_repo.get_by_email(payload.email)
        if existing_user:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email já cadastrado")

        # Valida documentos duplicados
        self._validate_document_duplicates(payload)

        role = UserRole(payload.role)
        nickname = payload.nickname.strip() if payload.nickname else None
        if role == UserRole.BUYER:
            if not nickname:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, detail="Apelido é obrigatório"
                )
            self._validate_nickname(nickname)

        user = User(
            email=payload.email,
            password_hash=get_password_hash(payload.password),
            role=role,
            nickname=nickname,
            email_verificado=False,  # Email não verificado inicialmente
        )

        try:
            self.db.add(user)
            self.db.flush()
        except IntegrityError as exc:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="Email já cadastrado"
            ) from exc

        if role == UserRole.SELLER and payload.company:
            company, activities = self._build_company(user.id, payload.company)
            try:
                self.company_repo.create(company, activities)
                self.db.refresh(user)
            except IntegrityError as exc:
                self.db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, detail="Erro ao salvar empresa"
                ) from exc
        elif role == UserRole.SERVICE_PROVIDER and payload.service_provider:
            profile = self._build_service_provider(user.id, payload.service_provider)
            try:
                self.service_provider_repo.create(profile)
                self.db.refresh(user)
            except IntegrityError as exc:
                self.db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, detail="Erro ao salvar prestador"
                ) from exc
        elif role == UserRole.BUYER and payload.buyer_profile:
            profile = self._build_buyer_profile(user.id, payload.buyer_profile)
            try:
                self.buyer_profile_repo.create(profile)
                self.db.refresh(user)
            except IntegrityError as exc:
                self.db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, detail="Erro ao salvar perfil do comprador"
                ) from exc
        else:
            self.db.commit()
            self.db.refresh(user)

        # Cria token e envia email de verificação
        await self._create_and_send_verification_email(user)

        return user

    def authenticate(self, payload: LoginRequest) -> Tuple[str, str, User]:
        user = self.user_repo.get_by_email(payload.email)
        if not user or not verify_password(payload.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas"
            )

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
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado"
            )

        return create_access_token(str(user.id), {"role": user.role.value})

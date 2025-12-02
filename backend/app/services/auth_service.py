"""Serviços responsáveis por autenticação e cadastro de usuários"""

from datetime import datetime, timedelta

from email_validator import EmailNotValidError, validate_email
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    get_password_hash,
    verify_password,
)
from app.models import (
    BuyerProfile,
    Company,
    CompanyActivity,
    EmailVerificationToken,
    PasswordResetToken,
    ServiceProvider,
    User,
    UserRole,
)
from app.repositories.activity_repository import ActivityRepository
from app.repositories.buyer_profile_repository import BuyerProfileRepository
from app.repositories.company_repository import CompanyRepository
from app.repositories.email_verification_repository import EmailVerificationRepository
from app.repositories.password_reset_repository import PasswordResetTokenRepository
from app.repositories.service_provider_repository import ServiceProviderRepository
from app.repositories.user_repository import UserRepository
from app.schemas import LoginRequest, RegisterRequest
from app.schemas.auth import CheckAvailabilityRequest, CheckAvailabilityResponse
from app.services.document_validation_service import DocumentValidationService
from app.services.email_service import EmailService
from app.services.nickname_blacklist import BLACKLISTED_NICKNAMES


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.company_repo = CompanyRepository(db)
        self.activity_repo = ActivityRepository(db)
        self.service_provider_repo = ServiceProviderRepository(db)
        self.buyer_profile_repo = BuyerProfileRepository(db)
        self.email_verification_repo = EmailVerificationRepository(db)
        self.password_reset_repo = PasswordResetTokenRepository(db)
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

    def _build_company(self, user_id: int, company_data) -> tuple[Company, list[CompanyActivity]]:
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
            bairro=company_data.bairro,
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
            bairro=data.bairro,
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
            bairro=data.bairro,
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
                    status_code=status.HTTP_409_CONFLICT, detail="CPF já cadastrado"
                )

        elif role == UserRole.SELLER and payload.company:
            existing_company = self.company_repo.get_by_cnpj_cpf(payload.company.cnpj_cpf)
            if existing_company:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT, detail="CNPJ/CPF já cadastrado"
                )

        elif (
            role == UserRole.SERVICE_PROVIDER
            and payload.service_provider
            and payload.service_provider.cnpj_cpf
        ):
            existing_provider = self.service_provider_repo.get_by_cnpj_cpf(
                payload.service_provider.cnpj_cpf
            )
            if existing_provider:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT, detail="CNPJ/CPF já cadastrado"
                )

    async def _validate_document_external(self, payload: RegisterRequest) -> None:
        """
        Valida documentos na Receita Federal (BrasilAPI)

        - CPF: Apenas validação matemática (não há API pública gratuita)
        - CNPJ: Validação matemática + consulta na BrasilAPI
        """
        role = UserRole(payload.role)

        # Valida CPF (comprador) - apenas matemática
        if role == UserRole.BUYER and payload.buyer_profile and payload.buyer_profile.cpf:
            is_valid, error_msg = self.document_validator.validate_cpf(payload.buyer_profile.cpf)
            if not is_valid:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error_msg)

        # Valida CNPJ/CPF (vendedor) - matemática + BrasilAPI (apenas se for CNPJ)
        elif role == UserRole.SELLER and payload.company and payload.company.cnpj_cpf:
            import re

            clean_doc = re.sub(r"[^0-9]", "", payload.company.cnpj_cpf)

            # Se for CNPJ (14 dígitos), valida formato e consulta BrasilAPI
            if len(clean_doc) == 14:
                # Valida formato e dígitos verificadores
                is_valid, error_msg = self.document_validator.validate_cnpj(
                    payload.company.cnpj_cpf
                )
                if not is_valid:
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error_msg)

                # Depois valida na Receita Federal via BrasilAPI
                (
                    is_valid_external,
                    error_msg_external,
                ) = await self.document_validator.validate_with_receita_federal(
                    payload.company.cnpj_cpf, "cnpj"
                )
                if is_valid_external is False:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=error_msg_external or "CNPJ inválido na Receita Federal",
                    )

            # Se for CPF (11 dígitos), apenas validação matemática
            elif len(clean_doc) == 11:
                is_valid, error_msg = self.document_validator.validate_cpf(payload.company.cnpj_cpf)
                if not is_valid:
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error_msg)
            # Se não for nem CPF nem CNPJ, o validator do schema já vai pegar

        # Valida CNPJ/CPF (prestador) - matemática + BrasilAPI (se for CNPJ)
        elif (
            role == UserRole.SERVICE_PROVIDER
            and payload.service_provider
            and payload.service_provider.cnpj_cpf
        ):
            import re

            clean_doc = re.sub(r"[^0-9]", "", payload.service_provider.cnpj_cpf)

            # Se for CNPJ (14 dígitos), valida formato e consulta BrasilAPI
            if len(clean_doc) == 14:
                # Valida formato e dígitos verificadores
                is_valid, error_msg = self.document_validator.validate_cnpj(
                    payload.service_provider.cnpj_cpf
                )
                if not is_valid:
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error_msg)

                # Valida na Receita Federal via BrasilAPI
                (
                    is_valid_external,
                    error_msg_external,
                ) = await self.document_validator.validate_with_receita_federal(
                    payload.service_provider.cnpj_cpf, "cnpj"
                )
                if is_valid_external is False:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=error_msg_external or "CNPJ inválido na Receita Federal",
                    )

            # Se for CPF (11 dígitos), apenas validação matemática
            elif len(clean_doc) == 11:
                is_valid, error_msg = self.document_validator.validate_cpf(
                    payload.service_provider.cnpj_cpf
                )
                if not is_valid:
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error_msg)

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
            user_id=user.id, token=token, expires_at=expires_at
        )

        self.email_verification_repo.create(verification_token)

        # Envia email de verificação
        user_name = user.nickname or user.email.split("@")[0]
        try:
            await self.email_service.send_verification_email(user.email, token, user_name)
        except HTTPException as e:
            # Se falhar ao enviar email, não bloqueia o cadastro
            # O usuário pode solicitar reenvio depois
            # Em desenvolvimento, mostra o token no log
            import logging
            logger = logging.getLogger(__name__)
            logger.warning("=" * 60)
            logger.warning("⚠️  EMAIL NÃO ENVIADO (Resend não configurado)")
            logger.warning("=" * 60)
            logger.warning(f"Email: {user.email}")
            logger.warning(f"Token de verificação: {token}")
            logger.warning(f"URL de verificação: {self.email_service.get_verification_url(token)}")
            logger.warning("=" * 60)
            logger.warning("Para desenvolvimento, use este token para verificar o email manualmente")
            logger.warning("ou configure RESEND_API_KEY no .env")
            logger.warning("=" * 60)
            pass

    def check_availability(self, payload: CheckAvailabilityRequest) -> CheckAvailabilityResponse:
        import re

        from app.utils.validators import format_cnpj, format_cpf

        response = CheckAvailabilityResponse()

        if payload.email:
            existing = self.user_repo.get_by_email(payload.email)
            response.email_available = existing is None

        if payload.cpf:
            cpf_clean = re.sub(r"[^0-9]", "", payload.cpf)
            if len(cpf_clean) == 11:
                cpf_formatted = format_cpf(payload.cpf)
                existing_buyer = self.buyer_profile_repo.get_by_cpf(cpf_formatted)
                existing_company = self.company_repo.get_by_cnpj_cpf(cpf_formatted)
                existing_provider = self.service_provider_repo.get_by_cnpj_cpf(cpf_formatted)
                response.cpf_available = (
                    existing_buyer is None
                    and existing_company is None
                    and existing_provider is None
                )

        if payload.cnpj:
            cnpj_clean = re.sub(r"[^0-9]", "", payload.cnpj)
            if len(cnpj_clean) == 14:
                cnpj_formatted = format_cnpj(payload.cnpj)
                existing_company = self.company_repo.get_by_cnpj_cpf(cnpj_formatted)
                existing_provider = self.service_provider_repo.get_by_cnpj_cpf(cnpj_formatted)
                response.cnpj_available = existing_company is None and existing_provider is None

        return response

    async def register(self, payload: RegisterRequest) -> User:
        import logging

        logger = logging.getLogger(__name__)

        logger.info("=" * 60)
        logger.info("INICIANDO CADASTRO DE USUÁRIO")
        logger.info(f"Email: {payload.email}")
        logger.info(f"Role: {payload.role}")
        logger.info("=" * 60)

        self._validate_email(payload.email)
        logger.info("✅ Email validado")

        existing_user = self.user_repo.get_by_email(payload.email)
        if existing_user:
            logger.error("❌ Email já cadastrado")
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email já cadastrado")
        logger.info("✅ Email não existe no banco")

        # Valida documentos duplicados
        logger.info("🔵 Validando documentos duplicados...")
        self._validate_document_duplicates(payload)
        logger.info("✅ Documentos não duplicados")

        # Valida documentos na Receita Federal (BrasilAPI para CNPJ)
        logger.info("🔵 Validando documentos na Receita Federal...")
        await self._validate_document_external(payload)
        logger.info("✅ Documentos validados")

        role = UserRole(payload.role)
        nickname = payload.nickname.strip() if payload.nickname else None
        if role == UserRole.BUYER:
            if not nickname:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, detail="Apelido é obrigatório"
                )
            self._validate_nickname(nickname)

        logger.info(f"🔵 Criando usuário no banco (role: {role})...")
        user = User(
            email=payload.email,
            password_hash=get_password_hash(payload.password),
            role=role,
            nickname=nickname,
            email_verificado=False,  # Email precisa ser verificado
        )

        try:
            self.db.add(user)
            self.db.flush()
            logger.info(f"✅ Usuário criado com ID: {user.id}")
        except IntegrityError as exc:
            logger.error(f"❌ Erro ao criar usuário: {exc}")
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="Email já cadastrado"
            ) from exc

        if role == UserRole.SELLER and payload.company:
            logger.info("🔵 Criando empresa e atividades...")
            company, activities = self._build_company(user.id, payload.company)
            logger.info(f"   Empresa: {company.nome_propriedade}")
            logger.info(f"   Atividades: {len(activities)}")
            try:
                self.company_repo.create(company, activities)
                self.db.refresh(user)
                logger.info("✅ Empresa e atividades criadas com sucesso")
            except IntegrityError as exc:
                logger.error(f"❌ Erro ao salvar empresa: {exc}")
                self.db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, detail="Erro ao salvar empresa"
                ) from exc
        elif role == UserRole.SERVICE_PROVIDER and payload.service_provider:
            logger.info("🔵 Criando perfil de prestador...")
            profile = self._build_service_provider(user.id, payload.service_provider)
            logger.info(f"   Serviço: {profile.nome_servico}")
            try:
                self.service_provider_repo.create(profile)
                self.db.refresh(user)
                logger.info("✅ Prestador criado com sucesso")
            except IntegrityError as exc:
                logger.error(f"❌ Erro ao salvar prestador: {exc}")
                self.db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, detail="Erro ao salvar prestador"
                ) from exc
        elif role == UserRole.BUYER and payload.buyer_profile:
            logger.info("🔵 Criando perfil de comprador...")
            profile = self._build_buyer_profile(user.id, payload.buyer_profile)
            logger.info(f"   Nome: {profile.nome_completo}")
            try:
                self.buyer_profile_repo.create(profile)
                self.db.refresh(user)
                logger.info("✅ Comprador criado com sucesso")
            except IntegrityError as exc:
                logger.error(f"❌ Erro ao salvar comprador: {exc}")
                self.db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Erro ao salvar perfil do comprador",
                ) from exc
        else:
            logger.info("🔵 Fazendo commit do usuário...")
            self.db.commit()
            self.db.refresh(user)
            logger.info("✅ Commit realizado")

        # Envia email de verificação
        try:
            await self._create_and_send_verification_email(user)
            logger.info("✅ Email de verificação enviado")
        except Exception as exc:
            logger.error(f"❌ Erro ao enviar email de verificação: {exc}")
            # Não bloqueia o cadastro se falhar ao enviar email
            # O usuário pode solicitar reenvio depois

        logger.info("=" * 60)
        logger.info("✅ CADASTRO CONCLUÍDO COM SUCESSO")
        logger.info(f"User ID: {user.id}")
        logger.info(f"Email: {user.email}")
        logger.info("=" * 60)

        return user

    def authenticate(self, payload: LoginRequest) -> tuple[str, str, User]:
        user = self.user_repo.get_by_email(payload.email)
        if not user or not verify_password(payload.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas"
            )

        # Verifica se o email foi verificado
        if not user.email_verificado:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Email não verificado. Verifique sua caixa de entrada e clique no link de verificação. Se não recebeu o email, solicite um novo link.",
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

    async def request_password_reset(self, email: str) -> None:
        """
        Solicita recuperação de senha para um email.
        Gera token e envia email de recuperação.
        Por segurança, sempre retorna sucesso mesmo se email não existir.
        """
        from datetime import datetime, timedelta

        user = self.user_repo.get_by_email(email)
        
        # Por segurança, não revela se o email existe
        if not user:
            return

        # Remove token anterior se existir
        existing_token = self.password_reset_repo.get_by_user_id(user.id)
        if existing_token:
            self.password_reset_repo.delete(existing_token)

        # Gera novo token
        token = self.email_service.generate_verification_token()
        expires_at = datetime.utcnow() + timedelta(hours=1)  # Token expira em 1 hora

        reset_token = PasswordResetToken(
            user_id=user.id, token=token, expires_at=expires_at, used=False
        )

        self.password_reset_repo.create(reset_token)

        # Envia email de recuperação
        user_name = user.nickname or user.email.split("@")[0]
        try:
            await self.email_service.send_password_reset_email(user.email, token, user_name)
        except Exception as e:
            # Log do erro para debug
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Erro ao enviar email de recuperação de senha: {str(e)}")
            # Se falhar ao enviar email, não bloqueia (usuário pode tentar novamente)
            # Mas em desenvolvimento, mostra o erro
            if "testing emails" in str(e).lower() or "verify a domain" in str(e).lower():
                logger.warning("=" * 60)
                logger.warning("⚠️  RESEND: Limitação de domínio de teste")
                logger.warning("=" * 60)
                logger.warning(f"Email tentado: {user.email}")
                logger.warning(f"Token gerado: {token}")
                logger.warning(f"URL: {self.email_service.get_password_reset_url(token)}")
                logger.warning("=" * 60)
                logger.warning("Para enviar para outros emails, verifique um domínio na Resend")
                logger.warning("ou use o email cadastrado na conta Resend para testes")
                logger.warning("=" * 60)
            raise

    async def reset_password(self, token: str, new_password: str) -> None:
        """
        Redefine a senha do usuário usando token de recuperação.
        
        Args:
            token: Token de recuperação de senha
            new_password: Nova senha do usuário
            
        Raises:
            HTTPException: Se token inválido, expirado ou já usado
        """
        from datetime import datetime

        reset_token = self.password_reset_repo.get_by_token(token)

        if not reset_token:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Token de recuperação inválido ou expirado",
            )

        if reset_token.expires_at < datetime.utcnow():
            self.password_reset_repo.delete(reset_token)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token de recuperação expirado. Solicite um novo token.",
            )

        if reset_token.used:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token de recuperação já foi utilizado. Solicite um novo token.",
            )

        # Busca usuário
        user = self.user_repo.get_by_id(reset_token.user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado"
            )

        # Atualiza senha
        user.password_hash = get_password_hash(new_password)
        self.db.commit()
        self.db.refresh(user)

        # Marca token como usado
        reset_token.used = True
        self.db.commit()

        # Remove token usado (opcional, pode manter para auditoria)
        self.password_reset_repo.delete(reset_token)

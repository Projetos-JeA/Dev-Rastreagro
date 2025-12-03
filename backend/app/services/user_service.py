from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.user_repository import UserRepository
from app.repositories.company_repository import CompanyRepository
from app.repositories.service_provider_repository import ServiceProviderRepository
from app.repositories.buyer_profile_repository import BuyerProfileRepository
from app.schemas.user import UserWithCompany, UserProfilesResponse
from app.models.user import UserRole


class UserService:
    def __init__(self, db: Session):
        self.user_repo = UserRepository(db)
        self.company_repo = CompanyRepository(db)
        self.service_repo = ServiceProviderRepository(db)
        self.buyer_profile_repo = BuyerProfileRepository(db)

    def get_me(self, user_id: int) -> UserWithCompany:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado"
            )

        company = None
        service_profile = None
        buyer_profile = None

        # Tenta buscar perfil independente do role (usuário pode ter múltiplos perfis)
        company_obj = self.company_repo.get_by_user_id(user.id)
        service_obj = self.service_repo.get_by_user_id(user.id)
        buyer_obj = self.buyer_profile_repo.get_by_user_id(user.id)

        if company_obj:
            # Busca atividades da empresa
            activities_list = []
            for activity in company_obj.activities:
                activity_dict = {
                    "id": activity.id,
                    "category_id": activity.category_id,
                    "group_id": activity.group_id,
                    "item_id": activity.item_id,
                }
                # Adiciona nomes se disponíveis
                if activity.category:
                    activity_dict["category_name"] = activity.category.name
                if activity.group:
                    activity_dict["group_name"] = activity.group.name
                if activity.item:
                    activity_dict["item_name"] = activity.item.name
                activities_list.append(activity_dict)
            
            # Converte objeto SQLAlchemy para dict
            company = {
                "id": company_obj.id,
                "user_id": company_obj.user_id,
                "nome_propriedade": company_obj.nome_propriedade,
                "cnpj_cpf": company_obj.cnpj_cpf,
                "insc_est_identidade": company_obj.insc_est_identidade,
                "endereco": company_obj.endereco,
                "bairro": company_obj.bairro,
                "cep": company_obj.cep,
                "cidade": company_obj.cidade,
                "estado": company_obj.estado,
                "email": company_obj.email,
                "inicio_atividades": company_obj.inicio_atividades.isoformat() if company_obj.inicio_atividades else None,
                "ramo_atividade": company_obj.ramo_atividade,
                "cnaes": company_obj.cnaes,
                "activities": activities_list,  # Lista de atividades
            }

        if service_obj:
            # Converte objeto SQLAlchemy para dict
            service_profile = {
                "id": service_obj.id,
                "user_id": service_obj.user_id,
                "nome_servico": service_obj.nome_servico,
                "descricao": service_obj.descricao,
                "telefone": service_obj.telefone,
                "email_contato": service_obj.email_contato,
                "cidade": service_obj.cidade,
                "estado": service_obj.estado,
                "tipo_servico": service_obj.tipo_servico,
                "endereco": service_obj.endereco,
                "bairro": service_obj.bairro,
                "cep": service_obj.cep,
                "cnpj_cpf": service_obj.cnpj_cpf,
                "insc_est_identidade": service_obj.insc_est_identidade,
            }

        if buyer_obj:
            # Converte objeto SQLAlchemy para dict
            buyer_profile = {
                "id": buyer_obj.id,
                "user_id": buyer_obj.user_id,
                "nome_completo": buyer_obj.nome_completo,
                "data_nascimento": buyer_obj.data_nascimento.isoformat() if buyer_obj.data_nascimento else None,
                "cpf": buyer_obj.cpf,
                "identidade": buyer_obj.identidade,
                "estado_civil": buyer_obj.estado_civil,
                "naturalidade": buyer_obj.naturalidade,
                "endereco": buyer_obj.endereco,
                "bairro": buyer_obj.bairro,
                "cep": buyer_obj.cep,
                "cidade": buyer_obj.cidade,
                "estado": buyer_obj.estado,
            }

        # Determina perfis disponíveis baseado nos dados existentes
        # IMPORTANTE: Verifica se os perfis EXISTEM no banco, não apenas o role principal
        available_roles = []
        if buyer_obj:
            available_roles.append("buyer")
        if company_obj:
            available_roles.append("seller")
        if service_obj:
            available_roles.append("service_provider")
        
        # Log para debug (pode remover depois)
        if len(available_roles) > 1:
            print(f"🔍 [DEBUG] Usuário {user.email} tem {len(available_roles)} perfis: {available_roles}")
        
        # Se não encontrou nenhum perfil, usa o role principal como fallback
        # (caso raro, mas pode acontecer)
        if not available_roles:
            available_roles.append(user.role.value)
            print(f"⚠️  [DEBUG] Usuário {user.email} não tem perfis, usando role principal: {user.role.value}")

        data = {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "nickname": user.nickname,
            "created_at": user.created_at,
            "updated_at": user.updated_at,
            "company": company,
            "service_profile": service_profile,
            "buyer_profile": buyer_profile,
            "roles": available_roles,  # Array de perfis disponíveis (sempre retorna array)
        }

        return UserWithCompany.model_validate(data)

    def get_available_profiles(self, user_id: int) -> UserProfilesResponse:
        """Retorna os perfis disponíveis do usuário"""
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado"
            )

        available_profiles = []

        # Verifica se tem buyer_profile
        buyer_profile = self.buyer_profile_repo.get_by_user_id(user_id)
        if buyer_profile:
            available_profiles.append({"role": "buyer", "has_profile": True, "label": "Comprador"})

        # Verifica se tem company (seller)
        company = self.company_repo.get_by_user_id(user_id)
        if company:
            available_profiles.append({"role": "seller", "has_profile": True, "label": "Vendedor/Produtor"})

        # Verifica se tem service_provider
        service_profile = self.service_repo.get_by_user_id(user_id)
        if service_profile:
            available_profiles.append({"role": "service_provider", "has_profile": True, "label": "Prestador"})

        return UserProfilesResponse(
            current_role=user.role,
            available_profiles=available_profiles,
        )

"""Service para gerenciar cotações"""

import json

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.quotation import Quotation, QuotationStatus
from app.repositories.company_repository import CompanyRepository
from app.repositories.quotation_repository import QuotationRepository
from app.repositories.user_repository import UserRepository
from app.schemas.quotation import QuotationCreate, QuotationResponse, QuotationUpdate
from app.services.ai.matching_service import MatchingService


class QuotationService:
    def __init__(self, db: Session):
        self.db = db
        self.quotation_repo = QuotationRepository(db)
        self.user_repo = UserRepository(db)
        self.company_repo = CompanyRepository(db)
        self.matching_service = MatchingService(db)

    def create_quotation(
        self, user_id: int, payload: QuotationCreate, quotation_type: str = "offer"
    ) -> Quotation:
        """
        Cria uma nova cotação ou oferta

        REGRAS:
        - OFERTA (offer): TODOS podem criar (vendedor, comprador, prestador) - produto/serviço à venda
        - COTAÇÃO (quotation): Apenas COMPRADORES criam - o que estão procurando

        Args:
            user_id: ID do usuário criador
            payload: Dados da cotação/oferta
            quotation_type: "quotation" (comprador cria) ou "offer" (todos criam)
        """
        import logging

        from app.models.quotation import QuotationType

        logger = logging.getLogger(__name__)

        logger.info(f"🚀 Criando {quotation_type} para usuário {user_id}")
        logger.info(f"📋 Dados recebidos: title={payload.title}, category={payload.category}")

        user = self.user_repo.get_by_id(user_id)
        if not user:
            logger.error(f"❌ Usuário {user_id} não encontrado")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado"
            )

        # Determina tipo e valida permissões
        if quotation_type == "offer":
            # OFERTA: TODOS podem criar (produtor, fornecedor, prestador)
            # Determina seller_type baseado nos perfis do usuário
            seller_id = user_id
            buyer_id = None

            # Verifica quais perfis o usuário tem
            company_obj = self.company_repo.get_by_user_id(user_id)
            from app.repositories.service_provider_repository import ServiceProviderRepository

            service_repo = ServiceProviderRepository(self.db)
            service_obj = service_repo.get_by_user_id(user_id)

            # Prioridade: service_provider > company > buyer
            if service_obj:
                seller_type = "service_provider"
            elif company_obj:
                seller_type = "company"
            else:
                # Produtor (buyer) criando oferta (ex: vendendo excedente)
                seller_type = "buyer"
            logger.info(f"✅ Oferta criada. Seller type: {seller_type}, User: {user.email}")

        elif quotation_type == "quotation":
            # COTAÇÃO: TODOS podem criar (o que estão procurando)
            # REGRAS:
            # ✅ TODOS os perfis podem criar cotação (produtor, fornecedor, prestador)
            seller_id = None
            seller_type = None
            buyer_id = user_id
            logger.info(f"✅ Cotação criada por usuário {user_id} ({user.email})")
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tipo inválido. Use 'quotation' ou 'offer'",
            )

        # Converte images para JSON string
        images_json = None
        if payload.images:
            images_json = json.dumps(payload.images)

        quotation = Quotation(
            type=QuotationType.QUOTATION.value
            if quotation_type == "quotation"
            else QuotationType.OFFER.value,
            seller_id=seller_id,
            buyer_id=buyer_id,
            seller_type=seller_type,
            title=payload.title,
            description=payload.description,
            category=payload.category,
            product_type=payload.product_type,
            location_city=payload.location_city,
            location_state=payload.location_state,
            price=payload.price,
            quantity=payload.quantity,
            unit=payload.unit,
            expires_at=payload.expires_at,
            image_url=payload.image_url,
            images=images_json,
            free_shipping=payload.free_shipping,
            discount_percentage=payload.discount_percentage,
            installments=payload.installments,
            stock=payload.stock,
            status=QuotationStatus.ACTIVE,
        )

        created_quotation = self.quotation_repo.create(quotation)
        logger.info(
            f"✅ {quotation_type.capitalize()} criada com sucesso! ID: {created_quotation.id}, Título: {created_quotation.title}"
        )

        return created_quotation

    def get_quotation(self, quotation_id: int) -> Quotation | None:
        """Busca uma cotação por ID"""
        return self.quotation_repo.get_by_id(quotation_id)

    def list_quotations(
        self, category: str | None = None, limit: int = 100, offset: int = 0
    ) -> list[Quotation]:
        """Lista cotações ativas"""
        if category:
            return self.quotation_repo.list_by_category(category, limit, offset)
        return self.quotation_repo.list_active(limit, offset)

    def list_my_quotations(self, user_id: int) -> list[Quotation]:
        """Lista cotações e ofertas de um usuário (tanto como comprador quanto vendedor)"""
        import logging

        logger = logging.getLogger(__name__)

        logger.info(f"📋 Listando cotações/ofertas do usuário {user_id}")

        # Busca ofertas criadas pelo usuário (como vendedor)
        offers = self.quotation_repo.get_by_seller_id(user_id)

        # Busca cotações criadas pelo usuário (como comprador)
        quotations = self.quotation_repo.get_by_buyer_id(user_id)

        # Combina e ordena por data de criação (mais recente primeiro)
        all_items = offers + quotations
        all_items.sort(key=lambda x: x.created_at, reverse=True)

        logger.info(
            f"✅ Encontradas {len(offers)} ofertas e {len(quotations)} cotações para o usuário {user_id}"
        )

        return all_items

    def update_quotation(
        self, quotation_id: int, user_id: int, payload: QuotationUpdate
    ) -> Quotation:
        """
        Atualiza uma cotação ou oferta

        Valida se o usuário é o dono (seller_id para ofertas, buyer_id para cotações)
        """
        quotation = self.quotation_repo.get_by_id(quotation_id)
        if not quotation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Cotação não encontrada"
            )

        # Valida permissão: dono da oferta (seller_id) ou dono da cotação (buyer_id)
        is_owner = False
        if quotation.type == "offer" and quotation.seller_id == user_id:
            is_owner = True
        elif quotation.type == "quotation" and quotation.buyer_id == user_id:
            is_owner = True

        if not is_owner:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não tem permissão para editar esta cotação/oferta",
            )

        # Atualiza campos
        update_data = payload.dict(exclude_unset=True)
        if "images" in update_data and update_data["images"]:
            update_data["images"] = json.dumps(update_data["images"])

        for field, value in update_data.items():
            setattr(quotation, field, value)

        return self.quotation_repo.update(quotation)

    def delete_quotation(self, quotation_id: int, user_id: int) -> None:
        """
        Deleta uma cotação ou oferta

        Valida se o usuário é o dono (seller_id para ofertas, buyer_id para cotações)
        """
        quotation = self.quotation_repo.get_by_id(quotation_id)
        if not quotation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Cotação não encontrada"
            )

        # Valida permissão: dono da oferta (seller_id) ou dono da cotação (buyer_id)
        is_owner = False
        if quotation.type == "offer" and quotation.seller_id == user_id:
            is_owner = True
        elif quotation.type == "quotation" and quotation.buyer_id == user_id:
            is_owner = True

        if not is_owner:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não tem permissão para deletar esta cotação/oferta",
            )

        self.quotation_repo.delete(quotation)

    def get_relevant_quotations(
        self, buyer_id: int, limit: int = 100, offset: int = 0
    ) -> list[Quotation]:
        """
        Retorna OFERTAS relevantes para um comprador usando IA.

        LÓGICA DE MATCH:
        1. Busca COTAÇÕES do comprador (o que ele está procurando)
        2. Faz match entre OFERTAS e COTAÇÕES do comprador
        3. Considera perfil do comprador (atividades, localização)
        4. Considera interações do comprador (histórico de cliques, favoritos, etc)

        Score:
        - 50% match direto entre oferta e cotação do comprador
        - 30% baseado em comportamento (interações do usuário)
        - 20% baseado em perfil (atividades, localização)

        Ordena por score de relevância (maior primeiro)
        """
        import logging

        logger = logging.getLogger(__name__)

        user = self.user_repo.get_by_id(buyer_id)
        if not user:
            logger.warning(f"Usuário {buyer_id} não encontrado")
            return []

        # 1. Busca COTAÇÕES do usuário (o que ele está procurando)
        user_quotations = self.quotation_repo.get_by_buyer_id(buyer_id)
        logger.info(f"📋 Usuário {buyer_id} tem {len(user_quotations)} cotações ativas")

        # 2. Busca OFERTAS do usuário (o que ele está vendendo)
        user_offers = self.quotation_repo.get_by_seller_id(buyer_id)
        logger.info(f"📦 Usuário {buyer_id} tem {len(user_offers)} ofertas ativas")

        # 3. Determina o que mostrar:
        # - Se tem COTAÇÕES: mostra OFERTAS relevantes (excluindo as próprias)
        # - Se tem OFERTAS: mostra COTAÇÕES relevantes (excluindo as próprias)
        # - Se tem ambos: prioriza mostrar OFERTAS (baseado nas cotações)

        if user_quotations:
            # Usuário tem cotações → mostra OFERTAS relevantes
            all_offers = self.quotation_repo.list_active(
                limit=100, offset=0, quotation_type="offer"
            )
            # Remove ofertas próprias do usuário
            all_offers = [o for o in all_offers if o.seller_id != buyer_id]

            if not all_offers:
                logger.info("Nenhuma oferta ativa encontrada")
                return []

            logger.info(f"🔍 Processando {len(all_offers)} ofertas para usuário {buyer_id}...")
            logger.info(
                f"📊 Match baseado em {len(user_quotations)} cotações do usuário + perfil + interações"
            )

            # Constrói perfil do usuário para análise
            buyer_profile = self.matching_service._build_buyer_profile(buyer_id)

            # Calcula score para cada oferta
            offers_with_scores = []
            for offer in all_offers:
                try:
                    score = self._calculate_offer_score(
                        buyer_id=buyer_id,
                        buyer_quotations=user_quotations,
                        buyer_profile=buyer_profile,
                        offer=offer,
                    )
                    offers_with_scores.append({"quotation": offer, "score": score})
                except Exception as e:
                    logger.warning(f"Erro ao calcular score para oferta {offer.id}: {e}")
                    score = self._calculate_category_score(buyer_profile, offer)
                    offers_with_scores.append({"quotation": offer, "score": score})

            logger.info(f"✅ Scores calculados para {len(offers_with_scores)} ofertas")

            # Ordena por score (maior primeiro)
            offers_with_scores.sort(key=lambda x: x["score"], reverse=True)

            # Separa por relevância
            high_relevance = [q for q in offers_with_scores if q["score"] >= 80]
            medium_relevance = [q for q in offers_with_scores if 50 <= q["score"] < 80]

            logger.info(f"📊 Relevância: {len(high_relevance)} alta, {len(medium_relevance)} média")

            # Combina: 90% relevantes primeiro, depois 10% menos relevantes
            high_limit = int(limit * 0.9)
            medium_limit = limit - high_limit

            result = high_relevance[:high_limit] + medium_relevance[:medium_limit]
            # Ajusta filtro: se não houver resultados com score >= 50, aceita score >= 30
            if not result or len(result) < 5:
                logger.warning(f"⚠️ Poucos resultados com score >= 50 ({len(result)}). Reduzindo threshold para 30.")
                # Tenta com threshold menor
                all_with_scores = [q for q in offers_with_scores if q["score"] >= 30]
                all_with_scores.sort(key=lambda x: x["score"], reverse=True)
                result = all_with_scores[:limit]
            else:
                result = [q for q in result if q["score"] >= 50]

            logger.info(f"✅ Retornando {len(result)} ofertas relevantes para o usuário {buyer_id}")
            if result:
                scores_list = [r['score'] for r in result]
                logger.info(f"📊 Scores: min={min(scores_list):.1f}, max={max(scores_list):.1f}, avg={sum(scores_list)/len(scores_list):.1f}")
                # Log dos top 5
                for i, r in enumerate(result[:5]):
                    logger.info(f"   {i+1}. Score: {r['score']:.1f} - {r['quotation'].title} (seller: {r['quotation'].seller_id})")
            else:
                logger.warning(f"⚠️ Nenhum resultado retornado! Total de ofertas processadas: {len(offers_with_scores)}")
                # Se não há resultados, retorna pelo menos os top 10 com score >= 30
                fallback = [q for q in offers_with_scores if q["score"] >= 30]
                fallback.sort(key=lambda x: x["score"], reverse=True)
                if fallback:
                    logger.info(f"🔄 Usando fallback: retornando {len(fallback[:10])} ofertas com score >= 30")
                    return [q["quotation"] for q in fallback[:10]]
                else:
                    logger.error(f"❌ Nenhuma oferta passou no filtro mínimo (score >= 30). Total processado: {len(offers_with_scores)}")
                    # Último recurso: retorna todas ordenadas por score
                    all_sorted = sorted(offers_with_scores, key=lambda x: x["score"], reverse=True)
                    logger.warning(f"⚠️ Retornando top {min(10, len(all_sorted))} ofertas sem filtro de score")
                    return [q["quotation"] for q in all_sorted[:10]]
            
            return [q["quotation"] for q in result[:limit]]

        elif user_offers:
            # Usuário tem ofertas → mostra COTAÇÕES relevantes
            all_quotations = self.quotation_repo.list_active(
                limit=100, offset=0, quotation_type="quotation"
            )
            # Remove cotações próprias do usuário
            all_quotations = [q for q in all_quotations if q.buyer_id != buyer_id]

            if not all_quotations:
                logger.info("Nenhuma cotação ativa encontrada")
                return []

            logger.info(f"🔍 Processando {len(all_quotations)} cotações para usuário {buyer_id}...")
            logger.info(
                f"📊 Match baseado em {len(user_offers)} ofertas do usuário + perfil + interações"
            )

            # Constrói perfil do usuário para análise
            buyer_profile = self.matching_service._build_buyer_profile(buyer_id)

            # Calcula score para cada cotação (invertido: cotação vs ofertas do usuário)
            quotations_with_scores = []
            for quotation in all_quotations:
                try:
                    # Score baseado em match entre cotação e ofertas do usuário
                    score = self._calculate_quotation_score(
                        seller_id=buyer_id,
                        seller_offers=user_offers,
                        seller_profile=buyer_profile,
                        quotation=quotation,
                    )
                    quotations_with_scores.append({"quotation": quotation, "score": score})
                except Exception as e:
                    logger.warning(f"Erro ao calcular score para cotação {quotation.id}: {e}")
                    score = self._calculate_category_score(buyer_profile, quotation)
                    quotations_with_scores.append({"quotation": quotation, "score": score})

            logger.info(f"✅ Scores calculados para {len(quotations_with_scores)} cotações")

            # Ordena por score (maior primeiro)
            quotations_with_scores.sort(key=lambda x: x["score"], reverse=True)

            # Separa por relevância
            high_relevance = [q for q in quotations_with_scores if q["score"] >= 80]
            medium_relevance = [q for q in quotations_with_scores if 50 <= q["score"] < 80]

            logger.info(f"📊 Relevância: {len(high_relevance)} alta, {len(medium_relevance)} média")

            # Combina: 90% relevantes primeiro, depois 10% menos relevantes
            high_limit = int(limit * 0.9)
            medium_limit = limit - high_limit

            result = high_relevance[:high_limit] + medium_relevance[:medium_limit]
            result = [q for q in result if q["score"] >= 50]

            logger.info(
                f"✅ Retornando {len(result)} cotações relevantes para o usuário {buyer_id}"
            )
            return [q["quotation"] for q in result[:limit]]

        else:
            # Usuário não tem cotações nem ofertas → mostra matches baseados apenas no perfil
            # Para fornecedores/prestadores: mostra cotações relevantes ao perfil deles
            logger.info(
                f"Usuário {buyer_id} não tem cotações nem ofertas. Buscando matches por perfil..."
            )

            # Verifica se é fornecedor ou prestador
            company_obj = self.company_repo.get_by_user_id(buyer_id)
            from app.repositories.service_provider_repository import ServiceProviderRepository

            service_repo = ServiceProviderRepository(self.db)
            service_obj = service_repo.get_by_user_id(buyer_id)

            if company_obj or service_obj:
                # É fornecedor ou prestador → mostra COTAÇÕES relevantes ao perfil
                all_quotations = self.quotation_repo.list_active(
                    limit=100, offset=0, quotation_type="quotation"
                )
                # Remove cotações próprias do usuário
                all_quotations = [q for q in all_quotations if q.buyer_id != buyer_id]

                if not all_quotations:
                    logger.info("Nenhuma cotação ativa encontrada")
                    return []

                logger.info(
                    f"🔍 Processando {len(all_quotations)} cotações para fornecedor/prestador {buyer_id}..."
                )
                logger.info("📊 Match baseado apenas no perfil do fornecedor/prestador")

                # Constrói perfil do usuário para análise
                buyer_profile = self.matching_service._build_buyer_profile(buyer_id)

                # Calcula score para cada cotação baseado no perfil
                quotations_with_scores = []
                for quotation in all_quotations:
                    try:
                        # Score baseado apenas no perfil (atividades, categoria)
                        score = self._calculate_category_score(buyer_profile, quotation)
                        # Aumenta score se categoria/produto combina com perfil
                        if quotation.product_type:
                            profile_categories = buyer_profile.get("categories", [])
                            if (
                                quotation.category.value in profile_categories
                                or "both" in profile_categories
                            ):
                                score += 20.0
                        quotations_with_scores.append({"quotation": quotation, "score": score})
                    except Exception as e:
                        logger.warning(f"Erro ao calcular score para cotação {quotation.id}: {e}")
                        score = 30.0  # Score mínimo
                        quotations_with_scores.append({"quotation": quotation, "score": score})

                logger.info(f"✅ Scores calculados para {len(quotations_with_scores)} cotações")

                # Ordena por score (maior primeiro)
                quotations_with_scores.sort(key=lambda x: x["score"], reverse=True)

                # Separa por relevância
                high_relevance = [q for q in quotations_with_scores if q["score"] >= 50]
                medium_relevance = [q for q in quotations_with_scores if 30 <= q["score"] < 50]

                logger.info(
                    f"📊 Relevância: {len(high_relevance)} alta, {len(medium_relevance)} média"
                )

                # Combina: 90% relevantes primeiro, depois 10% menos relevantes
                high_limit = int(limit * 0.9)
                medium_limit = limit - high_limit

                result = high_relevance[:high_limit] + medium_relevance[:medium_limit]
                result = [
                    q for q in result if q["score"] >= 30
                ]  # Score mínimo mais baixo para perfil

                logger.info(
                    f"✅ Retornando {len(result)} cotações relevantes para o fornecedor/prestador {buyer_id}"
                )
                return [q["quotation"] for q in result[:limit]]
            else:
                # Não é fornecedor nem prestador → retorna lista vazia
                logger.info(
                    f"Usuário {buyer_id} não tem perfil de fornecedor/prestador. Retornando lista vazia."
                )
                return []

    def _calculate_offer_score(
        self,
        buyer_id: int,
        buyer_quotations: list[Quotation],
        buyer_profile: dict,
        offer: Quotation,
    ) -> float:
        """
        Calcula score de relevância de uma oferta para um comprador

        Score:
        - 50% match direto entre oferta e cotações do comprador
        - 30% baseado em interações do comprador
        - 20% baseado em perfil do comprador
        """
        import logging

        logger = logging.getLogger(__name__)

        score = 0.0
        max_score = 100.0

        # 1. MATCH DIRETO COM COTAÇÕES (50 pontos)
        if buyer_quotations:
            match_scores = []
            perfect_match = False
            
            for buyer_quotation in buyer_quotations:
                # MATCH PERFEITO: categoria E produto_type idênticos = 100 pontos
                category_match = offer.category == buyer_quotation.category
                product_match = False
                
                if offer.product_type and buyer_quotation.product_type:
                    # Compara produto_type (case insensitive, remove espaços extras)
                    offer_product = offer.product_type.lower().strip()
                    quote_product = buyer_quotation.product_type.lower().strip()
                    
                    # Remove palavras comuns para melhor matching
                    common_words = {'de', 'da', 'do', 'para', 'com', 'em', 'a', 'o', 'e', 'o', 'a'}
                    offer_words = set(w for w in offer_product.split() if w not in common_words)
                    quote_words = set(w for w in quote_product.split() if w not in common_words)
                    
                    # Match perfeito: strings idênticas ou todas as palavras principais iguais
                    if offer_product == quote_product or (offer_words == quote_words and len(offer_words) > 0):
                        product_match = True
                        perfect_match = True
                        # Match perfeito = 100 pontos total
                        logger.info(f"🎯 MATCH PERFEITO encontrado! Oferta '{offer.title}' (produto: '{offer.product_type}') == Cotação '{buyer_quotation.title}' (produto: '{buyer_quotation.product_type}')")
                        return 100.0
                    elif offer_words & quote_words:  # Intersecção de palavras
                        # Tem palavras em comum
                        common_count = len(offer_words & quote_words)
                        total_count = len(offer_words | quote_words)
                        similarity = common_count / total_count if total_count > 0 else 0
                        if similarity >= 0.5:  # 50% ou mais de palavras em comum
                            match_scores.append(20.0)  # Match parcial bom
                        else:
                            match_scores.append(15.0)  # Match parcial
                
                # Se categoria combina
                if category_match:
                    if product_match:
                        # Já tratado acima (match perfeito)
                        pass
                    else:
                        match_scores.append(40.0)  # Categoria combina, produto não
                elif offer.category.value == "both" or buyer_quotation.category.value == "both":
                    match_scores.append(25.0)  # Categoria parcial

            if match_scores:
                # Usa o melhor match (mas não perfeito)
                score += min(max(match_scores), 50.0)
            else:
                # Se categoria combina mas produto não, dá pelo menos 30 pontos (aumentado)
                if any(offer.category == q.category for q in buyer_quotations):
                    score += 30.0
                    logger.debug(f"Match de categoria apenas: +30 pontos para oferta {offer.id}")
        else:
            # Se não tem cotações, não dá match direto
            score += 0.0

        # 2. INTERAÇÕES DO COMPRADOR (30 pontos)
        interaction_score = 0.0
        try:
            interactions = self.matching_service._get_user_interactions(buyer_id)
            # Verifica se o comprador já interagiu com ofertas similares
            for interaction in interactions:
                if interaction.get("quotation_data", {}).get("category") == offer.category.value:
                    interaction_score += 5.0
                if interaction.get("quotation_data", {}).get("product_type") == offer.product_type:
                    interaction_score += 10.0
            # Se não tem interações, dá score base de 10 pontos
            if interaction_score == 0.0:
                interaction_score = 10.0
            score += min(interaction_score, 30.0)  # Máximo 30 pontos
        except Exception as e:
            logger.warning(f"Erro ao calcular score de interações: {e}")
            # Se der erro, dá score base
            score += 10.0

        # 3. PERFIL DO COMPRADOR (20 pontos)
        profile_score = self._calculate_fast_score(buyer_profile, offer)
        # Ajusta para máximo de 20 pontos, mas garante mínimo de 10
        profile_adjusted = max(profile_score * 0.2, 10.0)
        score += min(profile_adjusted, 20.0)

        return min(score, max_score)

    def _calculate_fast_score(self, buyer_profile: dict, quotation: Quotation) -> float:
        """
        Calcula score rápido baseado apenas em regras (sem IA pesada)
        Usado para performance inicial
        """
        score = 0.0

        # 1. Match de categoria (60 pontos)
        profile_categories = buyer_profile.get("categories", [])
        quotation_category = quotation.category.value.lower() if quotation.category else ""

        if quotation_category in profile_categories:
            score += 60.0
        elif "both" in profile_categories and quotation_category in ["agriculture", "livestock"]:
            score += 50.0
        elif not profile_categories:
            # Se não tem categorias, assume interesse geral
            score += 40.0

        # 2. Match básico de tipo de produto (20 pontos)
        if quotation.product_type:
            product_lower = quotation.product_type.lower()
            # Palavras-chave comuns
            if any(
                keyword in product_lower for keyword in ["ração", "sal", "mineral", "suplemento"]
            ):
                if "livestock" in profile_categories or "both" in profile_categories:
                    score += 20.0
            elif any(
                keyword in product_lower for keyword in ["semente", "fertilizante", "defensivo"]
            ):
                if "agriculture" in profile_categories or "both" in profile_categories:
                    score += 20.0

        # 3. Score base mínimo (20 pontos)
        score += 20.0

        return min(score, 100.0)

    def _calculate_quotation_score(
        self,
        seller_id: int,
        seller_offers: list[Quotation],
        seller_profile: dict,
        quotation: Quotation,
    ) -> float:
        """
        Calcula score de relevância de uma cotação para um vendedor (invertido)

        Score:
        - 50% match direto entre cotação e ofertas do vendedor
        - 30% baseado em interações do vendedor
        - 20% baseado em perfil do vendedor
        """
        import logging

        logger = logging.getLogger(__name__)

        score = 0.0
        max_score = 100.0

        # 1. MATCH DIRETO COM OFERTAS (50 pontos)
        if seller_offers:
            match_scores = []
            for seller_offer in seller_offers:
                # Compara categoria
                if quotation.category == seller_offer.category:
                    match_scores.append(30.0)
                elif quotation.category.value == "both" or seller_offer.category.value == "both":
                    match_scores.append(20.0)

                # Compara tipo de produto
                if quotation.product_type and seller_offer.product_type:
                    if quotation.product_type.lower() == seller_offer.product_type.lower():
                        match_scores.append(20.0)
                    elif any(
                        word in quotation.product_type.lower()
                        for word in seller_offer.product_type.lower().split()
                    ):
                        match_scores.append(10.0)

            if match_scores:
                # Usa o melhor match
                score += min(max(match_scores), 50.0)
        else:
            # Se não tem ofertas, não dá match direto
            score += 0.0

        # 2. INTERAÇÕES DO VENDEDOR (30 pontos)
        try:
            interactions = self.matching_service._get_user_interactions(seller_id)
            # Verifica se o vendedor já interagiu com cotações similares
            for interaction in interactions:
                if (
                    interaction.get("quotation_data", {}).get("category")
                    == quotation.category.value
                ):
                    score += 5.0
                if (
                    interaction.get("quotation_data", {}).get("product_type")
                    == quotation.product_type
                ):
                    score += 10.0
            score = min(score + 10.0, score + 30.0)  # Máximo 30 pontos
        except Exception as e:
            logger.warning(f"Erro ao calcular score de interações: {e}")

        # 3. PERFIL DO VENDEDOR (20 pontos)
        profile_score = self._calculate_fast_score(seller_profile, quotation)
        # Ajusta para máximo de 20 pontos
        score += min(profile_score * 0.2, 20.0)

        return min(score, max_score)

    def _calculate_category_score(self, buyer_profile: dict, quotation: Quotation) -> float:
        """Score mínimo baseado apenas em categoria"""
        profile_categories = buyer_profile.get("categories", [])
        quotation_category = quotation.category.value.lower() if quotation.category else ""

        if quotation_category in profile_categories:
            return 50.0
        elif "both" in profile_categories:
            return 40.0
        else:
            return 30.0

    def to_response(self, quotation: Quotation, include_seller: bool = True) -> QuotationResponse:
        """Converte Quotation para QuotationResponse"""
        images = None
        if quotation.images:
            try:
                images = json.loads(quotation.images)
            except Exception:
                images = None

        seller_nickname = None
        buyer_nickname = None

        if include_seller:
            if quotation.seller:
                seller_nickname = quotation.seller.nickname
            if quotation.buyer:
                buyer_nickname = quotation.buyer.nickname

        # Os enums QuotationStatus e QuotationCategory herdam de str, então o Pydantic serializa corretamente
        return QuotationResponse(
            id=quotation.id,
            type=str(quotation.type),  # Garante que seja string
            seller_id=quotation.seller_id,
            buyer_id=quotation.buyer_id,
            seller_type=quotation.seller_type,
            title=quotation.title,
            description=quotation.description,
            category=quotation.category,  # Enum (herda de str, serializa automaticamente)
            product_type=quotation.product_type,
            location_city=quotation.location_city,
            location_state=quotation.location_state,
            price=quotation.price,
            quantity=quotation.quantity,
            unit=quotation.unit,
            expires_at=quotation.expires_at,
            image_url=quotation.image_url,
            images=images,
            free_shipping=quotation.free_shipping,
            discount_percentage=quotation.discount_percentage,
            installments=quotation.installments,
            stock=quotation.stock,
            status=quotation.status,  # Enum (herda de str, serializa automaticamente)
            created_at=quotation.created_at,
            updated_at=quotation.updated_at,
            seller_nickname=seller_nickname,
            buyer_nickname=buyer_nickname,
        )

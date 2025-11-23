"""Rotas para integração com BrasilAPI - Busca de dados de empresa por CNPJ"""

from fastapi import APIRouter, HTTPException, Path
from app.services.brasilapi_service import BrasilAPIService
import re

router = APIRouter(prefix="/cnpj", tags=["CNPJ"])

CNPJ_REGEX = re.compile(r"^\d{14}$")


@router.get("/{cnpj}/debug")
async def get_company_by_cnpj_debug(
    cnpj: str = Path(..., description="CNPJ apenas com números (14 dígitos)")
):
    """
    Endpoint de debug - retorna a resposta completa da BrasilAPI sem processamento
    Útil para verificar a estrutura real dos dados retornados
    """
    clean_cnpj = "".join(filter(str.isdigit, cnpj))
    
    if not CNPJ_REGEX.match(clean_cnpj):
        raise HTTPException(status_code=400, detail="CNPJ inválido. Use exatamente 14 dígitos.")
    
    try:
        dados = await BrasilAPIService.consultar_cnpj(clean_cnpj)
        
        if dados is None:
            raise HTTPException(status_code=404, detail="CNPJ não encontrado na base da Receita Federal.")
        
        # Retorna a resposta completa para debug
        return {
            "cnpj_consultado": clean_cnpj,
            "resposta_completa": dados,
            "campos_disponiveis": list(dados.keys()) if isinstance(dados, dict) else [],
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Erro ao consultar CNPJ na BrasilAPI: {str(e)}"
        )


@router.get("/{cnpj}")
async def get_company_by_cnpj(
    cnpj: str = Path(..., description="CNPJ apenas com números (14 dígitos)")
):
    """
    Busca dados completos da empresa por CNPJ usando BrasilAPI
    
    Args:
        cnpj: CNPJ com ou sem formatação (será sanitizado para apenas números)
        
    Returns:
        Dict com dados da empresa (razão social, nome fantasia, endereço, etc.)
    """
    # Manter apenas dígitos
    clean_cnpj = "".join(filter(str.isdigit, cnpj))
    
    if not CNPJ_REGEX.match(clean_cnpj):
        raise HTTPException(status_code=400, detail="CNPJ inválido. Use exatamente 14 dígitos.")
    
    try:
        dados = await BrasilAPIService.consultar_cnpj(clean_cnpj)
        
        if dados is None:
            raise HTTPException(status_code=404, detail="CNPJ não encontrado na base da Receita Federal.")
        
        # Mapear campos da BrasilAPI para o formato esperado pelo frontend
        # A BrasilAPI retorna muitos campos, vamos mapear os principais
        endereco_completo = dados.get("logradouro", "")
        numero = dados.get("numero", "")
        complemento = dados.get("complemento", "")
        
        # Monta endereço completo
        endereco = endereco_completo
        if numero:
            endereco += f", {numero}"
        if complemento:
            endereco += f" - {complemento}"
        
        # Busca inscrição estadual em diferentes campos possíveis da BrasilAPI
        # A BrasilAPI v1 retorna dados em estrutura específica
        inscricao_estadual = ""
        
        # A BrasilAPI pode retornar a inscrição estadual em diferentes locais:
        # 1. Diretamente no objeto principal
        # 2. Dentro de objeto "estabelecimento" 
        # 3. Dentro de array "estabelecimentos"
        # 4. Com diferentes nomes de campo
        
        # Tenta buscar diretamente
        if "inscricao_estadual" in dados:
            inscricao_estadual = dados.get("inscricao_estadual", "") or ""
        
        # Tenta dentro de objeto estabelecimento (se existir)
        if not inscricao_estadual and "estabelecimento" in dados:
            estabelecimento = dados.get("estabelecimento")
            if isinstance(estabelecimento, dict):
                inscricao_estadual = (
                    estabelecimento.get("inscricao_estadual", "") or
                    estabelecimento.get("inscricao_estadual_estabelecimento", "") or
                    estabelecimento.get("inscricao_estadual_contribuinte", "") or
                    ""
                )
        
        # Tenta dentro de array estabelecimentos (se existir)
        if not inscricao_estadual and "estabelecimentos" in dados:
            estabelecimentos = dados.get("estabelecimentos", [])
            if isinstance(estabelecimentos, list) and len(estabelecimentos) > 0:
                primeiro_estabelecimento = estabelecimentos[0]
                if isinstance(primeiro_estabelecimento, dict):
                    inscricao_estadual = (
                        primeiro_estabelecimento.get("inscricao_estadual", "") or
                        primeiro_estabelecimento.get("inscricao_estadual_estabelecimento", "") or
                        ""
                    )
        
        # Log para debug - mostra estrutura completa
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"🔍 DEBUG CNPJ - Campos principais: {list(dados.keys())[:10]}...")
        
        # Se não encontrou, loga estrutura para investigação
        if not inscricao_estadual:
            logger.warning(f"⚠️  Inscrição Estadual não encontrada. Verifique estrutura da resposta.")
            if "estabelecimento" in dados:
                estabelecimento = dados.get("estabelecimento")
                if isinstance(estabelecimento, dict):
                    logger.info(f"🔍 Campos em 'estabelecimento': {list(estabelecimento.keys())}")
        
        logger.info(f"✅ Inscrição Estadual encontrada: '{inscricao_estadual or 'VAZIA/NÃO ENCONTRADA'}'")
        
        return {
            "cnpj": dados.get("cnpj", ""),
            "razao_social": dados.get("razao_social", ""),
            "nome_fantasia": dados.get("nome_fantasia", ""),
            "situacao_cadastral": dados.get("situacao_cadastral"),
            "descricao_situacao": dados.get("descricao_situacao_cadastral", ""),
            "data_inicio_atividade": dados.get("data_inicio_atividade"),
            "cnae_fiscal_principal": dados.get("cnae_fiscal_principal", {}).get("codigo", "") if isinstance(dados.get("cnae_fiscal_principal"), dict) else "",
            "descricao_cnae": dados.get("cnae_fiscal_principal", {}).get("descricao", "") if isinstance(dados.get("cnae_fiscal_principal"), dict) else "",
            "endereco": endereco.strip() or endereco_completo,
            "bairro": dados.get("bairro", ""),
            "cep": dados.get("cep", "").replace("-", "") if dados.get("cep") else "",
            "cidade": dados.get("municipio", ""),
            "estado": dados.get("uf", ""),
            "telefone": dados.get("ddd_telefone_1", ""),
            "email": dados.get("email", ""),
            "inscricao_estadual": inscricao_estadual,
        }
        
    except HTTPException:
        # Re-lança exceções HTTP
        raise
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Erro ao consultar CNPJ na BrasilAPI: {str(e)}"
        )


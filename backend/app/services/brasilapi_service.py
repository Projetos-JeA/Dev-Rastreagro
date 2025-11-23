"""Service para integração com BrasilAPI - Validação de CNPJ"""

import re
from typing import Optional, Dict, Any
import httpx
from fastapi import HTTPException, status


class BrasilAPIService:
    """
    Service para consulta de CNPJ na BrasilAPI
    
    A BrasilAPI é uma API pública e gratuita que consulta dados da Receita Federal.
    Endpoint: https://brasilapi.com.br/api/cnpj/v1/{cnpj}
    
    Documentação: https://brasilapi.com.br/docs#tag/CNPJ
    """

    BASE_URL = "https://brasilapi.com.br/api/cnpj/v1"

    @staticmethod
    def _sanitize_cnpj(cnpj: str) -> str:
        """Remove formatação do CNPJ, deixando apenas números"""
        return re.sub(r'[^0-9]', '', cnpj)

    @staticmethod
    async def consultar_cnpj(cnpj: str) -> Optional[Dict[str, Any]]:
        """
        Consulta CNPJ na BrasilAPI
        
        Args:
            cnpj: CNPJ com ou sem formatação (14 dígitos)
            
        Returns:
            Dict com dados da empresa ou None se não encontrado
            
        Raises:
            HTTPException: Em caso de erro na requisição
        """
        # Sanitiza o CNPJ (remove formatação)
        clean_cnpj = BrasilAPIService._sanitize_cnpj(cnpj)
        
        # Valida se tem 14 dígitos
        if len(clean_cnpj) != 14:
            return None
        
        url = f"{BrasilAPIService.BASE_URL}/{clean_cnpj}"
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url)
                
                # CNPJ não encontrado
                if response.status_code == 404:
                    return None
                
                # Erro do servidor
                if response.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail=f"Erro ao consultar CNPJ na BrasilAPI: HTTP {response.status_code}"
                    )
                
                return response.json()
                
        except httpx.TimeoutException:
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="Timeout ao consultar CNPJ na BrasilAPI"
            )
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Erro ao consultar CNPJ na BrasilAPI: {str(e)}"
            )

    @staticmethod
    async def validar_cnpj_ativo(cnpj: str) -> tuple[bool, Optional[str]]:
        """
        Valida se o CNPJ existe e está ativo na Receita Federal
        
        Args:
            cnpj: CNPJ a validar
            
        Returns:
            Tuple[bool, Optional[str]]: 
                - (True, None) se CNPJ existe e está ativo
                - (False, mensagem_erro) se CNPJ não existe ou está inativo
        """
        try:
            dados = await BrasilAPIService.consultar_cnpj(cnpj)
            
            # CNPJ não encontrado
            if dados is None:
                return False, "CNPJ não encontrado na base da Receita Federal"
            
            # Verifica situação cadastral
            # situação_cadastral: 2 = ATIVA, outros valores = inativa
            situacao_cadastral = dados.get("situacao_cadastral")
            descricao_situacao = dados.get("descricao_situacao_cadastral", "")
            
            if situacao_cadastral != 2:
                situacao_texto = descricao_situacao if descricao_situacao else f"Código {situacao_cadastral}"
                return False, f"CNPJ não está ativo na Receita Federal. Situação: {situacao_texto}"
            
            # CNPJ válido e ativo
            return True, None
            
        except HTTPException:
            # Re-lança exceções HTTP
            raise
        except Exception as e:
            # Erro inesperado
            return False, f"Erro ao validar CNPJ: {str(e)}"


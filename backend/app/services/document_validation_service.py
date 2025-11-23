"""Service para validação de documentos (CPF/CNPJ)"""

from typing import Tuple, Optional
from app.utils.validators import validate_cpf, validate_cnpj
from app.services.brasilapi_service import BrasilAPIService


class DocumentValidationService:
    """
    Service para validação de documentos brasileiros (CPF/CNPJ)
    
    - CPF: Validação matemática (formato e dígitos verificadores)
    - CNPJ: Validação matemática + consulta na BrasilAPI (Receita Federal)
    
    A BrasilAPI é uma API pública e gratuita que consulta dados da Receita Federal.
    Documentação: https://brasilapi.com.br/docs#tag/CNPJ
    """

    @staticmethod
    def validate_cpf(cpf: str) -> Tuple[bool, str]:
        """
        Valida CPF (formato e dígitos verificadores)
        
        NOTA: Apenas validação matemática. Não há API pública gratuita
        para validar CPF na Receita Federal.
        
        Args:
            cpf: CPF a validar
            
        Returns:
            Tuple[bool, str]: (é_válido, mensagem_erro)
        """
        return validate_cpf(cpf)

    @staticmethod
    def validate_cnpj(cnpj: str) -> Tuple[bool, str]:
        """
        Valida CNPJ (formato e dígitos verificadores)
        
        Args:
            cnpj: CNPJ a validar
            
        Returns:
            Tuple[bool, str]: (é_válido, mensagem_erro)
        """
        return validate_cnpj(cnpj)

    @staticmethod
    async def validate_with_receita_federal(
        document: str, document_type: str
    ) -> Tuple[Optional[bool], Optional[str]]:
        """
        Valida documento na Receita Federal
        
        - CPF: Não há API pública gratuita, retorna None (apenas validação matemática)
        - CNPJ: Consulta na BrasilAPI para verificar se existe e está ativo
        
        Args:
            document: CPF ou CNPJ a validar
            document_type: "cpf" ou "cnpj"
            
        Returns:
            Tuple[Optional[bool], Optional[str]]: 
                - (True, None) se válido e ativo
                - (False, mensagem_erro) se inválido ou inativo
                - (None, None) se validação externa não disponível (CPF)
        """
        if document_type.lower() == "cpf":
            # CPF: apenas validação matemática (não há API pública gratuita)
            return None, None
        
        elif document_type.lower() == "cnpj":
            # CNPJ: validação na BrasilAPI
            try:
                is_valid, error_msg = await BrasilAPIService.validar_cnpj_ativo(document)
                return is_valid, error_msg
            except Exception as e:
                # Em caso de erro na API, retorna erro
                return False, f"Erro ao validar CNPJ na Receita Federal: {str(e)}"
        
        else:
            return False, f"Tipo de documento inválido: {document_type}"


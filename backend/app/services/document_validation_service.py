"""Service para validação de documentos (CPF/CNPJ)"""

from typing import Tuple, Optional
from app.utils.validators import validate_cpf, validate_cnpj


class DocumentValidationService:
    """
    Service para validação de documentos brasileiros (CPF/CNPJ)
    
    NOTA: Não há uma API pública gratuita oficial da Receita Federal
    para validação de CPF/CNPJ. Este service implementa apenas validação
    formal (formato e dígitos verificadores).
    
    Para validação completa com dados da Receita Federal, seria necessário
    usar serviços pagos como:
    - ReceitaWS (pago)
    - BrasilAPI (limitado, apenas consulta básica)
    - Outros serviços comerciais
    
    A estrutura está preparada para que seja possível integrar uma API
    externa no futuro através do método validate_with_receita_federal.
    """

    @staticmethod
    def validate_cpf(cpf: str) -> Tuple[bool, str]:
        """
        Valida CPF (formato e dígitos verificadores)
        
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
    ) -> Tuple[bool, Optional[str]]:
        """
        Valida documento na Receita Federal (preparado para integração futura)
        
        NOTA: Atualmente não implementado pois não há API pública gratuita.
        Este método está preparado para integração futura com serviços pagos.
        
        Args:
            document: CPF ou CNPJ a validar
            document_type: "cpf" ou "cnpj"
            
        Returns:
            Tuple[bool, Optional[str]]: (é_válido_na_receita, mensagem_erro)
            
        Exemplo de uso futuro:
            - Integrar com ReceitaWS (pago)
            - Integrar com BrasilAPI (limitado)
            - Integrar com outros serviços comerciais
        """
        # Por enquanto, retorna None indicando que a validação não foi feita
        # Isso permite que o sistema continue funcionando apenas com validação formal
        return None, None


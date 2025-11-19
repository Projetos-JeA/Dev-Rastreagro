"""Utilitários para formatação de erros de validação"""

from typing import Dict, List
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError


class ValidationErrorResponse:
    """Classe para formatar erros de validação de forma estruturada"""

    @staticmethod
    def format_field_errors(errors: List[Dict]) -> Dict[str, str]:
        """
        Formata erros do Pydantic em um dicionário campo -> mensagem
        
        Args:
            errors: Lista de erros do Pydantic
            
        Returns:
            Dict com campo como chave e mensagem de erro como valor
        """
        field_errors = {}
        
        for error in errors:
            # Extrai o campo do caminho do erro
            field_path = error.get("loc", [])
            if not field_path:
                continue
            
            # Remove "body" do início se existir
            if field_path[0] == "body":
                field_path = field_path[1:]
            
            # Constrói o nome do campo (pode ser aninhado, ex: buyer_profile.nome_completo)
            field_name = ".".join(str(f) for f in field_path)
            
            # Extrai a mensagem
            msg = error.get("msg", "Erro de validação")
            error_type = error.get("type", "")
            
            # Melhora mensagens comuns
            if error_type == "value_error.missing":
                msg = f"O campo '{field_name}' é obrigatório"
            elif error_type == "value_error.email":
                msg = "Email inválido"
            elif error_type == "type_error.str":
                msg = f"O campo '{field_name}' deve ser um texto"
            elif error_type == "value_error.any_str.min_length":
                min_length = error.get("ctx", {}).get("limit_value", "")
                msg = f"O campo '{field_name}' deve ter no mínimo {min_length} caracteres"
            
            field_errors[field_name] = msg
        
        return field_errors


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """
    Handler customizado para erros de validação do FastAPI/Pydantic
    
    Retorna erros no formato:
    {
        "errors": {
            "email": "Email inválido",
            "cpf": "CPF inválido",
            "buyer_profile.nome_completo": "O campo 'nome' só pode conter letras e espaços"
        }
    }
    """
    formatted_errors = ValidationErrorResponse.format_field_errors(exc.errors())
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"errors": formatted_errors}
    )


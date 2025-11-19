"""Rotas para integração com ViaCEP - Busca de endereço por CEP"""

from fastapi import APIRouter, HTTPException, Path
import httpx
import re

router = APIRouter(prefix="/viacep", tags=["ViaCEP"])

CEP_REGEX = re.compile(r"^\d{8}$")


@router.get("/{cep}")
async def get_address_by_cep(
    cep: str = Path(..., description="CEP apenas com números (8 dígitos)")
):
    """
    Busca endereço completo por CEP usando ViaCEP
    
    Args:
        cep: CEP com ou sem formatação (será sanitizado para apenas números)
        
    Returns:
        Dict com dados do endereço (logradouro, bairro, cidade, uf, etc.)
    """
    # manter apenas dígitos
    clean_cep = "".join(filter(str.isdigit, cep))

    if not CEP_REGEX.match(clean_cep):
        raise HTTPException(status_code=400, detail="CEP inválido. Use exatamente 8 dígitos.")

    url = f"https://viacep.com.br/ws/{clean_cep}/json/"

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(url)
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=502,
                detail=f"Erro ao consultar o serviço ViaCEP: {str(e)}"
            )

    if response.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail=f"ViaCEP retornou código HTTP {response.status_code}"
        )

    data = response.json()

    if data.get("erro") is True:
        raise HTTPException(status_code=404, detail="CEP não encontrado na base do ViaCEP.")

    # Retornar o mesmo formato que o front espera
    return {
        "cep": data.get("cep", ""),
        "logradouro": data.get("logradouro", ""),
        "complemento": data.get("complemento", ""),
        "bairro": data.get("bairro", ""),
        "localidade": data.get("localidade", ""),
        "uf": data.get("uf", ""),
        "gia": data.get("gia"),
        "ibge": data.get("ibge"),
        "ddd": data.get("ddd"),
        "siafi": data.get("siafi"),
    }

"""Utilitários de validação para CPF, CNPJ, CEP, nome e senha"""

import re


def validate_cpf(cpf: str) -> tuple[bool, str]:
    """
    Valida CPF brasileiro (formato e dígitos verificadores)

    Args:
        cpf: CPF com ou sem formatação (###.###.###-## ou apenas números)

    Returns:
        Tuple[bool, str]: (é_válido, mensagem_erro)
    """
    # Remove formatação
    cpf_clean = re.sub(r"[^0-9]", "", cpf)

    # Verifica tamanho
    if len(cpf_clean) != 11:
        return False, "CPF deve conter 11 dígitos"

    # Verifica se todos os dígitos são iguais (CPFs inválidos conhecidos)
    if cpf_clean == cpf_clean[0] * 11:
        return False, "CPF inválido"

    # Valida primeiro dígito verificador
    sum_val = sum(int(cpf_clean[i]) * (10 - i) for i in range(9))
    digit1 = 11 - (sum_val % 11)
    if digit1 >= 10:
        digit1 = 0
    if digit1 != int(cpf_clean[9]):
        return False, "CPF inválido"

    # Valida segundo dígito verificador
    sum_val = sum(int(cpf_clean[i]) * (11 - i) for i in range(10))
    digit2 = 11 - (sum_val % 11)
    if digit2 >= 10:
        digit2 = 0
    if digit2 != int(cpf_clean[10]):
        return False, "CPF inválido"

    return True, ""


def validate_cnpj(cnpj: str) -> tuple[bool, str]:
    """
    Valida CNPJ brasileiro (formato e dígitos verificadores)

    Args:
        cnpj: CNPJ com ou sem formatação (##.###.###/####-## ou apenas números)

    Returns:
        Tuple[bool, str]: (é_válido, mensagem_erro)
    """
    # Remove formatação
    cnpj_clean = re.sub(r"[^0-9]", "", cnpj)

    # Verifica tamanho
    if len(cnpj_clean) != 14:
        return False, "CNPJ deve conter 14 dígitos"

    # Verifica se todos os dígitos são iguais (CNPJs inválidos conhecidos)
    if cnpj_clean == cnpj_clean[0] * 14:
        return False, "CNPJ inválido"

    # Valida primeiro dígito verificador
    weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    sum_val = sum(int(cnpj_clean[i]) * weights1[i] for i in range(12))
    digit1 = 11 - (sum_val % 11)
    if digit1 >= 10:
        digit1 = 0
    if digit1 != int(cnpj_clean[12]):
        return False, "CNPJ inválido"

    # Valida segundo dígito verificador
    weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    sum_val = sum(int(cnpj_clean[i]) * weights2[i] for i in range(13))
    digit2 = 11 - (sum_val % 11)
    if digit2 >= 10:
        digit2 = 0
    if digit2 != int(cnpj_clean[13]):
        return False, "CNPJ inválido"

    return True, ""


def validate_cep(cep: str) -> tuple[bool, str]:
    """
    Valida CEP brasileiro (formato)

    Args:
        cep: CEP com ou sem formatação (#####-### ou apenas números)

    Returns:
        Tuple[bool, str]: (é_válido, mensagem_erro)
    """
    # Remove formatação
    cep_clean = re.sub(r"[^0-9]", "", cep)

    # Verifica tamanho
    if len(cep_clean) != 8:
        return False, "CEP deve conter 8 dígitos"

    # Verifica se todos os dígitos são iguais (CEPs inválidos conhecidos)
    if cep_clean == cep_clean[0] * 8:
        return False, "CEP inválido"

    return True, ""


def validate_nome_completo(nome: str) -> tuple[bool, str]:
    """
    Valida nome completo (apenas letras, acentos e espaços)

    Args:
        nome: Nome completo a validar

    Returns:
        Tuple[bool, str]: (é_válido, mensagem_erro)
    """
    if not nome or not nome.strip():
        return False, "Nome completo é obrigatório"

    # Remove espaços extras e verifica se há caracteres inválidos
    nome_normalized = nome.strip()

    # Verifica se contém apenas letras (incluindo acentos), espaços e hífen
    # isalpha() retorna True para letras incluindo acentos unicode
    for char in nome_normalized:
        if not (char.isalpha() or char.isspace() or char == "-"):
            return False, "O campo 'nome' só pode conter letras e espaços"

    # Verifica se tem pelo menos 2 caracteres
    if len(nome_normalized) < 2:
        return False, "Nome deve ter pelo menos 2 caracteres"

    # Verifica se tem pelo menos uma letra (não apenas espaços)
    if not any(char.isalpha() for char in nome_normalized):
        return False, "Nome deve conter pelo menos uma letra"

    return True, ""


def validate_senha(senha: str) -> tuple[bool, list[str]]:
    """
    Valida senha conforme regras de segurança

    Regras:
    - Mínimo 8 caracteres
    - Pelo menos 1 letra maiúscula
    - Pelo menos 1 letra minúscula
    - Pelo menos 1 número
    - Pelo menos 1 caractere especial (! @ # $ % & *)

    Args:
        senha: Senha a validar

    Returns:
        Tuple[bool, list[str]]: (é_válida, lista_de_erros)
    """
    errors = []

    if len(senha) < 8:
        errors.append("A senha deve ter pelo menos 8 caracteres")

    if not re.search(r"[A-Z]", senha):
        errors.append("A senha deve conter pelo menos 1 letra maiúscula")

    if not re.search(r"[a-z]", senha):
        errors.append("A senha deve conter pelo menos 1 letra minúscula")

    if not re.search(r"[0-9]", senha):
        errors.append("A senha deve conter pelo menos 1 número")

    if not re.search(r"[!@#$%&*]", senha):
        errors.append("A senha deve conter pelo menos 1 caractere especial (! @ # $ % & *)")

    return len(errors) == 0, errors


def format_cpf(cpf: str) -> str:
    """Formata CPF para o padrão ###.###.###-##"""
    cpf_clean = re.sub(r"[^0-9]", "", cpf)
    if len(cpf_clean) == 11:
        return f"{cpf_clean[:3]}.{cpf_clean[3:6]}.{cpf_clean[6:9]}-{cpf_clean[9:]}"
    return cpf_clean


def format_cnpj(cnpj: str) -> str:
    """Formata CNPJ para o padrão ##.###.###/####-##"""
    cnpj_clean = re.sub(r"[^0-9]", "", cnpj)
    if len(cnpj_clean) == 14:
        return f"{cnpj_clean[:2]}.{cnpj_clean[2:5]}.{cnpj_clean[5:8]}/{cnpj_clean[8:12]}-{cnpj_clean[12:]}"
    return cnpj_clean


def format_cep(cep: str) -> str:
    """Formata CEP para o padrão #####-###"""
    cep_clean = re.sub(r"[^0-9]", "", cep)
    if len(cep_clean) == 8:
        return f"{cep_clean[:5]}-{cep_clean[5:]}"
    return cep_clean

"""Ponto de entrada principal da aplicação FastAPI"""

import logging
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.routes import activities, auth, companies, health, users, viacep, cnpj, quotations, matches, interactions, chat
from app.utils.validation_errors import validation_exception_handler

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Importa rotas incluindo ViaCEP

settings = get_settings()

app = FastAPI(
    title=settings.api_title,
    description=settings.api_description,
    version=settings.api_version,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configuração de CORS - permite requisições do frontend
# IMPORTANTE: CORS deve ser adicionado ANTES dos exception handlers
# para garantir que os headers sejam processados corretamente
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost",
        "http://127.0.0.1",
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "http://localhost:19006",
        "http://127.0.0.1:19006",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Adiciona handler customizado para erros de validação
app.add_exception_handler(RequestValidationError, validation_exception_handler)

# Handler customizado para garantir headers CORS em todos os erros HTTP
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Garante que headers CORS sejam adicionados mesmo em erros HTTP"""
    response = JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )
    # Adiciona headers CORS manualmente
    origin = request.headers.get("origin")
    allowed_origins = [
        "http://localhost",
        "http://127.0.0.1",
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "http://localhost:19006",
        "http://127.0.0.1:19006",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
    if origin in allowed_origins:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        response.headers["Access-Control-Allow-Headers"] = "*"
    return response

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(companies.router)
app.include_router(activities.router)
# Rota ViaCEP para busca de endereço por CEP
app.include_router(viacep.router)
# Rota CNPJ para busca de dados de empresa
app.include_router(cnpj.router)
# Rotas de cotações e matches (Deu Agro)
app.include_router(quotations.router)
app.include_router(matches.router)
# Rotas de interações do usuário
app.include_router(interactions.router)
# Rotas de chat
app.include_router(chat.router)


@app.get("/")
def root():
    return {
        "message": settings.api_title,
        "version": settings.api_version,
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

"""
RastreAgro Backend - Main Application
FastAPI application entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from app.routes import auth, health
from app.database import engine, Base

# Carregar variáveis de ambiente
load_dotenv()

# Criar tabelas no banco de dados (apenas se banco estiver disponível)
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"⚠️  Aviso: Não foi possível conectar ao banco de dados: {e}")
    print("   O servidor continuará rodando, mas funcionalidades que dependem do banco podem não funcionar.")

# Inicializar a aplicação FastAPI
app = FastAPI(
    title="RastreAgro API",
    description="API para plataforma de rastreabilidade e marketplace de animais",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especificar origens permitidas
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(health.router, tags=["Health"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])


@app.get("/")
async def root():
    """Endpoint raiz"""
    return {
        "message": "RastreAgro API",
        "version": "1.0.0",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )


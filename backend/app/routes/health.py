"""
Rotas de verificação de saúde da API
"""

from fastapi import APIRouter
from datetime import datetime

router = APIRouter()


@router.get("/health")
async def health_check():
    """Retorna o status básico da API"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "RastreAgro API",
    }


@router.get("/health/db")
async def health_check_db():
    """Verifica a conectividade com o banco de dados"""
    try:
        from app.database import SessionLocal
        from sqlalchemy import text

        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as exc:  # noqa: BLE001
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(exc),
            "timestamp": datetime.utcnow().isoformat(),
        }


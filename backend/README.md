# RastreAgro Backend

Backend da aplicação RastreAgro desenvolvido com FastAPI + SQL Server.

## 🚀 Tecnologias

- **FastAPI** e **Pydantic**
- **SQLAlchemy 2.0** + **Alembic**
- **SQL Server** via **pyodbc**
- **JWT** (access + refresh) com `python-jose`
- **Passlib (bcrypt)** para hash de senha

## 📋 Pré-requisitos

- Python 3.12+
- SQL Server local (com banco `RastreAgro` ou configure via `.env`)
- ODBC Driver 17 for SQL Server instalado

## 🔧 Setup rápido

```bash
cd backend
python -m venv venv
venv\Scripts\activate         # Windows
# source venv/bin/activate      # Linux/MacOS
pip install -r requirements.txt
copy env.example .env           # ajuste o DSN e chaves JWT
alembic upgrade head            # cria tabelas e faz seed da taxonomia
uvicorn main:app --reload       # http://localhost:8000
```

> O DSN completo pode ser configurado em `.env` usando a variável `SQL_SERVER_DSN`.

## ✨ Funcionalidades entregues

- Login funcional com JWT (access + refresh)
- Registro de compradores (buyer) e vendedores/empresas (seller)
- Persistência completa no SQL Server (users, companies, company_activities)
- Taxonomia de atividades hierárquica (seed automático via migration)
- Rotas documentadas no Swagger (`/docs`)

## 📚 Endpoints principais

| Tag | Endpoint | Descrição |
| --- | --- | --- |
| Auth | `POST /auth/register` | Cria buyer (nickname obrigatório) ou seller (dados de empresa + atividades) |
|      | `POST /auth/login` | Login (form-urlencoded padrão OAuth2) |
|      | `POST /auth/refresh` | Gera novo access token a partir do refresh |
| Users | `GET /users/me` | Retorna usuário autenticado (inclui empresa quando seller) |
| Companies | `POST /companies` | Cria/atualiza dados da empresa logada |
|          | `GET /companies/{id}` | Recupera empresa por ID |
| Activities | `GET /activities/categories` | Lista categorias |
|           | `GET /activities/groups?category_id=` | Lista grupos da categoria |
|           | `GET /activities/items?group_id=` | Lista itens do grupo |
| Health | `GET /health` | Ping básico |
|        | `GET /health/db` | Verifica conexão com o banco |

## 🧱 Modelagem criada

- `users` (role: `buyer` | `seller`, nickname obrigatório para buyer)
- `companies` (1:1 com user seller)
- `activity_category`, `activity_group`, `activity_item`
- `company_activities` (N:N entre empresas e taxonomia)

A migration `20251105_01_initial.py` cria toda a estrutura e popula a taxonomia conforme o enunciado:
- Pecuária (Cria/Recria/Engorda com itens Macho/Fêmea)
- Agricultura (Soja, Sorgo, …)
- Integração Pecuária/Agricultura (Bezerro, Garrote, …)
- Comércio, Indústria, Serviços

## 📁 Estrutura

```
backend/
├── app/
│   ├── core/                # Config, segurança e dependências
│   ├── database.py          # Engine e SessionLocal
│   ├── models/              # ORM (users, companies, atividades)
│   ├── schemas/             # Pydantic schemas (auth, users, companies, activities)
│   ├── repositories/        # Acesso a dados
│   ├── services/            # Regras de negócio (auth, company, user, activities)
│   └── routes/              # Rotas FastAPI
├── alembic/                 # Migrations + seed de atividades
├── alembic.ini
├── env.example
├── main.py
└── requirements.txt
```

## 🔐 Segurança

- Hash de senha com bcrypt
- JWT access (30 minutos) + refresh (7 dias)
- Refresh automático implementado
- Validação de nickname com blacklist (~200 nomes comuns)
- Sellers só podem acessar rotas de empresa (`require_role('seller')`)

## 🧪 Testes rápidos

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "buyer@test.com",
    "password": "senha123",
    "role": "buyer",
    "nickname": "cliente_demo"
  }'

curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=buyer@test.com&password=senha123"
```

Swagger: `http://localhost:8000/docs`

## 📝 Notas

- Utilize `alembic revision --autogenerate -m "mensagem"` para futuras mudanças
- O controle de rebanho será adicionado em próxima sprint (não incluso)
- Código preparado para extensões futuras como 2FA e verificação externa de empresas

---

Dúvidas? Consulte `COMO_TESTAR.md` na raiz do projeto para o fluxo completo backend + frontend.


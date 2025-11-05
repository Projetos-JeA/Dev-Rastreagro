# RastreAgro Backend

Backend da aplicação RastreAgro desenvolvido com FastAPI.

## 🚀 Tecnologias

- **FastAPI**: Framework web moderno e rápido
- **SQLAlchemy**: ORM para Python
- **PyODBC**: Driver para conexão com SQL Server
- **Python-JOSE**: JWT tokens
- **Passlib**: Hash de senhas

## 📋 Pré-requisitos

- Python 3.9+
- SQL Server (local ou remoto)
- ODBC Driver 17 for SQL Server instalado

## 🔧 Instalação

1. **Criar ambiente virtual:**
```bash
python -m venv venv
```

2. **Ativar ambiente virtual:**
- Windows: `venv\Scripts\activate`
- Linux/Mac: `source venv/bin/activate`

3. **Instalar dependências:**
```bash
pip install -r requirements.txt
```

4. **Configurar variáveis de ambiente:**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```
DB_SERVER=localhost
DB_NAME=rastreagro
DB_USER=sa
DB_PASSWORD=sua_senha
DB_DRIVER=ODBC Driver 17 for SQL Server
JWT_SECRET=seu-secret-jwt-aqui
```

## 🗄️ Banco de Dados

O SQL Server precisa estar rodando e acessível. O sistema criará as tabelas automaticamente na primeira execução.

## ▶️ Executar

```bash
python main.py
```

Ou usando uvicorn diretamente:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

A API estará disponível em: `http://localhost:8000`

## 📚 Documentação

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 🧪 Testar

### Health Check
```bash
curl http://localhost:8000/health
```

### Login (Mock)
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "cliente@test.com", "password": "senha123"}'
```

## 📁 Estrutura do Projeto

```
backend/
├── app/
│   ├── __init__.py
│   ├── database.py          # Configuração do banco
│   ├── models/              # Modelos SQLAlchemy
│   │   ├── __init__.py
│   │   └── user.py
│   ├── schemas/             # Schemas Pydantic
│   │   ├── __init__.py
│   │   └── auth.py
│   ├── services/            # Lógica de negócio
│   │   ├── __init__.py
│   │   └── auth_service.py
│   └── routes/              # Rotas da API
│       ├── __init__.py
│       ├── health.py
│       └── auth.py
├── main.py                  # Entry point
├── requirements.txt
├── .env.example
└── README.md
```

## 🔐 Autenticação

A autenticação atual é mockada para desenvolvimento. Usuários de teste:

- **Cliente**: `cliente@test.com` / `senha123`
- **Empresa**: `empresa@test.com` / `senha123`

Em produção, implementar:
- Hash de senhas real
- Validação de 2FA real
- Integração com banco de dados

## 📝 Notas

- O sistema usa estrutura MVC (Models, Views/Routes, Controllers/Services)
- As rotas estão organizadas por funcionalidade
- Swagger UI é gerado automaticamente a partir dos docstrings


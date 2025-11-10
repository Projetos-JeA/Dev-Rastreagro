# RastreAgro

Plataforma de rastreabilidade e marketplace para compra e venda de animais, conectando compradores (clientes) e vendedores (empresas) com fluxo de cadastro completo e autenticação JWT.

## 📦 Monorepo

```
projeto-agro/
├── backend/
│   ├── main.py                      # Entrypoint FastAPI
│   ├── requirements.txt
│   ├── env.example                  # Modelo de variáveis (.env)
│   ├── alembic/                     # Migrations + seeds de atividades
│   │   └── versions/20251105_01_initial.py
│   └── app/
│       ├── core/                    # Config, security, dependências
│       ├── database.py
│       ├── models/                  # users, companies, activities
│       ├── schemas/                 # Pydantic DTOs
│       ├── services/                # Auth, user, company, activities
│       ├── repositories/            # Regras de acesso ao banco
│       └── routes/                  # Auth, Users, Companies, Activities
├── frontend/
│   ├── App.tsx
│   ├── package.json
│   ├── app.json
│   └── src/
│       ├── config/api.ts            # Base Axios + storage tokens
│       ├── context/AuthContext.tsx
│       ├── navigation/AppNavigator.tsx
│       ├── screens/
│       │   ├── LoginScreen.tsx
│       │   ├── RegisterScreen.tsx   # Form dinâmico buyer/seller
│       │   └── HomeScreen.tsx
│       └── services/                # auth, activities, company, user
├── docs/
│   └── SPRINT_1_REQUISITOS.md
├── start-all.ps1 / start-all.bat    # Scripts auxiliares locais
└── COMO_TESTAR.md
```

## 🚀 Como rodar

### 1. Preparação única

```bash
cd C:\Users\Secad-PCJF\OneDrive\Documentos\projeto-agro
```

| O que fazer | Onde ficar | Comandos |
| --- | --- | --- |
| Criar/atualizar venv | `backend/` | `python -m venv venv`<br>`venv\Scripts\activate`<br>`pip install -r requirements.txt` |
| Configurar `.env` | `backend/` | `copy env.example .env` (edite DSN e chaves) |
| Aplicar migrations + seeds | `backend/` (com venv ativa) | `alembic upgrade head` |
| Instalar dependências do app | `frontend/` | `npm install` |

> Ajuste `frontend/src/config/api.ts` se for acessar o backend por outro IP (ex.: dispositivo físico).

### 2. Rotina diária (ao ligar o computador / abrir o Cursor)

1. **Backend** – abra um PowerShell, entre na pasta do projeto e rode:
   ```powershell
   cd C:\Users\Secad-PCJF\OneDrive\Documentos\projeto-agro\backend
   .\venv\Scripts\activate
   python -m uvicorn main:app --reload
   ```
   - Deixe essa janela aberta. A API fica em `http://127.0.0.1:8000` e a documentação em `http://127.0.0.1:8000/docs`.

2. **Frontend** – em outra janela PowerShell:
   ```powershell
   cd C:\Users\Secad-PCJF\OneDrive\Documentos\projeto-agro\frontend
   npm start
   ```
   - Quando o Expo perguntar, pressione `w` para abrir `http://localhost:8081` (tela de login). Escaneie o QR code se quiser testar no celular.

3. **Hot Reload** – ambos os servidores estão com reload automático. Salve o arquivo e veja a mudança sem reiniciar. Reinicie apenas se adicionar dependências ou alterar arquivos de configuração que o watcher não monitora.

## ✅ Entregas desta sprint

- **Autenticação completa**: registro/login com JWT (access + refresh) e refresh automático no app
- **Cadastro de comprador**: nickname obrigatório + validação de blacklist
- **Cadastro de vendedor/empresa**: formulário completo + persistência no SQL Server
- **Taxonomia de atividades**: categoria → grupo → item com seed via Alembic
- **Seletor hierárquico no app** com múltiplas seleções
- **Swagger organizado** (Auth, Users, Companies, Activities)
- **Home placeholder** pós-login

## 🏁 Status por Sprint

- **Sprint 1 – Descoberta e MVP**
  - Documentação base (`docs/SPRINT_1_REQUISITOS.md`), user stories, fluxos e diretrizes de design.
  - Definição da arquitetura (FastAPI + SQL Server + Expo) e entidades principais.

- **Sprint 2 – Setup do ambiente**
  - Estrutura inicial do backend (FastAPI, models/schemas/services/routes) e frontend (Expo + TypeScript) sem Docker.
  - Scripts de inicialização (`start-all`, `start-backend`, `start-frontend`) e documentação de teste.
  - Configuração da venv, requirements e `tsconfig` ajustado para Expo web.

- **Sprint 3 – Autenticação e cadastros** *(entrega atual)*
  - Login funcional com JWT (access + refresh) e rotas autenticadas.
  - Cadastro de comprador e empresa diretamente em uma única tela dinâmica.
  - Persistência completa no SQL Server com Alembic + seed de atividades (categoria → grupo → item).
  - Seleção hierárquica de atividades com múltiplas escolhas no app e validações de negócio.
  - Swagger organizado por tags (Auth, Users, Companies, Activities).

## 🔐 Conexão rápida ao SQL Server (SSMS)

- **Servidor**: `localhost\SQLEXPRESS`
- **Autenticação**: `SQL Server Authentication`
- **Login**: `sa`
- **Senha**: `rastreagro`

Após conectar, utilize o banco `RastreAgro`. Tabelas principais:
- `dbo.users` – usuários (comprador, vendedor, prestador)
- `dbo.companies` – dados da empresa (vendedor)
- `dbo.service_providers` – cadastro de prestadores

## 🔌 Endpoints principais

| Endpoint | Descrição |
| --- | --- |
| `POST /auth/register` | Cria buyer (apelido) ou seller (dados empresa + atividades) |
| `POST /auth/login` | Login padrão (form-urlencoded) |
| `POST /auth/refresh` | Gera novo access token |
| `GET /users/me` | Perfil logado + dados da empresa quando seller |
| `POST /companies` | Cria/atualiza empresa logada |
| `GET /activities/*` | Listas para o seletor hierárquico |

## 📚 Documentos úteis

- [Requisitos e user stories](docs/SPRINT_1_REQUISITOS.md)
- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)
- [Como testar (end-to-end)](COMO_TESTAR.md)

## 🗂️ Próximos passos (roadmap)
EXEMPLO
- Controle de rebanho (próxima tarefa)
- Match automático oferta/demanda
- Pagamento com retenção e NF-e real
- Chat interno
- Verificação de empresa e 2FA

---

Desenvolvido para o agro com foco em rastreabilidade e transparência.

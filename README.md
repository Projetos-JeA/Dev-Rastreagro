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

## 🔧 Pré-requisitos e configuração do ambiente

1. **Instalar o SQL Server 2019 Express**
   - Baixe o instalador oficial (versão Express) no site da Microsoft.
   - Durante o setup escolha a opção **Custom** e selecione os componentes Database Engine Services.
   - Quando o instalador solicitar o modo de autenticação, escolha **Mixed Mode** (SQL Server + Windows) e defina:
     - Login `sa`
     - Senha `rastreagro`

2. **Instalar o SQL Server Configuration Manager**
   - É instalado junto com o SQL Server (procure por "SQL Server 2019 Configuration Manager" no menu Iniciar).
   - Abra o Configuration Manager e verifique:
     - Em **SQL Server Services**:
       - `SQL Server (SQLEXPRESS)` → estado **Em execução**, modo inicial **Automático**.
       - `SQL Server Browser` → estado **Em execução**, modo inicial **Automático**.
     - Em **Configuração de Rede do SQL Server > Protocolos para SQLEXPRESS**:
       - Habilite **TCP/IP**.
       - Marque com botão direito → **Propriedades** → guia **Endereços IP**:
         - Para cada IPAtivo (IP1, IP2, IPAll...) coloque **Habilitado = Sim**.
         - Em **IPAll** deixe `Porta TCP = 1433` e limpe o campo `Portas TCP Dinâmicas`.
   - Após as alterações, reinicie o serviço `SQL Server (SQLEXPRESS)` e o `SQL Server Browser`.

3. **Instalar o ODBC Driver 18 for SQL Server**
   - Faça o download no site da Microsoft (pacote `msodbcsql18`).
   - Necessário para que o SQLAlchemy se conecte via `pyodbc`.

4. **Habilitar o login `sa` e criar o banco**
   - Abra um PowerShell **como administrador**:
     ```powershell
     # habilita e define a senha do sa
     & "C:\Program Files\Microsoft SQL Server\150\Tools\Binn\OSQL.EXE" -S localhost\SQLEXPRESS -E -Q "ALTER LOGIN sa ENABLE; ALTER LOGIN sa WITH PASSWORD='rastreagro';"

     # cria o banco RastreAgro caso não exista
     & "C:\Program Files\Microsoft SQL Server\150\Tools\Binn\OSQL.EXE" -S localhost\SQLEXPRESS -E -Q "IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'RastreAgro') CREATE DATABASE RastreAgro;"
     ```
     > Se preferir `sqlcmd`, utilize o caminho `"C:\Program Files\Microsoft SQL Server\150\Tools\Binn\sqlcmd.exe"` com os mesmos comandos.

5. **(Opcional) Instalar o SQL Server Management Studio (SSMS)**
   - Permite visualizar tabelas, rodar queries e conferir os dados. Use `localhost\SQLEXPRESS`, login `sa`, senha `rastreagro`.

6. **Configurar o arquivo `.env` do backend**
   - Copie o `backend/env.example` para `backend/.env` e ajuste:
     ```env
     SQL_SERVER_DSN=mssql+pyodbc://SA:rastreagro@localhost,1433/RastreAgro?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes
     JWT_SECRET_KEY=...        # gere com python -c "import secrets; print(secrets.token_urlsafe(64))"
     JWT_REFRESH_SECRET_KEY=...# idem para refresh
     ```

7. **Aplicar migrations (estrutura + seed)**
   ```powershell
   cd C:\Users\Secad-PCJF\OneDrive\Documentos\projeto-agro\backend
   .\venv\Scripts\activate
   alembic upgrade head
   ```

## 🚀 Como rodar

### 1. Preparação única

```bash
cd C:\Users\Secad-PCJF\OneDrive\Documentos\projeto-agro
```

| O que fazer | Onde ficar | Comandos |
| --- | --- | --- |
| Criar/atualizar venv | `backend/` | `python -m venv venv`<br>`venv\Scripts\activate`<br>`pip install -r requirements.txt` |
| Configurar `.env` | `backend/` | `copy env.example .env` (edite DSN e chaves conforme seção acima) |
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
- **Home placeholder** pós-login dados cadastrais

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

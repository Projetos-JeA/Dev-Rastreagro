# RastreAgro

Plataforma de rastreabilidade e marketplace para compra e venda de animais, conectando compradores (clientes) e vendedores (empresas) com fluxo de cadastro completo e autenticação JWT.

## 📦 Estrutura do Projeto

```
projeto-agro/
├── backend/
│   ├── main.py                      # Entrypoint FastAPI
│   ├── requirements.txt
│   ├── env.example                  # Modelo de variáveis (.env)
│   ├── alembic/                     # Migrations + seeds de atividades
│   │   └── versions/                # Todas as migrations
│   └── app/
│       ├── core/                    # Config, security, dependências
│       ├── database.py
│       ├── models/                  # users, companies, activities, quotations, etc
│       ├── schemas/                 # Pydantic DTOs
│       ├── services/                # Auth, user, company, activities, AI matching
│       │   └── ai/                  # Serviços de IA (Ollama)
│       ├── repositories/            # Regras de acesso ao banco
│       ├── routes/                  # Auth, Users, Companies, Activities, Quotations
│       ├── scripts/                 # Scripts utilitários (criar dados de teste, etc)
│       └── utils/                   # Validadores, helpers
├── frontend/
│   ├── app/                         # Expo Router (estrutura de pastas)
│   │   ├── (auth)/                  # Telas de autenticação
│   │   └── (tabs)/                  # Telas principais (tabs)
│   ├── src/
│   │   ├── config/api.ts            # Base Axios + storage tokens
│   │   ├── context/                 # Contexts (Auth, etc)
│   │   ├── services/                # Serviços de API
│   │   ├── components/              # Componentes reutilizáveis
│   │   └── utils/                   # Utilitários
│   ├── package.json
│   └── app.json                     # Configuração Expo
├── docs/                            # Documentação completa
│   ├── SPRINT_1_REQUISITOS.md
│   ├── INSTALACAO_OLLAMA_PASSO_A_PASSO.md
│   ├── GUIA_RESEND.md
│   ├── GUIA_OLLAMA.md
│   └── ... (outros documentos)
├── start-all.ps1 / start-all.bat    # Scripts auxiliares locais
└── README.md
```

## 🔧 Pré-requisitos e Configuração do Ambiente

### 1. Instalar SQL Server 2019 Express

- Baixe o instalador oficial (versão Express) no site da Microsoft.
- Durante o setup escolha a opção **Custom** e selecione os componentes Database Engine Services.
- Quando o instalador solicitar o modo de autenticação, escolha **Mixed Mode** (SQL Server + Windows) e defina:
  - Login `sa`
  - Senha `rastreagro`

### 2. Configurar SQL Server

- Abra o **SQL Server Configuration Manager** (instalado junto com o SQL Server).
- Verifique em **SQL Server Services**:
  - `SQL Server (SQLEXPRESS)` → estado **Em execução**, modo inicial **Automático**.
  - `SQL Server Browser` → estado **Em execução**, modo inicial **Automático**.
- Em **Configuração de Rede do SQL Server > Protocolos para SQLEXPRESS**:
  - Habilite **TCP/IP**.
  - Marque com botão direito → **Propriedades** → guia **Endereços IP**:
    - Para cada IPAtivo (IP1, IP2, IPAll...) coloque **Habilitado = Sim**.
    - Em **IPAll** deixe `Porta TCP = 1433` e limpe o campo `Portas TCP Dinâmicas`.
- Após as alterações, reinicie o serviço `SQL Server (SQLEXPRESS)` e o `SQL Server Browser`.

### 3. Instalar ODBC Driver 18 for SQL Server

- Faça o download no site da Microsoft (pacote `msodbcsql18`).
- Necessário para que o SQLAlchemy se conecte via `pyodbc`.

### 4. Habilitar login `sa` e criar o banco

Abra um PowerShell **como administrador**:

```powershell
# habilita e define a senha do sa
& "C:\Program Files\Microsoft SQL Server\150\Tools\Binn\OSQL.EXE" -S localhost\SQLEXPRESS -E -Q "ALTER LOGIN sa ENABLE; ALTER LOGIN sa WITH PASSWORD='rastreagro';"

# cria o banco RastreAgro caso não exista
& "C:\Program Files\Microsoft SQL Server\150\Tools\Binn\OSQL.EXE" -S localhost\SQLEXPRESS -E -Q "IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'RastreAgro') CREATE DATABASE RastreAgro;"
```

> Se preferir `sqlcmd`, utilize o caminho `"C:\Program Files\Microsoft SQL Server\150\Tools\Binn\sqlcmd.exe"` com os mesmos comandos.

### 5. Instalar Ollama (IA para Matching)

**Ollama é obrigatório para o sistema de matching funcionar!**

1. **Baixar e instalar Ollama:**
   - Acesse: https://ollama.com/download
   - Baixe a versão para Windows
   - Execute o instalador
   - **IMPORTANTE**: Feche e reabra o PowerShell/Terminal após a instalação

2. **Verificar instalação:**
   ```powershell
   ollama --version
   ```
   Se aparecer a versão, está funcionando! ✅

3. **Baixar modelos necessários:**
   ```powershell
   # Modelo OBRIGATÓRIO (para embeddings)
   ollama pull nomic-embed-text
   
   # Modelo OPCIONAL (para análises complexas)
   ollama pull llama3.2
   ```

4. **Verificar modelos instalados:**
   ```powershell
   ollama list
   ```
   Você deve ver `nomic-embed-text` e `llama3.2` na lista.

> 📖 **Documentação completa**: Veja `docs/INSTALACAO_OLLAMA_PASSO_A_PASSO.md` para mais detalhes.

### 6. Configurar Resend (Email - Opcional para testes)

Para envio de emails de verificação e recuperação de senha:

1. **Criar conta no Resend:**
   - Acesse: https://resend.com
   - Crie uma conta gratuita
   - Gere uma API Key

2. **Configurar no `.env`:**
   ```env
   RESEND_API_KEY=re_sua_api_key_aqui
   RESEND_FROM_EMAIL=onboarding@resend.dev
   ```

> 📖 **Documentação completa**: Veja `docs/GUIA_RESEND.md` para mais detalhes.

### 7. Configurar arquivo `.env` do backend

Copie o `backend/env.example` para `backend/.env` e ajuste:

```env
# Banco de dados
SQL_SERVER_DSN=mssql+pyodbc://SA:rastreagro@localhost,1433/RastreAgro?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes

# JWT (gere novas chaves)
JWT_SECRET_KEY=...        # gere com: python -c "import secrets; print(secrets.token_urlsafe(64))"
JWT_REFRESH_SECRET_KEY=... # idem para refresh

# Resend (Email - opcional)
RESEND_API_KEY=re_sua_api_key_aqui
RESEND_FROM_EMAIL=onboarding@resend.dev
```

### 8. Aplicar migrations (estrutura + seed)

```powershell
cd backend
.\venv\Scripts\activate
alembic upgrade head
```

## 🚀 Como Rodar o Projeto

### 1. Preparação Única (Primeira Vez)

```powershell
# Clone o repositório (se ainda não tiver)
git clone <url-do-repositorio>
cd projeto-agro
```

#### Backend

```powershell
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar venv
.\venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Configurar .env (copie env.example e ajuste)
copy env.example .env
# Edite o .env com suas configurações

# Aplicar migrations
alembic upgrade head
```

#### Frontend

```powershell
cd frontend

# Instalar dependências
npm install
```

> 💡 **Dica**: Ajuste `frontend/src/config/api.ts` se for acessar o backend por outro IP (ex.: dispositivo físico).

### 2. Rotina Diária (Iniciar o Projeto)

#### Passo 1: Iniciar Ollama (IA)

**IMPORTANTE**: O Ollama precisa estar rodando para o sistema de matching funcionar!

```powershell
# Verificar se está rodando
ollama list

# Se não estiver, inicie o serviço Ollama (geralmente inicia automaticamente)
# Se necessário, execute: ollama serve
```

#### Passo 2: Iniciar Backend

Abra um **PowerShell**:

```powershell
cd backend
.\venv\Scripts\activate
python -m uvicorn main:app --reload
```

- Deixe essa janela aberta
- API disponível em: `http://127.0.0.1:8000`
- Documentação Swagger: `http://127.0.0.1:8000/docs`

#### Passo 3: Iniciar Frontend

Abra **outro PowerShell**:

```powershell
cd frontend
npm start
```

- Quando o Expo perguntar, pressione:
  - `w` para abrir no navegador (`http://localhost:8081`)
  - `a` para abrir no emulador Android
  - Escaneie o QR code para testar no celular físico

### 3. Hot Reload

Ambos os servidores têm reload automático:
- **Backend**: Salve arquivos `.py` e veja as mudanças automaticamente
- **Frontend**: Salve arquivos `.tsx`/`.ts` e veja as mudanças automaticamente

> ⚠️ **Reinicie apenas se**:
> - Adicionar novas dependências (`pip install` ou `npm install`)
> - Alterar arquivos de configuração que o watcher não monitora
> - Modificar variáveis de ambiente (`.env`)

### 4. Scripts Auxiliares

Você também pode usar os scripts prontos:

```powershell
# Iniciar tudo de uma vez (backend + frontend)
.\start-all.ps1

# Ou separadamente:
.\backend\start.ps1    # Backend
.\frontend\start.ps1   # Frontend
```

## ✨ Funcionalidades Implementadas

### Autenticação e Usuários
- ✅ Registro/login com JWT (access + refresh tokens)
- ✅ Refresh automático de tokens no app
- ✅ Verificação de email (Resend)
- ✅ Recuperação de senha
- ✅ Alternância de perfis (comprador/vendedor/prestador)

### Cadastros
- ✅ Cadastro de comprador (buyer) com validação
- ✅ Cadastro de vendedor/empresa com validação de CNPJ (BrasilAPI)
- ✅ Cadastro de prestador de serviço
- ✅ Taxonomia de atividades: categoria → grupo → item (seed via Alembic)

### Marketplace e IA
- ✅ Sistema de cotações (quotations)
- ✅ **IA de Matching (Ollama)**: Calcula relevância de cotações para cada comprador
  - 70% baseado em comportamento (interações do usuário)
  - 30% baseado em perfil (atividades, categorias)
- ✅ Tela "Deu Agro" com cotações relevantes
- ✅ Rastreamento de interações do usuário (view, click, favorite, etc)

### Outros
- ✅ Swagger organizado (Auth, Users, Companies, Activities, Quotations)
- ✅ Scripts utilitários para criar dados de teste
- ✅ Validação de documentos (CPF/CNPJ)

## 🏁 Status do Projeto

### Sprint 1 – Descoberta e MVP
- Documentação base, user stories, fluxos e diretrizes de design
- Definição da arquitetura (FastAPI + SQL Server + Expo)

### Sprint 2 – Setup do Ambiente
- Estrutura inicial do backend e frontend
- Scripts de inicialização
- Configuração completa do ambiente

### Sprint 3 – Autenticação e Cadastros
- Login funcional com JWT (access + refresh)
- Cadastro de comprador, vendedor e prestador
- Validação de documentos (CPF/CNPJ via BrasilAPI)
- Taxonomia de atividades com seed

### Sprint 4 – Marketplace e IA
- Sistema de cotações (quotations)
- **IA de Matching com Ollama** (gratuito, local)
- Sistema de relevância inteligente
- Rastreamento de interações do usuário
- Tela "Deu Agro" com cotações relevantes

## 🔐 Conexão rápida ao SQL Server (SSMS)

- **Servidor**: `localhost\SQLEXPRESS`
- **Autenticação**: `SQL Server Authentication`
- **Login**: `sa`
- **Senha**: `rastreagro`

Após conectar, utilize o banco `RastreAgro`. Tabelas principais:
- `dbo.users` – usuários (comprador, vendedor, prestador)
- `dbo.companies` – dados da empresa (vendedor)
- `dbo.service_providers` – cadastro de prestadores

## 🔌 Endpoints Principais

| Endpoint | Descrição |
| --- | --- |
| `POST /auth/register` | Registra buyer, seller ou prestador |
| `POST /auth/login` | Login (form-urlencoded) |
| `POST /auth/refresh` | Gera novo access token |
| `POST /auth/verify-email` | Verifica email com token |
| `POST /auth/forgot-password` | Solicita recuperação de senha |
| `GET /users/me` | Perfil logado + perfis disponíveis |
| `GET /quotations/relevant` | Cotações relevantes (com IA) |
| `GET /quotations` | Todas as cotações ativas |
| `POST /quotations` | Criar nova cotação |
| `POST /interactions/track` | Registrar interação do usuário |
| `GET /activities/*` | Listas para o seletor hierárquico |
| `GET /cnpj/{cnpj}` | Busca dados de empresa por CNPJ |

## 📚 Documentação Completa

### Guias de Instalação
- [Instalação do Ollama (Passo a Passo)](docs/INSTALACAO_OLLAMA_PASSO_A_PASSO.md)
- [Guia do Ollama (Como funciona)](docs/GUIA_OLLAMA.md)
- [Configuração do Resend (Email)](docs/GUIA_RESEND.md)
- [Configuração de Domínio Resend](docs/CONFIGURACAO_DOMINIO_RESEND.md)

### Arquitetura e Funcionalidades
- [Arquitetura de Perfis e Roles](docs/ARQUITETURA_PERFIS_E_ROLES.md)
- [Plano de Implementação da IA](docs/PLANO_IMPLEMENTACAO_IA_DEU_AGRO.md)
- [Fluxo de Compra e Custos](docs/FLUXO_COMPRA_E_CUSTOS.md)
- [Testes sem Custo](docs/TESTES_SEM_CUSTO.md)

### Requisitos
- [Requisitos e User Stories](docs/SPRINT_1_REQUISITOS.md)
- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)

## 🗂️ Próximos Passos (Roadmap)

- [ ] Carrinho de compras
- [ ] Sistema de pedidos
- [ ] Integração com gateway de pagamento (Mercado Pago)
- [ ] Chat interno para negociação
- [ ] Notificações push
- [ ] Geração de APK/IPA para distribuição
- [ ] Dashboard de analytics
- [ ] Sistema de avaliações e reviews

## ⚠️ Observações Importantes

### IA (Ollama)
- **O Ollama DEVE estar rodando** para o sistema de matching funcionar
- Se o Ollama não estiver disponível, o sistema usa fallback simples (scores mais baixos)
- Modelos necessários: `nomic-embed-text` (obrigatório) e `llama3.2` (opcional)

### Email (Resend)
- Para testes, pode usar `onboarding@resend.dev` (limitado ao email da conta)
- Para produção, é necessário configurar um domínio próprio
- Veja `docs/EXPLICACAO_DOMINIO_PARA_INVESTIDOR.md` para mais detalhes

### Banco de Dados
- Certifique-se de que o SQL Server está rodando antes de iniciar o backend
- Use `localhost\SQLEXPRESS` com login `sa` e senha `rastreagro`

---

Desenvolvido para o agro com foco em rastreabilidade e transparência.

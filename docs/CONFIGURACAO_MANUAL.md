# Configuração Manual - RastreAgro

Este documento descreve os passos manuais necessários para configurar o projeto após clonar o repositório.

## 1. Configuração do Resend (Verificação de E-mail)

### 1.1. Criar conta no Resend

1. Acesse [https://resend.com](https://resend.com)
2. Crie uma conta gratuita (plano gratuito permite até 3.000 e-mails/mês)
3. Verifique seu e-mail

### 1.2. Criar API Key

1. No dashboard do Resend, vá em **API Keys**
2. Clique em **Create API Key**
3. Dê um nome descritivo (ex: "RastreAgro Development")
4. Selecione as permissões necessárias (pelo menos `sending_access`)
5. Copie a API Key gerada (ela só será exibida uma vez!)

### 1.3. Configurar domínio (Opcional para desenvolvimento)

Para desenvolvimento local, você pode usar o domínio de teste do Resend (`onboarding@resend.dev`).

**Para produção**, você precisará:

1. No dashboard do Resend, vá em **Domains**
2. Clique em **Add Domain**
3. Adicione seu domínio (ex: `rastreagro.com.br`)
4. Configure os registros DNS conforme instruções do Resend:
   - **SPF**: Adicione o registro TXT fornecido
   - **DKIM**: Adicione os 3 registros CNAME fornecidos
   - **DMARC**: (Opcional) Configure política de DMARC

### 1.4. Configurar variáveis de ambiente

No arquivo `.env` do backend, adicione:

```env
# Resend Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev  # Para desenvolvimento
# RESEND_FROM_EMAIL=noreply@seudominio.com.br  # Para produção

# Frontend URL (para links de verificação de e-mail)
FRONTEND_URL=http://localhost:8081  # Para desenvolvimento
# FRONTEND_URL=https://app.seudominio.com.br  # Para produção
```

**Importante**: 
- Nunca commite o arquivo `.env` no Git
- Use variáveis de ambiente diferentes para desenvolvimento e produção
- Mantenha suas API Keys seguras

## 2. Configuração do SQL Server

### 2.1. Instalar SQL Server Express

1. Baixe o SQL Server Express 2019 ou superior em: [https://www.microsoft.com/sql-server/sql-server-downloads](https://www.microsoft.com/sql-server/sql-server-downloads)
2. Execute o instalador
3. Escolha a instalação **Básica** ou **Personalizada**
4. Durante a instalação:
   - Selecione **Mixed Mode Authentication** (autenticação mista)
   - Defina uma senha para o usuário `sa` (anote essa senha!)

### 2.2. Instalar SQL Server Configuration Manager

1. Baixe o **SQL Server Management Studio (SSMS)** em: [https://docs.microsoft.com/sql/ssms/download-sql-server-management-studio-ssms](https://docs.microsoft.com/sql/ssms/download-sql-server-management-studio-ssms)
2. Instale o SSMS (inclui o Configuration Manager)

### 2.3. Configurar SQL Server para acesso de rede

1. Abra o **SQL Server Configuration Manager** (procure no menu Iniciar)
2. No painel esquerdo, expanda **SQL Server Network Configuration**
3. Clique em **Protocols for SQLEXPRESS** (ou o nome da sua instância)
4. No painel direito, clique com botão direito em **TCP/IP** e selecione **Enable**
5. Clique com botão direito em **TCP/IP** novamente e selecione **Properties**
6. Vá na aba **IP Addresses**
7. Role até o final e encontre **IPAll**
8. Em **TCP Port**, defina `1433`
9. Em **TCP Dynamic Ports**, deixe vazio
10. Clique em **OK**

### 2.4. Habilitar SQL Server Browser

1. No **SQL Server Configuration Manager**, expanda **SQL Server Services**
2. Clique com botão direito em **SQL Server Browser**
3. Selecione **Properties**
4. Na aba **Service**, altere **Start Mode** para **Automatic** ou **Manual**
5. Clique em **OK**
6. Clique com botão direito em **SQL Server Browser** novamente e selecione **Start**

### 2.5. Reiniciar serviços SQL Server

1. No **SQL Server Configuration Manager**, clique com botão direito em **SQL Server (SQLEXPRESS)**
2. Selecione **Restart**
3. Aguarde o serviço reiniciar

### 2.6. Habilitar login `sa`

1. Abra o **SQL Server Management Studio (SSMS)**
2. Conecte-se ao servidor usando **Windows Authentication**
3. No **Object Explorer**, expanda **Security** > **Logins**
4. Clique com botão direito em **sa** e selecione **Properties**
5. Na aba **General**, defina uma senha forte
6. Na aba **Status**, em **Login**, selecione **Enabled**
7. Clique em **OK**

### 2.7. Configurar firewall (se necessário)

Se estiver usando firewall do Windows:

1. Abra o **Windows Defender Firewall**
2. Clique em **Advanced settings**
3. Clique em **Inbound Rules** > **New Rule**
4. Selecione **Port** > **Next**
5. Selecione **TCP** e digite `1433` na porta específica
6. Selecione **Allow the connection** > **Next**
7. Marque todos os perfis (Domain, Private, Public) > **Next**
8. Dê um nome (ex: "SQL Server TCP 1433") > **Finish**

## 3. Configuração do Backend

### 3.1. Criar ambiente virtual

```bash
cd backend
python -m venv venv
```

### 3.2. Ativar ambiente virtual

**Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

**Windows (CMD):**
```cmd
venv\Scripts\activate.bat
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 3.3. Instalar dependências

```bash
pip install -r requirements.txt
```

### 3.4. Configurar arquivo `.env`

Crie um arquivo `.env` na pasta `backend/` com o seguinte conteúdo:

```env
# Database
DATABASE_URL=mssql+pyodbc://sa:SUA_SENHA_AQUI@localhost:1433/RastreAgro?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes

# JWT
SECRET_KEY=seu-secret-key-super-seguro-aqui-gerar-com-openssl-rand-hex-32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev
FRONTEND_URL=http://localhost:8081
```

**Para gerar SECRET_KEY:**
```bash
# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Linux/Mac
openssl rand -hex 32
```

### 3.5. Executar migrações

```bash
alembic upgrade head
```

## 4. Configuração do Frontend

### 4.1. Instalar dependências

```bash
cd frontend
npm install
```

### 4.2. Configurar variáveis de ambiente (se necessário)

O frontend usa valores padrão para desenvolvimento. Se precisar alterar, crie um arquivo `.env` na pasta `frontend/`:

```env
EXPO_PUBLIC_API_URL=http://localhost:8000
```

## 5. Executar o Projeto

### 5.1. Backend

```bash
cd backend
# Ativar venv (se não estiver ativado)
.\venv\Scripts\Activate.ps1  # Windows PowerShell
# ou
venv\Scripts\activate.bat  # Windows CMD

# Executar servidor
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

O backend estará disponível em: `http://localhost:8000`
Documentação Swagger: `http://localhost:8000/docs`

### 5.2. Frontend

```bash
cd frontend
npm start
```

Siga as instruções no terminal para abrir no emulador ou dispositivo físico.

## 6. Verificação de E-mail - Fluxo

### 6.1. Cadastro de usuário

1. Usuário preenche o formulário de cadastro
2. Backend cria o usuário com `email_verificado = false`
3. Backend gera um token de verificação (UUID + expiração de 24h)
4. Backend envia e-mail via Resend com link de verificação
5. Link: `{FRONTEND_URL}/verify-email?token={token}`

### 6.2. Verificação de e-mail

1. Usuário clica no link do e-mail
2. Frontend redireciona para tela de verificação
3. Frontend envia token para `POST /auth/verify-email`
4. Backend valida token e atualiza `email_verificado = true`
5. Usuário pode fazer login normalmente

### 6.3. Reenvio de e-mail de verificação

1. Usuário acessa tela de reenvio (ou clica em "Reenviar e-mail")
2. Frontend envia `POST /auth/resend-verification` com e-mail
3. Backend gera novo token e envia novo e-mail

## 7. Troubleshooting

### Erro: "sqlcmd não é reconhecido"

**Solução**: Use o caminho completo do `sqlcmd.exe` ou use `osql.exe`:
```powershell
& "C:\Program Files\Microsoft SQL Server\150\Tools\Binn\sqlcmd.exe" -S localhost\SQLEXPRESS -U sa -P sua_senha
```

### Erro: "Não é possível conectar ao servidor SQL Server"

**Soluções**:
1. Verifique se o SQL Server está rodando (Services > SQL Server (SQLEXPRESS))
2. Verifique se o TCP/IP está habilitado no Configuration Manager
3. Verifique se a porta 1433 está configurada
4. Verifique se o SQL Server Browser está rodando
5. Verifique o firewall

### Erro: "ODBC Driver 18 for SQL Server not found"

**Solução**: Instale o driver ODBC:
- Windows: [https://learn.microsoft.com/sql/connect/odbc/download-odbc-driver-for-sql-server](https://learn.microsoft.com/sql/connect/odbc/download-odbc-driver-for-sql-server)

### Erro: "Resend API Key inválida"

**Soluções**:
1. Verifique se a API Key está correta no `.env`
2. Verifique se a API Key tem permissões de envio
3. Verifique se o domínio está configurado (para produção)

### Erro: "CEP não encontrado"

**Soluções**:
1. Verifique se o CEP tem 8 dígitos
2. Verifique se o formato está correto (apenas números ou #####-###)
3. Verifique a conexão com a internet (ViaCEP requer conexão)

## 8. Próximos Passos

Após configurar tudo:

1. ✅ Teste o cadastro de usuário
2. ✅ Verifique se o e-mail de verificação está sendo enviado
3. ✅ Teste a verificação de e-mail
4. ✅ Teste a busca de CEP
5. ✅ Teste as validações de CPF/CNPJ
6. ✅ Teste as validações de senha
7. ✅ Teste o login após verificação de e-mail

## 9. Recursos Adicionais

- **Resend Documentation**: [https://resend.com/docs](https://resend.com/docs)
- **ViaCEP API**: [https://viacep.com.br](https://viacep.com.br)
- **SQL Server Documentation**: [https://docs.microsoft.com/sql](https://docs.microsoft.com/sql)
- **FastAPI Documentation**: [https://fastapi.tiangolo.com](https://fastapi.tiangolo.com)
- **Expo Documentation**: [https://docs.expo.dev](https://docs.expo.dev)


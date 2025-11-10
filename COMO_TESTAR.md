# 🚀 Como Testar o RastreAgro

## ✅ Serviços em execução

1. **Backend** – FastAPI em `http://localhost:8000`
2. **Frontend** – Expo em `http://localhost:8081` (ou Expo Go)

---

## 🔧 Backend

1. **Swagger**: `http://localhost:8000/docs`
   - Tags: Auth, Users, Companies, Activities
   - Teste rapidamente `/auth/register`, `/auth/login`, `/users/me`

2. **Fluxo sugerido via Swagger**
   ```text
   POST /auth/register (buyer)
   POST /auth/login (form-urlencoded username/password)
   GET /users/me (usar bearer token)
   ```

3. **Health check**
   - `GET http://localhost:8000/health`
   - `GET http://localhost:8000/health/db`

> Lembre-se de executar `alembic upgrade head` antes da primeira vez para criar as tabelas e seed das atividades.

---

## 📱 Frontend (Expo)

### Opção 1 – Navegador (mais simples)
No terminal do Expo, pressione:
```
w
```
Abre o app em `http://localhost:8081`.

### Opção 2 – Expo Go (celular)
1. Abra o app Expo Go
2. Escaneie o QR code do terminal
3. Certifique-se de que celular e PC estão na mesma rede Wi‑Fi

### Opção 3 – Emulador Android
o no terminal do Expo, pressione `a` (requer Android Studio configurado).

---

## 🎯 Fluxos para demonstrar

### 1. Registro como comprador
1. Abrir o app → “Não tem uma conta? Cadastre-se” → “Sou Comprador”
2. Preencher email, senha, apelido (não pode ser nome comum da blacklist)
3. Após envio, o app faz login automático e mostra a Home em branco
4. Verifique no Swagger `/users/me` usando o token do app

### 2. Registro como vendedor/empresa
1. No app → “Sou Vendedor/Empresa”
2. Preencher dados completos + selecionar atividades (categoria → grupo → item)
   - É possível adicionar várias atividades (lista com remover)
3. Após salvar, login automático e Home
4. No Swagger, teste `/companies/{id}` ou `/users/me` e confira as atividades

### 3. Login e refresh
1. Faça logout no app
2. Login novamente com o email cadastrado
3. Opcional: invocar uma rota protegida até o token expirar (ou forçar pelo Swagger `POST /auth/refresh`)

---

## ⚠️ Possíveis problemas

- **Erro 401 no app** → backend indisponível ou refresh inválido. Verifique se `/auth/refresh` funciona e se o SQL Server está online.
- **Expo não abre via IP** → libere a porta 8081 no firewall (`Start > Firewall > Nova regra > TCP > 8081`).
- **Migration não roda** → confirme o DSN no `.env` (ex.: `SQL_SERVER_DSN=mssql+pyodbc://SA:Your_password123@localhost,1433/RastreAgro?driver=ODBC+Driver+17+for+SQL+Server`).

---

## 🔄 Reiniciando rapidamente

```powershell
# Backend
cd backend
venv\Scripts\activate
uvicorn main:app --reload

# Frontend
cd frontend
npm start
```

> Use os scripts `backend/start-backend.ps1` e `frontend/start-frontend.ps1` para abrir janelas separadas já configuradas.

---

**Dica:** abra o Swagger ao lado do app Expo para acompanhar requests e testar payloads complexos (ex.: registro de empresa com múltiplas atividades).


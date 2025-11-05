<<<<<<< HEAD
# Dev-Rastreagro
=======
# RastreAgro 🐄

Plataforma de rastreabilidade e marketplace para compra/venda de animais, conectando clientes e empresas através de um sistema de match automático entre oferta e demanda.

## 📋 Visão Geral

O RastreAgro é um MVP desenvolvido para facilitar a compra e venda de animais, oferecendo:
- Match automático entre oferta e demanda
- Chat interno para negociação
- Pagamento com retenção (escrow)
- Autenticação 2FA
- Emissão de NF-e (stub)

## 🏗️ Estrutura do Projeto

```
projeto-agro/
├── backend/          # API FastAPI
├── frontend/         # App React Native (Expo)
└── docs/            # Documentação
```

## 🚀 Início Rápido

### Backend

1. **Entrar no diretório:**
```bash
cd backend
```

2. **Criar ambiente virtual:**
```bash
python -m venv venv
```

3. **Ativar ambiente virtual:**
- Windows: `venv\Scripts\activate`
- Linux/Mac: `source venv/bin/activate`

4. **Instalar dependências:**
```bash
pip install -r requirements.txt
```

5. **Configurar variáveis de ambiente:**
```bash
cp env.example .env
```

Edite o arquivo `.env` com suas configurações do SQL Server.

6. **Executar:**
```bash
python main.py
```

A API estará disponível em `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`

### Frontend

1. **Entrar no diretório:**
```bash
cd frontend
```

2. **Instalar dependências:**
```bash
npm install
```

3. **Executar:**
```bash
npm start
```

## 📚 Documentação

- **Sprint 1 - Requisitos**: [docs/SPRINT_1_REQUISITOS.md](docs/SPRINT_1_REQUISITOS.md)
- **Backend README**: [backend/README.md](backend/README.md)
- **Frontend README**: [frontend/README.md](frontend/README.md)

## 🔐 Autenticação (Mock para Desenvolvimento)

### Usuários de Teste

- **Cliente**: 
  - Email: `cliente@test.com`
  - Senha: `senha123`

- **Empresa**: 
  - Email: `empresa@test.com`
  - Senha: `senha123`

- **2FA**: Código mockado `123456`

## 🛠️ Tecnologias

### Backend
- FastAPI
- SQLAlchemy
- PyODBC (SQL Server)
- Python-JOSE (JWT)
- Passlib (Hash de senhas)

### Frontend
- React Native
- Expo
- React Navigation
- Axios
- TypeScript

## 📱 Funcionalidades

### Sprint 1 (Concluída)
- ✅ Documentação completa com User Stories
- ✅ Fluxos de usuário definidos
- ✅ Diagrama de entidades

### Sprint 2 (Concluída)
- ✅ Backend FastAPI estruturado
- ✅ Conexão com SQL Server
- ✅ Rotas de autenticação (mock)
- ✅ Health check
- ✅ Swagger UI automático
- ✅ Frontend Expo configurado
- ✅ Telas de Login e Home
- ✅ Integração com API

### Próximas Sprints
- Gestão de animais
- Match automático
- Chat interno
- Pagamento com retenção
- NF-e (integração real)

## 🧪 Testando a API

### Health Check
```bash
curl http://localhost:8000/health
```

### Login
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "cliente@test.com", "password": "senha123"}'
```

## 📝 Notas Importantes

- O ambiente está configurado para **desenvolvimento local sem Docker**
- SQL Server precisa estar instalado e rodando
- ODBC Driver 17 for SQL Server é necessário
- Autenticação está mockada para facilitar desenvolvimento
- Em produção, implementar autenticação real e segurança adequada

## 🤝 Contribuindo

1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e proprietário.

---

**Desenvolvido com ❤️ para o agronegócio**

>>>>>>> 8007789 (Implementacao inicial do projeto RastreAgro - Backend FastAPI com SQL Server, Frontend Expo React Native, telas de login e cadastro com perfis de comprador e vendedor, autenticacao e estrutura MVC completa)

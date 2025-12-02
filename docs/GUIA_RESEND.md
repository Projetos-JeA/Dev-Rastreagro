# 📧 Guia de Configuração do Resend

## O que é Resend?

A **Resend** é um serviço moderno de envio de emails transacionais (emails de verificação, notificações, etc.). É uma alternativa ao SendGrid, Mailgun, etc.

## 🚀 Como obter a chave da API

### Passo 1: Criar conta na Resend

1. Acesse: **https://resend.com**
2. Clique em **"Sign Up"** ou **"Get Started"**
3. Crie sua conta (pode usar email pessoal ou do projeto)

### Passo 2: Verificar domínio (OPCIONAL)

**⚠️ IMPORTANTE:** O domínio é necessário APENAS para emails mais profissionais. O app mobile, backend e toda a aplicação funcionam perfeitamente sem domínio próprio.

- **Para desenvolvimento/testes**: Use o domínio de teste da Resend (`onboarding@resend.dev`) - funciona imediatamente
- **Para produção/MVP**: Pode continuar usando `onboarding@resend.dev` - funciona perfeitamente
- **Para emails profissionais (opcional)**: Se quiser emails com seu domínio (ex: `noreply@rastreagro.com.br`), aí sim precisa verificar um domínio próprio

**Resumo:**
- ✅ App mobile funciona sem domínio
- ✅ Backend funciona sem domínio  
- ✅ Emails funcionam com `onboarding@resend.dev`
- ⚠️ Domínio próprio é apenas para branding profissional dos emails

### Passo 3: Obter a API Key

1. Após fazer login, vá em **"API Keys"** no menu lateral
2. Clique em **"Create API Key"**
3. Dê um nome (ex: "RastreAgro Development")
4. Selecione as permissões (geralmente "Full Access" para desenvolvimento)
5. Clique em **"Add"**
6. **COPIE A CHAVE** (ela só aparece uma vez!)

### Passo 4: Configurar no projeto

Adicione no arquivo `backend/.env`:

```env
# Resend API Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@rastreagro.com
FRONTEND_URL=http://localhost:8081
```

**⚠️ IMPORTANTE:**
- A chave começa com `re_`
- Não compartilhe essa chave publicamente
- Adicione `.env` no `.gitignore` (se ainda não estiver)

## 💰 Planos e Limites

### Plano Gratuito (Free Tier)
- **100 emails/dia**
- **3.000 emails/mês**
- Perfeito para desenvolvimento e testes

### Planos Pagos
- A partir de $20/mês
- Mais emails e recursos avançados

## 🧪 Testando sem Resend (Desenvolvimento)

Se você não quiser configurar o Resend agora, o sistema ainda funciona:

1. O cadastro será criado normalmente
2. O email de verificação **não será enviado**
3. Você pode verificar o email manualmente no banco de dados ou criar um endpoint de teste

## 📝 Exemplo de .env completo

```env
# Database
SQL_SERVER_DSN=mssql+pyodbc://SA:Your_password123@localhost,1433/RastreAgro?driver=ODBC+Driver+17+for+SQL+Server

# JWT
JWT_SECRET_KEY=sua_chave_secreta_aqui
JWT_REFRESH_SECRET_KEY=sua_chave_refresh_aqui

# Resend (Email)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@rastreagro.com
FRONTEND_URL=http://localhost:8081
```

## 🔍 Verificando se está funcionando

Após configurar:

1. Reinicie o backend
2. Crie uma conta de teste
3. Verifique os logs do backend (deve aparecer "Email enviado com sucesso")
4. Verifique a caixa de entrada do email cadastrado

## ❓ Problemas Comuns

### "Serviço de email não configurado"
- Verifique se `RESEND_API_KEY` está no `.env`
- Verifique se não há espaços extras na chave
- Reinicie o backend após adicionar a chave

### "Email não chega"
- Verifique a pasta de spam
- Verifique se o domínio está verificado (para produção)
- Verifique os logs do backend para erros

### "Chave inválida"
- Verifique se copiou a chave completa
- Verifique se não há quebras de linha na chave
- Gere uma nova chave na Resend

## 📚 Links Úteis

- **Resend Dashboard**: https://resend.com/emails
- **Documentação**: https://resend.com/docs
- **Status da API**: https://status.resend.com


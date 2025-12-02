# 📧 Guia de Configuração de Domínio na Resend

## ⚠️ IMPORTANTE: Domínio Próprio é OPCIONAL

**Para TESTES e MVP:** Você pode usar o domínio de teste da Resend (`onboarding@resend.dev`) que funciona perfeitamente para o email cadastrado na conta Resend.

**Para PRODUÇÃO:** Se quiser emails mais profissionais, você precisa:

1. **COMPRAR** o domínio (ex: rastreagro.app)
2. **Adicionar** os registros DNS
3. **Verificar** o domínio na Resend

## ✅ Domínio Criado na Resend: `rastreagro.app`

Se você criou o domínio na Resend mas ainda não comprou o domínio real, você precisa:

1. **Comprar o domínio** em um provedor (Registro.br, GoDaddy, Namecheap, etc.)
2. **Adicionar os registros DNS** no provedor do domínio
3. **Aguardar verificação** na Resend

**Por enquanto, use `onboarding@resend.dev` para testes!**

## 📋 Passo a Passo

### 1. Acesse o Painel do Provedor de Domínio

Onde você comprou/gerencia o domínio `rastreagro.app`:

- Registro.br (se for .br)
- GoDaddy
- Namecheap
- Cloudflare
- Outro provedor

### 2. Localize a Zona DNS

Procure por:

- **DNS**
- **Zona DNS**
- **DNS Records**
- **Gerenciamento DNS**

### 3. Adicione os Registros DNS

Na página da Resend, você verá 3 registros para adicionar:

#### 🔐 Domain Verification (DKIM)

**Registro 1:**

- **Tipo:** `TXT`
- **Nome:** `resend._domainkey`
- **Conteúdo:** (copie o valor completo da página da Resend)
- **TTL:** `Auto` ou `3600`

#### 📤 Enable Sending (SPF)

**Registro 2:**

- **Tipo:** `MX`
- **Nome:** `send`
- **Conteúdo:** `feedback-smtp.sa-east-1.amazonses.com` (ou o valor mostrado)
- **Prioridade:** `10`
- **TTL:** `Auto` ou `3600`

**Registro 3:**

- **Tipo:** `TXT`
- **Nome:** `send`
- **Conteúdo:** `v=spf1 include:amazonses.com ~all` (ou o valor mostrado)
- **TTL:** `Auto` ou `3600`

### 4. Salve e Aguarde

- Salve os registros no painel do provedor
- Aguarde a propagação DNS (5 minutos a 48 horas)
- Geralmente funciona em **5-30 minutos**

### 5. Verifique na Resend

- Volte para a página da Resend
- A Resend verificará automaticamente
- Quando estiver verde/verificado, está pronto!

## ⚙️ Configuração no Projeto

Após verificar o domínio, atualize o `.env`:

```env
RESEND_FROM_EMAIL=noreply@rastreagro.app
```

Ou use outros emails do domínio:

- `noreply@rastreagro.app`
- `contato@rastreagro.app`
- `suporte@rastreagro.app`
- Qualquer email `@rastreagro.app`

## 🧪 Testando

Após verificar o domínio:

1. Reinicie o backend
2. Teste o envio de email de recuperação de senha
3. Agora funcionará para **qualquer email**!

## ❓ Problemas Comuns

### "Domínio não verificado"

- Aguarde mais tempo (pode levar até 48h)
- Verifique se copiou os registros corretamente
- Verifique se salvou no provedor de domínio

### "Registros não aparecem"

- Aguarde a propagação DNS
- Use ferramentas como `nslookup` ou `dig` para verificar

### "Erro ao enviar email"

- Verifique se o domínio está verde na Resend
- Verifique se `RESEND_FROM_EMAIL` está correto no `.env`
- Reinicie o backend após mudar o `.env`

## 📚 Links Úteis

- **Resend Dashboard:** https://resend.com/domains
- **Documentação Resend:** https://resend.com/docs

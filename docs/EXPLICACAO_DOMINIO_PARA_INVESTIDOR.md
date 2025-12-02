# 📊 Explicação: Domínio e Custos - Resend

## 🎯 Para Investidores e Equipe

### ❓ Por que precisamos de um domínio?

**Resumo rápido:**

- A Resend oferece um domínio de **teste gratuito** (`onboarding@resend.dev`)
- Esse domínio **só funciona** para o email cadastrado na conta Resend
- Para enviar emails para **qualquer usuário** (clientes reais), precisamos de um **domínio próprio**

---

## 📧 Como funciona o envio de emails?

### ✅ **SITUAÇÃO ATUAL (Teste - GRATUITO)**

```
Email de origem: onboarding@resend.dev
Funciona para: rastreagro.br@gmail.com (email da conta Resend)
Custo: R$ 0,00
Limitação: Só envia para 1 email
```

**Quando usar:**

- ✅ Desenvolvimento
- ✅ Testes internos
- ✅ MVP inicial
- ✅ Validação de funcionalidades

**Não funciona para:**

- ❌ Enviar para clientes reais
- ❌ Enviar para qualquer email cadastrado no app
- ❌ Produção com usuários reais

---

### 🚀 **SITUAÇÃO IDEAL (Produção - COM DOMÍNIO)**

```
Email de origem: noreply@rastreagro.app
Funciona para: QUALQUER email
Custo: ~R$ 30-50/ano (domínio) + R$ 0 (Resend continua gratuito)
Sem limitações: Envia para qualquer usuário
```

**Quando usar:**

- ✅ Lançamento do app
- ✅ Usuários reais se cadastrando
- ✅ Produção
- ✅ Escalabilidade

---

## 💰 Custos Detalhados

### 1️⃣ **Domínio (Necessário para produção)**

| Item              | Custo    | Periodicidade | Onde comprar                           |
| ----------------- | -------- | ------------- | -------------------------------------- |
| Domínio `.app`    | R$ 30-50 | Anual         | Google Domains, Namecheap, Registro.br |
| Domínio `.com.br` | R$ 40-60 | Anual         | Registro.br                            |
| Domínio `.com`    | R$ 50-80 | Anual         | GoDaddy, Namecheap                     |

**Recomendação:**

- `.app` ou `.com.br` são mais baratos
- Custo único por ano (não mensal)
- Exemplo: `rastreagro.app` = ~R$ 40/ano

### 2️⃣ **Resend (Serviço de Email)**

| Plano    | Custo      | Limite                             | Quando usar                      |
| -------- | ---------- | ---------------------------------- | -------------------------------- |
| **Free** | R$ 0,00    | 100 emails/dia<br>3.000 emails/mês | ✅ MVP<br>✅ Testes<br>✅ Início |
| Pro      | R$ 100/mês | 50.000 emails/mês                  | Quando crescer                   |
| Business | R$ 500/mês | 200.000 emails/mês                 | Escala                           |

**Importante:**

- ✅ **Resend continua GRATUITO** mesmo com domínio próprio
- ✅ O domínio próprio **não aumenta** o custo da Resend
- ✅ Você só paga pelo domínio (~R$ 40/ano)

---

## 📊 Comparação de Cenários

### **Cenário 1: Desenvolvimento/Testes (ATUAL)**

```
✅ Custo: R$ 0,00
✅ Funciona: Para testes internos
❌ Limitação: Só 1 email
✅ Adequado: Para desenvolvimento
```

### **Cenário 2: MVP/Lançamento (RECOMENDADO)**

```
✅ Custo: R$ 40/ano (domínio)
✅ Funciona: Para todos os usuários
✅ Resend: Continua gratuito
✅ Adequado: Para lançamento
```

### **Cenário 3: Crescimento (FUTURO)**

```
✅ Custo: R$ 40/ano (domínio) + R$ 100/mês (Resend Pro)
✅ Funciona: Para todos os usuários
✅ Limite: 50.000 emails/mês
✅ Adequado: Quando tiver muitos usuários
```

---

## 🎯 Recomendações por Fase

### **FASE 1: Desenvolvimento (AGORA)**

- ✅ **Usar domínio de teste** (`onboarding@resend.dev`)
- ✅ **Custo: R$ 0,00**
- ✅ **Funciona perfeitamente** para desenvolvimento
- ✅ **Não precisa comprar domínio ainda**

### **FASE 2: MVP/Lançamento (QUANDO FOR LANÇAR)**

- ✅ **Comprar domínio** (~R$ 40/ano)
- ✅ **Configurar DNS** (gratuito, 30 minutos)
- ✅ **Resend continua gratuito**
- ✅ **Custo total: R$ 40/ano**

### **FASE 3: Crescimento (QUANDO TIVER MUITOS USUÁRIOS)**

- ✅ **Manter domínio** (R$ 40/ano)
- ✅ **Upgrade Resend** se necessário (R$ 100/mês)
- ✅ **Escalar conforme necessidade**

---

## 💡 Por que isso é importante?

### **Para o Investidor:**

1. **Custo baixo:** R$ 40/ano é investimento mínimo
2. **Escalável:** Começa gratuito, paga só quando crescer
3. **Profissional:** Emails com domínio próprio têm melhor reputação
4. **Necessário:** Sem domínio, não pode enviar para clientes reais

### **Para a Equipe:**

1. **Desenvolvimento:** Pode continuar sem custo
2. **Testes:** Funciona perfeitamente agora
3. **Lançamento:** Precisa comprar domínio antes de lançar
4. **Simples:** Configuração leva ~30 minutos

---

## 📋 Resumo Executivo

### **O que temos agora:**

- ✅ Sistema funcionando
- ✅ Envio de emails operacional
- ✅ Custo: R$ 0,00
- ⚠️ Limitação: Só funciona para 1 email (testes)

### **O que precisamos para produção:**

- ✅ Domínio próprio (~R$ 40/ano)
- ✅ Configuração DNS (gratuito, 30 min)
- ✅ Resend continua gratuito

### **Custo total para lançamento:**

- 💰 **R$ 40/ano** (domínio)
- 💰 **R$ 0,00/mês** (Resend - plano gratuito)
- 💰 **Total: R$ 3,33/mês** (dividido por 12 meses)

### **Quando comprar:**

- ⏰ **Agora:** Não precisa (desenvolvimento)
- ⏰ **Antes do lançamento:** Sim (1-2 semanas antes)
- ⏰ **Tempo de setup:** 30 minutos

---

## 🎬 Conclusão

**Para o Investidor:**

> "O sistema está funcionando perfeitamente para desenvolvimento sem custos. Para lançamento, precisamos investir R$ 40/ano em um domínio próprio. A Resend continua gratuita. É um investimento mínimo e necessário para enviar emails para clientes reais."

**Para a Equipe:**

> "Podemos continuar desenvolvendo sem custos. Quando for lançar, compramos o domínio (R$ 40/ano), configuramos em 30 minutos, e está pronto. Simples e barato."

---

## 📞 Próximos Passos

1. **Agora:** Continuar desenvolvimento sem custos ✅
2. **1-2 semanas antes do lançamento:** Comprar domínio
3. **Configurar DNS:** 30 minutos
4. **Lançar:** Sistema pronto para produção

---

**Última atualização:** 2025-11-29

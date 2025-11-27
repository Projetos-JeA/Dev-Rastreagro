# 🛒 FLUXO COMPLETO DE COMPRA E CUSTOS DE SERVIÇOS

## 📋 SUMÁRIO

1. [Fluxo Completo de Compra](#fluxo-completo-de-compra)
2. [Custos de Serviços](#custos-de-serviços)
3. [Integração de Pagamento](#integração-de-pagamento)
4. [Modelos de Dados](#modelos-de-dados)

---

## 🛒 FLUXO COMPLETO DE COMPRA

### 1. PRODUTOR VÊ COTAÇÕES

```
Produtor abre app → Tela "Deu Agro"
→ Sistema mostra cotações ordenadas por relevância (IA)
→ 90% no topo (score ≥ 90)
→ 10% depois (score 50-89)
```

### 2. PRODUTOR CLICA "DEU AGRO"

```
Produtor clica "Deu Agro" em uma cotação
→ Sistema cria Match (status: pending)
→ Notifica vendedor (empresa/prestador)
→ Habilita chat entre comprador e vendedor
```

### 3. NEGOCIAÇÃO NO CHAT

```
Comprador e vendedor conversam
→ Negociam quantidade, preço, condições
→ Vendedor pode enviar proposta personalizada
→ Comprador pode fazer contraproposta
```

### 4. COMPRADOR ADICIONA AO CARRINHO

```
Comprador clica "Adicionar ao Carrinho"
→ Sistema adiciona cotação ao carrinho
→ Cotação fica "reserved" (não aparece para outros)
→ Timer de X minutos para finalizar compra
```

### 5. FINALIZAR COMPRA

```
Comprador clica "Finalizar Compra"
→ Tela de resumo do pedido
→ Seleciona método de pagamento (Crédito, Débito, PIX)
→ Confirma dados de entrega
→ Clica "Pagar"
```

### 6. PROCESSAMENTO DE PAGAMENTO

```
Sistema processa pagamento via gateway
→ Se PIX: Gera QR Code / Código PIX
→ Se Cartão: Processa via gateway
→ Aguarda confirmação
→ Atualiza status do pedido
```

### 7. CONFIRMAÇÃO E NOTIFICAÇÕES

```
Pagamento confirmado
→ Pedido fica "paid"
→ Cotação fica "sold" (some da exposição)
→ Notifica vendedor
→ Gera comprovante
→ Envia email para ambos
```

### 8. ENTREGA E CONFIRMAÇÃO

```
Vendedor confirma entrega
→ Comprador confirma recebimento
→ Pedido fica "completed"
→ Libera pagamento para vendedor (se houver retenção)
```

---

## 💰 CUSTOS DE SERVIÇOS

### 1. OPENAI (IA para Matching)

**Serviço**: Embeddings + GPT-3.5-turbo

**Custos**:

- **Embeddings** (`text-embedding-3-small`):
  - Geração: $0.00002 por cotação
  - Busca: $0.00002 por cotação × comprador
  - **Exemplo**: 1000 cotações, 100 compradores/dia
  - Geração: 1000 × $0.00002 = **$0.02/dia** = **$0.60/mês**
  - Busca: 100 × 1000 × $0.00002 = **$2.00/dia** = **$60/mês**
  - **Total Embeddings: ~$60.60/mês**

- **GPT-3.5-turbo** (opcional, para contexto complexo):
  - $0.0015 por 1K tokens (input)
  - $0.002 por 1K tokens (output)
  - **Exemplo**: 100 requisições/dia, ~500 tokens cada
  - 100 × 500 = 50K tokens/dia
  - Custo: 50K × $0.0015 = **$0.075/dia** = **$2.25/mês**

**Total OpenAI**: ~$63/mês (com GPT-3.5) ou ~$61/mês (só embeddings)

**Limite Gratuito**: OpenAI oferece $5 de crédito inicial (teste)

---

### 2. GATEWAY DE PAGAMENTO

#### Opção A: Stripe (Recomendada - Internacional)

**Custos**:

- Taxa por transação: **2.9% + R$ 0.30** (cartão de crédito)
- Taxa por transação: **2.5% + R$ 0.30** (cartão de débito)
- PIX: **Não suporta diretamente** (precisa de outro serviço)

**Exemplo**:

- Venda de R$ 1.000,00
- Taxa: R$ 1.000 × 2.9% + R$ 0.30 = **R$ 29,30**
- **Custo mensal**: Sem taxa fixa, só por transação

**Vantagens**:

- ✅ Aceita cartão de crédito e débito
- ✅ Internacional (aceita cartões estrangeiros)
- ✅ API robusta e confiável
- ✅ Dashboard completo

**Desvantagens**:

- ❌ Não aceita PIX diretamente
- ❌ Taxa um pouco mais alta

---

#### Opção B: Mercado Pago (Recomendada - Brasil)

**Custos**:

- Cartão de crédito: **4.99% + R$ 0.39** por transação
- Cartão de débito: **2.99% + R$ 0.39** por transação
- PIX: **0.99%** por transação (sem taxa fixa)
- Boleto: **R$ 3,49** por transação

**Exemplo**:

- Venda de R$ 1.000,00
- Crédito: R$ 1.000 × 4.99% + R$ 0.39 = **R$ 50,29**
- Débito: R$ 1.000 × 2.99% + R$ 0.39 = **R$ 30,29**
- PIX: R$ 1.000 × 0.99% = **R$ 9,90**

**Vantagens**:

- ✅ Aceita PIX (essencial no Brasil)
- ✅ Aceita cartão de crédito e débito
- ✅ Aceita boleto
- ✅ API brasileira, fácil integração
- ✅ Sem taxa fixa mensal

**Desvantagens**:

- ❌ Taxa de crédito mais alta que Stripe
- ❌ Focado no Brasil (não aceita cartões estrangeiros)

---

#### Opção C: Asaas (Brasil - Mais Barato)

**Custos**:

- Cartão de crédito: **3.99% + R$ 0.40** por transação
- Cartão de débito: **1.99% + R$ 0.40** por transação
- PIX: **0.99%** por transação
- Boleto: **R$ 2,50** por transação

**Exemplo**:

- Venda de R$ 1.000,00
- Crédito: R$ 1.000 × 3.99% + R$ 0.40 = **R$ 40,30**
- Débito: R$ 1.000 × 1.99% + R$ 0.40 = **R$ 20,30**
- PIX: R$ 1.000 × 0.99% = **R$ 9,90**

**Vantagens**:

- ✅ Taxas mais baixas
- ✅ Aceita PIX, cartão, boleto
- ✅ API brasileira

**Desvantagens**:

- ❌ Menos conhecido que Mercado Pago
- ❌ Dashboard pode ser menos completo

---

#### Opção D: PagSeguro (Brasil)

**Custos**:

- Cartão de crédito: **4.99% + R$ 0.40** por transação
- Cartão de débito: **2.99% + R$ 0.40** por transação
- PIX: **0.99%** por transação
- Boleto: **R$ 3,50** por transação

**Similar ao Mercado Pago**

---

### 3. EMAIL (Resend)

**Serviço**: Resend (já configurado)

**Custos**:

- **Plano Free**: 3.000 emails/mês grátis
- **Plano Pro**: $20/mês = 50.000 emails/mês
- **Plano Business**: $80/mês = 200.000 emails/mês

**Exemplo**:

- 100 usuários ativos
- ~10 emails por usuário/mês (verificação, notificações, etc.)
- Total: 1.000 emails/mês
- **Custo: GRÁTIS** (dentro do plano free)

**Se crescer**:

- 5.000 emails/mês = **$20/mês**

---

### 4. HOSPEDAGEM (Opcional - Futuro)

#### Backend (FastAPI)

- **Opção 1**: Railway, Render (gratuito até certo limite)
- **Opção 2**: AWS, Azure, GCP (~$10-50/mês)
- **Opção 3**: VPS (DigitalOcean, Linode) (~$5-20/mês)

#### Frontend (React Native Web)

- **Opção 1**: Vercel, Netlify (gratuito)
- **Opção 2**: AWS S3 + CloudFront (~$1-5/mês)

#### Banco de Dados (SQL Server)

- **Opção 1**: SQL Server Express (gratuito, local)
- **Opção 2**: Azure SQL Database (~$5-50/mês)
- **Opção 3**: AWS RDS SQL Server (~$15-100/mês)

---

## 💳 INTEGRAÇÃO DE PAGAMENTO

### RECOMENDAÇÃO: Mercado Pago (Brasil)

**Por quê?**

- ✅ Aceita PIX (essencial no Brasil)
- ✅ Aceita cartão de crédito e débito
- ✅ API brasileira, documentação em português
- ✅ Sem taxa fixa mensal
- ✅ Dashboard completo

---

### MÉTODOS DE PAGAMENTO SUPORTADOS

1. **PIX**
   - Taxa: 0.99% por transação
   - Confirmação: Instantânea (até 2 minutos)
   - Melhor para valores altos

2. **Cartão de Crédito**
   - Taxa: 4.99% + R$ 0.39 por transação
   - Confirmação: Imediata
   - Parcelamento: Até 12x (opcional)

3. **Cartão de Débito**
   - Taxa: 2.99% + R$ 0.39 por transação
   - Confirmação: Imediata
   - Melhor para valores menores

4. **Boleto** (Opcional)
   - Taxa: R$ 3,49 por transação
   - Confirmação: 1-3 dias úteis
   - Útil para valores muito altos

---

### FLUXO DE PAGAMENTO

#### 1. Comprador Seleciona Método

```
Tela de pagamento
→ Seleciona: PIX / Crédito / Débito
→ Preenche dados (se cartão)
→ Clica "Pagar"
```

#### 2. Sistema Processa

```
Backend chama API do Mercado Pago
→ Se PIX: Gera QR Code / Código PIX
→ Se Cartão: Processa transação
→ Aguarda confirmação
```

#### 3. Confirmação

```
Pagamento confirmado
→ Atualiza status do pedido para "paid"
→ Notifica comprador e vendedor
→ Gera comprovante
```

---

## 📊 MODELOS DE DADOS

### 1. `Cart` (Carrinho)

```python
- id
- buyer_id (FK para User)
- created_at
- updated_at
- expires_at (timer de X minutos)
- items (relationship com CartItem)
```

### 2. `CartItem` (Item do Carrinho)

```python
- id
- cart_id (FK)
- quotation_id (FK)
- quantity (quantidade negociada)
- unit_price (preço unitário negociado)
- total_price (quantity × unit_price)
- notes (observações da negociação)
```

### 3. `Order` (Pedido)

```python
- id
- buyer_id (FK)
- seller_id (FK)
- cart_id (FK)
- status (enum: "pending" | "paid" | "shipped" | "delivered" | "cancelled")
- total_amount (valor total)
- payment_method (enum: "pix" | "credit_card" | "debit_card" | "boleto")
- payment_status (enum: "pending" | "paid" | "failed" | "refunded")
- payment_id (ID do pagamento no gateway)
- shipping_address (endereço de entrega)
- created_at
- updated_at
```

### 4. `OrderItem` (Item do Pedido)

```python
- id
- order_id (FK)
- quotation_id (FK)
- quantity
- unit_price
- total_price
```

### 5. `Payment` (Pagamento)

```python
- id
- order_id (FK)
- payment_method
- amount
- status (enum: "pending" | "paid" | "failed" | "refunded")
- gateway_payment_id (ID no Mercado Pago)
- gateway_response (JSON - resposta completa do gateway)
- pix_qr_code (se PIX)
- pix_code (se PIX)
- created_at
- paid_at
```

---

## 🔧 ENDPOINTS NECESSÁRIOS

### Carrinho

- `POST /cart` - Criar carrinho
- `GET /cart/my` - Meu carrinho
- `POST /cart/items` - Adicionar item ao carrinho
- `PUT /cart/items/{id}` - Atualizar item
- `DELETE /cart/items/{id}` - Remover item
- `DELETE /cart` - Limpar carrinho

### Pedidos

- `POST /orders` - Criar pedido (finalizar compra)
- `GET /orders/my` - Meus pedidos (comprador)
- `GET /orders/sales` - Minhas vendas (vendedor)
- `GET /orders/{id}` - Detalhes do pedido

### Pagamento

- `POST /payments` - Processar pagamento
- `GET /payments/{id}` - Status do pagamento
- `POST /payments/{id}/webhook` - Webhook do gateway (confirmação)
- `GET /payments/pix/{id}/qr-code` - QR Code PIX

---

## 📈 RESUMO DE CUSTOS MENSAIS

### Cenário Conservador (100 usuários, 500 transações/mês)

| Serviço                 | Custo Mensal                 |
| ----------------------- | ---------------------------- |
| **OpenAI (Embeddings)** | $61/mês (~R$ 305)            |
| **Mercado Pago**        | R$ 0 (só taxa por transação) |
| **Resend (Email)**      | R$ 0 (dentro do free)        |
| **Hospedagem**          | R$ 0 (local por enquanto)    |
| **TOTAL**               | **~R$ 305/mês**              |

### Cenário Médio (500 usuários, 2.000 transações/mês)

| Serviço                 | Custo Mensal                 |
| ----------------------- | ---------------------------- |
| **OpenAI (Embeddings)** | $305/mês (~R$ 1.525)         |
| **Mercado Pago**        | R$ 0 (só taxa por transação) |
| **Resend (Email)**      | R$ 100/mês (plano Pro)       |
| **Hospedagem**          | R$ 50/mês (VPS)              |
| **TOTAL**               | **~R$ 1.675/mês**            |

### Custos por Transação (Mercado Pago)

| Método      | Taxa por R$ 1.000          |
| ----------- | -------------------------- |
| **PIX**     | R$ 9,90 (0.99%)            |
| **Débito**  | R$ 30,29 (2.99% + R$ 0,39) |
| **Crédito** | R$ 50,29 (4.99% + R$ 0,39) |
| **Boleto**  | R$ 3,49 (fixo)             |

**Nota**: Essas taxas são pagas pelo vendedor, não pela plataforma.

---

## 🎯 RECOMENDAÇÕES FINAIS

### Para Começar (MVP):

1. **OpenAI**: Usar plano gratuito ($5 crédito) para testes
2. **Mercado Pago**: Conta gratuita, só paga por transação
3. **Resend**: Plano free (3.000 emails/mês)
4. **Hospedagem**: Local (desenvolvimento)

### Quando Crescer:

1. **OpenAI**: Avaliar custo vs benefício (pode otimizar)
2. **Mercado Pago**: Negociar taxas menores (volume)
3. **Resend**: Upgrade para Pro se necessário
4. **Hospedagem**: Migrar para cloud quando necessário

---

## 📝 CHECKLIST DE IMPLEMENTAÇÃO

### Backend:

- [ ] Instalar SDK do Mercado Pago
- [ ] Criar models: Cart, CartItem, Order, OrderItem, Payment
- [ ] Criar migration
- [ ] Criar service de pagamento (`PaymentService`)
- [ ] Criar endpoints de carrinho
- [ ] Criar endpoints de pedidos
- [ ] Criar endpoints de pagamento
- [ ] Implementar webhook do Mercado Pago
- [ ] Criar dados de teste

### Testes:

- [ ] Testar adicionar ao carrinho
- [ ] Testar finalizar compra
- [ ] Testar pagamento PIX
- [ ] Testar pagamento cartão
- [ ] Testar webhook de confirmação
- [ ] Testar cancelamento de pedido

---

**Documento criado para planejamento de custos e fluxo de compra**

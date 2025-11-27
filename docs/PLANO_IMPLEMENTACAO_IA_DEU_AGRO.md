# 🧠 PLANO DE IMPLEMENTAÇÃO - "DEU AGRO" COM IA

## 🎯 OBJETIVO

Implementar sistema de matching inteligente usando IA desde o início, com:

- **90% das cotações relevantes no topo** (score ≥ 90)
- **10% de cotações menos relevantes** (score 50-89)
- **Backend-first** (testar no Swagger)
- **Sem verificação de email** (para testes)
- **Todos os perfis criados** (produtor, empresa, prestador)

---

## 🤖 ESCOLHA DA IA

### Opção 1: OpenAI GPT-4/GPT-3.5-turbo (RECOMENDADA)

**Custo**: ~$0.002 por requisição (muito barato)
**Vantagens**:

- ✅ API pronta e confiável
- ✅ Entende contexto em português
- ✅ Não precisa treinar modelo próprio
- ✅ Embeddings para similaridade semântica
- ✅ Pode usar `text-embedding-3-small` (gratuito até certo limite)

**Como funciona**:

- Usa **embeddings** para calcular similaridade entre perfil do comprador e descrição da cotação
- Usa **GPT-3.5-turbo** para entender contexto e sinônimos
- Combina embeddings + regras simples = score final

**Custo estimado**:

- 1000 cotações/dia = ~$2/mês
- Embeddings: $0.00002 por cotação

### Opção 2: Ollama (Local - Gratuito)

**Custo**: Gratuito (roda localmente)
**Vantagens**:

- ✅ Sem custo
- ✅ Dados não saem do servidor
- ✅ Modelos como `llama3`, `mistral`

**Desvantagens**:

- ⚠️ Precisa instalar e configurar
- ⚠️ Consome recursos do servidor
- ⚠️ Pode ser mais lento

### Opção 3: Hugging Face (Gratuito com limites)

**Custo**: Gratuito até certo limite
**Vantagens**:

- ✅ Modelos em português (BERT, multilingual)
- ✅ API simples

**Desvantagens**:

- ⚠️ Limite de requisições
- ⚠️ Pode ser mais lento

---

## 💡 RECOMENDAÇÃO: OpenAI (Híbrido)

**Estratégia Híbrida**:

1. **Embeddings** (OpenAI) para similaridade semântica → 70% do score
2. **Regras simples** (atividades, localização) → 30% do score
3. **GPT-3.5-turbo** (opcional) para entender contexto complexo

**Por quê?**

- Embeddings são baratos e rápidos
- Entendem sinônimos automaticamente ("pulverização" = "aplicação de defensivos")
- Podemos começar simples e evoluir

---

## 📊 ARQUITETURA PROPOSTA

### 1. MODELOS DE DADOS

#### `Quotation` (Cotação)

```python
- id
- seller_id (FK para User - empresa ou prestador)
- seller_type (enum: "company" | "service_provider")
- title (ex: "Venda de boi")
- description (texto livre - será analisado pela IA)
- category (enum: "agriculture" | "livestock" | "service")
- product_type (ex: "boi", "defensivo", "pulverização")
- location (cidade, estado)
- price (opcional)
- quantity (opcional)
- unit (ex: "kg", "unidade", "lote")
- status (enum: "active" | "reserved" | "sold" | "expired")
- expires_at (opcional - data de expiração)
- created_at
- updated_at
- embedding (vetor de 1536 dimensões - OpenAI embedding)
```

#### `Match` (Deu Agro)

```python
- id
- quotation_id (FK)
- buyer_id (FK para User - produtor/comprador)
- score (0-100) - score calculado pela IA
- status (enum: "pending" | "accepted" | "rejected" | "completed")
- created_at
```

#### `BuyerPreferences` (Preferências do Comprador)

```python
- id
- user_id (FK)
- search_history (JSON - histórico de buscas)
- preferred_locations (array de estados/cidades)
- preferred_categories (array)
- embedding_profile (vetor - embedding do perfil completo)
- updated_at
```

---

## 🔧 IMPLEMENTAÇÃO - FASE 1 (Backend)

### PASSO 1: Instalar Dependências

```bash
cd backend
pip install openai python-dotenv
```

**Arquivo**: `backend/requirements.txt`

```txt
openai>=1.0.0
python-dotenv>=1.0.0
numpy>=1.24.0  # Para cálculos de similaridade
```

---

### PASSO 2: Configurar OpenAI

**Arquivo**: `backend/.env`

```env
OPENAI_API_KEY=sk-...
```

**Arquivo**: `backend/app/core/config.py`

```python
openai_api_key: str = Field(default="", alias="OPENAI_API_KEY")
```

---

### PASSO 3: Criar Service de IA

**Arquivo**: `backend/app/services/ai_matching_service.py`

**Funções principais**:

1. `generate_embedding(text: str) -> list[float]`
   - Gera embedding usando `text-embedding-3-small`
   - Retorna vetor de 1536 dimensões

2. `calculate_relevance_score(buyer_profile: dict, quotation: dict) -> float`
   - Calcula similaridade entre embeddings
   - Aplica regras (localização, atividades)
   - Retorna score 0-100

3. `get_relevant_quotations(buyer_id: int, limit: int = 100) -> list[dict]`
   - Busca todas cotações ativas
   - Calcula score para cada uma
   - Ordena por score (90%+ no topo)
   - Retorna lista ordenada

---

### PASSO 4: Criar Modelos e Migrations

**Arquivo**: `backend/app/models/quotation.py`

- Model `Quotation` com todos os campos

**Arquivo**: `backend/app/models/match.py`

- Model `Match` para "Deu Agro"

**Migration**: `alembic/versions/XXXXX_create_quotations_and_matches.py`

---

### PASSO 5: Criar Endpoints (Swagger)

#### 5.1. Criar Cotação

```
POST /quotations
Body: {
  "title": "Venda de boi",
  "description": "Boi gordo, vacinado, pronto para abate",
  "category": "livestock",
  "product_type": "boi",
  "price": 5000.00,
  "quantity": 10,
  "unit": "unidade",
  "expires_at": "2024-12-31"
}
```

#### 5.2. Listar Cotações Relevantes (para comprador)

```
GET /quotations/relevant?buyer_id=1&limit=50
Response: {
  "quotations": [
    {
      "id": 1,
      "title": "Venda de boi",
      "score": 95.5,  // Score calculado pela IA
      "seller_nickname": "Fazenda Oliveira",
      ...
    }
  ],
  "total": 50,
  "high_relevance_count": 45  // 90% com score ≥ 90
}
```

#### 5.3. "Dar Agro" (Criar Match)

```
POST /matches
Body: {
  "quotation_id": 1,
  "buyer_id": 1
}
```

#### 5.4. Listar Minhas Cotações (vendedor)

```
GET /quotations/my?seller_id=2
```

#### 5.5. Atualizar Embedding (quando cotação é criada/editada)

```
POST /quotations/{id}/update-embedding
```

---

### PASSO 6: Criar Dados de Teste (Seed)

**Arquivo**: `backend/app/scripts/create_test_data.py`

**Criar**:

- 3 Produtores (diferentes atividades)
- 2 Empresas (diferentes segmentos)
- 2 Prestadores (diferentes serviços)
- 10-20 Cotações variadas

**Comando**:

```bash
python -m app.scripts.create_test_data
```

---

### PASSO 7: Desabilitar Verificação de Email (Temporário)

**Arquivo**: `backend/app/services/auth_service.py`

```python
# TEMPORÁRIO: Pular verificação de email
user.email_verificado = True  # Em vez de False
```

---

## 🧪 TESTANDO NO SWAGGER

### Fluxo de Teste:

1. **Criar usuários** (sem verificação de email):
   - POST `/auth/register` → Criar produtor
   - POST `/auth/register` → Criar empresa
   - POST `/auth/register` → Criar prestador

2. **Criar cotações**:
   - POST `/quotations` → Empresa cria cotação de produto
   - POST `/quotations` → Prestador cria cotação de serviço

3. **Testar matching**:
   - GET `/quotations/relevant?buyer_id=1`
   - Verificar se cotações aparecem ordenadas por score
   - Verificar se 90% têm score ≥ 90

4. **Testar "Deu Agro"**:
   - POST `/matches` → Produtor "dá agro" em cotação
   - GET `/matches/my?buyer_id=1` → Ver matches do produtor

---

## 📈 ALGORITMO DE SCORE (Híbrido)

### Fórmula:

```
Score Final = (Similaridade Embedding × 70) + (Regras × 30)
```

### Similaridade Embedding (70%):

1. Gera embedding do perfil do comprador:
   - Concatena: atividades + localização + tipo de produtor
   - Ex: "Soja, Milho, Bovinos, Goiás, Agricultor"

2. Gera embedding da cotação:
   - Concatena: title + description + category + product_type
   - Ex: "Venda de defensivos para soja, aplicação em plantio, agricultura, defensivo"

3. Calcula similaridade (cosine similarity):
   - `similarity = cosine(embedding_buyer, embedding_quotation)`
   - Retorna valor entre 0 e 1

4. Converte para 0-70 pontos:
   - `score_embedding = similarity × 70`

### Regras Simples (30%):

1. **Atividade Match** (15 pontos):
   - Se atividade do comprador = produto/serviço da cotação → 15 pontos
   - Ex: Comprador tem "Soja" e cotação é "defensivo para soja" → 15 pontos

2. **Localização Match** (10 pontos):
   - Mesmo estado → 10 pontos
   - Estado vizinho → 5 pontos
   - Estados diferentes → 0 pontos

3. **Categoria Match** (5 pontos):
   - Comprador "Agricultor" + cotação "agricultura" → 5 pontos
   - Comprador "Pecuarista" + cotação "pecuária" → 5 pontos

### Score Final:

```
Score = score_embedding + score_atividade + score_localizacao + score_categoria
```

**Exemplo**:

- Similaridade embedding: 0.9 → 63 pontos
- Atividade match: 15 pontos
- Localização match: 10 pontos
- Categoria match: 5 pontos
- **Total: 93 pontos** → Aparece no topo (≥ 90)

---

## 🎯 ORDENAÇÃO FINAL

1. **Cotações com score ≥ 90**: Aparecem primeiro (90% do total)
2. **Cotações com score 50-89**: Aparecem depois (10% do total)
3. **Cotações com score < 50**: Não aparecem

**Dentro de cada grupo**, ordenar por:

- Score (maior primeiro)
- Data (mais recente primeiro)

---

## 📝 CHECKLIST DE IMPLEMENTAÇÃO

### Backend:

- [ ] Instalar `openai` e `numpy`
- [ ] Adicionar `OPENAI_API_KEY` no `.env`
- [ ] Criar `AIMatchingService`
- [ ] Criar models `Quotation` e `Match`
- [ ] Criar migration
- [ ] Criar endpoints no Swagger:
  - [ ] POST `/quotations` (criar cotação)
  - [ ] GET `/quotations/relevant` (listar relevantes)
  - [ ] POST `/matches` (dar agro)
  - [ ] GET `/matches/my` (meus matches)
  - [ ] GET `/quotations/my` (minhas cotações)
- [ ] Criar script de dados de teste
- [ ] Desabilitar verificação de email (temporário)
- [ ] Testar no Swagger

### Testes:

- [ ] Criar 3 produtores diferentes
- [ ] Criar 2 empresas diferentes
- [ ] Criar 2 prestadores diferentes
- [ ] Criar 20 cotações variadas
- [ ] Testar matching para cada produtor
- [ ] Verificar se 90% têm score ≥ 90
- [ ] Testar "Deu Agro"

---

## 💰 CUSTO ESTIMADO (OpenAI)

**Por mês** (assumindo 1000 cotações ativas, 100 compradores):

- Embeddings (geração): 1000 cotações × $0.00002 = **$0.02**
- Embeddings (busca): 100 compradores × 1000 cotações × $0.00002 = **$2.00**
- **Total: ~$2.02/mês** (muito barato!)

**Se usar GPT-3.5-turbo** (opcional, para contexto complexo):

- ~$0.002 por requisição
- 100 requisições/dia = **$6/mês**

**Total máximo: ~$8/mês** (muito acessível)

---

## 🚀 PRÓXIMOS PASSOS

1. **Decidir qual IA usar** (recomendo OpenAI)
2. **Criar conta OpenAI** e obter API key
3. **Implementar Fase 1** (backend)
4. **Testar no Swagger**
5. **Ajustar pesos** do algoritmo (70/30 ou 80/20)
6. **Coletar feedback** dos testes
7. **Evoluir** conforme necessário

---

## 📚 REFERÊNCIAS

- **OpenAI Embeddings**: https://platform.openai.com/docs/guides/embeddings
- **Cosine Similarity**: https://en.wikipedia.org/wiki/Cosine_similarity
- **OpenAI Pricing**: https://openai.com/pricing

---

**Documento criado para planejamento da implementação com IA**

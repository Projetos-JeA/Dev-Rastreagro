# 🆓 COMO TESTAR SEM CUSTOS - Guia Completo

## 🎯 OBJETIVO

Implementar e testar todo o sistema "Deu Agro" + fluxo de compra **sem pagar nada**, usando:

- Versões gratuitas/sandbox dos serviços
- Créditos iniciais
- Ambientes de teste

---

## 🤖 1. OPENAI (IA) - GRATUITO PARA TESTES

### Opção A: Crédito Inicial Gratuito ($5)

**Como obter**:

1. Criar conta em https://platform.openai.com
2. Adicionar método de pagamento (não cobra nada)
3. Recebe **$5 de crédito gratuito** automaticamente
4. Crédito expira em 3 meses

**O que dá para testar com $5**:

- Embeddings: $5 ÷ $0.00002 = **250.000 embeddings**
- GPT-3.5-turbo: ~2.500 requisições
- **Suficiente para meses de desenvolvimento!**

**Custo**: **GRÁTIS** (dentro do crédito)

---

### Opção B: Ollama (100% Gratuito - Local)

**Como instalar**:

```bash
# Windows (PowerShell)
winget install Ollama.Ollama

# Ou baixar de: https://ollama.com
```

**Como usar**:

```python
# Em vez de OpenAI, usar Ollama local
import requests

def generate_embedding_ollama(text: str):
    response = requests.post(
        "http://localhost:11434/api/embeddings",
        json={
            "model": "nomic-embed-text",  # Modelo gratuito
            "prompt": text
        }
    )
    return response.json()["embedding"]
```

**Vantagens**:

- ✅ 100% gratuito
- ✅ Dados não saem do servidor
- ✅ Sem limites

**Desvantagens**:

- ⚠️ Precisa instalar e rodar localmente
- ⚠️ Pode ser mais lento
- ⚠️ Embeddings podem ser menos precisos

**Custo**: **GRÁTIS**

---

### Opção C: Hugging Face (Gratuito com limites)

**Como usar**:

1. Criar conta em https://huggingface.co
2. Obter token de API (gratuito)
3. Usar modelos gratuitos:
   - `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` (português)

**Limites**:

- 1.000 requisições/hora (gratuito)
- Suficiente para testes

**Custo**: **GRÁTIS**

---

## 💳 2. MERCADO PAGO - SANDBOX (100% GRATUITO)

### Como Configurar Sandbox

**Passo 1**: Criar conta em https://www.mercadopago.com.br

**Passo 2**: Acessar Credenciais de Teste

- Dashboard → Desenvolvedores → Suas integrações
- Criar aplicação de teste
- Copiar **Access Token** de teste

**Passo 3**: Usar Ambiente Sandbox

```python
# backend/.env
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxx  # Token de teste
MERCADOPAGO_PUBLIC_KEY=TEST-xxxxx     # Chave pública de teste
MERCADOPAGO_USE_SANDBOX=true          # Usar ambiente de teste
```

**O que funciona no Sandbox**:

- ✅ Criar pagamentos
- ✅ Gerar QR Code PIX (fake)
- ✅ Processar cartões (números de teste)
- ✅ Webhooks de teste
- ✅ Todas as funcionalidades

**Cartões de Teste**:

- Crédito aprovado: `5031 4332 1540 6351`
- Débito aprovado: `5031 4332 1540 6351`
- CVV: `123`
- Data: qualquer data futura

**PIX de Teste**:

- Gera QR Code fake
- Pode simular pagamento manualmente

**Custo**: **GRÁTIS** (sandbox é sempre gratuito)

---

## 📧 3. RESEND (EMAIL) - JÁ GRATUITO

**Plano Free**:

- 3.000 emails/mês grátis
- Suficiente para desenvolvimento e testes iniciais

**Custo**: **GRÁTIS** (já configurado)

---

## 🗄️ 4. BANCO DE DADOS - LOCAL (GRATUITO)

**SQL Server Express**:

- Já está instalado e rodando localmente
- Sem custos

**Custo**: **GRATUITO**

---

## 🚀 ESTRATÉGIA RECOMENDADA PARA TESTES

### FASE 1: Desenvolvimento (Sem Custos)

1. **IA**: Usar **Ollama local** ou **Hugging Face** (gratuito)
2. **Pagamento**: Usar **Mercado Pago Sandbox** (gratuito)
3. **Email**: Usar **Resend Free** (já configurado)
4. **Banco**: SQL Server local (gratuito)

**Custo Total**: **R$ 0,00**

---

### FASE 2: Testes Avançados (Opcional)

1. **IA**: Usar **OpenAI com $5 crédito** (gratuito)
   - Testar qualidade dos embeddings
   - Comparar com Ollama
   - Decidir qual usar em produção

2. **Pagamento**: Continuar com **Sandbox** até estar pronto para produção

**Custo Total**: **R$ 0,00** (dentro do crédito)

---

## 🔧 IMPLEMENTAÇÃO SEM CUSTOS

### 1. Configurar Ollama (IA Local)

**Instalar**:

```bash
# Windows
winget install Ollama.Ollama

# Ou baixar: https://ollama.com/download
```

**Baixar modelo**:

```bash
ollama pull nomic-embed-text
```

**Código Python**:

```python
# backend/app/services/ai_matching_service.py
import requests
import numpy as np
from typing import List

class AIMatchingService:
    def __init__(self):
        self.ollama_url = "http://localhost:11434/api/embeddings"
        self.model = "nomic-embed-text"

    def generate_embedding(self, text: str) -> List[float]:
        """Gera embedding usando Ollama (gratuito)"""
        response = requests.post(
            self.ollama_url,
            json={"model": self.model, "prompt": text},
            timeout=30
        )
        return response.json()["embedding"]

    def cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calcula similaridade de cosseno"""
        vec1 = np.array(vec1)
        vec2 = np.array(vec2)
        return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))
```

**Vantagem**: 100% gratuito, sem limites, dados locais

---

### 2. Configurar Mercado Pago Sandbox

**Instalar SDK**:

```bash
cd backend
pip install mercadopago
```

**Configurar**:

```python
# backend/app/core/config.py
mercadopago_access_token: str = Field(default="", alias="MERCADOPAGO_ACCESS_TOKEN")
mercadopago_public_key: str = Field(default="", alias="MERCADOPAGO_PUBLIC_KEY")
mercadopago_use_sandbox: bool = Field(default=True, alias="MERCADOPAGO_USE_SANDBOX")
```

**Service de Pagamento**:

```python
# backend/app/services/payment_service.py
import mercadopago

class PaymentService:
    def __init__(self):
        access_token = settings.mercadopago_access_token
        self.mp = mercadopago.SDK(access_token)

    def create_pix_payment(self, amount: float, description: str):
        """Cria pagamento PIX (sandbox)"""
        payment_data = {
            "transaction_amount": amount,
            "description": description,
            "payment_method_id": "pix",
            "payer": {
                "email": "test@test.com"  # Email de teste
            }
        }
        result = self.mp.payment().create(payment_data)
        return result["response"]
```

**Custo**: **GRATUITO** (sandbox)

---

### 3. Alternar entre Ollama e OpenAI

**Estratégia**: Criar interface comum

```python
# backend/app/services/ai_matching_service.py
from abc import ABC, abstractmethod

class EmbeddingProvider(ABC):
    @abstractmethod
    def generate_embedding(self, text: str) -> List[float]:
        pass

class OllamaProvider(EmbeddingProvider):
    """Gratuito, local"""
    def generate_embedding(self, text: str) -> List[float]:
        # Implementação Ollama
        pass

class OpenAIProvider(EmbeddingProvider):
    """Pago, mas mais preciso"""
    def generate_embedding(self, text: str) -> List[float]:
        # Implementação OpenAI
        pass

# Escolher provider via .env
AI_PROVIDER=ollama  # ou openai
```

---

## 📝 CHECKLIST DE IMPLEMENTAÇÃO SEM CUSTOS

### Setup Inicial:

- [ ] Instalar Ollama localmente
- [ ] Baixar modelo `nomic-embed-text`
- [ ] Criar conta Mercado Pago (sandbox)
- [ ] Obter tokens de teste do Mercado Pago
- [ ] Configurar `.env` com tokens de teste

### Backend:

- [ ] Criar `AIMatchingService` com suporte a Ollama
- [ ] Criar `PaymentService` com Mercado Pago Sandbox
- [ ] Criar models: Quotation, Match, Cart, Order, Payment
- [ ] Criar migrations
- [ ] Criar endpoints no Swagger
- [ ] Criar script de dados de teste

### Testes:

- [ ] Testar geração de embeddings (Ollama)
- [ ] Testar matching de cotações
- [ ] Testar criação de pagamento PIX (sandbox)
- [ ] Testar criação de pagamento cartão (sandbox)
- [ ] Testar webhook do Mercado Pago
- [ ] Verificar que tudo funciona sem custos

---

## 🎯 QUANDO MIGRAR PARA PRODUÇÃO

### IA:

- **Ollama**: Continuar usando se funcionar bem
- **OpenAI**: Migrar se precisar de mais precisão
  - Custo: ~R$ 305/mês (100 usuários)
  - Pode começar com crédito de $5

### Pagamento:

- **Mercado Pago**: Migrar de sandbox para produção
  - Mesma API, só trocar tokens
  - Custo: Só taxas por transação (vendedor paga)

### Email:

- **Resend**: Continuar free até 3.000 emails/mês
  - Upgrade quando necessário

---

## 💡 DICAS IMPORTANTES

### 1. Ollama pode ser mais lento

- Embeddings podem levar 1-2 segundos
- Para produção, considerar OpenAI se velocidade for crítica

### 2. Mercado Pago Sandbox

- Pagamentos não são reais
- Use cartões de teste fornecidos
- Webhooks funcionam normalmente

### 3. Testar tudo antes de ir para produção

- Validar matching com Ollama
- Testar todos os fluxos de pagamento
- Garantir que webhooks funcionam

---

## 📊 RESUMO: CUSTOS PARA TESTES

| Serviço            | Versão de Teste  | Custo                          |
| ------------------ | ---------------- | ------------------------------ |
| **IA (Ollama)**    | Local            | **GRÁTIS**                     |
| **IA (OpenAI)**    | $5 crédito       | **GRÁTIS** (dentro do crédito) |
| **Mercado Pago**   | Sandbox          | **GRÁTIS**                     |
| **Resend**         | Free (3K emails) | **GRÁTIS**                     |
| **Banco de Dados** | Local            | **GRÁTIS**                     |
| **TOTAL**          |                  | **R$ 0,00**                    |

---

## 🚀 PRÓXIMOS PASSOS

1. **Instalar Ollama** (se escolher IA local)
2. **Criar conta Mercado Pago** e obter tokens de teste
3. **Implementar com versões gratuitas**
4. **Testar tudo no Swagger**
5. **Decidir quando migrar para produção** (quando tiver usuários reais)

---

**Documento criado para implementação sem custos**

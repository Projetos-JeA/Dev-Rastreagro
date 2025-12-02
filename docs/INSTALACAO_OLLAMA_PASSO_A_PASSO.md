# 🚀 Instalação do Ollama - Passo a Passo

## ✅ Passo 1: Verificar Instalação

Após instalar o Ollama, **feche e reabra o PowerShell/Terminal**.

Depois, teste:

```powershell
ollama --version
```

Se aparecer a versão, está funcionando! ✅

---

## 📦 Passo 2: Baixar Modelos Necessários

### Modelo OBRIGATÓRIO (Embeddings)

Este é o modelo mais importante para o sistema funcionar:

```powershell
ollama pull nomic-embed-text
```

**Tamanho**: ~274 MB  
**Tempo**: 1-2 minutos (dependendo da internet)

### Modelo OPCIONAL (Análises)

Para análises mais complexas (pode usar fallback simples):

```powershell
ollama pull llama3.2
```

**Tamanho**: ~2.0 GB  
**Tempo**: 5-10 minutos (dependendo da internet)

---

## 🔍 Passo 3: Verificar Modelos Instalados

```powershell
ollama list
```

Você deve ver algo como:

```
NAME                  ID              SIZE    MODIFIED
nomic-embed-text:latest  abc123...      274 MB  2 hours ago
llama3.2:latest         def456...      2.0 GB  1 hour ago
```

---

## ⚠️ IMPORTANTE: Modelos Cloud vs Locais

### ❌ Modelos Cloud (NÃO usar)

- `gpt-oss:20b-cloud`
- `deepseek-v3.1:671b-cloud`
- `qwen3-coder:480b-cloud`
- `minimax-m2:cloud`
- `glm-4.6:cloud`

**Por quê?** Esses modelos são cloud-based e podem ter custos ou limitações.

### ✅ Modelos Locais (USAR)

- `nomic-embed-text` ← **OBRIGATÓRIO**
- `llama3.2` ← Recomendado
- `llama3.1`
- `mistral`
- `phi3`

**Por quê?** Rodam localmente, sem custos, sem internet.

---

## 🧪 Passo 4: Testar Ollama

### Teste 1: Verificar se está rodando

```powershell
ollama list
```

### Teste 2: Testar embeddings

```powershell
ollama run nomic-embed-text "teste"
```

### Teste 3: Testar modelo principal (se instalou)

```powershell
ollama run llama3.2 "Olá, como você está?"
```

---

## 🔧 Passo 5: Instalar Dependências Python

```powershell
cd backend
pip install ollama numpy
```

---

## 🗄️ Passo 6: Rodar Migration

```powershell
cd backend
alembic upgrade head
```

Isso cria a tabela `user_interactions` no banco.

---

## ✅ Passo 7: Testar o Sistema

1. Inicie o backend:

```powershell
cd backend
python -m uvicorn main:app --reload
```

2. Teste o endpoint:

```powershell
# No navegador ou Postman
GET http://localhost:8000/quotations/relevant
```

3. Verifique os logs do backend para ver se a IA está funcionando.

---

## 🐛 Problemas Comuns

### "ollama: comando não encontrado"

- **Solução**: Feche e reabra o terminal
- Se não funcionar, reinicie o computador

### "Connection refused"

- **Solução**: Ollama precisa estar rodando
- Verifique se o serviço Ollama está ativo
- Reinicie o Ollama se necessário

### "Model not found"

- **Solução**: Execute `ollama pull nomic-embed-text`
- Aguarde o download completar

### Sistema lento

- **Normal**: Ollama consome recursos do computador
- Feche outros programas pesados
- Use modelos menores se necessário

---

## 📊 Resumo dos Modelos

| Modelo             | Tamanho | Obrigatório? | Uso                           |
| ------------------ | ------- | ------------ | ----------------------------- |
| `nomic-embed-text` | 274 MB  | ✅ SIM       | Embeddings para matching      |
| `llama3.2`         | 2.0 GB  | ❌ Não       | Análises complexas (opcional) |

---

## 🎯 Próximos Passos

1. ✅ Instalar Ollama
2. ✅ Baixar `nomic-embed-text`
3. ⏳ Instalar dependências Python
4. ⏳ Rodar migration
5. ⏳ Testar sistema

---

**Última atualização**: 2025-11-29

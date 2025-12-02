# 🧠 Guia de Instalação e Configuração do Ollama

## O que é Ollama?

Ollama é uma ferramenta **gratuita e local** para rodar modelos de IA grandes (LLMs) no seu computador. Não precisa de internet e não tem custos.

## 🚀 Instalação

### Windows

1. Baixe o instalador: https://ollama.com/download
2. Execute o instalador
3. Ollama será instalado e iniciado automaticamente

### Verificar Instalação

Abra o PowerShell e execute:
```powershell
ollama --version
```

Se aparecer a versão, está instalado! ✅

## 📦 Instalar Modelos

O sistema usa dois modelos:

### 1. Modelo de Embeddings (obrigatório)
```bash
ollama pull nomic-embed-text
```

### 2. Modelo Principal (opcional, para análises complexas)
```bash
ollama pull llama3.2
```

## 🔧 Configuração no Projeto

### 1. Instalar biblioteca Python

```bash
cd backend
pip install ollama numpy
```

### 2. Verificar se Ollama está rodando

Ollama precisa estar rodando em segundo plano. Verifique:

```bash
ollama list
```

Se retornar lista de modelos, está funcionando! ✅

## 🧪 Testando

### Teste Manual

```python
import ollama

# Testar embeddings
response = ollama.embeddings(model="nomic-embed-text", prompt="teste")
print(response["embedding"][:5])  # Primeiros 5 valores
```

### Teste no Sistema

1. Inicie o backend
2. Acesse `/quotations/relevant` (endpoint usa IA automaticamente)
3. Verifique os logs do backend

## ⚠️ Problemas Comuns

### "Ollama não está instalado"
- Instale o Ollama: https://ollama.com/download
- Reinicie o terminal

### "Connection refused"
- Ollama não está rodando
- Inicie o Ollama manualmente ou reinicie o computador

### "Model not found"
- Execute: `ollama pull nomic-embed-text`
- Execute: `ollama pull llama3.2`

### Sistema lento
- Ollama consome recursos do computador
- Feche outros programas pesados
- Use modelos menores se necessário

## 💡 Fallback Automático

Se o Ollama não estiver disponível, o sistema usa um **fallback simples** baseado em:
- Palavras-chave
- Categorias
- Localização

Funciona, mas com menor precisão que a IA completa.

## 📊 Performance

- **Com Ollama**: Matching inteligente com embeddings
- **Sem Ollama**: Matching baseado em regras simples

Ambos funcionam, mas Ollama oferece melhor precisão!

## 🔗 Links Úteis

- **Site Oficial**: https://ollama.com
- **Documentação**: https://github.com/ollama/ollama
- **Modelos Disponíveis**: https://ollama.com/library

---

**Última atualização**: 2025-11-29


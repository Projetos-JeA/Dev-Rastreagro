# 📋 PERGUNTAS PARA O PO - "DEU AGRO" (Sistema de Matching)

## 🎯 CONTEXTO

O sistema já possui cadastros completos de:

- **Produtores**: Com atividades de agricultura e pecuária (tipos de culturas, animais, etc.)
- **Prestadores de Serviço**: Com tipo de serviço, nome, descrição
- **Empresas/Fornecedores**: Com segmentos (comércio/indústria) e produtos

Agora precisamos definir como conectar esses perfis através do "Deu Agro".

---

## ✅ RESPOSTAS JÁ CONHECIDAS

### 1. O QUE É "DEU AGRO"?

✅ **RESPOSTA**: "Deu Agro" é o que liga o produtor/comprador com o produto/serviço oferecido que está passando na tela dele.

**Como funciona:**

- Cotação aparece na tela do comprador (ex: "Fazenda Oliveira, à venda: boi")
- Mostra dados do produto (quantidade, vacinação, etc.)
- Comprador só vê cotações relacionadas ao que cadastrou
- Algoritmo faz matching baseado no cadastro
- Tela mostra apenas **apelido (nickname)** do usuário (privacidade)

### 2. QUEM PODE VER O QUÊ?

✅ **RESPOSTA**:

- **Produtor/Comprador**: Vê apenas cotações relevantes (matching automático)
- **Empresa**: Vende produtos (cria cotações)
- **Prestador de Serviço**: Vende serviços (cria cotações)

### 3. MÚLTIPLOS PERFIS

✅ **RESPOSTA**: Usuário pode ter múltiplos perfis (ex: Produtor + Empresa) e alternar entre eles dentro do app.

---

### 2. QUEM CRIA AS COTAÇÕES?

✅ **RESPOSTA**:

- **Empresas** criam cotações de **produtos** (ex: boi, sementes, defensivos)
- **Prestadores de Serviço** criam cotações de **serviços** (ex: pulverização, consultoria)

---

### 3. COMO O SISTEMA SABE O QUE É RELEVANTE PARA O PRODUTOR?

**Opção A: Matching por Dados do Cadastro (Regras Simples)**

- Sistema compara atividades do produtor (ex: "Soja") com produtos/serviços da cotação
- Se houver correspondência → mostra para o produtor
- **Vantagem**: Simples, rápido, baseado em dados que já temos
- **Exemplo**: Produtor cadastrou "Soja" → Vê cotações de defensivos para soja, sementes de soja, pulverização para soja

**Opção B: IA para Matching Inteligente**

- IA analisa perfil completo do produtor (atividades, localização, histórico)
- IA analisa descrição da cotação (texto livre)
- IA calcula score de relevância
- **Vantagem**: Mais inteligente, entende contexto, melhora com o tempo
- **Desvantagem**: Mais complexo, precisa de treinamento, custo maior

**Sugestão**: Começar com Opção A (regras simples) e depois evoluir para IA se necessário.

---

### 4. O QUE ACONTECE DEPOIS DE "DEU AGRO"?

- [ ] Abre chat automaticamente?
- [x] Apenas notifica o prestador/empresa?
- [ ] Produtor precisa clicar em "Iniciar conversa"?

OBS: APARECE COM BASE NO CADASTRO, AO ABRIR A OFERTA/COTAÇÃO, NA TELA APÓS CLICAR TEREI DETALHADA PRA COMPRAR OU OFERECER UMA PROPOSTA/NEGOCIAÇÃO(QTD,PESO ETC..).
MARCAR CHECKBOX RECEBER NOTIFICAÇÕES POR E-MAIL, OU WPP 2V
**Sugestão**: Abre chat automaticamente para facilitar a comunicação.

---

### 5. O PRODUTOR VÊ TODAS AS COTAÇÕES OU APENAS AS RELEVANTES?

- [ ] Vê todas as cotações disponíveis (com filtros)
- [ ] Vê apenas cotações relevantes para ele (matching automático)
- [x] Vê cotações relevantes + pode buscar outras

TELA INFINITA: ACIMA DE 90% AS COTAÇÕES RELEVANTES APARECEM NO TOPO, OS OUTROS MENOS RELEVANTES

É UM ALGORÍTMO VAI MOSTRAR AS COTAÇÕES, ANALIZANDO AS PREFERÊNCIAS QUE MAIS SE ENCAIXAM NO PERFIL DELE ISSO SÃO AS COTAÇÕES MAIS RELEVANTES

**Sugestão**: Vê cotações relevantes automaticamente + pode buscar outras se quiser.

---

### 6. COTAÇÕES TÊM VALIDADE?

- [ ] Sim, expiram após X dias
- [x] Não, ficam ativas até serem removidas
- [ ] Sim, mas podem ser renovadas

obs: o vendedor pode escolher a data, ou podemos deixar a opção por tempo indeterminado, notificação de expiração

**Sugestão**: Expirar após 30 dias, com opção de renovar.

---

### 7. HÁ LIMITE DE MATCHES?

- [x] Produtor pode "Dar Agro" em quantas cotações quiser?
- [ ] Há limite por dia/semana?
- [ ] Há limite total?

PODE TER N COTAÇÕES MAS A OFERTA PODE ACABAR E ISSO VAI SER UMA NOTIFICAÇÃO DO PRÓPRIO ANUNCIO QUE O TEMPO DE EXPOSIÇÃO OU VENDA ESTÁ ACABANDO.
NOTIFICAÇÃO (ALERTA) PISTANDO EM VERMELHO AVISANDO O PRAZO.
NO ATO DO PAGAMENTO NA TELA, O COMPRADOR CLICOU EM COMPRAR O PRODUTO AUTOMATICAMENTE ELE SOME DA TELA DE COTAÇÕES/EXPOSIÇÃO, PRA QUE NINGUÉM COMPRE O MESMO PRODUTO,
ELE TERÁ UM TEMPO PRA FINALIZAR A COMPRA DE MINUTOS, CASO NÃO FINALIZE A COMPRA O PRODUTO VOLTA PRA EXPOSIÇÃO.

**Sugestão**: Sem limite, mas monitorar para evitar spam.

---

### 8. COMO ORDENAR AS COTAÇÕES?

- [ ] Por relevância (mais compatível primeiro)
- [ ] Por data (mais recente primeiro)
- [ ] Por localização (mais próximo primeiro)
- [ ] Por preço (mais barato primeiro)
- [ ] Produtor escolhe a ordenação

OBS: O VENDER PODE ESCOLHER VENDER O LOTE X, OU A UNIDADE E COLOCAR TANTOS DISPONÍVEIS.
PODE COLOCAR POR LOCALIZAÇÃO E RELEVÂNCIA 2V
**Sugestão**: Ordenar por relevância, com opção de mudar ordenação.

---

### 9. HÁ NOTIFICAÇÕES?

- [x] Produtor recebe notificação quando há nova cotação relevante?
- [x] Prestador/Empresa recebe notificação quando alguém "Deu Agro"?
- [x] Ambos recebem notificações?

**Sugestão**: Ambos recebem notificações (push + email opcional).

---

### 10. CHAT É OBRIGATÓRIO?

- [x] Sim, após "Deu Agro" habilitar
- [ ] Não, é opcional
- [ ] Depende do tipo de cotação

**Sugestão**: Chat é automático, mas pode ser fechado se não houver interesse.

CAMPO DE TEXTO EM BRANCO PRA ENVIAR UMA NOTIFICAÇÃO
um balão de chat pra enviar mensagem direta pro fornecedor.

---

## 🧠 IDEIAS DE ALGORITMO DE MATCHING

### ALGORITMO PROPOSTO: "Score de Compatibilidade"

**Como funciona:**

1. **Coleta dados do cadastro do comprador:**
   - Atividades de agricultura (ex: "Soja", "Milho")
   - Atividades de pecuária (ex: "Bovinos", "Suínos")
   - Localização (cidade, estado)
   - Tipo de produtor (Agricultor, Pecuarista, Ambos)

2. **Analisa cotação:**
   - Tipo de produto/serviço
   - Categoria (agricultura, pecuária, ambos)
   - Localização do vendedor
   - Tags/palavras-chave da descrição

3. **Calcula Score de Compatibilidade:**

```
Score = (Atividade Match × 50) + (Localização Match × 30) + (Categoria Match × 20)
```

**Exemplo:**

- Comprador cadastrou: "Soja" + "Bovinos" + Localização: "Goiás"
- Cotação: "Venda de defensivos para soja" + Localização: "Goiás"
- Score = (50 pontos - atividade match) + (30 pontos - mesma localização) + (20 pontos - categoria agricultura)
- **Score Total = 100 pontos** → Aparece na tela do comprador

**Regras de Matching:**

1. **Atividade Match (50 pontos):**
   - Se comprador tem "Soja" e cotação é sobre "Soja" → 50 pontos
   - Se comprador tem "Bovinos" e cotação é sobre "Bovinos" → 50 pontos
   - Se não houver match → 0 pontos

2. **Localização Match (30 pontos):**
   - Mesmo estado → 30 pontos
   - Estado vizinho → 15 pontos
   - Estados diferentes → 0 pontos

3. **Categoria Match (20 pontos):**
   - Comprador é "Agricultor" e cotação é de agricultura → 20 pontos
   - Comprador é "Pecuarista" e cotação é de pecuária → 20 pontos
   - Comprador é "Ambos" → sempre 20 pontos

**Filtro mínimo:**

- Apenas cotações com score ≥ 50 aparecem na tela
- Ordenação: Maior score primeiro, depois por data (mais recente)

---

### ALGORITMO AVANÇADO (Futuro - com IA) (ESCOLHIDO NA FASE INICIAL)

**Quando implementar:**

- Quando tivermos histórico de matches bem-sucedidos
- Quando quiseremos personalização mais inteligente

**Como funcionaria:**

- IA analisa descrição da cotação (texto livre)
- IA entende sinônimos (ex: "pulverização" = "aplicação de defensivos")
- IA aprende com histórico (ex: "comprador X sempre compra de vendedor Y")
- IA calcula score mais preciso considerando contexto

---

## 💡 SUGESTÃO DE IMPLEMENTAÇÃO

### FASE 1: Matching Simples (Baseado em Dados Existentes)

**Como funciona:**

1. **Prestador/Empresa cria cotação** com:
   - Tipo de serviço/produto
   - Descrição
   - Localização
   - Preço (opcional)

2. **Sistema faz matching automático** comparando:
   - Atividades do produtor (ex: "Soja", "Bovinos") com tipo de serviço/produto
   - Localização (mesmo estado/cidade = mais relevante)
   - Segmento da empresa com atividades do produtor

3. **Produtor vê cotações relevantes** ordenadas por:
   - Score de compatibilidade
   - Data de criação

4. **Produtor clica "Deu Agro"** → Abre chat automaticamente

**Vantagens:**

- ✅ Usa dados que já temos no cadastro
- ✅ Implementação rápida
- ✅ Fácil de entender e explicar
- ✅ Não precisa de IA (pode adicionar depois)
- ✅ Score calculado em tempo real
- ✅ Fácil de ajustar pesos (50/30/20)

---

### FASE 2: IA para Matching Inteligente (Futuro)

**Como funcionaria:**

- IA analisa texto da descrição da cotação
- IA entende contexto (ex: "pulverização" → relaciona com "defensivos")
- IA aprende com histórico de matches bem-sucedidos
- IA calcula score mais preciso de relevância

**Quando implementar:**

- Quando tivermos dados suficientes (histórico de matches)
- Quando matching simples não for suficiente
- Quando quiseremos personalização avançada

---

## 📊 DADOS QUE JÁ TEMOS NO SISTEMA

### Produtor (Company):

- ✅ Tipo de produtor (Agricultor, Pecuarista, Ambos)
- ✅ Atividades de agricultura (culturas, sementes, defensivos, etc.)
- ✅ Atividades de pecuária (tipos de animais, rações, vacinas, etc.)
- ✅ Localização (cidade, estado, CEP)

### Prestador de Serviço (ServiceProvider):

- ✅ Nome do serviço
- ✅ Tipo de serviço
- ✅ Descrição
- ✅ Localização (cidade, estado, CEP)

### Empresa/Fornecedor (Company):

- ✅ Segmento (Comércio ou Indústria)
- ✅ Produtos do segmento
- ✅ Localização (cidade, estado, CEP)

---

## 📱 ESTRUTURA DE TELAS SUGERIDA

### TELA DO PRODUTOR/COMPRADOR:

- **"Deu Agro"** (tela principal)
  - Lista de cotações passando na tela (carrossel ou lista)
  - Mostra: Apelido do vendedor, produto/serviço, dados básicos
  - Botão "Deu Agro" em cada cotação
  - Filtros (opcional): Localização, categoria, preço

### TELA DA EMPRESA (quando logada como vendedora):

- **"Minhas Cotações"**
  - Lista de cotações criadas
  - Botão "Nova Cotação" (cadastrar produto)
  - Editar/Excluir cotações existentes
  - Ver quem "Deu Agro" em cada cotação

### TELA DO PRESTADOR (quando logado como prestador):

- **"Meus Serviços"**
  - Lista de serviços/cotações criadas
  - Botão "Novo Serviço" (cadastrar serviço)
  - Editar/Excluir serviços existentes
  - Ver quem "Deu Agro" em cada serviço

### TELA DE ALTERNAR PERFIS:

- Menu ou botão no topo
- Mostra perfis disponíveis (ex: "Produtor", "Empresa")
- Ao clicar, alterna contexto da aplicação

---

## 🎯 PRÓXIMOS PASSOS

1. **PO responde as novas perguntas** (8 perguntas acima)
2. **Definimos regras de matching** (algoritmo de score)
3. **Criamos modelos de dados**:
   - `Quotation` (Cotações)
   - `Match` (Deu Agro)
   - `Chat` (Conversas)
4. **Implementamos matching simples** (Fase 1)
5. **Criamos telas** (Produtor, Empresa, Prestador)
6. **Testamos e coletamos feedback**
7. **Evoluímos para IA se necessário** (Fase 2)

---

## ❓ NOVAS PERGUNTAS PARA ESCLARECER COM O PO

### 1. EMPRESA PODE COMPRAR TAMBÉM?

- [ ] Sim, empresa pode comprar mesmo estando no perfil de vendedora?
- [ ] Não, empresa só vende, não compra?
- [ ] Depende: se tiver perfil de Produtor também, pode comprar?

**Contexto**: Usuário pode ter múltiplos perfis (Produtor + Empresa). Quando está no perfil "Empresa", pode ver cotações para comprar também?

---

### 2. TELA DA EMPRESA - CADASTRO DE PRODUTOS

- [ ] Empresa cadastra produtos **apenas no momento do cadastro inicial**?
- [ ] Empresa pode **cadastrar/editar produtos depois de logado**?
- [ ] Empresa tem uma tela específica para gerenciar produtos?

**Contexto**: Quando empresa está logada, ela precisa cadastrar os produtos que vai vender. Isso é feito:

- A) Só no cadastro inicial (dados fixos)
- B) Depois de logado (pode adicionar/editar produtos)

---

### 3. TELA DO PRESTADOR - CADASTRO DE SERVIÇOS

- [ ] Prestador cadastra serviços **apenas no momento do cadastro inicial**?
- [ ] Prestador pode **cadastrar/editar serviços depois de logado**?
- [ ] Prestador tem uma tela específica para gerenciar serviços?

**Contexto**: Quando prestador está logado, ele precisa cadastrar os serviços que vai oferecer. Isso é feito:

- A) Só no cadastro inicial (dados fixos)
- B) Depois de logado (pode adicionar/editar serviços)

---

### 4. DADOS DO CADASTRO PODEM SER EDITADOS?

- [ ] Dados do cadastro (atividades, localização, etc.) podem ser **editados depois de logado**?
- [ ] Dados são **fixos** (só podem ser editados entrando em contato com suporte)?
- [ ] Alguns dados podem ser editados, outros não?

**Contexto**: Se produtor mudou de atividade (ex: parou de plantar soja, começou milho), ele pode atualizar isso no app?

---

### 5. CHAT AUTOMÁTICO OU OPCIONAL?

- [ ] Após "Deu Agro", chat abre **automaticamente**?
- [ ] Produtor precisa clicar em "Iniciar conversa"?
- [ ] Chat é opcional (pode fechar se não tiver interesse)?

---

### 6. NOTIFICAÇÕES

- [ ] Push notification quando há nova cotação relevante?
- [ ] Push notification quando alguém "Deu Agro" na sua cotação?
- [ ] Email também?
- [ ] Ambos (push + email)?

---

### 7. VALIDADE DAS COTAÇÕES

- [ ] Cotações expiram após X dias?
- [ ] Cotações ficam ativas até serem removidas?
- [ ] Podem ser renovadas?

---

### 8. LIMITES

- [ ] Há limite de cotações que empresa/prestador pode criar?
- [ ] Há limite de matches ("Deu Agro") por produtor?
- [ ] Sem limites?

---

**Documento criado para alinhamento com PO sobre funcionalidade "Deu Agro"**

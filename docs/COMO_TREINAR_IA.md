# 🧠 Como Treinar a IA do Sistema

## 📋 Visão Geral

A IA do sistema aprende de **múltiplas formas** para melhorar continuamente a relevância das cotações mostradas para cada usuário. Quanto mais dados coletamos, mais inteligente ela fica!

## 🎯 Formas de Treinar a IA

### 1. **Interações do Usuário (70% do peso)**

A IA aprende principalmente com o que o usuário **FAZ** no sistema:

#### Tipos de Interações Rastreadas:
- **VIEW** (Visualização): Usuário vê uma cotação
- **CLICK** (Clique): Usuário clica para ver detalhes
- **FAVORITE** (Favoritar): Usuário marca como favorito
- **ACCEPTED** (Aceito): Usuário aceita uma cotação/match
- **REJECTED** (Rejeitado): Usuário rejeita uma cotação
- **PURCHASED** (Comprado): Usuário compra o produto

#### Como Funciona:
1. Cada interação é salva no banco (`user_interactions`)
2. A IA analisa padrões nas interações
3. Se o usuário sempre clica em "Ração para Gado", a IA entende que ele tem interesse
4. Cotações similares recebem score mais alto

#### Exemplo:
```
Usuário João:
- Visualizou 5 cotações de "Ração para Gado"
- Favoritou 3 delas
- Comprou 1

→ IA aprende: João tem interesse em "Ração para Gado"
→ Próximas cotações de ração aparecem no topo
```

### 2. **Dados do Perfil (30% do peso)**

A IA usa os dados cadastrados pelo usuário:

#### Dados Coletados:
- **Atividades da Empresa**: Agricultura, Pecuária, etc
- **Categorias**: Bovinos, Suínos, Soja, Milho, etc
- **Grupos**: Cria, Recria, Engorda, etc
- **Itens**: Macho, Fêmea, etc
- **Localização**: Estado, Cidade

#### Como Funciona:
1. Quando o usuário cadastra atividades (ex: "Pecuária > Bovinos > Cria")
2. A IA mapeia para categorias de cotações (livestock, agriculture, both)
3. Cotações da mesma categoria recebem score base alto
4. Quanto mais específico o perfil, melhor o match

#### Exemplo:
```
Usuário Maria cadastrou:
- Atividade: Pecuária > Bovinos > Engorda

→ IA mapeia: livestock + both
→ Cotações de ração, sal mineral, arame aparecem primeiro
→ Cotações de sementes de soja aparecem depois (menor relevância)
```

### 3. **Cadastro Completo**

Quanto mais completo o cadastro, melhor a IA funciona:

#### Campos Importantes:
- ✅ **Atividades selecionadas** (categoria → grupo → item)
- ✅ **Tipo de produtor** (Agricultor, Pecuarista, Ambos)
- ✅ **Localização** (Estado, Cidade)
- ✅ **Dados da empresa** (se for fornecedor)

#### Como Funciona:
1. Durante o cadastro, o usuário seleciona atividades
2. Esses dados são salvos em `company_activities`
3. A IA usa esses dados para calcular relevância inicial
4. Conforme o usuário interage, a IA ajusta baseado em comportamento

### 4. **Criação de Cotações**

Quando um fornecedor cria uma cotação, a IA aprende:

#### Dados da Cotação:
- **Título**: "Ração para Gado Premium"
- **Descrição**: Detalhes do produto
- **Categoria**: Livestock, Agriculture, Both, Service
- **Tipo de Produto**: Ração, Sal Mineral, Sementes, etc
- **Localização**: Estado, Cidade

#### Como Funciona:
1. Fornecedor cria cotação com categoria "Livestock"
2. A IA gera embedding do texto (título + descrição)
3. Quando um produtor de pecuária acessa, a IA compara embeddings
4. Similaridade alta = score alto = aparece no topo

### 5. **Feedback Implícito**

A IA aprende com ações que indicam interesse:

#### Sinais Positivos:
- ✅ Tempo de visualização (quanto mais tempo, mais interesse)
- ✅ Número de cliques (múltiplos cliques = alto interesse)
- ✅ Compra realizada (máximo interesse)
- ✅ Favoritar (interesse confirmado)

#### Sinais Negativos:
- ❌ Rejeitar cotação
- ❌ Visualização muito rápida (pouco interesse)
- ❌ Nunca clicar em cotações similares

## 🔄 Fluxo de Aprendizado

```
1. USUÁRIO CADASTRA
   ↓
   Dados salvos no banco (atividades, perfil)
   ↓
2. IA CALCULA SCORE INICIAL
   ↓
   Baseado em perfil (30%) + comportamento (70%)
   ↓
3. USUÁRIO INTERAGE
   ↓
   View, Click, Favorite, Purchase
   ↓
4. IA APRENDE
   ↓
   Ajusta scores para próximas cotações
   ↓
5. LOOP CONTÍNUO
   ↓
   Quanto mais interações, mais precisa fica!
```

## 📊 Exemplo Prático

### Cenário: Produtor de Gado

**Cadastro:**
- Atividade: Pecuária > Bovinos > Engorda
- Localização: Palmas, TO

**Interações:**
- Visualizou 10 cotações de ração
- Favoritou 3 cotações de "Ração para Gado de Corte"
- Comprou 1 cotação de "Sal Mineral"

**Resultado:**
- ✅ Cotações de ração aparecem no topo (score 90-100)
- ✅ Cotações de sal mineral aparecem em seguida (score 80-90)
- ✅ Cotações de sementes aparecem no final (score 50-60)
- ✅ Cotações de serviços aparecem apenas se relevantes

## 🎓 Como Melhorar o Treinamento

### Para Desenvolvedores:

1. **Rastrear Mais Interações:**
   - Tempo de visualização
   - Scroll depth (até onde rolou a página)
   - Comparações entre cotações

2. **Coletar Feedback Explícito:**
   - Botão "Não é relevante"
   - Botão "Muito relevante"
   - Avaliações (1-5 estrelas)

3. **Análise de Padrões:**
   - Agrupar usuários similares
   - Detectar sazonalidade (ex: época de plantio)
   - Aprender com compras anteriores

### Para Usuários:

1. **Complete seu Perfil:**
   - Selecione todas as atividades relevantes
   - Preencha localização correta
   - Atualize quando mudar de atividade

2. **Interaja com o Sistema:**
   - Visualize cotações interessantes
   - Favorite produtos que gostou
   - Rejeite o que não é relevante

3. **Dê Feedback:**
   - Use botões de relevância (quando disponíveis)
   - Reporte cotações irrelevantes

## 🔍 Verificação de Dados

### Como Verificar se os Dados Estão Sendo Salvos:

1. **Atividades da Empresa:**
   ```sql
   SELECT ca.*, ac.name as category_name, ag.name as group_name, ai.name as item_name
   FROM company_activities ca
   JOIN activity_category ac ON ca.category_id = ac.id
   LEFT JOIN activity_group ag ON ca.group_id = ag.id
   LEFT JOIN activity_item ai ON ca.item_id = ai.id
   WHERE ca.company_id = [ID_DA_EMPRESA]
   ```

2. **Interações do Usuário:**
   ```sql
   SELECT * FROM user_interactions
   WHERE user_id = [ID_DO_USUARIO]
   ORDER BY created_at DESC
   ```

3. **Cotações Criadas:**
   ```sql
   SELECT * FROM quotations
   WHERE seller_id = [ID_DO_FORNECEDOR]
   ORDER BY created_at DESC
   ```

## 🚀 Próximos Passos

- [ ] Implementar feedback explícito (botões de relevância)
- [ ] Adicionar análise de tempo de visualização
- [ ] Criar dashboard de analytics para ver padrões
- [ ] Implementar agrupamento de usuários similares
- [ ] Adicionar detecção de sazonalidade

---

**Lembre-se:** A IA melhora com o tempo! Quanto mais dados coletamos, mais inteligente ela fica! 🧠✨


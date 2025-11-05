# Sprint 1 — Figma e Requisitos
## RastreAgro MVP - Documentação Inicial

---

## Visão Geral

O RastreAgro é uma plataforma de rastreabilidade e marketplace para compra/venda de animais, conectando clientes e empresas através de um sistema de match automático entre oferta e demanda.

---

## Perfis de Usuário

### 1. Cliente
- **Descrição**: Pessoa física ou jurídica que deseja comprar animais
- **Necessidades**: Encontrar animais que atendam critérios específicos, negociar preços, realizar compras seguras
- **Características**:
  - Busca e filtragem de animais
  - Visualização de ofertas disponíveis
  - Negociação via chat
  - Realização de pagamentos com retenção
  - Recebimento de NF-e

### 2. Empresa
- **Descrição**: Pessoa jurídica que vende animais (fazendas, criadores, agropecuárias)
- **Necessidades**: Divulgar animais disponíveis, receber ofertas, gerenciar vendas
- **Características**:
  - Cadastro de animais para venda
  - Gestão de ofertas e demandas
  - Negociação via chat
  - Recebimento de pagamentos com retenção
  - Emissão de NF-e

---

## User Stories

### Autenticação e Segurança

#### US-001: Autenticação com 2FA
**Como** um usuário (cliente ou empresa)  
**Eu quero** fazer login com autenticação de dois fatores  
**Para que** eu tenha segurança adicional na minha conta

**Critérios de Aceite:**
- Usuário pode fazer login com email e senha
- Sistema envia código 2FA via SMS ou email
- Usuário precisa inserir código 2FA para acessar
- Código expira em 5 minutos
- Token JWT é gerado após validação 2FA

#### US-002: Registro de Cliente
**Como** um cliente  
**Eu quero** me cadastrar na plataforma  
**Para que** eu possa comprar animais

**Critérios de Aceite:**
- Formulário com dados pessoais (nome, CPF, email, telefone, endereço)
- Validação de CPF único
- Validação de email único
- Envio de email de confirmação

#### US-003: Registro de Empresa
**Como** uma empresa  
**Eu quero** me cadastrar na plataforma  
**Para que** eu possa vender animais

**Critérios de Aceite:**
- Formulário com dados empresariais (razão social, CNPJ, email, telefone, endereço)
- Validação de CNPJ único
- Upload de documentos (contrato social, alvará)
- Aprovação manual da empresa

---

### Gestão de Animais

#### US-004: Cadastro de Animal para Venda (Empresa)
**Como** uma empresa  
**Eu quero** cadastrar animais disponíveis para venda  
**Para que** clientes possam visualizar e comprar

**Critérios de Aceite:**
- Formulário com atributos: espécie, raça, peso, idade, sexo, preço, fotos
- Upload de múltiplas fotos do animal
- Status (disponível, reservado, vendido)
- Data de cadastro automática

#### US-005: Visualização de Animais (Cliente)
**Como** um cliente  
**Eu quero** visualizar animais disponíveis para compra  
**Para que** eu possa escolher o que comprar

**Critérios de Aceite:**
- Lista de animais com fotos, preço e informações básicas
- Filtros por: espécie, raça, peso, idade, preço, localização
- Ordenação por: preço, data de cadastro, relevância
- Detalhes completos do animal ao clicar

#### US-006: Busca e Filtros Avançados
**Como** um cliente  
**Eu quero** buscar animais com filtros específicos  
**Para que** eu encontre exatamente o que preciso

**Critérios de Aceite:**
- Busca por texto livre
- Filtros combinados (raça, peso, idade, preço)
- Salvar filtros favoritos
- Resultados em tempo real

---

### Match Automático

#### US-007: Cadastro de Demanda (Cliente)
**Como** um cliente  
**Eu quero** cadastrar minha demanda de animais  
**Para que** o sistema encontre ofertas compatíveis automaticamente

**Critérios de Aceite:**
- Formulário com critérios: espécie, raça, peso mínimo/máximo, idade, preço máximo
- Prioridade da demanda
- Data limite para encontrar oferta

#### US-008: Match Automático de Oferta e Demanda
**Como** o sistema  
**Eu quero** fazer match automático entre ofertas e demandas  
**Para que** clientes e empresas sejam conectados

**Critérios de Aceite:**
- Algoritmo de match roda diariamente
- Compara atributos de ofertas com demandas
- Notifica cliente quando há match
- Notifica empresa quando há demanda compatível
- Score de compatibilidade (0-100%)

#### US-009: Visualização de Matches
**Como** um cliente  
**Eu quero** ver os matches encontrados para minha demanda  
**Para que** eu possa entrar em contato com as empresas

**Critérios de Aceite:**
- Lista de matches ordenada por score
- Informações do animal e da empresa
- Botão para iniciar negociação via chat

---

### Chat Interno

#### US-010: Iniciar Conversa (Cliente/Empresa)
**Como** um cliente ou empresa  
**Eu quero** iniciar uma conversa sobre um animal  
**Para que** eu possa negociar detalhes da compra/venda

**Critérios de Aceite:**
- Botão "Entrar em contato" na página do animal
- Criação automática de chat
- Histórico de mensagens persistente
- Notificações push de novas mensagens

#### US-011: Troca de Mensagens
**Como** um usuário  
**Eu quero** enviar e receber mensagens no chat  
**Para que** eu possa negociar e tirar dúvidas

**Critérios de Aceite:**
- Envio de mensagens de texto
- Envio de fotos
- Indicador de leitura (lida/não lida)
- Timestamp de cada mensagem
- Status online/offline

#### US-012: Lista de Conversas
**Como** um usuário  
**Eu quero** ver todas minhas conversas  
**Para que** eu possa acessar rapidamente minhas negociações

**Critérios de Aceite:**
- Lista de conversas com preview da última mensagem
- Ordenação por última mensagem
- Badge com quantidade de mensagens não lidas
- Busca por nome do contato

---

### Compra/Venda

#### US-013: Iniciar Compra (Cliente)
**Como** um cliente  
**Eu quero** iniciar o processo de compra de um animal  
**Para que** eu possa finalizar a transação

**Critérios de Aceite:**
- Botão "Comprar" na página do animal
- Resumo da compra (animal, preço, empresa)
- Seleção de forma de pagamento
- Confirmação antes de finalizar

#### US-014: Confirmar Venda (Empresa)
**Como** uma empresa  
**Eu quero** confirmar a venda de um animal  
**Para que** a transação seja processada

**Critérios de Aceite:**
- Notificação de solicitação de compra
- Visualização de detalhes do cliente
- Opção de aceitar ou recusar
- Ao aceitar, animal fica como "reservado"

#### US-015: Atributos do Animal na Compra
**Como** um cliente  
**Eu quero** ver todos os atributos do animal antes de comprar  
**Para que** eu tenha certeza do que estou comprando

**Critérios de Aceite:**
- Peso, raça, idade, sexo, preço
- Fotos do animal
- Histórico de saúde (se disponível)
- Certificados e documentos

---

### Pagamento com Retenção

#### US-016: Processar Pagamento com Retenção
**Como** o sistema  
**Eu quero** processar pagamentos com retenção de valores  
**Para que** haja segurança para ambas as partes

**Critérios de Aceite:**
- Cliente realiza pagamento
- Valor é retido na plataforma (escrow)
- Retenção liberada após confirmação de entrega
- Taxa de plataforma deduzida
- Notificação para ambas as partes

#### US-017: Liberação de Retenção
**Como** uma empresa  
**Eu quero** confirmar a entrega do animal  
**Para que** o pagamento seja liberado

**Critérios de Aceite:**
- Botão "Confirmar Entrega" após venda
- Cliente confirma recebimento
- Após confirmação, pagamento é liberado
- Prazo de 7 dias para confirmação automática (se não houver disputa)

---

### NF-e (Nota Fiscal Eletrônica)

#### US-018: Emissão de NF-e (Stub)
**Como** uma empresa  
**Eu quero** emitir NF-e após a venda  
**Para que** eu esteja em conformidade fiscal

**Critérios de Aceite:**
- Emissão automática após confirmação de pagamento
- Integração com API de NF-e (stub/mock)
- Dados do animal e cliente preenchidos automaticamente
- NF-e disponível para download
- Envio automático por email para cliente

---

## 🔄 Fluxos de Usuário

### Fluxo 1: Cadastro e Primeiro Acesso

```
1. Usuário acessa tela de login
2. Clica em "Criar conta"
3. Seleciona perfil: Cliente ou Empresa
4. Preenche formulário de cadastro
5. Recebe email de confirmação
6. Faz login
7. Recebe código 2FA
8. Insere código 2FA
9. Acessa home do sistema
```

### Fluxo 2: Empresa - Cadastrar Animal e Vender

```
1. Empresa faz login (2FA)
2. Acessa "Meus Animais"
3. Clica em "Adicionar Animal"
4. Preenche dados: espécie, raça, peso, idade, preço, fotos
5. Salva animal (status: disponível)
6. Sistema faz match automático com demandas
7. Recebe notificação de match
8. Cliente entra em contato via chat
9. Negocia via chat
10. Cliente inicia compra
11. Empresa confirma venda
12. Cliente realiza pagamento (retenção)
13. Sistema emite NF-e (stub)
14. Empresa confirma entrega
15. Cliente confirma recebimento
16. Pagamento é liberado
```

### Fluxo 3: Cliente - Buscar e Comprar Animal

```
1. Cliente faz login (2FA)
2. Acessa "Buscar Animais"
3. Aplica filtros (raça, peso, idade, preço)
4. Visualiza lista de animais
5. Clica em um animal para ver detalhes
6. Verifica atributos e fotos
7. Clica em "Entrar em contato"
8. Conversa com empresa via chat
9. Clica em "Comprar"
10. Confirma dados da compra
11. Seleciona forma de pagamento
12. Realiza pagamento (retenção)
13. Aguarda confirmação da empresa
14. Recebe NF-e por email
15. Confirma recebimento do animal
16. Pagamento é liberado para empresa
```

### Fluxo 4: Cliente - Cadastrar Demanda e Receber Matches

```
1. Cliente faz login (2FA)
2. Acessa "Minhas Demandas"
3. Clica em "Nova Demanda"
4. Preenche critérios: espécie, raça, peso, idade, preço máximo
5. Salva demanda
6. Sistema roda match automático (diariamente)
7. Cliente recebe notificação de match
8. Acessa "Meus Matches"
9. Visualiza animais compatíveis ordenados por score
10. Clica em um match para ver detalhes
11. Inicia conversa com empresa
12. Segue fluxo de compra
```

### Fluxo 5: Chat e Negociação

```
1. Usuário acessa "Conversas"
2. Visualiza lista de conversas
3. Clica em uma conversa
4. Visualiza histórico de mensagens
5. Envia mensagem de texto ou foto
6. Recebe notificação quando há nova mensagem
7. Responde mensagem
8. Negocia preço e condições
9. Decide prosseguir com compra ou não
```

### Fluxo 6: Autenticação 2FA

```
1. Usuário insere email e senha
2. Sistema valida credenciais
3. Sistema gera código 2FA (6 dígitos)
4. Sistema envia código via SMS ou Email
5. Usuário insere código 2FA
6. Sistema valida código
7. Sistema verifica se código não expirou (5 min)
8. Sistema gera token JWT
9. Usuário é autenticado e redirecionado
```

---

## 📱 Telas Principais (Wireframes para Figma)

### Telas de Autenticação
1. **Login** - Email, senha, botão "Entrar", link "Criar conta"
2. **2FA** - Campo para código de 6 dígitos, botão "Verificar", "Reenviar código"
3. **Registro Cliente** - Formulário completo
4. **Registro Empresa** - Formulário completo

### Telas do Cliente
1. **Home** - Cards com: Buscar Animais, Minhas Demandas, Meus Matches, Conversas
2. **Buscar Animais** - Filtros, lista de cards de animais, busca
3. **Detalhes do Animal** - Fotos, atributos, preço, botões "Entrar em contato" e "Comprar"
4. **Minhas Demandas** - Lista de demandas, botão "Nova Demanda"
5. **Meus Matches** - Lista de matches com score, botões de ação
6. **Conversas** - Lista de conversas, busca
7. **Chat** - Mensagens, input de texto, botão enviar

### Telas da Empresa
1. **Home** - Cards com: Meus Animais, Vendas, Ofertas, Conversas
2. **Meus Animais** - Lista de animais, botão "Adicionar Animal", status
3. **Cadastrar Animal** - Formulário completo com upload de fotos
4. **Vendas** - Lista de vendas, status, ações
5. **Conversas** - Igual ao cliente
6. **Chat** - Igual ao cliente

### Telas Compartilhadas
1. **Perfil** - Dados do usuário, edição, logout
2. **Notificações** - Lista de notificações
3. **Pagamento** - Resumo, forma de pagamento, confirmação
4. **NF-e** - Visualização e download

---

## 🎨 Diretrizes de Design (Figma)

### Cores
- **Primária**: Verde (#2E7D32) - Representa agro
- **Secundária**: Laranja (#FF6F00) - Destaque
- **Neutras**: Cinza escuro (#212121), Cinza claro (#F5F5F5)
- **Status**: Sucesso (#4CAF50), Erro (#F44336), Aviso (#FF9800)

### Tipografia
- **Títulos**: Roboto Bold, 24px
- **Subtítulos**: Roboto Medium, 18px
- **Corpo**: Roboto Regular, 16px
- **Legendas**: Roboto Regular, 14px

### Componentes Principais
- Botões: Primário (verde), Secundário (outline), Texto
- Cards: Sombra sutil, bordas arredondadas
- Inputs: Borda, placeholder, estados (focus, error)
- Avatar: Circular, inicial do nome
- Badges: Status, notificações

---

## 📊 Diagrama de Entidades

```
User (Cliente/Empresa)
├── id
├── tipo (cliente/empresa)
├── email
├── senha (hash)
├── telefone
├── 2FA_secret
└── endereco

Animal
├── id
├── empresa_id (FK)
├── especie
├── raca
├── peso
├── idade
├── sexo
├── preco
├── fotos[]
├── status
└── data_cadastro

Demanda
├── id
├── cliente_id (FK)
├── especie
├── raca
├── peso_min
├── peso_max
├── idade_min
├── idade_max
├── preco_max
└── status

Match
├── id
├── demanda_id (FK)
├── animal_id (FK)
├── score
├── data_match
└── status

Chat
├── id
├── cliente_id (FK)
├── empresa_id (FK)
├── animal_id (FK)
└── mensagens[]

Mensagem
├── id
├── chat_id (FK)
├── remetente_id (FK)
├── conteudo
├── tipo (texto/foto)
└── data_envio

Venda
├── id
├── animal_id (FK)
├── cliente_id (FK)
├── empresa_id (FK)
├── valor
├── status_pagamento
├── status_entrega
├── data_venda
└── nfe_id

Pagamento
├── id
├── venda_id (FK)
├── valor
├── valor_retencao
├── status
└── data_pagamento

NF-e (Stub)
├── id
├── venda_id (FK)
├── numero
├── chave_acesso
├── data_emissao
└── url_download
```

---

## ✅ Checklist Sprint 1

- [x] User Stories criadas
- [x] Fluxos de usuário documentados
- [x] Telas principais identificadas
- [x] Diretrizes de design definidas
- [x] Diagrama de entidades criado
- [ ] Protótipos no Figma (próximo passo)

---

## 📝 Notas para Prototipagem

1. **Prioridade de Telas**: Começar pelas telas de autenticação, depois home, depois funcionalidades principais
2. **Responsividade**: Considerar diferentes tamanhos de tela mobile
3. **Acessibilidade**: Contraste adequado, tamanhos de fonte legíveis
4. **Microinterações**: Feedback visual em ações (loading, sucesso, erro)
5. **Onboarding**: Tutorial para novos usuários

---

*Documento criado para Sprint 1 - RastreAgro MVP*


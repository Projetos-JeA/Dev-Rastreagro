# Análise de Dados - Comparação Documento vs Banco de Dados

## 📋 Resumo Executivo

Este documento compara os campos solicitados no arquivo `dados.docx` com a estrutura atual do banco de dados, identificando campos faltantes para cada tipo de usuário.

---

## 1️⃣ COMPRADOR (Buyer) - Dados Pessoais

### 📄 Campos no Documento Word:

- Nome
- Data de nascimento
- CPF
- Identidade
- Estado Civil
- Naturalidade
- Endereço
- CEP
- Cidade
- Estado
- E-mail

### 💾 Campos Atuais no Banco (tabela `users`):

- ✅ `email` - E-mail
- ✅ `nickname` - Apelido (usado como nome)
- ✅ `password_hash` - Senha
- ✅ `role` - Tipo de usuário (buyer/seller/service_provider)
- ✅ `created_at` - Data de criação
- ✅ `updated_at` - Data de atualização

### ❌ Campos FALTANTES para Comprador:

1. **`nome_completo`** (String 255) - Nome completo
2. **`data_nascimento`** (Date) - Data de nascimento
3. **`cpf`** (String 14) - CPF
4. **`identidade`** (String 20) - RG/Identidade
5. **`estado_civil`** (String 20) - Estado Civil (Solteiro, Casado, etc.)
6. **`naturalidade`** (String 100) - Naturalidade (cidade/estado)
7. **`endereco`** (String 255) - Endereço completo
8. **`cep`** (String 12) - CEP
9. **`cidade`** (String 100) - Cidade
10. **`estado`** (String 2) - Estado (UF)

### 📝 Observação:

Atualmente, o comprador só tem `nickname` e `email`. Todos os outros dados pessoais estão faltando.

---

## 2️⃣ EMPRESA/VENDEDOR (Seller) - Dados Propriedade/Empresarial

### 📄 Campos no Documento Word:

- Nome da propriedade/empresa
- Início das Atividades
- Ramo de Atividade
- CNAEs
- CNPJ/CPF
- Insc. Est./Identidade
- Endereço
- CEP
- Cidade
- Estado
- E-mail

### 💾 Campos Atuais no Banco (tabela `companies`):

- ✅ `nome_propriedade` - Nome da propriedade/empresa
- ✅ `inicio_atividades` - Início das Atividades
- ✅ `ramo_atividade` - Ramo de Atividade
- ✅ `cnaes` - CNAEs
- ✅ `cnpj_cpf` - CNPJ/CPF
- ✅ `insc_est_identidade` - Insc. Est./Identidade
- ✅ `endereco` - Endereço
- ✅ `cep` - CEP
- ✅ `cidade` - Cidade
- ✅ `estado` - Estado
- ✅ `email` - E-mail
- ✅ `activities` - Atividades (relacionamento com `company_activities`)

### ✅ Status: COMPLETO

Todos os campos do documento estão presentes na tabela `companies`.

---

## 3️⃣ PRESTADOR DE SERVIÇO (Service Provider)

### 📄 Campos no Documento Word:

O documento não especifica campos específicos para prestador de serviço, mas lista tipos de serviços:

- Manutenção de Máquinas
- Manutenção de Equipamentos
- Consultoria Técnica para Pecuária e Agricultura
- Consultoria em Tecnologia
- Logística e Armazenagem
- Financeiros, Seguros e Gestão de Risco
- Intermediação
- Pesquisa e Desenvolvimento
- Treinamento e Capacitação
- Serviços Ambientais
- Despachante Veicular
- Autoescola
- Frete Bovino

### 💾 Campos Atuais no Banco (tabela `service_providers`):

- ✅ `nome_servico` - Nome do serviço
- ✅ `descricao` - Descrição do serviço
- ✅ `telefone` - Telefone
- ✅ `email_contato` - E-mail de contato
- ✅ `cidade` - Cidade
- ✅ `estado` - Estado

### ❌ Campos FALTANTES para Prestador:

1. **`tipo_servico`** (String 100) - Tipo de serviço (categoria: Manutenção, Consultoria, Logística, etc.)
2. **`endereco`** (String 255) - Endereço completo
3. **`cep`** (String 12) - CEP
4. **`cnpj_cpf`** (String 20) - CNPJ/CPF (para pessoa jurídica ou física)
5. **`insc_est_identidade`** (String 50) - Inscrição Estadual ou Identidade

### 📝 Observação:

Os tipos de serviços listados no documento podem ser categorias de atividades que devem ser relacionadas com a tabela de atividades, similar ao que é feito com empresas.

---

## 4️⃣ ATIVIDADES - Taxonomia

### 📄 Atividades no Documento Word:

#### **Pecuária:**

- Cria (Macho, Fêmea)
- Recria (Macho, Fêmea)
- Engorda (Macho, Fêmea)

#### **Agricultura:**

- Tipo de Agricultura:
  - Tradicional
  - Comercial
  - Orgânica
  - Sustentável
  - Familiar
  - Precisão
  - Hidropônica
  - Agroecológica
  - Irrigada
- Tipo de Cultura:
  - Soja (Semente Fiscalizada, Semente Não Fiscalizada, Adubo Foliar, Fósforo, Fosfatado, Nitrogenado, Potássio, Composto, Defensivo: Herbicida, Inseticida, Fungicida, Calcário: Dolomítico, Calcítico, Magnesiano, Gesso, Adubo Orgânico: Cama de Frango, Esterco de Galinha, Compost Barn)
  - Sorgo
  - Milho
  - Milheto
  - Arroz
  - Trigo
  - Algodão
  - Feijão
  - Estilosantes Campo Grande
  - Girassol
  - Gergelim
  - Capim

#### **Integração Pecuária/Agricultura:**

- Bezerro (Macho, Fêmea)
- Garrote
- Novilha
- Boi Magro
- Vaca
- Touro

#### **Comércio:**

- Supermercado
- Produtos Agropecuários e Insumos Agrícolas
- Genética
- Postos de Combustível
- Uniforme
- EPIs
- Implementos Agrícolas
- Concessionárias
- Distribuidora de Peças
- Equipamentos
- Tecnologia
- Drones e Aviação
- Drogarias

#### **Indústria:**

- Ração
- Frigorifico
- Agroenergia
- Processamento de Grãos

#### **Serviços:**

- Manutenção de Máquinas
- Manutenção de Equipamentos
- Consultoria Técnica para Pecuária e Agricultura
- Consultoria em Tecnologia
- Logística e Armazenagem
- Financeiros, Seguros e Gestão de Risco
- Intermediação
- Pesquisa e Desenvolvimento
- Treinamento e Capacitação
- Serviços Ambientais
- Despachante Veicular
- Autoescola
- Frete Bovino

### 💾 Estrutura Atual no Banco:

- ✅ `activity_category` - Categorias (Pecuária, Agricultura, etc.)
- ✅ `activity_group` - Grupos dentro de categorias
- ✅ `activity_item` - Itens específicos dentro de grupos
- ✅ `company_activities` - Relacionamento empresa ↔ atividades

### ⚠️ Verificação Necessária:

Precisa verificar se todas as atividades do documento estão cadastradas no banco através das migrations/seeds. A estrutura hierárquica (Categoria → Grupo → Item) está correta, mas é necessário validar se o conteúdo está completo.

---

## 5️⃣ CONTROLE DE REBANHO (Funcionalidade Futura)

### 📄 Campos no Documento Word:

- Código (Brinco)
- Produto (Bezerro, Bezerra, Garrote, Novilha, Boi Magro, Vaca Magra, Vaca Gorda, Boi Gordo, Vaca Parida, Touro)
- Macho/Fêmea
- Peso
- Entrada (Peso inicial, Data)
- Controles de Peso (Controle 1-4: Peso, Data, Ganho)
- Saída (Peso de Saída, Data, Ganho)
- Vacina (Tipo 1-6, Sazonalidade, Data)
- Suplementação (Ração) - Entrada, Controles 1-4, Saída

### 💾 Status no Banco:

❌ **NÃO IMPLEMENTADO** - Esta é uma funcionalidade futura que não está no escopo atual do banco de dados.

---

## 📊 Resumo de Alterações Necessárias

### 🔴 PRIORIDADE ALTA - Comprador (Buyer)

**Criar nova tabela `buyer_profiles` ou adicionar campos na tabela `users`:**

```sql
-- Opção 1: Adicionar campos na tabela users (apenas para buyers)
ALTER TABLE users ADD COLUMN nome_completo VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN data_nascimento DATE NULL;
ALTER TABLE users ADD COLUMN cpf VARCHAR(14) NULL;
ALTER TABLE users ADD COLUMN identidade VARCHAR(20) NULL;
ALTER TABLE users ADD COLUMN estado_civil VARCHAR(20) NULL;
ALTER TABLE users ADD COLUMN naturalidade VARCHAR(100) NULL;
ALTER TABLE users ADD COLUMN endereco VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN cep VARCHAR(12) NULL;
ALTER TABLE users ADD COLUMN cidade VARCHAR(100) NULL;
ALTER TABLE users ADD COLUMN estado VARCHAR(2) NULL;

-- Opção 2: Criar tabela separada buyer_profiles (RECOMENDADO)
CREATE TABLE buyer_profiles (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    user_id BIGINT NOT NULL UNIQUE,
    nome_completo VARCHAR(255) NOT NULL,
    data_nascimento DATE NULL,
    cpf VARCHAR(14) NULL UNIQUE,
    identidade VARCHAR(20) NULL,
    estado_civil VARCHAR(20) NULL,
    naturalidade VARCHAR(100) NULL,
    endereco VARCHAR(255) NOT NULL,
    cep VARCHAR(12) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 🟡 PRIORIDADE MÉDIA - Prestador de Serviço

**Adicionar campos na tabela `service_providers`:**

```sql
ALTER TABLE service_providers ADD COLUMN tipo_servico VARCHAR(100) NULL;
ALTER TABLE service_providers ADD COLUMN endereco VARCHAR(255) NULL;
ALTER TABLE service_providers ADD COLUMN cep VARCHAR(12) NULL;
ALTER TABLE service_providers ADD COLUMN cnpj_cpf VARCHAR(20) NULL;
ALTER TABLE service_providers ADD COLUMN insc_est_identidade VARCHAR(50) NULL;
```

### 🟢 PRIORIDADE BAIXA - Verificar Atividades

**Validar se todas as atividades do documento estão no banco:**

- Verificar seeds/migrations de atividades
- Comparar lista do documento com dados no banco
- Adicionar atividades faltantes se necessário

---

## ✅ Próximos Passos

1. **Criar migration para adicionar campos do comprador**
2. **Criar migration para adicionar campos do prestador**
3. **Atualizar models Python (SQLAlchemy)**
4. **Atualizar schemas Pydantic**
5. **Atualizar serviços e rotas da API**
6. **Validar atividades no banco**

---

## 📝 Notas

- Os campos de **Controle de Rebanho** são para uma funcionalidade futura e não devem ser implementados agora.
- A estrutura hierárquica de atividades (Categoria → Grupo → Item) está correta e deve ser mantida.
- Recomenda-se criar uma tabela separada `buyer_profiles` ao invés de adicionar campos diretamente em `users` para manter a normalização do banco.

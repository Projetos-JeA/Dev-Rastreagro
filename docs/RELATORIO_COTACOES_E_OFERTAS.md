# 📊 Relatório de Cotações e Ofertas por Perfil

**Data:** 04/12/2025  
**Total de Usuários:** 18  
**Total de Cotações:** 45  
**Total de Ofertas:** 54

---

## 📋 Usuários com Cotações Criadas (15 usuários)

Todos os produtores (têm `buyer_profile`) podem criar cotações.

### 1. Produtores CPF (3 usuários)

- **produtor_cpf1@teste.com** (Produtor CPF 1)
  - Perfil: Produtor
  - Cotações: 3 | Ofertas: 3

- **produtor_cpf2@teste.com** (Produtor CPF 2)
  - Perfil: Produtor
  - Cotações: 3 | Ofertas: 3

- **produtor_cpf3@teste.com** (Produtor CPF 3)
  - Perfil: Produtor
  - Cotações: 3 | Ofertas: 3

### 2. Produtores CNPJ (3 usuários)

- **produtor_cnpj1@teste.com** (Produtor CNPJ 1)
  - Perfil: Produtor + Fornecedor
  - Cotações: 3 | Ofertas: 3

- **produtor_cnpj2@teste.com** (Produtor CNPJ 2)
  - Perfil: Produtor + Fornecedor
  - Cotações: 3 | Ofertas: 3

- **produtor_cnpj3@teste.com** (Produtor CNPJ 3)
  - Perfil: Produtor + Fornecedor
  - Cotações: 3 | Ofertas: 3

### 3. Produtores + Fornecedores (3 usuários)

- **produtor_fornecedor1@teste.com** (Produtor Fornecedor 1)
  - Perfil: Produtor + Fornecedor
  - Cotações: 3 | Ofertas: 3

- **produtor_fornecedor2@teste.com** (Produtor Fornecedor 2)
  - Perfil: Produtor + Fornecedor
  - Cotações: 3 | Ofertas: 3

- **produtor_fornecedor3@teste.com** (Produtor Fornecedor 3)
  - Perfil: Produtor + Fornecedor
  - Cotações: 3 | Ofertas: 3

### 4. Produtores + Prestadores (3 usuários)

- **produtor_prestador1@teste.com** (Produtor Prestador 1)
  - Perfil: Produtor + Prestador
  - Cotações: 3 | Ofertas: 3

- **produtor_prestador2@teste.com** (Produtor Prestador 2)
  - Perfil: Produtor + Prestador
  - Cotações: 3 | Ofertas: 3

- **produtor_prestador3@teste.com** (Produtor Prestador 3)
  - Perfil: Produtor + Prestador
  - Cotações: 3 | Ofertas: 3

### 5. Prestadores + Produtores (3 usuários)

- **prestador_produtor1@teste.com** (Prestador Produtor 1)
  - Perfil: Produtor + Prestador
  - Cotações: 3 | Ofertas: 3

- **prestador_produtor2@teste.com** (Prestador Produtor 2)
  - Perfil: Produtor + Prestador
  - Cotações: 3 | Ofertas: 3

- **prestador_produtor3@teste.com** (Prestador Produtor 3)
  - Perfil: Produtor + Prestador
  - Cotações: 3 | Ofertas: 3

---

## 📦 Usuários com Ofertas Criadas (18 usuários)

**TODOS** os usuários podem criar ofertas.

### 1. Produtores CPF (3 usuários)

- **produtor_cpf1@teste.com** - 3 ofertas
- **produtor_cpf2@teste.com** - 3 ofertas
- **produtor_cpf3@teste.com** - 3 ofertas

### 2. Produtores CNPJ (3 usuários)

- **produtor_cnpj1@teste.com** - 3 ofertas
- **produtor_cnpj2@teste.com** - 3 ofertas
- **produtor_cnpj3@teste.com** - 3 ofertas

### 3. Produtores + Fornecedores (3 usuários)

- **produtor_fornecedor1@teste.com** - 3 ofertas
- **produtor_fornecedor2@teste.com** - 3 ofertas
- **produtor_fornecedor3@teste.com** - 3 ofertas

### 4. Produtores + Prestadores (3 usuários)

- **produtor_prestador1@teste.com** - 3 ofertas
- **produtor_prestador2@teste.com** - 3 ofertas
- **produtor_prestador3@teste.com** - 3 ofertas

### 5. Fornecedores + Prestadores (3 usuários)

- **fornecedor_prestador1@teste.com** - 3 ofertas (sem cotações)
- **fornecedor_prestador2@teste.com** - 3 ofertas (sem cotações)
- **fornecedor_prestador3@teste.com** - 3 ofertas (sem cotações)

### 6. Prestadores + Produtores (3 usuários)

- **prestador_produtor1@teste.com** - 3 ofertas
- **prestador_produtor2@teste.com** - 3 ofertas
- **prestador_produtor3@teste.com** - 3 ofertas

---

## 📊 Resumo Geral

| Métrica                               | Quantidade |
| ------------------------------------- | ---------- |
| **Total de Usuários**                 | 18         |
| **Usuários com Cotações**             | 15         |
| **Usuários com Ofertas**              | 18         |
| **Usuários sem Cotações nem Ofertas** | 0          |
| **Total de Cotações**                 | 45         |
| **Total de Ofertas**                  | 54         |

---

## 📈 Estatísticas por Tipo de Perfil

### Produtor (3 usuários)

- **Total de Cotações:** 9
- **Total de Ofertas:** 9
- **Média:** 3 cotações e 3 ofertas por usuário

### Produtor + Fornecedor (6 usuários)

- **Total de Cotações:** 18
- **Total de Ofertas:** 18
- **Média:** 3 cotações e 3 ofertas por usuário

### Produtor + Prestador (6 usuários)

- **Total de Cotações:** 18
- **Total de Ofertas:** 18
- **Média:** 3 cotações e 3 ofertas por usuário

### Fornecedor + Prestador (3 usuários)

- **Total de Cotações:** 0
- **Total de Ofertas:** 9
- **Média:** 0 cotações e 3 ofertas por usuário
- **Observação:** Não têm `buyer_profile`, então não podem criar cotações

---

## 💡 Observações Importantes

1. **Todos podem criar ofertas** - Regra implementada corretamente ✅
2. **Apenas produtores podem criar cotações** - Usuários com `buyer_profile` ✅
3. **Fornecedor + Prestador** - Apenas ofertas (sem `buyer_profile`) ✅
4. **Matches dinâmicos** - Fornecedores veem cotações relevantes mesmo sem ter cotações próprias ✅

---

## 🔑 Credenciais de Acesso

**Senha padrão para todos:** `Senha123!`  
**Todos os emails estão verificados:** ✅

---

## 🎯 Matches Esperados

### Produtores (com cotações)

- Veem **ofertas** de outros usuários compatíveis com suas cotações
- Exemplo: `produtor_cpf1@teste.com` cotou "Sementes de Soja" → vê ofertas de "Sementes de Soja" de outros usuários

### Fornecedores (sem cotações)

- Veem **cotações** de produtores compatíveis com suas ofertas
- Exemplo: `fornecedor_prestador1@teste.com` ofertou "Sementes de Soja" → vê cotações de "Sementes de Soja" de produtores

### Produtores + Fornecedores

- Veem **ofertas** (baseado em suas cotações)
- Veem **cotações** (baseado em suas ofertas)
- Prioriza mostrar ofertas se tiver cotações

---

**Última atualização:** 04/12/2025

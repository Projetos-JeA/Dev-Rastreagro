# 📊 Relações entre Perfis - Guia de Matches

**Última atualização:** 04/12/2025

---

## 🎯 Regras de Matching

### Como funciona:

1. **Ofertas** são mostradas para usuários que têm **cotações compatíveis**
2. **Cotações** são mostradas para usuários que têm **ofertas compatíveis**
3. Compatibilidade baseada em:
   - **Categoria** (agriculture, livestock, service, both)
   - **Tipo de produto** (quando especificado)
   - **Perfil do usuário** (atividades, localização)

---

## 📋 Exemplos Práticos por Perfil

### 1. **produtor_cpf1@teste.com** (Produtor)

**Ofertas criadas:**

- Sementes de Soja Premium (agriculture)
- Fertilizante NPK 20-10-10 (agriculture)
- Defensivo Herbicida Glifosato (agriculture)

**Cotações criadas:**

- Preciso de Sementes de Soja Premium (agriculture)
- Preciso de Fertilizante NPK 20-10-10 (agriculture)
- Preciso de Defensivo Herbicida Glifosato (agriculture)

**👀 Quem pode ver as OFERTAS deste usuário:**

- `produtor_cpf3@teste.com` (Produtor)
- `produtor_cnpj1@teste.com` (Produtor + Fornecedor)
- `produtor_cnpj3@teste.com` (Produtor + Fornecedor)
- `produtor_fornecedor1@teste.com` (Produtor + Fornecedor)
- `produtor_fornecedor3@teste.com` (Produtor + Fornecedor)

**👀 Quem pode ver as COTAÇÕES deste usuário:**

- `fornecedor_prestador1@teste.com` (Fornecedor + Prestador)
- `fornecedor_prestador3@teste.com` (Fornecedor + Prestador)
- `produtor_cpf3@teste.com` (Produtor)
- `produtor_cnpj1@teste.com` (Produtor + Fornecedor)
- `produtor_cnpj3@teste.com` (Produtor + Fornecedor)
- `produtor_fornecedor1@teste.com` (Produtor + Fornecedor)
- `produtor_fornecedor3@teste.com` (Produtor + Fornecedor)

---

### 2. **fornecedor_prestador1@teste.com** (Fornecedor + Prestador)

**Ofertas criadas:**

- Sementes de Soja Premium (agriculture)
- Fertilizante NPK 20-10-10 (agriculture)
- Defensivo Herbicida Glifosato (agriculture)

**Cotações criadas:** Nenhuma (não tem buyer_profile)

**👀 Quem pode ver as OFERTAS deste usuário:**

- `produtor_cpf1@teste.com` (Produtor)
- `produtor_cpf3@teste.com` (Produtor)
- `produtor_cnpj1@teste.com` (Produtor + Fornecedor)
- `produtor_cnpj3@teste.com` (Produtor + Fornecedor)
- `produtor_fornecedor1@teste.com` (Produtor + Fornecedor)
- `produtor_fornecedor3@teste.com` (Produtor + Fornecedor)

**👀 Quem pode ver as COTAÇÕES deste usuário:**

- Nenhuma (não cria cotações)

---

### 3. **produtor_cnpj1@teste.com** (Produtor + Fornecedor)

**Ofertas criadas:**

- Sementes de Soja Premium (agriculture)
- Fertilizante NPK 20-10-10 (agriculture)
- Defensivo Herbicida Glifosato (agriculture)

**Cotações criadas:**

- Preciso de Sementes de Soja Premium (agriculture)
- Preciso de Fertilizante NPK 20-10-10 (agriculture)
- Preciso de Defensivo Herbicida Glifosato (agriculture)

**👀 Quem pode ver as OFERTAS deste usuário:**

- `produtor_cpf1@teste.com` (Produtor)
- `produtor_cpf3@teste.com` (Produtor)
- `produtor_cnpj3@teste.com` (Produtor + Fornecedor)
- `produtor_fornecedor1@teste.com` (Produtor + Fornecedor)
- `produtor_fornecedor3@teste.com` (Produtor + Fornecedor)

**👀 Quem pode ver as COTAÇÕES deste usuário:**

- `fornecedor_prestador1@teste.com` (Fornecedor + Prestador)
- `fornecedor_prestador3@teste.com` (Fornecedor + Prestador)
- `produtor_cpf1@teste.com` (Produtor)
- `produtor_cpf3@teste.com` (Produtor)
- `produtor_cnpj3@teste.com` (Produtor + Fornecedor)
- `produtor_fornecedor1@teste.com` (Produtor + Fornecedor)
- `produtor_fornecedor3@teste.com` (Produtor + Fornecedor)

---

### 4. **prestador_produtor1@teste.com** (Produtor + Prestador)

**Ofertas criadas:**

- Serviço de Pulverização Aérea (service)
- Serviço de Plantio Direto (service)
- Serviço de Colheita Mecanizada (service)

**Cotações criadas:**

- Preciso de Serviço de Pulverização Aérea (service)
- Preciso de Serviço de Plantio Direto (service)
- Preciso de Serviço de Colheita Mecanizada (service)

**👀 Quem pode ver as OFERTAS deste usuário:**

- `prestador_produtor2@teste.com` (Produtor + Prestador)
- `prestador_produtor3@teste.com` (Produtor + Prestador)
- `produtor_prestador1@teste.com` (Produtor + Prestador)
- `produtor_prestador2@teste.com` (Produtor + Prestador)
- `produtor_prestador3@teste.com` (Produtor + Prestador)

**👀 Quem pode ver as COTAÇÕES deste usuário:**

- `prestador_produtor2@teste.com` (Produtor + Prestador)
- `prestador_produtor3@teste.com` (Produtor + Prestador)
- `produtor_prestador1@teste.com` (Produtor + Prestador)
- `produtor_prestador2@teste.com` (Produtor + Prestador)
- `produtor_prestador3@teste.com` (Produtor + Prestador)

---

## 📊 Matriz de Compatibilidade Geral

| Perfil que cria            | Tipo                  | Quem pode ver                                              |
| -------------------------- | --------------------- | ---------------------------------------------------------- |
| **Produtor**               | Cotação (agriculture) | Fornecedor + Prestador, Produtor, Produtor + Fornecedor    |
| **Produtor**               | Cotação (livestock)   | Fornecedor + Prestador, Produtor, Produtor + Fornecedor    |
| **Produtor**               | Oferta (agriculture)  | Produtor, Produtor + Fornecedor (com cotações agriculture) |
| **Fornecedor + Prestador** | Oferta (agriculture)  | Produtor, Produtor + Fornecedor (com cotações agriculture) |
| **Fornecedor + Prestador** | Oferta (livestock)    | Produtor, Produtor + Fornecedor (com cotações livestock)   |
| **Produtor + Fornecedor**  | Cotação (agriculture) | Fornecedor + Prestador, Produtor, Produtor + Fornecedor    |
| **Produtor + Fornecedor**  | Oferta (agriculture)  | Produtor, Produtor + Fornecedor (com cotações agriculture) |
| **Produtor + Prestador**   | Cotação (service)     | Produtor + Prestador (com ofertas service)                 |
| **Produtor + Prestador**   | Oferta (service)      | Produtor + Prestador (com cotações service)                |

---

## 🔍 Agrupamento por Categoria

### **AGRICULTURE** (Agricultura)

- **Ofertas de:** `fornecedor_prestador1`, `fornecedor_prestador3`, `produtor_cpf1`, `produtor_cpf3`, `produtor_cnpj1`, `produtor_cnpj3`, `produtor_fornecedor1`, `produtor_fornecedor3`
- **Cotações de:** `produtor_cpf1`, `produtor_cpf3`, `produtor_cnpj1`, `produtor_cnpj3`, `produtor_fornecedor1`, `produtor_fornecedor3`
- **Matches:** Produtores veem ofertas de Fornecedores e outros Produtores

### **LIVESTOCK** (Pecuária)

- **Ofertas de:** `fornecedor_prestador2`, `produtor_cpf2`, `produtor_cnpj2`, `produtor_fornecedor2`
- **Cotações de:** `produtor_cpf2`, `produtor_cnpj2`, `produtor_fornecedor2`
- **Matches:** Produtores de pecuária veem ofertas de Fornecedores de pecuária

### **SERVICE** (Serviços)

- **Ofertas de:** Todos os `prestador_produtor*` e `produtor_prestador*`
- **Cotações de:** Todos os `prestador_produtor*` e `produtor_prestador*`
- **Matches:** Prestadores veem cotações de outros Prestadores/Produtores

---

## 🧪 Guia de Testes Rápido

### Teste 1: Produtor vendo ofertas

1. Faça login com: `produtor_cpf1@teste.com` / `Senha123!`
2. Vá em "Deu Agro"
3. **Deve ver ofertas de:**
   - `fornecedor_prestador1@teste.com`
   - `fornecedor_prestador3@teste.com`
   - `produtor_cpf3@teste.com`
   - `produtor_cnpj1@teste.com`
   - `produtor_cnpj3@teste.com`
   - `produtor_fornecedor1@teste.com`
   - `produtor_fornecedor3@teste.com`

### Teste 2: Fornecedor vendo cotações

1. Faça login com: `fornecedor_prestador1@teste.com` / `Senha123!`
2. Vá em "Deu Agro"
3. **Deve ver cotações de:**
   - `produtor_cpf1@teste.com`
   - `produtor_cpf3@teste.com`
   - `produtor_cnpj1@teste.com`
   - `produtor_cnpj3@teste.com`
   - `produtor_fornecedor1@teste.com`
   - `produtor_fornecedor3@teste.com`

### Teste 3: Produtor + Fornecedor (duplo perfil)

1. Faça login com: `produtor_cnpj1@teste.com` / `Senha123!`
2. Vá em "Deu Agro"
3. **Deve ver:**
   - **Ofertas** (como produtor): de outros fornecedores/produtores
   - **Cotações** (como fornecedor): de outros produtores

---

## 📝 Notas Importantes

1. **Fornecedor + Prestador** não cria cotações (não tem buyer_profile)
2. **Produtor + Fornecedor** pode criar tanto ofertas quanto cotações
3. **Produtor + Prestador** pode criar tanto ofertas quanto cotações
4. Matches são baseados em **categoria** principalmente
5. A IA também considera **tipo de produto** e **perfil do usuário**

---

## 🔑 Credenciais de Teste

**Senha padrão para todos:** `Senha123!`  
**Todos os emails estão verificados:** ✅

---

**Para gerar este relatório novamente:**

```bash
cd backend
python -m app.scripts.analyze_profile_relations
```

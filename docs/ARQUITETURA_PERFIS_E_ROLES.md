# 🏗️ Arquitetura: Perfis e Roles (Roles)

## 📋 Visão Geral

O sistema permite que **um usuário tenha múltiplos perfis** ao mesmo tempo:
- **Comprador** (buyer) - tem `buyer_profile`
- **Vendedor/Produtor** (seller) - tem `company`
- **Prestador de Serviço** (service_provider) - tem `service_profile`

## 🗄️ Como é Armazenado no Banco de Dados

### Tabela `users`

```sql
users
├── id (PK)
├── email
├── password_hash
├── role (ENUM: 'buyer' | 'seller' | 'service_provider')  ← PERFIL PRINCIPAL
├── nickname
└── email_verificado
```

**IMPORTANTE**: O campo `role` é o **perfil principal** (usado no cadastro), mas **NÃO limita** o usuário a ter apenas esse perfil!

### Tabelas de Perfis (Separadas)

```sql
buyer_profiles
├── id (PK)
├── user_id (FK → users.id)
├── nome_completo
├── cpf
├── endereco
└── ...

companies
├── id (PK)
├── user_id (FK → users.id)
├── nome_propriedade
├── cnpj_cpf
├── endereco
└── ...

service_providers
├── id (PK)
├── user_id (FK → users.id)
├── nome_servico
├── tipo_servico
├── endereco
└── ...
```

**Cada perfil é uma tabela separada!** Um usuário pode ter:
- ✅ Apenas `buyer_profile` → 1 perfil
- ✅ `buyer_profile` + `company` → 2 perfis
- ✅ `buyer_profile` + `company` + `service_profile` → 3 perfis

---

## 🔄 Como Funciona a Alternância de Perfis

### 1. Backend: Identificação dos Perfis

**Arquivo**: `backend/app/services/user_service.py`

```python
def get_me(self, user_id: int) -> UserWithCompany:
    # Busca TODOS os perfis disponíveis (independente do role)
    company_obj = self.company_repo.get_by_user_id(user.id)
    service_obj = self.service_repo.get_by_user_id(user.id)
    buyer_obj = self.buyer_profile_repo.get_by_user_id(user.id)
    
    # Determina perfis disponíveis baseado nos dados existentes
    available_roles = []
    if buyer_obj:
        available_roles.append("buyer")
    if company_obj:
        available_roles.append("seller")
    if service_obj:
        available_roles.append("service_provider")
    
    return {
        "role": user.role,  # Perfil principal (do cadastro)
        "roles": available_roles,  # Array de TODOS os perfis disponíveis
        "company": company_obj,
        "service_profile": service_obj,
        "buyer_profile": buyer_obj,
    }
```

**Lógica**:
- O backend **sempre retorna TODOS os perfis** que o usuário tem
- O campo `role` é apenas informativo (perfil principal)
- O campo `roles` é um **array** com todos os perfis disponíveis

### 2. Frontend: Seleção e Armazenamento

**Arquivo**: `frontend/src/context/AuthContext.tsx`

```typescript
// 1. Ao fazer login, busca dados do usuário
const userData = await userService.me();
// userData.roles = ['buyer', 'seller']  (exemplo)

// 2. Extrai perfis disponíveis
const roles = userData.roles || [userData.role];

// 3. Se tem mais de 1 perfil → mostra tela de seleção
if (roles.length > 1) {
    setNeedsProfileSelection(true);
}

// 4. Usuário escolhe perfil → salva no AsyncStorage
async function setActiveRole(role: string) {
    await AsyncStorage.setItem(`@activeRole_${user.id}`, role);
    setActiveRoleState(role);
}
```

**Armazenamento Local**:
- `AsyncStorage.setItem('@activeRole_${userId}', 'buyer')`
- Persiste entre sessões
- Usado para saber qual perfil mostrar na UI

---

## 🎯 Como o Sistema Identifica Qual Perfil Usar

### Cenário 1: Usuário com 1 Perfil

```typescript
// Backend retorna:
{
    role: "buyer",
    roles: ["buyer"],
    buyer_profile: {...}
}

// Frontend:
- availableRoles = ["buyer"]
- activeRole = "buyer" (automático)
- needsProfileSelection = false
- Não mostra tela de seleção
```

### Cenário 2: Usuário com 2 Perfis

```typescript
// Backend retorna:
{
    role: "buyer",  // Perfil principal (do cadastro)
    roles: ["buyer", "seller"],  // TODOS os perfis disponíveis
    buyer_profile: {...},
    company: {...}
}

// Frontend:
- availableRoles = ["buyer", "seller"]
- activeRole = null (inicialmente)
- needsProfileSelection = true
- Mostra tela de seleção
- Usuário escolhe → activeRole = "seller"
- Salva no AsyncStorage: "@activeRole_123" = "seller"
```

### Cenário 3: Alternando Perfil

```typescript
// Usuário clica no botão de alternar no Header
setActiveRole("buyer");

// Atualiza:
- activeRole = "buyer"
- AsyncStorage: "@activeRole_123" = "buyer"
- UI atualiza para mostrar conteúdo do perfil "buyer"
```

---

## 🔍 Como o Backend Usa o Perfil Ativo

### Problema Atual

**O backend NÃO recebe qual perfil está ativo!**

Atualmente, o backend usa o campo `role` (perfil principal) para determinar qual perfil usar. Isso pode ser um problema se o usuário alternar de perfil.

### Solução: Enviar Perfil Ativo nas Requisições

**Opção 1: Header HTTP** (Recomendado)

```typescript
// Frontend: Adiciona header em todas as requisições
api.interceptors.request.use((config) => {
    const activeRole = await AsyncStorage.getItem(`@activeRole_${userId}`);
    if (activeRole) {
        config.headers['X-Active-Role'] = activeRole;
    }
    return config;
});
```

```python
# Backend: Lê header
@router.get("/quotations/relevant")
def get_relevant_quotations(
    current_user: User = Depends(get_current_user),
    active_role: str = Header(None, alias="X-Active-Role"),
    db: Session = Depends(get_db),
):
    # Usa active_role se fornecido, senão usa user.role
    profile_role = active_role or current_user.role.value
    # ...
```

**Opção 2: Query Parameter**

```typescript
// Frontend
api.get(`/quotations/relevant?active_role=${activeRole}`);
```

**Opção 3: Contexto no Token JWT**

Adicionar `active_role` no payload do JWT (mais complexo, mas mais seguro).

---

## 📊 Fluxo Completo

```
1. USUÁRIO FAZ LOGIN
   ↓
2. BACKEND: /users/me
   → Retorna: { role: "buyer", roles: ["buyer", "seller"], ... }
   ↓
3. FRONTEND: AuthContext
   → Detecta: roles.length > 1
   → Mostra tela de seleção
   ↓
4. USUÁRIO ESCOLHE: "seller"
   → AsyncStorage: "@activeRole_123" = "seller"
   → activeRole = "seller"
   ↓
5. REQUISIÇÕES FUTURAS
   → Header: X-Active-Role: seller
   → Backend usa perfil "seller" para filtrar dados
   ↓
6. USUÁRIO ALTERNA PARA "buyer"
   → AsyncStorage: "@activeRole_123" = "buyer"
   → Header: X-Active-Role: buyer
   → Backend usa perfil "buyer"
```

---

## 🛠️ Implementação Recomendada

### 1. Adicionar Header nas Requisições

**Arquivo**: `frontend/src/config/api.ts`

```typescript
api.interceptors.request.use(async (config) => {
    const token = await getStoredAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Adiciona perfil ativo
    const userId = await AsyncStorage.getItem('@userId');
    if (userId) {
        const activeRole = await AsyncStorage.getItem(`@activeRole_${userId}`);
        if (activeRole) {
            config.headers['X-Active-Role'] = activeRole;
        }
    }
    
    return config;
});
```

### 2. Backend Lê Header

**Arquivo**: `backend/app/core/dependencies.py`

```python
def get_active_role(
    current_user: User = Depends(get_current_user),
    x_active_role: str = Header(None, alias="X-Active-Role")
) -> str:
    """Retorna o perfil ativo do usuário"""
    if x_active_role and x_active_role in ["buyer", "seller", "service_provider"]:
        return x_active_role
    return current_user.role.value
```

### 3. Usar em Rotas

```python
@router.get("/quotations/relevant")
def get_relevant_quotations(
    current_user: User = Depends(get_current_user),
    active_role: str = Depends(get_active_role),
    db: Session = Depends(get_db),
):
    # Usa active_role para determinar qual perfil usar
    if active_role == "buyer":
        # Busca cotações relevantes para comprador
        ...
    elif active_role == "seller":
        # Busca cotações do próprio vendedor
        ...
```

---

## ✅ Resumo

| Aspecto | Como Funciona |
|---------|---------------|
| **Armazenamento** | `role` (principal) + tabelas separadas (buyer_profile, company, service_provider) |
| **Identificação** | Backend retorna `roles` (array) com todos os perfis disponíveis |
| **Seleção** | Frontend salva `activeRole` no AsyncStorage |
| **Uso** | **ATUALMENTE**: Backend usa `role` (principal)<br>**RECOMENDADO**: Enviar `activeRole` via header |
| **Alternância** | Frontend atualiza `activeRole` no AsyncStorage |

---

## 🎯 Próximos Passos

1. ✅ Sistema já identifica múltiplos perfis
2. ✅ Frontend já salva perfil ativo
3. ⏳ **FALTA**: Backend ler perfil ativo das requisições
4. ⏳ **FALTA**: Filtrar dados baseado no perfil ativo

---

**Última atualização**: 2025-11-29


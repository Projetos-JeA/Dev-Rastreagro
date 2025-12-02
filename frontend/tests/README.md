# Testes E2E com Playwright

## 📋 Por que o Playwright baixa o Chromium?

O Playwright baixa uma versão específica do Chromium por **3 motivos principais**:

### 1. **Versão Específica e Controlada**
- O Playwright usa versões testadas e validadas
- Garante que os testes funcionem igual em qualquer máquina
- Não depende do que está instalado no seu Windows

### 2. **Isolamento**
- Não interfere com seu Chrome/Edge normal
- Cada teste roda em ambiente limpo e isolado
- Você pode continuar usando seu navegador normalmente

### 3. **Confiabilidade**
- Mesma versão = mesmos resultados
- Evita problemas de compatibilidade entre versões diferentes
- É a melhor prática para testes automatizados

**Tamanho:** ~170MB (já foi baixado uma vez)

---

## 🚀 Como Ver os Testes Rodando na Tela

### Pré-requisitos:
1. ✅ Backend rodando em `http://localhost:8000`
2. ✅ Frontend rodando em `http://localhost:8081`
3. ✅ Playwright instalado (já feito)

### Passo a Passo:

#### 1. Inicie os servidores (em janelas PowerShell externas):

**Backend:**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```powershell
cd frontend
npm start
# Pressione 'w' para abrir no navegador
```

#### 2. Execute os testes (em uma nova janela PowerShell):

```powershell
cd frontend
npm run test:e2e
```

**O que vai acontecer:**
- ✅ Uma janela do navegador Chromium abrirá automaticamente
- ✅ Você verá os testes executando em tempo real
- ✅ O navegador preencherá os formulários automaticamente
- ✅ Você verá cada etapa do cadastro sendo testada

#### 3. Opções de Execução:

**Ver todos os testes:**
```powershell
npm run test:e2e
```

**Ver um teste específico:**
```powershell
npm run test:e2e -- buyer.spec.ts
npm run test:e2e -- producer-pf.spec.ts
npm run test:e2e -- producer-supplier.spec.ts
npm run test:e2e -- validations.spec.ts
```

**Interface visual do Playwright (recomendado para iniciantes):**
```powershell
npm run test:e2e:ui
```
Isso abre uma interface gráfica onde você pode:
- Ver os testes
- Executar testes individuais
- Ver screenshots e vídeos
- Debugar testes

**Ver relatório HTML após os testes:**
```powershell
npm run test:e2e:report
```

---

## 📁 Estrutura dos Testes

```
tests/
├── e2e/
│   ├── fixtures/
│   │   └── test-data.ts          # Dados de teste (emails, CPFs, etc.)
│   ├── helpers/
│   │   └── registration-helpers.ts  # Funções auxiliares
│   └── registration/
│       ├── buyer.spec.ts         # Teste cadastro comprador
│       ├── producer-pf.spec.ts   # Teste produtor PF
│       ├── producer-supplier.spec.ts  # Teste produtor+fornecedor PJ
│       └── validations.spec.ts    # Teste validações
```

---

## 🎯 Testes Disponíveis

### 1. **buyer.spec.ts**
Testa o cadastro completo de um comprador (buyer).

### 2. **producer-pf.spec.ts**
Testa o cadastro de um produtor pessoa física (apenas CPF).

### 3. **producer-supplier.spec.ts**
Testa o cadastro de produtor + fornecedor pessoa jurídica (com CNPJ).

### 4. **validations.spec.ts**
Testa as validações:
- Email duplicado
- Requisitos de senha
- CPF/CNPJ duplicados

---

## 💡 Dicas

1. **Mantenha os servidores rodando** enquanto executa os testes
2. **Use `npm run test:e2e:ui`** para uma experiência mais visual
3. **Os testes geram vídeos e screenshots** quando falham (em `test-results/`)
4. **Relatório HTML** está em `playwright-report/` após executar os testes

---

## 🔧 Configuração

O arquivo `playwright.config.ts` está configurado com:
- ✅ `headless: false` - Mostra o navegador (você vê os testes)
- ✅ `baseURL: 'http://localhost:8081'` - URL do frontend
- ✅ Screenshots e vídeos quando falha
- ✅ Timeout de 60 segundos por teste

---

## ❓ Problemas Comuns

**Teste não encontra elementos:**
- Verifique se o frontend está rodando em `http://localhost:8081`
- Aguarde a página carregar completamente

**Erro de conexão:**
- Verifique se o backend está rodando em `http://localhost:8000`
- Verifique se não há firewall bloqueando

**Email/CPF já cadastrado:**
- Os testes geram dados únicos automaticamente
- Se ainda assim falhar, limpe o banco de dados de teste

---

## 📝 Próximos Passos

Após ver os testes rodando, você pode:
1. Modificar os testes em `tests/e2e/registration/`
2. Adicionar novos cenários de teste
3. Ajustar os helpers em `tests/e2e/helpers/`
4. Personalizar os dados de teste em `tests/e2e/fixtures/`


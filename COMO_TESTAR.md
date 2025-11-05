# 🚀 Como Testar o RastreAgro

## ✅ O que foi iniciado:

1. **Backend** - Rodando em janela separada do PowerShell
2. **Frontend** - Rodando em janela separada do PowerShell (Expo)

---

## 📱 Testando o Frontend (Mobile)

### Opção 1: No Navegador (MAIS FÁCIL para demonstração)
No terminal do Expo que abriu, pressione:
```
w
```
Isso abrirá o app no navegador! É a forma mais fácil de testar sem precisar do celular.

### Opção 2: No Celular (via QR Code)
1. Abra o app **Expo Go** no celular
2. Escaneie o QR code que aparece no terminal
3. Se não funcionar, certifique-se que:
   - Celular e computador estão na mesma rede WiFi
   - Firewall do Windows permite conexões na porta 8081

### Opção 3: Emulador Android
No terminal do Expo, pressione:
```
a
```
(Requer Android Studio instalado e emulador configurado)

---

## 🔧 Testando o Backend

### 1. Swagger UI (Interface Interativa)
Abra no navegador:
```
http://localhost:8000/docs
```

Aqui você pode:
- Ver todas as rotas disponíveis
- Testar o login diretamente
- Ver a documentação da API

### 2. Testar Login via Swagger
1. Vá em `/api/v1/auth/login`
2. Clique em "Try it out"
3. Use os dados de teste:
   ```json
   {
     "email": "cliente@test.com",
     "password": "senha123"
   }
   ```
4. Clique em "Execute"
5. Você receberá um token JWT!

### 3. Testar Health Check
No navegador, acesse:
```
http://localhost:8000/health
```

---

## 📝 Usuários de Teste

### Cliente
- **Email**: `cliente@test.com`
- **Senha**: `senha123`

### Empresa
- **Email**: `empresa@test.com`
- **Senha**: `senha123`

### 2FA (Mock)
- **Código**: `123456`

---

## 🎯 Fluxo Completo para Demonstrar

1. **Abra o Swagger**: `http://localhost:8000/docs`
2. **Teste o login** com `cliente@test.com` / `senha123`
3. **Copie o token** retornado
4. **No app mobile** (pressione `w` no Expo para abrir no navegador):
   - Digite `cliente@test.com` / `senha123`
   - Clique em "Entrar"
   - Digite o código 2FA: `123456`
   - Você será redirecionado para a Home!

---

## ⚠️ Problemas Comuns

### Backend não inicia
- Verifique se a porta 8000 está livre
- Veja a janela do PowerShell do backend para erros

### Frontend não conecta ao backend
- Certifique-se que o backend está rodando
- Verifique `http://localhost:8000/health` no navegador

### QR Code não funciona
- Use a opção `w` para abrir no navegador (mais fácil!)
- Ou verifique se estão na mesma rede WiFi

---

## 🔄 Para Reiniciar

Se precisar reiniciar:
1. Feche as janelas do PowerShell (backend e frontend)
2. Execute novamente:
   ```powershell
   .\backend\start-backend.ps1
   # Aguarde 3 segundos
   .\frontend\start-frontend.ps1
   ```

---

**💡 Dica de Demonstração**: Use `w` no Expo para abrir no navegador - é mais rápido e fácil para mostrar funcionando!


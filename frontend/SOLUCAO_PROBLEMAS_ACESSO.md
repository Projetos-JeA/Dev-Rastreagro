# 🔧 Solução de Problemas de Acesso - Frontend

## Problema: Não consegue acessar pelo IP

### ✅ Solução 1: Reiniciar o Expo com LAN

1. **Pare o Expo** (Ctrl+C no terminal)
2. **Inicie novamente com LAN habilitado:**
   ```bash
   npm start
   ```
   (Já configurado para usar `--lan` automaticamente)

3. **Ou use diretamente:**
   ```bash
   npx expo start --lan
   ```

### ✅ Solução 2: Verificar Firewall do Windows

O firewall pode estar bloqueando a porta 8081.

1. **Abra o Firewall do Windows:**
   - Pressione `Win + R`
   - Digite: `wf.msc` e pressione Enter

2. **Crie uma regra de entrada:**
   - Clique em "Regras de Entrada" → "Nova Regra"
   - Selecione "Porta" → Próximo
   - TCP → Portas específicas: `8081` → Próximo
   - Permitir conexão → Próximo
   - Marque todas as opções → Próximo
   - Nome: "Expo Dev Server" → Concluir

### ✅ Solução 3: Verificar se o Expo está rodando

No terminal do Expo, você deve ver algo como:
```
Metro waiting on exp://10.255.252.43:8081
```

Se não aparecer, o Expo não está aceitando conexões de rede.

### ✅ Solução 4: Usar Tunnel (Alternativa)

Se LAN não funcionar, use tunnel:

```bash
npx expo start --tunnel
```

Isso cria um túnel público, mas pode ser mais lento.

### ✅ Solução 5: Acessar via Web (Mais Fácil)

No terminal do Expo, pressione:
```
w
```

Isso abre automaticamente no navegador em `http://localhost:8081`

### ✅ Solução 6: Verificar IP Correto

Execute no PowerShell:
```powershell
ipconfig | findstr /i "IPv4"
```

Use o IP que aparece na interface ativa (geralmente Wi-Fi ou Ethernet).

### ✅ Solução 7: Testar no Mesmo Computador Primeiro

Antes de tentar de outro dispositivo, teste localmente:

```
http://localhost:8081
```

Se funcionar localmente mas não por IP, o problema é de rede/firewall.

## 📝 Checklist de Verificação

- [ ] Expo está rodando com `--lan`?
- [ ] Firewall permite porta 8081?
- [ ] IP está correto? (verifique com `ipconfig`)
- [ ] Dispositivo está na mesma rede WiFi?
- [ ] Tentou acessar via `localhost:8081` primeiro?

## 🚀 Comando Rápido

Para iniciar tudo de uma vez (com LAN habilitado):

```bash
npm start
```

Depois pressione `w` no terminal para abrir no navegador automaticamente.

## 💡 Dica

Se nada funcionar, use o **tunnel**:
```bash
npx expo start --tunnel
```

Isso funciona mesmo fora da rede local, mas pode ser mais lento.


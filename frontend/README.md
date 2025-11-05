# RastreAgro Mobile

Aplicativo mobile do RastreAgro desenvolvido com React Native e Expo.

## 🚀 Tecnologias

- **React Native**: Framework para desenvolvimento mobile
- **Expo**: Plataforma e ferramentas para React Native
- **React Navigation**: Navegação entre telas
- **Axios**: Cliente HTTP para chamadas à API
- **TypeScript**: Tipagem estática

## 📋 Pré-requisitos

- Node.js 16+ e npm/yarn
- Expo CLI: `npm install -g expo-cli`
- Expo Go app no celular (iOS/Android) ou emulador

## 🔧 Instalação

1. **Instalar dependências:**
```bash
npm install
```

ou

```bash
yarn install
```

2. **Configurar API URL:**

Edite `src/config/api.ts` se necessário para ajustar a URL da API.

## ▶️ Executar

```bash
npm start
```

ou

```bash
yarn start
```

Isso abrirá o Expo Dev Tools. Você pode:
- Escanear o QR code com o app Expo Go (Android/iOS)
- Pressionar `a` para abrir no Android emulador
- Pressionar `i` para abrir no iOS simulator
- Pressionar `w` para abrir no navegador

## 📱 Telas

### Login
- Tela de login com email e senha
- Suporte a autenticação 2FA (mock)
- Usuários de teste exibidos na tela

### Home
- Tela inicial após login
- Exibe status da API
- Lista de funcionalidades
- Botão de logout

## 🔐 Autenticação

O app usa JWT tokens armazenados no AsyncStorage. Os tokens são automaticamente incluídos nas requisições via interceptors do Axios.

### Usuários de Teste

- **Cliente**: `cliente@test.com` / `senha123`
- **Empresa**: `empresa@test.com` / `senha123`

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── config/
│   │   └── api.ts              # Configuração do Axios
│   ├── context/
│   │   └── AuthContext.tsx     # Context de autenticação
│   ├── navigation/
│   │   └── AppNavigator.tsx    # Navegação principal
│   ├── screens/
│   │   ├── LoginScreen.tsx     # Tela de login
│   │   └── HomeScreen.tsx      # Tela inicial
│   └── services/
│       └── authService.ts      # Serviço de autenticação
├── App.tsx                     # Componente principal
├── app.json                    # Configuração do Expo
├── package.json
└── README.md
```

## 🔌 Conectar com Backend

Certifique-se de que o backend está rodando em `http://localhost:8000`.

Para dispositivos físicos:
- Use o IP da sua máquina na rede local
- Exemplo: `http://192.168.1.100:8000`
- Edite `src/config/api.ts` para usar o IP correto

## 📝 Notas

- O app está configurado para desenvolvimento
- Em produção, configure a URL da API corretamente
- O 2FA é mockado - implementar integração real em produção


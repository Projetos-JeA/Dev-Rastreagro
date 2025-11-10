# RastreAgro Mobile

Aplicativo mobile do RastreAgro desenvolvido com React Native (Expo).

## 🚀 Tecnologias

- **Expo / React Native 0.72**
- **React Navigation (stack)**
- **Axios** com interceptores de refresh token
- **AsyncStorage** / `localStorage` (web) para persistir tokens
- **TypeScript**

## 📋 Pré-requisitos

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- App Expo Go (Android/iOS) ou emulador
- Backend rodando em `http://localhost:8000`

## 🔧 Instalação

```bash
cd frontend
npm install
```

> Após alterações nas dependências, rode `npm install` para atualizar `package-lock.json`.

## ▶️ Executar

```bash
npm start
```

No terminal do Expo:
- `w` abre no navegador (mais simples)
- `a` abre no emulador Android
- `i` abre no simulador iOS
- escaneie o QR code com o Expo Go (dispositivo físico)

## 📱 Fluxo de Telas

1. **Login**: email + senha. Em caso de sucesso, salva tokens e navega para Home.
2. **RegisterChoice**: escolhe entre “Sou Comprador” ou “Sou Vendedor/Empresa”.
3. **RegisterBuyer**: formulário simples (email, senha, apelido). Faz login automático após registrar.
4. **RegisterSeller**: formulário completo com dados empresariais + seletor hierárquico de atividades (categoria → grupo → item). Permite múltiplas seleções e login automático.
5. **Home**: placeholder “Home” com botão “Sair”.

## 🔐 Autenticação

- Tokens armazenados (`access_token`, `refresh_token`) via `src/config/api.ts`
- Interceptor renova automaticamente o `access_token` ao receber 401
- Após registrar ou logar o app consulta `/users/me` para obter o perfil

## 📁 Estrutura resumida

```
frontend/
├── src/
│   ├── config/api.ts                # Axios + storage de tokens
│   ├── context/AuthContext.tsx      # Estado global de autenticação
│   ├── navigation/AppNavigator.tsx  # Stack de telas
│   ├── screens/                     # Login, Register*, Home
│   └── services/                    # auth, activities, company, user
├── App.tsx
├── package.json
└── README.md
```

## 🔌 Conectar com o backend

- Ajuste a URL em `src/config/api.ts` caso use IP da rede local
- Backend precisa estar acessível em `http://localhost:8000`
- Rotas consumidas:
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /auth/refresh`
  - `GET /users/me`
  - `GET /activities/*`
  - `POST /companies`

## 📝 Notas

- A tela Home é um placeholder para futuras funcionalidades
- O seletor de atividade utiliza `@react-native-picker/picker`
- Caso faça build web (`npm run web`), tokens usam `localStorage`
- Próximas sprints: adicionar fluxo de controle de rebanho e dashboards


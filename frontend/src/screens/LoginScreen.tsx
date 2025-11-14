/**
 * Tela de login para acesso dos usuários
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { showApiError } from '../utils/errorMessages';

interface LoginScreenProps {
  navigation: StackNavigationProp<RootStackParamList, 'Login'>;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { login } = useAuth();

  const handleLogin = async () => {
    // Limpar mensagem de erro anterior
    setErrorMessage('');

    if (!email || !password) {
      const msg = 'Por favor, preencha email e senha';
      setErrorMessage(msg);
      Alert.alert('Erro', msg);
      return;
    }

    setLoading(true);
    try {
      await login({ email, password });
      // Se chegou aqui, o login foi bem-sucedido e a navegação acontece automaticamente
    } catch (error: any) {
      console.error('Erro no login:', error);

      // Tratamento específico para credenciais inválidas
      let errorMsg = 'Erro ao fazer login. Tente novamente.';

      if (error?.status === 401 || error?.response?.status === 401) {
        errorMsg = 'Email ou senha incorretos. Verifique seus dados e tente novamente.';
      } else if (error?.message) {
        errorMsg = error.message;
      } else if (error?.response?.data?.detail) {
        errorMsg =
          typeof error.response.data.detail === 'string'
            ? error.response.data.detail
            : 'Erro ao fazer login. Tente novamente.';
      }

      // Exibir erro visual na tela
      setErrorMessage(errorMsg);

      // Tentar exibir alert também (funciona melhor no mobile)
      Alert.alert('Erro no login', errorMsg);

      // Se for erro 401, usar showApiError também
      if (error?.status !== 401 && error?.response?.status !== 401) {
        showApiError(error, errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Text style={styles.title}>RastreAgro</Text>
          <Text style={styles.subtitle}>Faça login para continuar</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={text => {
              setEmail(text);
              setErrorMessage(''); // Limpar erro ao digitar
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <TextInput
            style={styles.input}
            placeholder="Senha"
            value={password}
            onChangeText={text => {
              setPassword(text);
              setErrorMessage(''); // Limpar erro ao digitar
            }}
            secureTextEntry
            autoCapitalize="none"
          />

          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerButtonText}>Não tem uma conta? Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
    padding: 12,
    borderRadius: 4,
    marginBottom: 15,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: '500',
  },
});

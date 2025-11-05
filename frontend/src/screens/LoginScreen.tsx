/**
 * Login Screen
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

type ProfileType = 'vendedor' | 'comprador';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profile, setProfile] = useState<ProfileType>('comprador');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha email e senha');
      return;
    }

    if (!profile) {
      Alert.alert('Erro', 'Por favor, selecione um perfil');
      return;
    }

    setLoading(true);
    try {
      // Mapear perfil para o tipo esperado pela API
      const emailToUse = profile === 'vendedor' ? 'empresa@test.com' : 'cliente@test.com';
      
      await login({ email: emailToUse, password });
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao fazer login');
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.title}>RastreAgro</Text>
          <Text style={styles.subtitle}>Faça login para continuar</Text>

          <View style={styles.profileContainer}>
            <Text style={styles.label}>Selecione seu perfil:</Text>
            <View style={styles.profileButtons}>
              <TouchableOpacity
                style={[
                  styles.profileButton,
                  profile === 'comprador' && styles.profileButtonActive
                ]}
                onPress={() => setProfile('comprador')}
              >
                <Text style={[
                  styles.profileButtonText,
                  profile === 'comprador' && styles.profileButtonTextActive
                ]}>
                  Comprador
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.profileButton,
                  profile === 'vendedor' && styles.profileButtonActive
                ]}
                onPress={() => setProfile('vendedor')}
              >
                <Text style={[
                  styles.profileButtonText,
                  profile === 'vendedor' && styles.profileButtonTextActive
                ]}>
                  Vendedor
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <TextInput
            style={styles.input}
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
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

          <View style={styles.helpText}>
            <Text style={styles.helpTextLabel}>Usuários de teste:</Text>
            <Text style={styles.helpTextValue}>Email e senha: qualquer valor</Text>
            <Text style={styles.helpTextValue}>O login será processado com base no perfil selecionado</Text>
          </View>
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
  profileContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  profileButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  profileButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  profileButtonActive: {
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },
  profileButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  profileButtonTextActive: {
    color: '#2E7D32',
    fontWeight: 'bold',
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
    marginTop: 15,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '600',
  },
  helpText: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
  },
  helpTextLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 5,
  },
  helpTextValue: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
});

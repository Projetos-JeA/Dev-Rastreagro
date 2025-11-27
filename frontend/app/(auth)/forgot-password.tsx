import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Input from '../../src/components/Input';
import { useTheme } from '../../src/context/ThemeContext';
import { authService } from '../../src/services/authService';
import { isValidEmail } from '../../src/utils/validators';

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit() {
    setError('');

    if (!email.trim()) {
      setError('Email é obrigatório');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Email inválido');
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSuccess(true);
      Alert.alert(
        'Email enviado',
        'Se o email estiver cadastrado, um link de recuperação de senha será enviado.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err: any) {
      setError(err.message || 'Erro ao solicitar recuperação de senha');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ImageBackground
      source={require('../../assets/background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={[styles.overlay, { backgroundColor: colors.backgroundOverlay }]} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <Text style={[styles.title, { color: colors.text }]}>Recuperar Senha</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Digite seu email e enviaremos um link para redefinir sua senha.
            </Text>

            <Input
              label="E-mail"
              required
              value={email}
              onChangeText={setEmail}
              error={error}
              placeholder="Digite seu e-mail"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading && !success}
            />

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.buttonBackground }, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading || success}
            >
              {loading ? (
                <ActivityIndicator color={colors.buttonText} />
              ) : (
                <Text style={[styles.buttonText, { color: colors.buttonText }]}>
                  Enviar Link de Recuperação
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              disabled={loading}
            >
              <Text style={[styles.backButtonText, { color: colors.link }]}>
                Voltar ao login
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logo: { width: 150, height: 150 },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'left',
    marginBottom: 24,
  },

  button: {
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 10,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontSize: 18, fontWeight: 'bold' },

  backButton: { marginTop: 10, alignItems: 'center' },
  backButtonText: { fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
});

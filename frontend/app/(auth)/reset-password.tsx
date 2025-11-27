import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { validatePassword } from '../../src/utils/validators';

export default function ResetPasswordScreen() {
  const { colors } = useTheme();
  const { token } = useLocalSearchParams<{ token: string }>();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function updateField(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  async function handleSubmit() {
    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else {
      const validation = validatePassword(formData.password);
      if (!validation.isValid) {
        newErrors.password = (validation as any).errors?.[0] || validation.errors[0] || 'Senha inválida';
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    if (!token) {
      Alert.alert('Erro', 'Token inválido. Solicite um novo link de recuperação.');
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, formData.password);
      Alert.alert(
        'Sucesso',
        'Senha redefinida com sucesso! Você já pode fazer login com a nova senha.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }],
      );
    } catch (err: any) {
      Alert.alert('Erro', err?.message || 'Erro ao redefinir senha');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
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
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              <View style={styles.logoContainer}>
                <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
              </View>

              <Text style={[styles.title, { color: colors.text }]}>Link inválido</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Token inválido ou expirado. Solicite um novo link de recuperação.
              </Text>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.buttonBackground }]}
                onPress={() => router.replace('/(auth)/login')}
              >
                <Text style={[styles.buttonText, { color: colors.buttonText }]}>Voltar ao login</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    );
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

            <Text style={[styles.title, { color: colors.text }]}>Redefinir Senha</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Digite sua nova senha abaixo.
            </Text>

            <Input
              label="Nova Senha"
              required
              value={formData.password}
              onChangeText={text => updateField('password', text)}
              error={errors.password}
              placeholder="Digite sua nova senha"
              isPassword
              autoCapitalize="none"
            />

            <Input
              label="Confirmar Senha"
              required
              value={formData.confirmPassword}
              onChangeText={text => updateField('confirmPassword', text)}
              error={errors.confirmPassword}
              placeholder="Confirme sua nova senha"
              isPassword
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: colors.buttonBackground },
                loading && styles.buttonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.buttonText} />
              ) : (
                <Text style={[styles.buttonText, { color: colors.buttonText }]}>
                  Redefinir Senha
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.replace('/(auth)/login')}
              disabled={loading}
            >
              <Text style={[styles.backButtonText, { color: colors.link }]}>Voltar ao login</Text>
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
    marginBottom: 25,
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
    marginTop: 6,
    marginBottom: 10,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontSize: 18, fontWeight: 'bold' },
  backButton: { marginTop: 10, alignItems: 'center' },
  backButtonText: { fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
});

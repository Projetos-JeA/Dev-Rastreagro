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
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { authService } from '../../src/services/authService';
import { isValidEmail } from '../../src/utils/validators';

export default function LoginScreen() {
  const { login } = useAuth();
  const { colors } = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function updateField(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }

  async function handleLogin() {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await login({ email: formData.email, password: formData.password });
    } catch (error: any) {
      const status = error?.status || error?.response?.status;
      const detail = error?.response?.data?.detail || error?.message;

      if (status === 403 || detail?.includes('não verificado') || detail?.includes('verificar')) {
        // Email não verificado
        Alert.alert(
          'Email não verificado',
          detail ||
            'Verifique sua caixa de entrada e clique no link de verificação. Se não recebeu o email, solicite um novo link.',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Reenviar email',
              onPress: async () => {
                try {
                  await authService.resendVerification(formData.email);
                  Alert.alert(
                    'Email reenviado',
                    'Um novo link de verificação foi enviado para seu email. Verifique sua caixa de entrada.'
                  );
                } catch (err: any) {
                  Alert.alert(
                    'Erro',
                    err?.response?.data?.message ||
                      'Não foi possível reenviar o email. Tente novamente mais tarde.'
                  );
                }
              },
            },
          ]
        );
        setErrors({ email: 'Email não verificado' });
      } else if (status === 401) {
        setErrors({ password: 'Email ou senha incorretos' });
      } else {
        setErrors({ password: detail || 'Erro ao fazer login. Tente novamente.' });
      }
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
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

            <Input
              label="E-mail"
              required
              value={formData.email}
              onChangeText={text => updateField('email', text)}
              error={errors.email}
              placeholder="Digite seu email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Senha"
              required
              value={formData.password}
              onChangeText={text => updateField('password', text)}
              error={errors.password}
              placeholder="Digite sua senha"
              isPassword
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => router.push('/(auth)/forgot-password')}
            >
              <Text style={[styles.forgotPasswordText, { color: colors.link }]}>
                Esqueceu a senha
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.buttonBackground }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.buttonText} />
              ) : (
                <Text style={[styles.buttonText, { color: colors.buttonText }]}>Entrar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.socialButton,
                {
                  backgroundColor: colors.buttonSocialBackground,
                  borderColor: colors.buttonSocialBorder,
                },
              ]}
            >
              <Image
                source={{ uri: 'https://www.google.com/favicon.ico' }}
                style={styles.socialIcon}
              />
              <Text style={[styles.socialButtonText, { color: colors.buttonSocialText }]}>
                Entrar com Google
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.socialButton,
                {
                  backgroundColor: colors.buttonSocialBackground,
                  borderColor: colors.buttonSocialBorder,
                },
              ]}
            >
              <View
                style={[styles.facebookIconContainer, { backgroundColor: colors.facebookColor }]}
              >
                <Text style={[styles.facebookIcon, { color: colors.white }]}>f</Text>
              </View>
              <Text style={[styles.socialButtonText, { color: colors.buttonSocialText }]}>
                Entrar com facebook
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => router.push('/(auth)/first-access')}
            >
              <Text style={[styles.registerButtonText, { color: colors.link }]}>
                Primeiro acesso
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
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
  logo: {
    width: 150,
    height: 150,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    marginTop: -10,
  },
  forgotPasswordText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  button: {
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  socialButton: {
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  facebookIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  facebookIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  registerButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: 14,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});

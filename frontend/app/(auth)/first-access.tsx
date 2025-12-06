import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { useRouter } from 'expo-router';
import Input from '../../src/components/Input';
import StepIndicator from '../../src/components/StepIndicator';
import { authService } from '../../src/services/authService';
import { saveStep1Data, getStep1Data } from '../../src/services/registrationStorage';

export default function FirstAccessScreen() {
  const { colors } = useTheme();
  const [formData, setFormData] = useState({
    fullName: '',
    nickname: '',
    birthDate: '',
    cpf: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadSavedData() {
      const saved = await getStep1Data();
      if (saved) {
        setFormData(saved);
      }
    }
    loadSavedData();
  }, []);

  function generateNickname(fullName: string): string {
    if (!fullName.trim()) return '';

    const nameParts = fullName.trim().split(' ').filter(part => part.length > 0);
    if (nameParts.length === 0) return '';

    const initials = nameParts
      .map(part => part[0].toUpperCase())
      .join('');

    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();

    return `${initials}${randomChars}`;
  }

  async function updateField(field: string, value: string) {
    let updated = { ...formData, [field]: value };

    if (field === 'fullName') {
      const generatedNickname = generateNickname(value);
      updated = { ...updated, nickname: generatedNickname };
    }

    setFormData(updated);

    setTimeout(async () => {
      await saveStep1Data(updated);
    }, 300);

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nome completo é obrigatório';
    }

    if (!formData.nickname.trim()) {
      newErrors.nickname = 'Apelido é obrigatório';
    }

    if (!formData.birthDate.trim()) {
      newErrors.birthDate = 'Data de nascimento é obrigatória';
    } else if (formData.birthDate.length !== 10) {
      newErrors.birthDate = 'Data inválida';
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (formData.cpf.replace(/\D/g, '').length !== 11) {
      newErrors.cpf = 'CPF inválido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (formData.phone.replace(/\D/g, '').length < 12) {
      newErrors.phone = 'Telefone inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleContinue() {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const availability = await authService.checkAvailability({
        email: formData.email,
        cpf: formData.cpf,
      });

      const newErrors: Record<string, string> = {};

      if (availability.email_available === false) {
        newErrors.email = 'Este email já está cadastrado';
      }

      if (availability.cpf_available === false) {
        newErrors.cpf = 'Este CPF já está cadastrado';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      await saveStep1Data(formData);
      
      router.push({
        pathname: '/(auth)/second-access',
        params: formData,
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível verificar os dados. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleLoginRedirect() {
    router.push('/(auth)/login');
  }

  return (
    <ImageBackground
      source={require('../../assets/background.png')}
      style={styles.backgroundImage}
    >
      <View style={[styles.overlay, { backgroundColor: colors.backgroundOverlay }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.container}>
              <View style={styles.iconContainer}>
                <Image
                  source={require('../../assets/logo.png')}
                  style={styles.icon}
                  resizeMode="contain"
                />
              </View>

              <StepIndicator currentStep={1} totalSteps={3} />

              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Dados Pessoais
              </Text>

              <View style={styles.formContainer}>
                <Input
                  label="Nome completo"
                  required
                  value={formData.fullName}
                  onChangeText={(text) => updateField('fullName', text)}
                  error={errors.fullName}
                  placeholder="Digite o nome"
                  autoCapitalize="words"
                />

                <Input
                  label="Apelido"
                  required
                  value={formData.nickname}
                  onChangeText={(text) => updateField('nickname', text)}
                  error={errors.nickname}
                  placeholder="Gerado automaticamente"
                  autoCapitalize="words"
                  editable={false}
                />

                <Input
                  label="Data de nascimento"
                  required
                  value={formData.birthDate}
                  onChangeText={(text) => updateField('birthDate', text)}
                  error={errors.birthDate}
                  placeholder="xx/xx/xxxx"
                  mask="date"
                  maxLength={10}
                />

                <Input
                  label="CPF"
                  required
                  value={formData.cpf}
                  onChangeText={(text) => updateField('cpf', text)}
                  error={errors.cpf}
                  placeholder="xxx.xxx.xxx-xx"
                  mask="cpf"
                  maxLength={14}
                />

                <Input
                  label="Email"
                  required
                  value={formData.email}
                  onChangeText={(text) => updateField('email', text)}
                  error={errors.email}
                  placeholder="Digite o email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Input
                  label="Telefone"
                  required
                  value={formData.phone}
                  onChangeText={(text) => updateField('phone', text)}
                  error={errors.phone}
                  placeholder="+xx xx x xxxx-xxxx"
                  mask="phone"
                  maxLength={19}
                />
              </View>

              <TouchableOpacity
                style={[styles.continueButton, { backgroundColor: colors.buttonBackground, shadowColor: colors.shadowColor }]}
                onPress={handleContinue}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.buttonText} />
                ) : (
                  <Text style={[styles.continueButtonText, { color: colors.buttonText }]}>
                    Continuar
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={handleLoginRedirect} activeOpacity={0.7}>
                <Text style={[styles.loginLink, { color: colors.text }]}>
                  Possuo cadastro
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 30,
  },
  container: {
    flex: 1,
    paddingHorizontal: 30,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  icon: {
    width: 150,
    height: 150,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 25,
  },
  formContainer: {
    marginBottom: 20,
  },
  continueButton: {
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    textAlign: 'center',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

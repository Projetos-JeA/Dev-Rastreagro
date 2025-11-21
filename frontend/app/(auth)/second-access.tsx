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
} from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Input from '../../src/components/Input';
import StepIndicator from '../../src/components/StepIndicator';
import ProfileSelector, { ProfileType } from '../../src/components/ProfileSelector';

export default function SecondAccessScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();

  const [formData, setFormData] = useState({
    cnpj: '',
    companyName: '',
    tradeName: '',
    stateRegistration: '',
    password: '',
    confirmPassword: '',
  });
  const [selectedProfiles, setSelectedProfiles] = useState<ProfileType[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  useEffect(() => {
    if (formData.password && formData.confirmPassword) {
      setPasswordMatch(formData.password === formData.confirmPassword);
    } else {
      setPasswordMatch(null);
    }
  }, [formData.password, formData.confirmPassword]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.cnpj.trim()) {
      newErrors.cnpj = 'CNPJ é obrigatório';
    } else if (formData.cnpj.replace(/\D/g, '').length !== 14) {
      newErrors.cnpj = 'CNPJ inválido';
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Razão social é obrigatória';
    }

    if (!formData.tradeName.trim()) {
      newErrors.tradeName = 'Nome fantasia é obrigatório';
    }

    if (!formData.stateRegistration.trim()) {
      newErrors.stateRegistration = 'Inscrição estadual é obrigatória';
    } else if (formData.stateRegistration.replace(/\D/g, '').length !== 12) {
      newErrors.stateRegistration = 'Inscrição estadual inválida';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não correspondem';
    }

    if (selectedProfiles.length === 0) {
      newErrors.profile = 'Selecione pelo menos um tipo de perfil';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      router.push({
        pathname: '/(auth)/third-access',
        params: {
          ...params,
          ...formData,
          profileTypes: JSON.stringify(selectedProfiles),
        },
      });
    }
  };

  const handleLoginRedirect = () => {
    router.push('/(auth)/login');
  };

  const handleProfileSelect = (profile: ProfileType) => {
    setSelectedProfiles((prev) => {
      let newProfiles: ProfileType[];

      if (prev.includes(profile)) {
        newProfiles = prev.filter((p) => p !== profile);
      } else {
        if (prev.length >= 2) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            profile: 'Você só pode selecionar no máximo 2 perfis',
          }));
          return prev;
        }

        newProfiles = [...prev, profile];

        if (newProfiles.length === 2) {
          const hasProducer = newProfiles.includes('producer');
          const hasSupplier = newProfiles.includes('supplier');
          const hasServiceProvider = newProfiles.includes('service_provider');

          const isValidCombination =
            (hasProducer && hasSupplier) || (hasSupplier && hasServiceProvider);

          if (!isValidCombination) {
            setErrors((prevErrors) => ({
              ...prevErrors,
              profile:
                'Combinação inválida. Só é permitido: Produtor + Fornecedor ou Fornecedor + Prestador de Serviço.',
            }));
            return prev;
          }
        }
      }

      if (errors.profile) {
        setErrors((prevErrors) => {
          const { profile, ...rest } = prevErrors;
          return rest;
        });
      }

      return newProfiles;
    });
  };

  return (
    <ImageBackground
      source={require('../../assets/background.png')}
      style={styles.backgroundImage}
      blurRadius={3}
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

              <StepIndicator
                currentStep={2}
                totalSteps={3}
                onStepPress={(step) => {
                  if (step === 1) {
                    router.back();
                  }
                }}
              />

              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Dados da Empresa
              </Text>

              <View>
                <Input
                  label="CNPJ"
                  required
                  value={formData.cnpj}
                  onChangeText={(text) => updateField('cnpj', text)}
                  error={errors.cnpj}
                  placeholder="xx.xxx.xxx/xxxx-xx"
                  mask="cnpj"
                  maxLength={18}
                />

                <Input
                  label="Razão social"
                  required
                  value={formData.companyName}
                  onChangeText={(text) => updateField('companyName', text)}
                  error={errors.companyName}
                  placeholder="Digite sua razão"
                  autoCapitalize="words"
                />

                <Input
                  label="Nome Fantasia"
                  required
                  value={formData.tradeName}
                  onChangeText={(text) => updateField('tradeName', text)}
                  error={errors.tradeName}
                  placeholder="Digite seu nome"
                  autoCapitalize="words"
                />

                <Input
                  label="Inscrição estadual"
                  required
                  value={formData.stateRegistration}
                  onChangeText={(text) => updateField('stateRegistration', text)}
                  error={errors.stateRegistration}
                  placeholder="xxx.xxx.xxx.xxx"
                  mask="ie"
                  maxLength={15}
                />

                <Input
                  label="Criar senha"
                  required
                  value={formData.password}
                  onChangeText={(text) => updateField('password', text)}
                  error={errors.password}
                  successMessage={
                    passwordMatch && formData.password ? 'As senhas são iguais' : undefined
                  }
                  placeholder="Digite sua senha"
                  isPassword
                />

                <Input
                  label="Confirmar senha"
                  required
                  value={formData.confirmPassword}
                  onChangeText={(text) => updateField('confirmPassword', text)}
                  error={errors.confirmPassword}
                  successMessage={
                    passwordMatch && formData.confirmPassword
                      ? 'As senhas são iguais'
                      : undefined
                  }
                  placeholder="Digite sua senha novamente"
                  isPassword
                />
              </View>

              <ProfileSelector
                selectedProfiles={selectedProfiles}
                onSelectProfile={handleProfileSelect}
                required
              />
              {errors.profile && <Text style={styles.profileError}>{errors.profile}</Text>}

              <Text style={[styles.termsText, { color: colors.textSecondary }]}>
                Ao clicar em 'Continuar cadastro', você concorda com os nossos{' '}
                <Text style={[styles.termsLink, { color: colors.text }]}>Termos de uso</Text>.
              </Text>

              <TouchableOpacity
                style={[styles.continueButton, { backgroundColor: colors.buttonBackground }]}
                onPress={handleContinue}
                activeOpacity={0.8}
              >
                <Text style={[styles.continueButtonText, { color: colors.buttonText }]}>
                  Continuar
                </Text>
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
  profileError: {
    fontSize: 12,
    color: '#F44336',
    marginTop: -15,
    marginBottom: 15,
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  termsLink: {
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  continueButton: {
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
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

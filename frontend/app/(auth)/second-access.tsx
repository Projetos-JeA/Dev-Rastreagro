import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import PasswordRequirements from '../../src/components/PasswordRequirements';
import ProfileSelector, { ProfileType } from '../../src/components/ProfileSelector';
import StepIndicator from '../../src/components/StepIndicator';
import { useTheme } from '../../src/context/ThemeContext';
import { buscarCep } from '../../src/services/viacepService';
import { buscarCnpj } from '../../src/services/cnpjService';
import { authService } from '../../src/services/authService';
import { validatePassword, getPasswordRequirements, PasswordRequirement } from '../../src/utils/validators';

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
    address: '',
    cep: '',
    city: '',
    state: '',
    neighborhood: '',
  });
  const [selectedProfiles, setSelectedProfiles] = useState<ProfileType[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null);
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirement[]>([]);
  const [loadingCep, setLoadingCep] = useState(false);
  const [loadingCnpj, setLoadingCnpj] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

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

  useEffect(() => {
    if (formData.password && formData.confirmPassword) {
      setPasswordMatch(formData.password === formData.confirmPassword);
    } else {
      setPasswordMatch(null);
    }
  }, [formData.password, formData.confirmPassword]);

  useEffect(() => {
    if (formData.password) {
      setPasswordRequirements(getPasswordRequirements(formData.password));
    } else {
      setPasswordRequirements([]);
    }
  }, [formData.password]);

  async function handleBuscarCep() {
    const digits = (formData.cep || '').replace(/\D/g, '');
    if (digits.length !== 8) {
      Alert.alert('Erro', 'CEP inválido. Use 8 dígitos.');
      return;
    }
    setLoadingCep(true);
    try {
      const data = await buscarCep(digits);
      setFormData(prev => ({
        ...prev,
        address: data.logradouro || prev.address,
        neighborhood: data.bairro || prev.neighborhood,
        city: data.localidade || prev.city,
        state: data.uf || prev.state,
      }));
    } catch (error: any) {
      console.log('ERRO BUSCAR CEP >>>', JSON.stringify(error?.response?.data || error, null, 2));
      const message =
        error?.response?.data?.detail ||
        error?.message ||
        'CEP não encontrado. Verifique o número informado.';
      Alert.alert('Erro', message);
    } finally {
      setLoadingCep(false);
    }
  }

  async function handleBuscarCnpj() {
    const digits = (formData.cnpj || '').replace(/\D/g, '');
    if (digits.length !== 14) {
      Alert.alert('Erro', 'CNPJ inválido. Use 14 dígitos.');
      return;
    }
    setLoadingCnpj(true);
    try {
      const data = await buscarCnpj(digits);
      setFormData(prev => ({
        ...prev,
        cnpj: data.cnpj || prev.cnpj,
        companyName: data.razao_social || prev.companyName,
        tradeName: data.nome_fantasia || prev.tradeName,
        stateRegistration: data.inscricao_estadual || prev.stateRegistration,
        address: data.endereco || prev.address,
        neighborhood: data.bairro || prev.neighborhood,
        cep: data.cep || prev.cep,
        city: data.cidade || prev.city,
        state: data.estado || prev.state,
      }));
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.cnpj;
        delete newErrors.companyName;
        delete newErrors.tradeName;
        delete newErrors.stateRegistration;
        delete newErrors.address;
        delete newErrors.neighborhood;
        delete newErrors.cep;
        delete newErrors.city;
        delete newErrors.state;
        return newErrors;
      });
      Alert.alert('Sucesso', 'Dados da empresa carregados com sucesso!');
    } catch (error: any) {
      console.log('ERRO BUSCAR CNPJ >>>', JSON.stringify(error?.response?.data || error, null, 2));
      const message =
        error?.response?.data?.detail ||
        error?.message ||
        'CNPJ não encontrado. Verifique o número informado.';
      Alert.alert('Erro', message);
    } finally {
      setLoadingCnpj(false);
    }
  }

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    const isProducerAndSupplier = selectedProfiles.includes('producer') && selectedProfiles.includes('supplier');

    if (isProducerAndSupplier) {
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

      if (formData.stateRegistration.trim() && formData.stateRegistration.replace(/\D/g, '').length !== 12) {
        newErrors.stateRegistration = 'Inscrição estadual inválida';
      }
    } else {
      if (!formData.companyName.trim() && !formData.tradeName.trim()) {
        newErrors.companyName = 'Nome da propriedade é obrigatório';
      }
    }

    if (!formData.cep.trim()) {
      newErrors.cep = 'CEP é obrigatório';
    } else if (formData.cep.replace(/\D/g, '').length !== 8) {
      newErrors.cep = 'CEP inválido';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Endereço é obrigatório';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Cidade é obrigatória';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'Estado é obrigatório';
    } else if (formData.state.length !== 2) {
      newErrors.state = 'Estado deve ser a sigla com 2 letras (ex: SP, RJ)';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0];
      }
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
  }

  async function handleContinue() {
    if (!validateForm()) {
      return;
    }

    const cnpjDigits = (formData.cnpj || '').replace(/\D/g, '');
    const needsCnpjCheck = cnpjDigits.length === 14;

    if (needsCnpjCheck) {
      setIsCheckingAvailability(true);
      try {
        const availability = await authService.checkAvailability({
          cnpj: formData.cnpj,
        });

        if (availability.cnpj_available === false) {
          setErrors(prev => ({ ...prev, cnpj: 'Este CNPJ já está cadastrado' }));
          return;
        }
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível verificar o CNPJ. Tente novamente.');
        return;
      } finally {
        setIsCheckingAvailability(false);
      }
    }

    router.push({
      pathname: '/(auth)/third-access',
      params: {
        ...params,
        ...formData,
        profileTypes: JSON.stringify(selectedProfiles),
      },
    });
  }

  function handleLoginRedirect() {
    router.push('/(auth)/login');
  }

  function handleProfileSelect(profile: ProfileType) {
    setSelectedProfiles(prev => {
      let newProfiles: ProfileType[];

      if (prev.includes(profile)) {
        newProfiles = prev.filter(p => p !== profile);
      } else {
        if (prev.length >= 2) {
          setErrors(prevErrors => ({
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
            setErrors(prevErrors => ({
              ...prevErrors,
              profile:
                'Combinação inválida. Só é permitido: Produtor + Fornecedor ou Fornecedor + Prestador de Serviço.',
            }));
            return prev;
          }
        }
      }

      if (errors.profile) {
        setErrors(prevErrors => {
          const { profile, ...rest } = prevErrors;
          return rest;
        });
      }

      return newProfiles;
    });
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

              <StepIndicator
                currentStep={2}
                totalSteps={3}
                onStepPress={step => {
                  if (step === 1) {
                    router.back();
                  }
                }}
              />

              <ProfileSelector
                selectedProfiles={selectedProfiles}
                onSelectProfile={handleProfileSelect}
                required
              />
              {errors.profile && <Text style={[styles.profileError, { color: colors.error }]}>{errors.profile}</Text>}

              <Text style={[styles.sectionTitle, { color: colors.text }]}>Dados da Empresa</Text>

              <View>
                {(() => {
                  const isProducerAndSupplier = selectedProfiles.includes('producer') && selectedProfiles.includes('supplier');

                  if (isProducerAndSupplier) {
                    return (
                      <>
                        <View style={styles.cnpjContainer}>
                          <View style={styles.cnpjInputContainer}>
                            <Input
                              label="CNPJ"
                              required
                              value={formData.cnpj}
                              onChangeText={text => updateField('cnpj', text)}
                              error={errors.cnpj}
                              placeholder="xx.xxx.xxx/xxxx-xx"
                              mask="cnpj"
                              maxLength={18}
                            />
                          </View>
                          <TouchableOpacity
                            style={[styles.cnpjButton, { backgroundColor: colors.primary }]}
                            onPress={handleBuscarCnpj}
                            disabled={loadingCnpj || !formData.cnpj}
                          >
                            {loadingCnpj ? (
                              <ActivityIndicator size="small" color={colors.white} />
                            ) : (
                              <Text style={[styles.cnpjButtonText, { color: colors.white }]}>Buscar</Text>
                            )}
                          </TouchableOpacity>
                        </View>

                        <Input
                          label="Razão social"
                          required
                          value={formData.companyName}
                          onChangeText={text => updateField('companyName', text)}
                          error={errors.companyName}
                          placeholder="Digite sua razão social"
                          autoCapitalize="words"
                        />

                        <Input
                          label="Nome Fantasia"
                          required
                          value={formData.tradeName}
                          onChangeText={text => updateField('tradeName', text)}
                          error={errors.tradeName}
                          placeholder="Digite seu nome fantasia"
                          autoCapitalize="words"
                        />

                        <Input
                          label="Inscrição estadual"
                          value={formData.stateRegistration}
                          onChangeText={text => updateField('stateRegistration', text)}
                          error={errors.stateRegistration}
                          placeholder="xxx.xxx.xxx.xxx (opcional)"
                          mask="ie"
                          maxLength={15}
                        />
                      </>
                    );
                  }

                  return (
                    <Input
                      label="Nome da Propriedade"
                      required
                      value={formData.companyName || formData.tradeName}
                      onChangeText={text => {
                        updateField('companyName', text);
                        updateField('tradeName', text);
                      }}
                      error={errors.companyName}
                      placeholder="Digite o nome da sua propriedade"
                      autoCapitalize="words"
                    />
                  );
                })()}

                <View style={styles.cepContainer}>
                  <View style={styles.cepInputContainer}>
                    <Input
                      label="CEP"
                      required
                      value={formData.cep}
                      onChangeText={text => updateField('cep', text)}
                      error={errors.cep}
                      placeholder="00000-000"
                      mask="cep"
                      maxLength={9}
                      keyboardType="numeric"
                    />
                  </View>
                  <TouchableOpacity
                    style={[styles.cepButton, { backgroundColor: colors.primary }]}
                    onPress={handleBuscarCep}
                    disabled={loadingCep || !formData.cep}
                  >
                    {loadingCep ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <Text style={[styles.cepButtonText, { color: colors.white }]}>Buscar</Text>
                    )}
                  </TouchableOpacity>
                </View>

                <Input
                  label="Endereço"
                  required
                  value={formData.address}
                  onChangeText={text => updateField('address', text)}
                  error={errors.address}
                  placeholder="Rua, Avenida, etc."
                  autoCapitalize="words"
                />

                <Input
                  label="Bairro"
                  value={formData.neighborhood}
                  onChangeText={text => updateField('neighborhood', text)}
                  error={errors.neighborhood}
                  placeholder="Nome do bairro"
                  autoCapitalize="words"
                />

                <View style={styles.cityStateContainer}>
                  <View style={styles.cityInput}>
                    <Input
                      label="Cidade"
                      required
                      value={formData.city}
                      onChangeText={text => updateField('city', text)}
                      error={errors.city}
                      placeholder="Nome da cidade"
                      autoCapitalize="words"
                    />
                  </View>
                  <View style={styles.stateInput}>
                    <Input
                      label="Estado (UF)"
                      required
                      value={formData.state}
                      onChangeText={text => updateField('state', text.toUpperCase())}
                      error={errors.state}
                      placeholder="SP"
                      maxLength={2}
                      autoCapitalize="characters"
                    />
                  </View>
                </View>

                <Input
                  label="Criar senha"
                  required
                  value={formData.password}
                  onChangeText={text => updateField('password', text)}
                  error={errors.password}
                  placeholder="Digite sua senha"
                  isPassword
                />

                {formData.password.length > 0 && (
                  <PasswordRequirements requirements={passwordRequirements} />
                )}

                <Input
                  label="Confirmar senha"
                  required
                  value={formData.confirmPassword}
                  onChangeText={text => updateField('confirmPassword', text)}
                  error={errors.confirmPassword}
                  successMessage={
                    passwordMatch && formData.confirmPassword ? 'As senhas são iguais' : undefined
                  }
                  placeholder="Digite sua senha novamente"
                  isPassword
                />
              </View>

              <Text style={[styles.termsText, { color: colors.textSecondary }]}>
                Ao clicar em 'Continuar cadastro', você concorda com os nossos{' '}
                <Text style={[styles.termsLink, { color: colors.text }]}>Termos de uso</Text>.
              </Text>

              <TouchableOpacity
                style={[styles.continueButton, { backgroundColor: colors.buttonBackground, shadowColor: colors.shadowColor }]}
                onPress={handleContinue}
                activeOpacity={0.8}
                disabled={isCheckingAvailability}
              >
                {isCheckingAvailability ? (
                  <ActivityIndicator color={colors.buttonText} />
                ) : (
                  <Text style={[styles.continueButtonText, { color: colors.buttonText }]}>
                    Continuar
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={handleLoginRedirect} activeOpacity={0.7}>
                <Text style={[styles.loginLink, { color: colors.text }]}>Possuo cadastro</Text>
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
  cnpjContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  cnpjInputContainer: {
    flex: 1,
  },
  cnpjButton: {
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
    marginLeft: 10,
    marginTop: 20,
  },
  cnpjButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  cepContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  cepInputContainer: {
    flex: 1,
  },
  cepButton: {
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
    marginLeft: 10,
    marginTop: 20,
  },
  cepButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  cityStateContainer: {
    flexDirection: 'row',
  },
  cityInput: {
    flex: 2,
    marginRight: 10,
  },
  stateInput: {
    flex: 1,
  },
});

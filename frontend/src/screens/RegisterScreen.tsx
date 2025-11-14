import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';
import {
  activitiesService,
  ActivityCategory,
  ActivityGroup,
  ActivityItem,
} from '../services/activitiesService';
import { showApiError } from '../utils/errorMessages';

type UserType = 'buyer' | 'seller' | 'service_provider';

type RegisterScreenNavigation = StackNavigationProp<RootStackParamList, 'Register'>;

interface Props {
  navigation: RegisterScreenNavigation;
}

interface SelectedActivity {
  category_id: number;
  group_id?: number | null;
  item_id?: number | null;
  label: string;
}

interface SellerForm {
  email: string;
  nome_propriedade: string;
  inicio_atividades: string;
  ramo_atividade: string;
  cnaes: string;
  cnpj_cpf: string;
  insc_est_identidade: string;
  endereco: string;
  cep: string;
  cidade: string;
  estado: string;
}

interface ServiceForm {
  nome_servico: string;
  descricao: string;
  telefone: string;
  email_contato: string;
  cidade: string;
  estado: string;
}

type Tab = {
  label: string;
  value: UserType;
  description: string;
};

const SELLER_INITIAL_FORM: SellerForm = {
  email: '',
  nome_propriedade: '',
  inicio_atividades: '',
  ramo_atividade: '',
  cnaes: '',
  cnpj_cpf: '',
  insc_est_identidade: '',
  endereco: '',
  cep: '',
  cidade: '',
  estado: '',
};

const SERVICE_INITIAL_FORM: ServiceForm = {
  nome_servico: '',
  descricao: '',
  telefone: '',
  email_contato: '',
  cidade: '',
  estado: '',
};

export default function RegisterScreen({ navigation }: Props) {
  const { registerBuyer, registerSeller, registerServiceProvider } = useAuth();

  const [userType, setUserType] = useState<UserType>('buyer');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');

  const [sellerForm, setSellerForm] = useState<SellerForm>(SELLER_INITIAL_FORM);
  const [serviceForm, setServiceForm] = useState<ServiceForm>(SERVICE_INITIAL_FORM);
  const [selectedActivities, setSelectedActivities] = useState<SelectedActivity[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  const [categories, setCategories] = useState<ActivityCategory[]>([]);
  const [groups, setGroups] = useState<ActivityGroup[]>([]);
  const [items, setItems] = useState<ActivityItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [emailError, setEmailError] = useState<string>('');

  const validatePassword = (pwd: string): string[] => {
    const errors: string[] = [];
    if (pwd.length < 8) {
      errors.push('A senha deve ter pelo menos 8 caracteres');
    }
    return errors;
  };

  const resetFormState = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setNickname('');
    setSellerForm(SELLER_INITIAL_FORM);
    setServiceForm(SERVICE_INITIAL_FORM);
    setSelectedActivities([]);
    setSelectedCategory(null);
    setSelectedGroup(null);
    setSelectedItem(null);
    setUserType('buyer');
    setPasswordErrors([]);
    setEmailError('');
  };

  useEffect(() => {
    activitiesService
      .listCategories()
      .then(setCategories)
      .catch(() => Alert.alert('Erro', 'Não foi possível carregar as categorias de atividade.'));
  }, []);

  useEffect(() => {
    if (userType !== 'seller') {
      setSellerForm(SELLER_INITIAL_FORM);
      setSelectedActivities([]);
      setSelectedCategory(null);
      setSelectedGroup(null);
      setSelectedItem(null);
      setGroups([]);
      setItems([]);
      return;
    }

    if (selectedCategory) {
      activitiesService
        .listGroups(selectedCategory)
        .then(data => {
          setGroups(data);
          setSelectedGroup(null);
          setItems([]);
          setSelectedItem(null);
        })
        .catch(() => Alert.alert('Erro', 'Não foi possível carregar os grupos de atividade.'));
    } else {
      setGroups([]);
      setSelectedGroup(null);
    }
  }, [selectedCategory, userType]);

  useEffect(() => {
    if (userType !== 'seller') {
      return;
    }

    if (selectedGroup) {
      activitiesService
        .listItems(selectedGroup)
        .then(data => {
          setItems(data);
          setSelectedItem(data.length > 0 ? null : null);
        })
        .catch(() => Alert.alert('Erro', 'Não foi possível carregar os itens de atividade.'));
    } else {
      setItems([]);
      setSelectedItem(null);
    }
  }, [selectedGroup, userType]);

  useEffect(() => {
    if (userType !== 'service_provider') {
      setServiceForm(SERVICE_INITIAL_FORM);
    }
  }, [userType]);

  const sellerActivitiesPayload = useMemo(() => {
    return selectedActivities.map(({ label, ...rest }) => rest);
  }, [selectedActivities]);

  const tabs: Tab[] = [
    { label: 'Sou comprador', value: 'buyer', description: 'Acesso básico para compradores' },
    {
      label: 'Sou empresa / vendedor',
      value: 'seller',
      description: 'Cadastro completo com atividades',
    },
    {
      label: 'Sou prestador de serviço',
      value: 'service_provider',
      description: 'Ofereço serviços para o agro',
    },
  ];

  const handleAddActivity = () => {
    if (!selectedCategory) {
      Alert.alert('Erro', 'Selecione uma categoria');
      return;
    }

    const categoryName = categories.find(c => c.id === selectedCategory)?.name ?? '';
    const groupName = selectedGroup ? groups.find(g => g.id === selectedGroup)?.name : undefined;
    const itemName = selectedItem ? items.find(i => i.id === selectedItem)?.name : undefined;

    if (items.length > 0 && !selectedItem) {
      Alert.alert('Erro', 'Selecione um item para o grupo escolhido');
      return;
    }

    const newActivity: SelectedActivity = {
      category_id: selectedCategory,
      group_id: selectedGroup ?? null,
      item_id: selectedItem ?? null,
      label: [categoryName, groupName, itemName].filter(Boolean).join(' / '),
    };

    const alreadyExists = selectedActivities.some(
      activity =>
        activity.category_id === newActivity.category_id &&
        (activity.group_id || null) === (newActivity.group_id || null) &&
        (activity.item_id || null) === (newActivity.item_id || null)
    );

    if (alreadyExists) {
      Alert.alert('Atenção', 'Essa atividade já foi adicionada.');
      return;
    }

    setSelectedActivities(prev => [...prev, newActivity]);
  };

  const handleRemoveActivity = (index: number) => {
    setSelectedActivities(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Limpar erros anteriores
    setPasswordErrors([]);
    setEmailError('');

    // Validação básica
    if (!email || !password || !confirmPassword) {
      Alert.alert('Erro', 'Preencha email e senhas.');
      return;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Email inválido');
      Alert.alert('Erro', 'Email inválido');
      return;
    }

    // Validação de senha
    const pwdErrors = validatePassword(password);
    if (pwdErrors.length > 0) {
      setPasswordErrors(pwdErrors);
      Alert.alert('Senha inválida', pwdErrors.join('\n'));
      return;
    }

    if (password !== confirmPassword) {
      setPasswordErrors(['As senhas não conferem']);
      Alert.alert('Erro', 'As senhas não conferem.');
      return;
    }

    if (userType === 'buyer') {
      if (!nickname) {
        Alert.alert('Erro', 'Informe o apelido.');
        return;
      }
    } else if (userType === 'seller') {
      const requiredSellerFields: Array<keyof SellerForm> = [
        'email',
        'nome_propriedade',
        'cnpj_cpf',
        'endereco',
        'cep',
        'cidade',
        'estado',
      ];

      const missingField = requiredSellerFields.find(field => !sellerForm[field]);
      if (missingField) {
        Alert.alert('Erro', 'Preencha todos os campos obrigatórios da empresa.');
        return;
      }

      if (selectedActivities.length === 0) {
        Alert.alert('Erro', 'Selecione pelo menos uma atividade.');
        return;
      }
    } else if (userType === 'service_provider') {
      const requiredServiceFields: Array<keyof ServiceForm> = [
        'nome_servico',
        'email_contato',
        'cidade',
        'estado',
      ];
      const missing = requiredServiceFields.find(field => !serviceForm[field]);
      if (missing) {
        Alert.alert('Erro', 'Preencha os dados obrigatórios do prestador.');
        return;
      }
    }

    setLoading(true);

    try {
      if (userType === 'buyer') {
        await registerBuyer({ email, password, nickname });
        Alert.alert(
          'Cadastro realizado com sucesso!',
          'Sua conta foi criada. Faça login para continuar.',
          [
            {
              text: 'OK',
              onPress: () => {
                resetFormState();
                navigation.replace('Login');
              },
            },
          ]
        );
      } else if (userType === 'seller') {
        await registerSeller({
          email,
          password,
          company: {
            ...sellerForm,
            inicio_atividades: sellerForm.inicio_atividades || undefined,
            ramo_atividade: sellerForm.ramo_atividade || undefined,
            cnaes: sellerForm.cnaes || undefined,
            insc_est_identidade: sellerForm.insc_est_identidade || undefined,
            activities: sellerActivitiesPayload,
          },
        });
        Alert.alert(
          'Cadastro realizado com sucesso!',
          'Sua empresa foi cadastrada. Faça login para continuar.',
          [
            {
              text: 'OK',
              onPress: () => {
                resetFormState();
                navigation.replace('Login');
              },
            },
          ]
        );
      } else {
        await registerServiceProvider({
          email,
          password,
          service_provider: {
            nome_servico: serviceForm.nome_servico,
            descricao: serviceForm.descricao || undefined,
            telefone: serviceForm.telefone || undefined,
            email_contato: serviceForm.email_contato,
            cidade: serviceForm.cidade,
            estado: serviceForm.estado,
          },
        });
        Alert.alert(
          'Cadastro realizado com sucesso!',
          'Seu perfil de prestador foi criado. Faça login para continuar.',
          [
            {
              text: 'OK',
              onPress: () => {
                resetFormState();
                navigation.replace('Login');
              },
            },
          ]
        );
      }
    } catch (error: any) {
      // Tratamento específico para email já cadastrado
      if (error instanceof Error && error.message.includes('já cadastrado')) {
        setEmailError('Este email já está cadastrado');
        showApiError(error, 'Email já cadastrado. Use outro email ou faça login.');
      } else if (error?.status === 409) {
        setEmailError('Este email já está cadastrado');
        showApiError(error, 'Email já cadastrado. Use outro email ou faça login.');
      } else {
        showApiError(
          error,
          'Não foi possível concluir o cadastro. Verifique os dados e tente novamente.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const renderBuyerForm = () => (
    <View>
      <Text style={styles.sectionTitle}>Dados do comprador</Text>
      <TextInput
        style={styles.input}
        placeholder="Apelido"
        value={nickname}
        onChangeText={setNickname}
      />
    </View>
  );

  const handleSellerChange = (field: keyof SellerForm, value: string) => {
    setSellerForm(prev => ({ ...prev, [field]: value }));
  };

  const renderSellerForm = () => (
    <View>
      <Text style={styles.sectionTitle}>Dados empresariais</Text>
      <TextInput
        style={styles.input}
        placeholder="Email comercial"
        value={sellerForm.email}
        onChangeText={value => handleSellerChange('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Nome da propriedade"
        value={sellerForm.nome_propriedade}
        onChangeText={value => handleSellerChange('nome_propriedade', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Início das atividades (AAAA-MM-DD)"
        value={sellerForm.inicio_atividades}
        onChangeText={value => handleSellerChange('inicio_atividades', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Ramo de atividade"
        value={sellerForm.ramo_atividade}
        onChangeText={value => handleSellerChange('ramo_atividade', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="CNAEs"
        value={sellerForm.cnaes}
        onChangeText={value => handleSellerChange('cnaes', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="CNPJ/CPF"
        value={sellerForm.cnpj_cpf}
        onChangeText={value => handleSellerChange('cnpj_cpf', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Inscrição Estadual / Identidade"
        value={sellerForm.insc_est_identidade}
        onChangeText={value => handleSellerChange('insc_est_identidade', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Endereço completo"
        value={sellerForm.endereco}
        onChangeText={value => handleSellerChange('endereco', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="CEP"
        value={sellerForm.cep}
        onChangeText={value => handleSellerChange('cep', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Cidade"
        value={sellerForm.cidade}
        onChangeText={value => handleSellerChange('cidade', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Estado (UF)"
        value={sellerForm.estado}
        maxLength={2}
        onChangeText={value => handleSellerChange('estado', value)}
      />

      <Text style={styles.sectionTitle}>Atividades</Text>
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Categoria</Text>
        <Picker
          selectedValue={selectedCategory}
          onValueChange={setSelectedCategory}
          style={styles.picker}
        >
          <Picker.Item label="Selecione" value={null} />
          {categories.map(category => (
            <Picker.Item key={category.id} label={category.name} value={category.id} />
          ))}
        </Picker>
      </View>

      {groups.length > 0 && (
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Grupo</Text>
          <Picker
            selectedValue={selectedGroup}
            onValueChange={setSelectedGroup}
            style={styles.picker}
          >
            <Picker.Item label="Selecione" value={null} />
            {groups.map(group => (
              <Picker.Item key={group.id} label={group.name} value={group.id} />
            ))}
          </Picker>
        </View>
      )}

      {items.length > 0 && (
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Item</Text>
          <Picker
            selectedValue={selectedItem}
            onValueChange={setSelectedItem}
            style={styles.picker}
          >
            <Picker.Item label="Selecione" value={null} />
            {items.map(item => (
              <Picker.Item key={item.id} label={item.name} value={item.id} />
            ))}
          </Picker>
        </View>
      )}

      <TouchableOpacity style={styles.addButton} onPress={handleAddActivity}>
        <Text style={styles.addButtonText}>Adicionar atividade</Text>
      </TouchableOpacity>

      <FlatList
        data={selectedActivities}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.activityChip}>
            <Text style={styles.activityLabel}>{item.label}</Text>
            <TouchableOpacity onPress={() => handleRemoveActivity(index)}>
              <Text style={styles.activityRemove}>Remover</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyActivities}>Nenhuma atividade selecionada</Text>
        }
        style={{ marginBottom: 24 }}
      />
    </View>
  );

  const handleServiceChange = (field: keyof ServiceForm, value: string) => {
    setServiceForm(prev => ({ ...prev, [field]: value }));
  };

  const renderServiceProviderForm = () => (
    <View>
      <Text style={styles.sectionTitle}>Dados do prestador</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome do serviço"
        value={serviceForm.nome_servico}
        onChangeText={value => handleServiceChange('nome_servico', value)}
      />
      <TextInput
        style={[styles.input, styles.multilineInput]}
        placeholder="Descrição"
        value={serviceForm.descricao}
        onChangeText={value => handleServiceChange('descricao', value)}
        multiline
        numberOfLines={3}
      />
      <TextInput
        style={styles.input}
        placeholder="Telefone"
        value={serviceForm.telefone}
        onChangeText={value => handleServiceChange('telefone', value)}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Email de contato"
        value={serviceForm.email_contato}
        onChangeText={value => handleServiceChange('email_contato', value)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Cidade"
        value={serviceForm.cidade}
        onChangeText={value => handleServiceChange('cidade', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Estado (UF)"
        value={serviceForm.estado}
        onChangeText={value => handleServiceChange('estado', value.toUpperCase())}
        maxLength={2}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Criar conta</Text>
        <Text style={styles.subtitle}>Escolha o perfil e informe seus dados</Text>

        <View style={styles.tabContainer}>
          {tabs.map(tab => {
            const active = userType === tab.value;
            return (
              <TouchableOpacity
                key={tab.value}
                style={[styles.tabButton, active && styles.tabButtonActive]}
                onPress={() => setUserType(tab.value)}
              >
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
                <Text style={[styles.tabDescription, active && styles.tabDescriptionActive]}>
                  {tab.description}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Conta de acesso</Text>
        <TextInput
          style={[styles.input, emailError ? styles.inputError : null]}
          placeholder="Email de acesso"
          value={email}
          onChangeText={text => {
            setEmail(text);
            setEmailError('');
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        <TextInput
          style={[styles.input, passwordErrors.length > 0 ? styles.inputError : null]}
          placeholder="Senha (mínimo 8 caracteres)"
          value={password}
          onChangeText={text => {
            setPassword(text);
            setPasswordErrors([]);
          }}
          secureTextEntry
        />
        {passwordErrors.length > 0 && (
          <View style={styles.errorContainer}>
            {passwordErrors.map((err, idx) => (
              <Text key={idx} style={styles.errorText}>
                • {err}
              </Text>
            ))}
          </View>
        )}
        <TextInput
          style={[
            styles.input,
            password !== confirmPassword && confirmPassword ? styles.inputError : null,
          ]}
          placeholder="Confirmar senha"
          value={confirmPassword}
          onChangeText={text => {
            setConfirmPassword(text);
            setPasswordErrors([]);
          }}
          secureTextEntry
        />
        {password !== confirmPassword && confirmPassword ? (
          <Text style={styles.errorText}>As senhas não conferem</Text>
        ) : null}

        {userType === 'buyer' && renderBuyerForm()}
        {userType === 'seller' && renderSellerForm()}
        {userType === 'service_provider' && renderServiceProviderForm()}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Cadastrar e entrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
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
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    padding: 6,
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  tabLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  tabLabelActive: {
    color: '#2E7D32',
  },
  tabDescription: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
    textAlign: 'center',
  },
  tabDescriptionActive: {
    color: '#2E7D32',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
    marginTop: 20,
    marginBottom: 12,
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
  multilineInput: {
    textAlignVertical: 'top',
  },
  pickerContainer: {
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  picker: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    color: '#555',
    paddingHorizontal: 15,
    paddingTop: 12,
  },
  addButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  activityChip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  activityLabel: {
    color: '#2E7D32',
    flex: 1,
    marginRight: 12,
  },
  activityRemove: {
    color: '#F44336',
    fontWeight: '600',
  },
  emptyActivities: {
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '600',
  },
  inputError: {
    borderColor: '#F44336',
    borderWidth: 2,
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 5,
  },
  errorContainer: {
    marginBottom: 10,
  },
});

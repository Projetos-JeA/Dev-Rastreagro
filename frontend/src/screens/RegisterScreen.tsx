/**
 * Register Screen - Tela de cadastro
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
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

type ProfileType = 'comprador' | 'vendedor';

interface CompradorData {
  nome: string;
  dataNascimento: string;
  cpf: string;
  identidade: string;
  estadoCivil: string;
  naturalidade: string;
  endereco: string;
  cep: string;
  cidade: string;
  estado: string;
  email: string;
  senha: string;
}

interface VendedorData {
  nomePropriedade: string;
  inicioAtividades: string;
  ramoAtividade: string;
  cnaes: string;
  cnpjCpf: string;
  inscEstIdentidade: string;
  endereco: string;
  cep: string;
  cidade: string;
  estado: string;
  email: string;
  senha: string;
  atividades: string[];
}

export default function RegisterScreen({ navigation }: any) {
  const [profile, setProfile] = useState<ProfileType>('comprador');
  const [loading, setLoading] = useState(false);

  // Dados do Comprador
  const [compradorData, setCompradorData] = useState<CompradorData>({
    nome: '',
    dataNascimento: '',
    cpf: '',
    identidade: '',
    estadoCivil: '',
    naturalidade: '',
    endereco: '',
    cep: '',
    cidade: '',
    estado: '',
    email: '',
    senha: '',
  });

  // Dados do Vendedor
  const [vendedorData, setVendedorData] = useState<VendedorData>({
    nomePropriedade: '',
    inicioAtividades: '',
    ramoAtividade: '',
    cnaes: '',
    cnpjCpf: '',
    inscEstIdentidade: '',
    endereco: '',
    cep: '',
    cidade: '',
    estado: '',
    email: '',
    senha: '',
    atividades: [],
  });

  const handleCompradorChange = (field: keyof CompradorData, value: string) => {
    setCompradorData(prev => ({ ...prev, [field]: value }));
  };

  const handleVendedorChange = (field: keyof VendedorData, value: string | string[]) => {
    setVendedorData(prev => ({ ...prev, [field]: value }));
  };

  const toggleAtividade = (atividade: string) => {
    setVendedorData(prev => {
      const atividades = prev.atividades.includes(atividade)
        ? prev.atividades.filter(a => a !== atividade)
        : [...prev.atividades, atividade];
      return { ...prev, atividades };
    });
  };

  const validateComprador = (): boolean => {
    const required = ['nome', 'dataNascimento', 'cpf', 'identidade', 'endereco', 'cep', 'cidade', 'estado', 'email', 'senha'];
    for (const field of required) {
      if (!compradorData[field as keyof CompradorData]) {
        Alert.alert('Erro', `Por favor, preencha o campo: ${field}`);
        return false;
      }
    }
    return true;
  };

  const validateVendedor = (): boolean => {
    const required = ['nomePropriedade', 'inicioAtividades', 'ramoAtividade', 'cnpjCpf', 'endereco', 'cep', 'cidade', 'estado', 'email', 'senha'];
    for (const field of required) {
      if (field !== 'atividades' && !vendedorData[field as keyof VendedorData]) {
        Alert.alert('Erro', `Por favor, preencha o campo: ${field}`);
        return false;
      }
    }
    if (vendedorData.atividades.length === 0) {
      Alert.alert('Erro', 'Por favor, selecione pelo menos uma atividade');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (profile === 'comprador') {
      if (!validateComprador()) return;
    } else {
      if (!validateVendedor()) return;
    }

    setLoading(true);
    try {
      // Aqui você faria a chamada à API
      // Por enquanto, apenas simula o cadastro
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'Sucesso!',
        'Cadastro realizado com sucesso! Você pode fazer login agora.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao realizar cadastro');
    } finally {
      setLoading(false);
    }
  };

  const renderCompradorForm = () => (
    <View>
      <Text style={styles.sectionTitle}>Dados Pessoais</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nome *"
        value={compradorData.nome}
        onChangeText={(value) => handleCompradorChange('nome', value)}
      />

      <TextInput
        style={styles.input}
        placeholder="Data de nascimento * (DD/MM/AAAA)"
        value={compradorData.dataNascimento}
        onChangeText={(value) => handleCompradorChange('dataNascimento', value)}
      />

      <TextInput
        style={styles.input}
        placeholder="CPF *"
        value={compradorData.cpf}
        onChangeText={(value) => handleCompradorChange('cpf', value)}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Identidade *"
        value={compradorData.identidade}
        onChangeText={(value) => handleCompradorChange('identidade', value)}
      />

      <TextInput
        style={styles.input}
        placeholder="Estado Civil"
        value={compradorData.estadoCivil}
        onChangeText={(value) => handleCompradorChange('estadoCivil', value)}
      />

      <TextInput
        style={styles.input}
        placeholder="Naturalidade"
        value={compradorData.naturalidade}
        onChangeText={(value) => handleCompradorChange('naturalidade', value)}
      />

      <TextInput
        style={styles.input}
        placeholder="Endereço *"
        value={compradorData.endereco}
        onChangeText={(value) => handleCompradorChange('endereco', value)}
      />

      <TextInput
        style={styles.input}
        placeholder="CEP *"
        value={compradorData.cep}
        onChangeText={(value) => handleCompradorChange('cep', value)}
        keyboardType="numeric"
      />

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Cidade *"
          value={compradorData.cidade}
          onChangeText={(value) => handleCompradorChange('cidade', value)}
        />

        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Estado *"
          value={compradorData.estado}
          onChangeText={(value) => handleCompradorChange('estado', value)}
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="E-mail *"
        value={compradorData.email}
        onChangeText={(value) => handleCompradorChange('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha *"
        value={compradorData.senha}
        onChangeText={(value) => handleCompradorChange('senha', value)}
        secureTextEntry
      />
    </View>
  );

  const renderVendedorForm = () => (
    <View>
      <Text style={styles.sectionTitle}>Dados da Propriedade/Empresa</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nome da propriedade *"
        value={vendedorData.nomePropriedade}
        onChangeText={(value) => handleVendedorChange('nomePropriedade', value)}
      />

      <TextInput
        style={styles.input}
        placeholder="Início das Atividades * (DD/MM/AAAA)"
        value={vendedorData.inicioAtividades}
        onChangeText={(value) => handleVendedorChange('inicioAtividades', value)}
      />

      <TextInput
        style={styles.input}
        placeholder="Ramo de Atividade *"
        value={vendedorData.ramoAtividade}
        onChangeText={(value) => handleVendedorChange('ramoAtividade', value)}
      />

      <TextInput
        style={styles.input}
        placeholder="CNAEs"
        value={vendedorData.cnaes}
        onChangeText={(value) => handleVendedorChange('cnaes', value)}
      />

      <TextInput
        style={styles.input}
        placeholder="CNPJ/CPF *"
        value={vendedorData.cnpjCpf}
        onChangeText={(value) => handleVendedorChange('cnpjCpf', value)}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Insc. Est./Identidade"
        value={vendedorData.inscEstIdentidade}
        onChangeText={(value) => handleVendedorChange('inscEstIdentidade', value)}
      />

      <TextInput
        style={styles.input}
        placeholder="Endereço *"
        value={vendedorData.endereco}
        onChangeText={(value) => handleVendedorChange('endereco', value)}
      />

      <TextInput
        style={styles.input}
        placeholder="CEP *"
        value={vendedorData.cep}
        onChangeText={(value) => handleVendedorChange('cep', value)}
        keyboardType="numeric"
      />

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Cidade *"
          value={vendedorData.cidade}
          onChangeText={(value) => handleVendedorChange('cidade', value)}
        />

        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Estado *"
          value={vendedorData.estado}
          onChangeText={(value) => handleVendedorChange('estado', value)}
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="E-mail *"
        value={vendedorData.email}
        onChangeText={(value) => handleVendedorChange('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha *"
        value={vendedorData.senha}
        onChangeText={(value) => handleVendedorChange('senha', value)}
        secureTextEntry
      />

      <Text style={[styles.sectionTitle, styles.marginTop]}>Atividades *</Text>
      
      <Text style={styles.subsectionTitle}>Pecuária</Text>
      <View style={styles.checkboxContainer}>
        {['Pecuária - Cria - Macho', 'Pecuária - Cria - Fêmea', 'Pecuária - Recria - Macho', 'Pecuária - Recria - Fêmea', 'Pecuária - Engorda - Macho', 'Pecuária - Engorda - Fêmea'].map(activity => (
          <TouchableOpacity
            key={activity}
            style={[
              styles.checkbox,
              vendedorData.atividades.includes(activity) && styles.checkboxActive
            ]}
            onPress={() => toggleAtividade(activity)}
          >
            <Text style={[
              styles.checkboxText,
              vendedorData.atividades.includes(activity) && styles.checkboxTextActive
            ]}>
              {activity.replace('Pecuária - ', '')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.subsectionTitle}>Agricultura</Text>
      <View style={styles.checkboxContainer}>
        {['Soja', 'Sorgo', 'Milho', 'Milheto', 'Arroz', 'Trigo', 'Algodão', 'Feijão'].map(activity => (
          <TouchableOpacity
            key={activity}
            style={[
              styles.checkbox,
              vendedorData.atividades.includes(activity) && styles.checkboxActive
            ]}
            onPress={() => toggleAtividade(activity)}
          >
            <Text style={[
              styles.checkboxText,
              vendedorData.atividades.includes(activity) && styles.checkboxTextActive
            ]}>
              {activity}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.subsectionTitle}>Integração</Text>
      <View style={styles.checkboxContainer}>
        {['Integração - Bezerro - Macho', 'Integração - Bezerro - Fêmea', 'Integração - Garrote', 'Integração - Novilha', 'Integração - Boi Magro', 'Integração - Vaca'].map(activity => (
          <TouchableOpacity
            key={activity}
            style={[
              styles.checkbox,
              vendedorData.atividades.includes(activity) && styles.checkboxActive
            ]}
            onPress={() => toggleAtividade(activity)}
          >
            <Text style={[
              styles.checkboxText,
              vendedorData.atividades.includes(activity) && styles.checkboxTextActive
            ]}>
              {activity.replace('Integração - ', '')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.subsectionTitle}>Comércio</Text>
      <View style={styles.checkboxContainer}>
        {['Supermercado', 'Produtos Agropecuários', 'Combustíveis', 'Uniforme', 'EPIs'].map(activity => (
          <TouchableOpacity
            key={activity}
            style={[
              styles.checkbox,
              vendedorData.atividades.includes(activity) && styles.checkboxActive
            ]}
            onPress={() => toggleAtividade(activity)}
          >
            <Text style={[
              styles.checkboxText,
              vendedorData.atividades.includes(activity) && styles.checkboxTextActive
            ]}>
              {activity}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.subsectionTitle}>Indústria</Text>
      <View style={styles.checkboxContainer}>
        {['Ração', 'Frigorífico'].map(activity => (
          <TouchableOpacity
            key={activity}
            style={[
              styles.checkbox,
              vendedorData.atividades.includes(activity) && styles.checkboxActive
            ]}
            onPress={() => toggleAtividade(activity)}
          >
            <Text style={[
              styles.checkboxText,
              vendedorData.atividades.includes(activity) && styles.checkboxTextActive
            ]}>
              {activity}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.subsectionTitle}>Serviços</Text>
      <View style={styles.checkboxContainer}>
        {['Manutenção de Máquinas', 'Manutenção de Equipamentos'].map(activity => (
          <TouchableOpacity
            key={activity}
            style={[
              styles.checkbox,
              vendedorData.atividades.includes(activity) && styles.checkboxActive
            ]}
            onPress={() => toggleAtividade(activity)}
          >
            <Text style={[
              styles.checkboxText,
              vendedorData.atividades.includes(activity) && styles.checkboxTextActive
            ]}>
              {activity}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.title}>Cadastro</Text>
          <Text style={styles.subtitle}>Crie sua conta no RastreAgro</Text>

          <View style={styles.profileContainer}>
            <Text style={styles.label}>Tipo de cadastro:</Text>
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

          {profile === 'comprador' ? renderCompradorForm() : renderVendedorForm()}

          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Cadastrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.linkText}>Já tem uma conta? Faça login</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 20,
    marginBottom: 15,
  },
  marginTop: {
    marginTop: 30,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginTop: 15,
    marginBottom: 10,
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
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  checkbox: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  checkboxActive: {
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },
  checkboxText: {
    fontSize: 14,
    color: '#666',
  },
  checkboxTextActive: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#2E7D32',
    fontSize: 14,
  },
});


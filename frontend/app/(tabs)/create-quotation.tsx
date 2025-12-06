import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Header from '../../src/components/Header';
import Input from '../../src/components/Input';
import Select from '../../src/components/Select';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { quotationService, QuotationCreateRequest } from '../../src/services/quotationService';

export default function CreateQuotationScreen() {
  const { colors } = useTheme();
  const { user, profileImage, currentRoleLabel } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const quotationType = (params.quotation_type as string) || 'offer'; // 'quotation' ou 'offer'
  const [loading, setLoading] = useState(false);
  
  const isQuotation = quotationType === 'quotation';
  const screenTitle = isQuotation ? 'Nova Cotação' : 'Criar Oferta';
  const cardTitle = isQuotation ? 'Criar Nova Cotação' : 'Criar Nova Oferta';
  const cardSubtitle = isQuotation 
    ? 'Preencha os dados do produto ou serviço que você está procurando'
    : 'Preencha os dados do produto ou serviço que deseja oferecer';

  const [formData, setFormData] = useState<QuotationCreateRequest>({
    title: '',
    description: '',
    category: 'agriculture',
    product_type: '',
    location_city: '',
    location_state: '',
    price: undefined,
    quantity: undefined,
    unit: '',
    image_url: '',
    free_shipping: false,
    discount_percentage: undefined,
    installments: 1,
    stock: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    { label: 'Agricultura', value: 'agriculture' },
    { label: 'Pecuária', value: 'livestock' },
    { label: 'Serviços', value: 'service' },
    { label: 'Ambos (Agri + Pecuária)', value: 'both' },
  ];

  const units = [
    { label: 'Selecione a unidade', value: '' },
    { label: 'Kg (Quilograma)', value: 'kg' },
    { label: 'Litro', value: 'litro' },
    { label: 'Unidade', value: 'unidade' },
    { label: 'Saca', value: 'saca' },
    { label: 'Tonelada', value: 'tonelada' },
    { label: 'Hectare', value: 'hectare' },
    { label: 'Cabeça', value: 'cabeça' },
    { label: 'Lote', value: 'lote' },
    { label: 'Dose', value: 'dose' },
  ];

  function handleBack() {
    router.back();
  }

  function handleProfile() {
    router.push('/(tabs)/profile');
  }

  function updateField<K extends keyof QuotationCreateRequest>(
    field: K,
    value: QuotationCreateRequest[K]
  ) {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'O título da cotação é obrigatório';
    }

    if (!formData.category) {
      newErrors.category = 'Selecione uma categoria';
    }

    if (formData.price && formData.price <= 0) {
      newErrors.price = 'O preço deve ser maior que zero';
    }

    if (formData.quantity && formData.quantity <= 0) {
      newErrors.quantity = 'A quantidade deve ser maior que zero';
    }

    if (formData.location_state && formData.location_state.length !== 2) {
      newErrors.location_state = 'Informe a UF com 2 letras (ex: SP)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validateForm()) {
      console.log('❌ Validação do formulário falhou');
      return;
    }

    setLoading(true);
    console.log('🚀 Criando cotação...');
    console.log('📋 Dados do formulário:', formData);

    try {
      const payload: QuotationCreateRequest = {
        title: formData.title.trim(),
        category: formData.category,
        description: formData.description?.trim() || undefined,
        product_type: formData.product_type?.trim() || undefined,
        location_city: formData.location_city?.trim() || undefined,
        location_state: formData.location_state?.trim() || undefined,
        price: formData.price || undefined,
        quantity: formData.quantity || undefined,
        unit: formData.unit || undefined,
        image_url: formData.image_url?.trim() || undefined,
        free_shipping: formData.free_shipping || false,
        discount_percentage: formData.discount_percentage || undefined,
        installments: formData.installments || 1,
        stock: formData.stock || undefined,
        quotation_type: quotationType as 'quotation' | 'offer', // Adiciona o tipo (quotation ou offer)
      };

      console.log('📤 Enviando payload para API:', payload);
      const createdQuotation = await quotationService.createQuotation(payload);
      console.log('✅ Cotação criada com sucesso!', createdQuotation);
      console.log('📊 ID da cotação criada:', createdQuotation.id);

      const successMessage = isQuotation
        ? `Sua cotação "${createdQuotation.title}" foi criada com sucesso!`
        : `Sua oferta "${createdQuotation.title}" foi criada com sucesso e já está disponível no Deu Agro!`;
      
      Alert.alert(
        '✅ Sucesso!',
        successMessage,
        [
          {
            text: 'Ver no Deu Agro',
            onPress: () => router.push('/(tabs)/deu-agro'),
          },
          {
            text: isQuotation ? 'Ver Minhas Cotações' : 'Ver Minhas Ofertas',
            onPress: () => router.push('/(tabs)/my-quotations'),
          },
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );

      setFormData({
        title: '',
        description: '',
        category: 'agriculture',
        product_type: '',
        location_city: '',
        location_state: '',
        price: undefined,
        quantity: undefined,
        unit: '',
        image_url: '',
        free_shipping: false,
        discount_percentage: undefined,
        installments: 1,
        stock: undefined,
      });
    } catch (error: any) {
      console.error('❌ Erro ao criar cotação:', error);
      console.error('❌ Detalhes do erro:', error.response?.data || error.message);
      console.error('❌ Status do erro:', error.response?.status);
      Alert.alert(
        '❌ Erro',
        error.response?.data?.detail || error.message || 'Não foi possível criar a cotação. Tente novamente.'
      );
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
      <Header
        userName={user?.nickname}
        userRole={currentRoleLabel}
        profileImage={profileImage}
        showBackButton={true}
        screenTitle={screenTitle}
        onBackPress={handleBack}
        onProfilePress={handleProfile}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        <View style={[styles.card, { backgroundColor: colors.cardBackground, shadowColor: colors.shadowColor }]}>
          <View style={styles.headerSection}>
            <Ionicons name="add-circle" size={40} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {cardTitle}
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
              {cardSubtitle}
            </Text>
          </View>

            <View style={styles.formSection}>
              <Input
                label={isQuotation ? "Título da Cotação" : "Título da Oferta"}
                required
                placeholder="Ex: Boi Nelore, Sementes de Soja, etc."
                value={formData.title}
                onChangeText={text => updateField('title', text)}
                error={errors.title}
              />

              <Input
                label="Descrição"
                placeholder="Descreva detalhes sobre o produto ou serviço..."
                value={formData.description}
                onChangeText={text => updateField('description', text)}
                multiline
                numberOfLines={4}
              />

              <Select
                label="Categoria"
                required
                value={formData.category}
                onValueChange={value => updateField('category', value as any)}
                options={categories}
                error={errors.category}
              />

              <Input
                label="Tipo de Produto"
                placeholder="Ex: Bovino, Defensivo, Fertilizante..."
                value={formData.product_type}
                onChangeText={text => updateField('product_type', text)}
              />

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Input
                    label="Cidade"
                    placeholder="Cidade"
                    value={formData.location_city}
                    onChangeText={text => updateField('location_city', text)}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Input
                    label="Estado (UF)"
                    placeholder="UF"
                    value={formData.location_state}
                    onChangeText={text => updateField('location_state', text.toUpperCase())}
                    maxLength={2}
                    error={errors.location_state}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Input
                    label="Preço (R$)"
                    placeholder="0.00"
                    value={formData.price?.toString() || ''}
                    onChangeText={text => {
                      const num = parseFloat(text.replace(',', '.'));
                      updateField('price', isNaN(num) ? undefined : num);
                    }}
                    keyboardType="numeric"
                    error={errors.price}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Input
                    label="Quantidade"
                    placeholder="0"
                    value={formData.quantity?.toString() || ''}
                    onChangeText={text => {
                      const num = parseFloat(text);
                      updateField('quantity', isNaN(num) ? undefined : num);
                    }}
                    keyboardType="numeric"
                    error={errors.quantity}
                  />
                </View>
              </View>

              <Select
                label="Unidade de Medida"
                value={formData.unit || ''}
                onValueChange={value => updateField('unit', value)}
                options={units}
                placeholder="Selecione a unidade"
              />

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Input
                    label="Estoque"
                    placeholder="0"
                    value={formData.stock?.toString() || ''}
                    onChangeText={text => {
                      const num = parseInt(text);
                      updateField('stock', isNaN(num) ? undefined : num);
                    }}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Input
                    label="Desconto (%)"
                    placeholder="0"
                    value={formData.discount_percentage?.toString() || ''}
                    onChangeText={text => {
                      const num = parseInt(text);
                      updateField('discount_percentage', isNaN(num) ? undefined : num);
                    }}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Input
                    label="Parcelas"
                    placeholder="1"
                    value={formData.installments?.toString() || '1'}
                    onChangeText={text => {
                      const num = parseInt(text);
                      updateField('installments', isNaN(num) || num < 1 ? 1 : num);
                    }}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.halfWidth}>
                  <View style={styles.checkboxWrapper}>
                    <Text style={[styles.checkboxWrapperLabel, { color: colors.text }]}>
                      Opções
                    </Text>
                    <TouchableOpacity
                      style={styles.checkboxContainer}
                      onPress={() => updateField('free_shipping', !formData.free_shipping)}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          {
                            backgroundColor: formData.free_shipping
                              ? colors.primary
                              : colors.inputBackground,
                            borderColor: colors.inputBorder,
                          },
                        ]}
                      >
                        {formData.free_shipping && (
                          <Ionicons name="checkmark" size={18} color={colors.white} />
                        )}
                      </View>
                      <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                        Frete Grátis
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <Input
                label="URL da Imagem"
                placeholder="https://exemplo.com/imagem.jpg"
                value={formData.image_url}
                onChangeText={text => updateField('image_url', text)}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: loading ? colors.gray : colors.primary },
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={24} color={colors.white} />
                  <Text style={[styles.submitButtonText, { color: colors.white }]}>
                    {isQuotation ? 'Publicar Cotação' : 'Publicar Oferta'}
                  </Text>
                </>
              )}
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  formSection: {
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  checkboxWrapper: {
    marginBottom: 20,
  },
  checkboxWrapperLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import Header from '../../src/components/Header';
import { quotationService, QuotationResponse } from '../../src/services/quotationService';

export default function MyQuotationsScreen() {
  const { colors } = useTheme();
  const { user, profileImage } = useAuth();
  const router = useRouter();
  const [quotations, setQuotations] = useState<QuotationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const roleLabel: Record<string, string> = {
    buyer: 'Produtor',
    seller: 'Fornecedor',
    service_provider: 'Prestador de Serviço',
  };

  const userRole = user?.role ? roleLabel[user.role] || 'Usuário' : 'Usuário';

  const statusLabel: Record<string, { label: string; color: string }> = {
    active: { label: 'Ativa', color: colors.success },
    reserved: { label: 'Reservada', color: colors.warning },
    sold: { label: 'Vendida', color: colors.primary },
    expired: { label: 'Expirada', color: colors.textSecondary },
    cancelled: { label: 'Cancelada', color: colors.error },
  };

  const categoryLabel: Record<string, { label: string; color: string; icon: any }> = {
    agriculture: {
      label: 'Agricultura',
      color: '#4CAF50',
      icon: 'leaf-outline'
    },
    livestock: {
      label: 'Pecuária',
      color: '#FF9800',
      icon: 'paw-outline'
    },
    service: {
      label: 'Serviços',
      color: '#2196F3',
      icon: 'build-outline'
    },
    both: {
      label: 'Agro + Pecuária',
      color: '#9C27B0',
      icon: 'layers-outline'
    },
  };

  async function loadQuotations() {
    try {
      setLoading(true);

      const mockData: QuotationResponse[] = [
        {
          id: 1,
          seller_id: 1,
          seller_type: 'seller',
          title: 'Soja de Alta Qualidade',
          description: 'Soja livre de transgênicos, cultivada de forma sustentável. Ideal para alimentação animal e produção de óleo.',
          category: 'agriculture',
          product_type: 'Grãos',
          location_city: 'Dourados',
          location_state: 'MS',
          price: 145.50,
          quantity: 5000,
          unit: 'kg',
          expires_at: '2025-12-31',
          free_shipping: false,
          discount_percentage: 10,
          installments: 3,
          stock: 5000,
          status: 'active',
          created_at: '2025-11-15T10:00:00Z',
          updated_at: '2025-11-15T10:00:00Z',
          seller_nickname: 'João Silva',
        },
        {
          id: 2,
          seller_id: 1,
          seller_type: 'seller',
          title: 'Gado Nelore Para Engorda',
          description: 'Lote de 50 cabeças de gado Nelore, idade entre 18-24 meses. Animais vacinados e com atestado sanitário.',
          category: 'livestock',
          product_type: 'Bovinos',
          location_city: 'Aquidauana',
          location_state: 'MS',
          price: 8500.00,
          quantity: 50,
          unit: 'cabeça',
          expires_at: '2025-12-20',
          free_shipping: false,
          stock: 50,
          status: 'sold',
          created_at: '2025-10-25T08:00:00Z',
          updated_at: '2025-11-25T16:45:00Z',
          seller_nickname: 'João Silva',
        },
        {
          id: 5,
          seller_id: 1,
          seller_type: 'seller',
          title: 'Sementes de Girassol Certificadas',
          description: 'Sementes de girassol certificadas, com alta taxa de germinação (98%). Variedade resistente à seca.',
          category: 'agriculture',
          product_type: 'Sementes',
          location_city: 'Maracaju',
          location_state: 'MS',
          price: 35.00,
          quantity: 500,
          unit: 'kg',
          expires_at: '2025-11-30',
          free_shipping: true,
          stock: 500,
          status: 'expired',
          created_at: '2025-09-15T07:00:00Z',
          updated_at: '2025-11-30T23:59:00Z',
          seller_nickname: 'João Silva',
        },
        {
          id: 6,
          seller_id: 1,
          seller_type: 'seller',
          title: 'Adubo Orgânico Compostado',
          description: 'Adubo orgânico de alta qualidade, produzido através de compostagem controlada. Rico em nutrientes.',
          category: 'agriculture',
          product_type: 'Insumos',
          location_city: 'Ponta Porã',
          location_state: 'MS',
          price: 45.00,
          quantity: 2000,
          unit: 'kg',
          expires_at: '2026-06-30',
          free_shipping: false,
          discount_percentage: 20,
          installments: 5,
          stock: 2000,
          status: 'active',
          created_at: '2025-11-18T13:00:00Z',
          updated_at: '2025-11-18T13:00:00Z',
          seller_nickname: 'João Silva',
        },
      ];

      setQuotations(mockData);
    } catch (error: any) {
      console.error('Erro ao carregar cotações:', error);
      Alert.alert('Erro', 'Não foi possível carregar suas cotações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadQuotations();
    setRefreshing(false);
  }

  async function handleDelete(quotationId: number, title: string) {
    Alert.alert(
      'Excluir Cotação',
      `Deseja realmente excluir "${title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await quotationService.deleteQuotation(quotationId);
              Alert.alert('Sucesso', 'Cotação excluída com sucesso!');
              await loadQuotations();
            } catch (error: any) {
              console.error('Erro ao excluir cotação:', error);
              Alert.alert('Erro', 'Não foi possível excluir a cotação. Tente novamente.');
            }
          },
        },
      ]
    );
  }

  function handleBack() {
    router.back();
  }

  function handleProfile() {
    router.push('/(tabs)/profile');
  }

  function handleCreateNew() {
    router.push('/(tabs)/create-quotation');
  }

  function formatPrice(price?: number): string {
    if (!price) return 'Consultar';
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  useEffect(() => {
    loadQuotations();
  }, []);

  return (
    <ImageBackground
      source={require('../../assets/background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <Header
        userName={user?.nickname}
        userRole={userRole}
        profileImage={profileImage}
        showBackButton={true}
        screenTitle="Minhas Cotações"
        onBackPress={handleBack}
        onProfilePress={handleProfile}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.scrollContent,
          (loading || quotations.length === 0) && styles.scrollContentCentered
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Carregando cotações...
            </Text>
          </View>
        ) : quotations.length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: colors.cardBackground }]}>
            <Ionicons name="file-tray-outline" size={80} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Nenhuma Cotação Criada
            </Text>
            <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
              Você ainda não criou nenhuma cotação. Comece agora a oferecer seus produtos e serviços!
            </Text>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: colors.primary }]}
              onPress={handleCreateNew}
            >
              <Ionicons name="add-circle-outline" size={24} color={colors.white} />
              <Text style={[styles.createButtonText, { color: colors.white }]}>
                Criar Nova Cotação
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.headerRow}>
              <Text style={[styles.totalText, { color: colors.text }]}>
                {quotations.length} {quotations.length === 1 ? 'cotação' : 'cotações'}
              </Text>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.primary }]}
                onPress={handleCreateNew}
              >
                <Ionicons name="add" size={20} color={colors.white} />
                <Text style={[styles.addButtonText, { color: colors.white }]}>Nova</Text>
              </TouchableOpacity>
            </View>

            {quotations.map((quotation) => (
              <View
                key={quotation.id}
                style={[styles.quotationCard, { backgroundColor: colors.cardBackground }]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <Text style={[styles.quotationTitle, { color: colors.text }]}>
                      {quotation.title}
                    </Text>
                    <View style={styles.metaRow}>
                      <View style={[
                        styles.badge,
                        { backgroundColor: categoryLabel[quotation.category]?.color + '15' }
                      ]}>
                        <Ionicons
                          name={categoryLabel[quotation.category]?.icon}
                          size={14}
                          color={categoryLabel[quotation.category]?.color}
                        />
                        <Text style={[
                          styles.badgeText,
                          { color: categoryLabel[quotation.category]?.color }
                        ]}>
                          {categoryLabel[quotation.category]?.label}
                        </Text>
                      </View>
                      {quotation.product_type && (
                        <Text style={[styles.productType, { color: colors.textSecondary }]}>
                          • {quotation.product_type}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusLabel[quotation.status]?.color + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: statusLabel[quotation.status]?.color || colors.text },
                      ]}
                    >
                      {statusLabel[quotation.status]?.label || quotation.status}
                    </Text>
                  </View>
                </View>

                {quotation.image_url && (
                  <Image
                    source={{ uri: quotation.image_url }}
                    style={styles.quotationImage}
                    resizeMode="cover"
                  />
                )}

                {quotation.description && (
                  <Text
                    style={[styles.description, { color: colors.textSecondary }]}
                    numberOfLines={2}
                  >
                    {quotation.description}
                  </Text>
                )}

                <View style={styles.infoRow}>
                  {quotation.price && (
                    <View style={styles.infoItem}>
                      <Ionicons name="cash-outline" size={18} color={colors.primary} />
                      <Text style={[styles.infoText, { color: colors.text }]}>
                        {formatPrice(quotation.price)}
                        {quotation.unit && ` / ${quotation.unit}`}
                      </Text>
                    </View>
                  )}
                  {quotation.quantity && (
                    <View style={styles.infoItem}>
                      <Ionicons name="cube-outline" size={18} color={colors.primary} />
                      <Text style={[styles.infoText, { color: colors.text }]}>
                        {quotation.quantity} {quotation.unit || 'un'}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.footerRow}>
                  <View style={styles.footerLeft}>
                    {quotation.location_city && (
                      <View style={styles.locationRow}>
                        <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                        <Text style={[styles.locationText, { color: colors.textSecondary }]}>
                          {quotation.location_city}
                          {quotation.location_state && `, ${quotation.location_state}`}
                        </Text>
                      </View>
                    )}
                    <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                      Criada em {formatDate(quotation.created_at)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.deleteButton, { backgroundColor: colors.error + '20' }]}
                    onPress={() => handleDelete(quotation.id, quotation.title)}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
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
  scrollContentCentered: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  emptyContainer: {
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalText: {
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  quotationCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  quotationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  productType: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  quotationImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  footerLeft: {
    flex: 1,
    gap: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 13,
  },
  dateText: {
    fontSize: 12,
  },
  deleteButton: {
    padding: 10,
    borderRadius: 8,
  },
});

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Header from '../../src/components/Header';
import ProductCard from '../../src/components/ProductCard';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { quotationService, QuotationResponse } from '../../src/services/quotationService';

interface Seller {
  id: string;
  name: string;
  nickname: string;
  location: string;
  rating: number;
  totalSales: number;
  avatar?: string;
}

interface Product {
  id: string;
  name: string;
  image: string;
  images?: string[];
  originalPrice: number;
  price: number;
  discount: number;
  installments: number;
  installmentValue: number;
  freeShipping: boolean;
  category: string;
  seller: Seller;
  description: string;
  specifications?: { label: string; value: string }[];
  stock: number;
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Touro Nelore Reprodutor',
    image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400',
    images: [
      'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400',
      'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400',
      'https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?w=400',
    ],
    originalPrice: 160333,
    price: 132999,
    discount: 49,
    installments: 12,
    installmentValue: 15699,
    freeShipping: false,
    category: 'Animais',
    seller: {
      id: 's1',
      name: 'João Silva',
      nickname: 'Fazenda Silva',
      location: 'Ribeirão Preto, SP',
      rating: 4.8,
      totalSales: 127,
    },
    description:
      'Touro Nelore PO, 3 anos, excelente genética para reprodução. Certificado de registro, vacinação em dia. Animal dócil e com ótimo histórico reprodutivo.',
    specifications: [
      { label: 'Raça', value: 'Nelore PO' },
      { label: 'Idade', value: '3 anos' },
      { label: 'Peso', value: '850 kg' },
      { label: 'Registro', value: 'ABCZ' },
      { label: 'Vacinação', value: 'Em dia' },
    ],
    stock: 1,
  },
  {
    id: '2',
    name: 'Arame Farpado Nelore - 500m',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400',
    originalPrice: 160333,
    price: 132999,
    discount: 49,
    installments: 12,
    installmentValue: 15699,
    freeShipping: true,
    category: 'Insumos',
    seller: {
      id: 's2',
      name: 'Maria Costa',
      nickname: 'Agropecuária Costa',
      location: 'Uberaba, MG',
      rating: 4.9,
      totalSales: 352,
    },
    description:
      'Arame farpado galvanizado de alta resistência, ideal para cercas de pasto. Produto novo com garantia.',
    specifications: [
      { label: 'Comprimento', value: '500 metros' },
      { label: 'Material', value: 'Aço galvanizado' },
      { label: 'Farpas', value: '4 pontas' },
      { label: 'Bitola', value: '2,4mm' },
    ],
    stock: 15,
  },
  {
    id: '3',
    name: 'Sementes de CAPIM Mombaça - 20kg',
    image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400',
    originalPrice: 160333,
    price: 132999,
    discount: 49,
    installments: 12,
    installmentValue: 15699,
    freeShipping: true,
    category: 'Forragem',
    seller: {
      id: 's3',
      name: 'Pedro Oliveira',
      nickname: 'Sementes do Campo',
      location: 'Goiânia, GO',
      rating: 4.7,
      totalSales: 89,
    },
    description:
      'Sementes de Capim Mombaça de alta qualidade e germinação. Ideal para formação e recuperação de pastagens.',
    specifications: [
      { label: 'Peso', value: '20 kg' },
      { label: 'Germinação', value: '85%' },
      { label: 'Pureza', value: '98%' },
      { label: 'Validade', value: '12 meses' },
    ],
    stock: 50,
  },
  {
    id: '4',
    name: 'Ração Premium Bovinos - 50kg',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400',
    originalPrice: 89000,
    price: 67500,
    discount: 24,
    installments: 6,
    installmentValue: 11250,
    freeShipping: true,
    category: 'Ração',
    seller: {
      id: 's4',
      name: 'Carlos Mendes',
      nickname: 'Nutrição Animal Total',
      location: 'Campinas, SP',
      rating: 4.9,
      totalSales: 456,
    },
    description:
      'Ração balanceada premium para bovinos de corte e leite. Formulação completa com vitaminas e minerais.',
    specifications: [
      { label: 'Peso', value: '50 kg' },
      { label: 'Proteína', value: '18%' },
      { label: 'Energia', value: '2.800 kcal/kg' },
      { label: 'Tipo', value: 'Farelada' },
    ],
    stock: 120,
  },
  {
    id: '5',
    name: 'Pulverizador Costal 20L',
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400',
    originalPrice: 45000,
    price: 32500,
    discount: 28,
    installments: 10,
    installmentValue: 3250,
    freeShipping: false,
    category: 'Equipamentos',
    seller: {
      id: 's5',
      name: 'Ana Paula Santos',
      nickname: 'Equipamentos Agrícola',
      location: 'Curitiba, PR',
      rating: 4.6,
      totalSales: 203,
    },
    description:
      'Pulverizador costal manual 20L com bomba de pressão, ideal para aplicação de defensivos e fertilizantes.',
    specifications: [
      { label: 'Capacidade', value: '20 litros' },
      { label: 'Material', value: 'Plástico reforçado' },
      { label: 'Pressão', value: 'Até 4 bar' },
      { label: 'Garantia', value: '12 meses' },
    ],
    stock: 8,
  },
  {
    id: '6',
    name: 'Sal Mineral Premium - 25kg',
    image: 'https://images.unsplash.com/photo-1628243323838-f3876b5f9877?w=400',
    originalPrice: 12500,
    price: 9999,
    discount: 20,
    installments: 3,
    installmentValue: 3333,
    freeShipping: true,
    category: 'Suplementos',
    seller: {
      id: 's1',
      name: 'João Silva',
      nickname: 'Fazenda Silva',
      location: 'Ribeirão Preto, SP',
      rating: 4.8,
      totalSales: 127,
    },
    description:
      'Sal mineral enriquecido para bovinos, formulação balanceada com macro e microelementos essenciais.',
    specifications: [
      { label: 'Peso', value: '25 kg' },
      { label: 'Cálcio', value: '120 g/kg' },
      { label: 'Fósforo', value: '90 g/kg' },
      { label: 'Tipo', value: 'Seca das águas' },
    ],
    stock: 35,
  },
];

export default function DeuAgroScreen() {
  const { colors } = useTheme();
  const { user, profileImage } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showRelevantOnly, setShowRelevantOnly] = useState(true); // TEMPORÁRIO: Toggle para comparar
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const categories = [
    'Todos',
    'Favoritos',
    'Animais',
    'Insumos',
    'Forragem',
    'Ração',
    'Equipamentos',
    'Suplementos',
  ];

  const roleLabel: Record<string, string> = {
    buyer: 'Comprador',
    seller: 'Produtor',
    service_provider: 'Prestador',
  };

  const userRole = user?.role ? roleLabel[user.role] || 'Usuário' : 'Usuário';

  // Função para converter QuotationResponse para Product
  function quotationToProduct(quotation: QuotationResponse): Product {
    const originalPrice = quotation.price ? Math.round(quotation.price * 100) : 0;
    const price = quotation.discount_percentage
      ? Math.round(originalPrice * (1 - quotation.discount_percentage / 100))
      : originalPrice;
    const discount = quotation.discount_percentage || 0;
    const installments = quotation.installments || 1;
    const installmentValue = Math.round(price / installments);

    // Mapeia categoria da API para categoria do frontend
    const categoryMap: Record<string, string> = {
      livestock: 'Animais',
      agriculture: 'Insumos',
      service: 'Equipamentos',
      both: 'Insumos',
    };

    return {
      id: String(quotation.id),
      name: quotation.title,
      image: quotation.image_url || 'https://via.placeholder.com/400',
      images: quotation.images || [],
      originalPrice,
      price,
      discount,
      installments,
      installmentValue,
      freeShipping: quotation.free_shipping,
      category: categoryMap[quotation.category] || 'Insumos',
      seller: {
        id: String(quotation.seller_id),
        name: quotation.seller_nickname || 'Vendedor',
        nickname: quotation.seller_nickname || 'Vendedor',
        location: quotation.location_city
          ? `${quotation.location_city}, ${quotation.location_state}`
          : 'Localização não informada',
        rating: 4.5,
        totalSales: 0,
      },
      description: quotation.description || '',
      stock: quotation.stock || 0,
    };
  }

  // Busca cotações da API
  useEffect(() => {
    async function loadQuotations() {
      if (!user) return;

      setLoading(true);
      try {
        let quotations: QuotationResponse[];
        if (showRelevantOnly) {
          quotations = await quotationService.getRelevantQuotations();
        } else {
          quotations = await quotationService.getAllQuotations();
        }

        const convertedProducts = quotations.map(quotationToProduct);
        setProducts(convertedProducts);
      } catch (error: any) {
        console.error('Erro ao carregar cotações:', error);
        // Fallback para mockProducts se API falhar
        setProducts(mockProducts);
        Alert.alert(
          'Aviso',
          'Não foi possível carregar cotações da API. Mostrando dados de exemplo.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadQuotations();
  }, [user, showRelevantOnly]);

  function handleBack() {
    router.push('/(tabs)/');
  }

  function handleProfile() {
    router.push('/(tabs)/profile');
  }

  function toggleRelevantMode() {
    setShowRelevantOnly(!showRelevantOnly);
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'Todos' ||
      (selectedCategory === 'Favoritos' && favorites.includes(product.id)) ||
      product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  function toggleFavorite(productId: string) {
    setFavorites(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  }

  function handleProductPress(productId: string) {
    router.push({
      pathname: '/(tabs)/product-detail',
      params: { productId },
    });
  }

  function handleAddToCart(productId: string) {
    Alert.alert('Carrinho', `Produto ${productId} adicionado ao carrinho!`);
    // TODO: Implementar adicionar ao carrinho via API
  }

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
        screenTitle="Deu Agro"
        onBackPress={handleBack}
        onProfilePress={handleProfile}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          {/* TEMPORÁRIO: Botão para comparar cotações relevantes vs todas */}
          <View
            style={[
              styles.comparisonBanner,
              {
                backgroundColor: showRelevantOnly ? colors.successLight : colors.warning + '20',
                borderColor: showRelevantOnly ? colors.success : colors.warning,
              },
            ]}
          >
            <View style={styles.comparisonInfo}>
              <Ionicons
                name={showRelevantOnly ? 'checkmark-circle' : 'alert-circle'}
                size={20}
                color={showRelevantOnly ? colors.success : colors.warning}
              />
              <Text
                style={[
                  styles.comparisonText,
                  { color: showRelevantOnly ? colors.success : colors.warning },
                ]}
              >
                {showRelevantOnly
                  ? `✅ Mostrando ${products.length} cotações RELEVANTES (filtradas por seu perfil)`
                  : `⚠️ Mostrando ${products.length} cotações TODAS (incluindo não relevantes)`}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                {
                  backgroundColor: showRelevantOnly ? colors.success : colors.warning,
                },
              ]}
              onPress={toggleRelevantMode}
            >
              <Text style={styles.toggleButtonText}>
                {showRelevantOnly ? 'Ver Todas' : 'Ver Relevantes'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.searchContainer, { backgroundColor: colors.cardBackground }]}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Buscar produtos..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
          >
            {categories.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor:
                      selectedCategory === category ? colors.primary : colors.cardBackground,
                  },
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color: selectedCategory === category ? colors.white : colors.text,
                    },
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Carregando cotações...
              </Text>
            </View>
          ) : (
            <View style={styles.productsContainer}>
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFavorite={favorites.includes(product.id)}
                  onToggleFavorite={() => toggleFavorite(product.id)}
                  onPress={() => handleProductPress(product.id)}
                  onAddToCart={() => handleAddToCart(product.id)}
                />
              ))}
            </View>
          )}

          {!loading && filteredProducts.length === 0 && (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyCard, { backgroundColor: colors.cardBackground }]}>
                <Ionicons name="search-outline" size={80} color={colors.textSecondary} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  Nenhum produto encontrado
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  Tente ajustar os filtros ou buscar por outros termos
                </Text>
              </View>
            </View>
          )}
        </View>
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
  contentContainer: {
    gap: 12,
  },
  comparisonBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  comparisonInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  comparisonText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  productsContainer: {
    gap: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});

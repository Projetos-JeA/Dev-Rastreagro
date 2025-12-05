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
import { useCart } from '../../src/context/CartContext';
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

export default function DeuAgroScreen() {
  const { colors } = useTheme();
  const { user, profileImage, currentRoleLabel } = useAuth();
  const { addItem } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [showRelevantOnly, setShowRelevantOnly] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const categories = [
    'Todos',
    'Animais',
    'Insumos',
    'Forragem',
    'Ração',
    'Equipamentos',
    'Suplementos',
  ];

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
        setProducts([]);
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
      product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  function handleProductPress(productId: string) {
    const product = products.find(p => p.id === productId);
    if (!product) {
      Alert.alert('Erro', 'Produto não encontrado');
      return;
    }
    
    // Passa o produto completo como parâmetro
    router.push({
      pathname: '/(tabs)/product-detail',
      params: { 
        productId: product.id,
        productData: JSON.stringify(product),
      },
    });
  }

  function handleAddToCart(productId: string) {
    const product = products.find(p => p.id === productId);
    if (!product) {
      Alert.alert('Erro', 'Produto não encontrado');
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      stock: product.stock,
      freeShipping: product.freeShipping,
    });

    Alert.alert('✅ Item adicionado', `${product.name} foi adicionado ao carrinho!`, [{ text: 'OK' }]);
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
          <View
            style={[
              styles.comparisonBanner,
              { backgroundColor: colors.cardBackground, shadowColor: colors.shadowColor },
            ]}
          >
            <View style={styles.comparisonContent}>
              <View style={styles.comparisonHeader}>
                <View
                  style={[
                    styles.iconBadge,
                    {
                      backgroundColor: showRelevantOnly
                        ? colors.successLight
                        : colors.warning + '20',
                    },
                  ]}
                >
                  <Ionicons
                    name={showRelevantOnly ? 'star' : 'list'}
                    size={20}
                    color={showRelevantOnly ? colors.success : colors.warning}
                  />
                </View>
                <View style={styles.headerText}>
                  <Text style={[styles.comparisonTitle, { color: colors.text }]}>
                    {showRelevantOnly ? 'Produtos Relevantes' : 'Todos os Produtos'}
                  </Text>
                  <Text style={[styles.comparisonSubtitle, { color: colors.textSecondary }]}>
                    {products.length} {products.length === 1 ? 'produto' : 'produtos'}{' '}
                    {showRelevantOnly && 'para seu perfil'}
                  </Text>
                </View>
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
                <Ionicons
                  name={showRelevantOnly ? 'apps' : 'star'}
                  size={16}
                  color={colors.white}
                />
                <Text style={[styles.toggleButtonText, { color: colors.white }]}>
                  {showRelevantOnly ? 'Ver Todos' : 'Relevantes'}
                </Text>
              </TouchableOpacity>
            </View>
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
    padding: 16,
    borderRadius: 12,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 4,
  },
  comparisonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  comparisonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  comparisonTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  comparisonSubtitle: {
    fontSize: 12,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  toggleButtonText: {
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

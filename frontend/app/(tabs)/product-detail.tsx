import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Image,
  TouchableOpacity,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import Header from '../../src/components/Header';

const { width } = Dimensions.get('window');

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
    description: 'Touro Nelore PO, 3 anos, excelente genética para reprodução. Certificado de registro, vacinação em dia. Animal dócil e com ótimo histórico reprodutivo.',
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
    description: 'Arame farpado galvanizado de alta resistência, ideal para cercas de pasto. Produto novo com garantia.',
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
    description: 'Sementes de Capim Mombaça de alta qualidade e germinação. Ideal para formação e recuperação de pastagens.',
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
    description: 'Ração balanceada premium para bovinos de corte e leite. Formulação completa com vitaminas e minerais.',
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
    description: 'Pulverizador costal manual 20L com bomba de pressão, ideal para aplicação de defensivos e fertilizantes.',
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
    description: 'Sal mineral enriquecido para bovinos, formulação balanceada com macro e microelementos essenciais.',
    specifications: [
      { label: 'Peso', value: '25 kg' },
      { label: 'Cálcio', value: '120 g/kg' },
      { label: 'Fósforo', value: '90 g/kg' },
      { label: 'Tipo', value: 'Seca das águas' },
    ],
    stock: 35,
  },
];

export default function ProductDetailScreen() {
  const { colors } = useTheme();
  const { user, profileImage } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const roleLabel: Record<string, string> = {
    buyer: 'Produtor',
    seller: 'Fornecedor',
    service_provider: 'Prestador de Serviço',
  };

  const userRole = user?.role ? roleLabel[user.role] || 'Usuário' : 'Usuário';

  const foundProduct = mockProducts.find((p) => p.id === params.productId);

  if (!foundProduct) {
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
          screenTitle="Produto"
          onBackPress={() => router.back()}
          onProfilePress={() => router.push('/(tabs)/profile')}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={80} color={colors.textSecondary} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            Produto não encontrado
          </Text>
          <Text style={[styles.errorSubtitle, { color: colors.textSecondary }]}>
            O produto que você está procurando não existe ou foi removido
          </Text>
          <TouchableOpacity
            style={[styles.errorButton, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.errorButtonText, { color: colors.white }]}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }

  const product: Product = foundProduct;
  const images = product.images || [product.image];

  function handleBack() {
    router.back();
  }

  function handleProfile() {
    router.push('/(tabs)/profile');
  }

  function handleToggleFavorite() {
    setIsFavorite(!isFavorite);
  }

  function handleAddToCart() {
    Alert.alert('Sucesso', 'Produto adicionado ao carrinho!', [{ text: 'OK' }]);
  }

  function handleContactSeller() {
    Alert.alert(
      'Contatar Vendedor',
      `Deseja entrar em contato com ${product.seller.nickname}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sim', onPress: () => console.log('Contatar:', product.seller.id) },
      ]
    );
  }

  function formatPrice(price: number): string {
    return `R$${(price / 100).toFixed(3).replace('.', ',')}`;
  }

  function renderStars(rating: number) {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={`full-${i}`} name="star" size={16} color={colors.warning} />);
    }

    if (hasHalfStar) {
      stars.push(<Ionicons key="half" name="star-half" size={16} color={colors.warning} />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Ionicons key={`empty-${i}`} name="star-outline" size={16} color={colors.warning} />);
    }

    return stars;
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
        screenTitle={'Detalhes'}
        onBackPress={handleBack}
        onProfilePress={handleProfile}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={handleToggleFavorite} style={[styles.favoriteButton, { backgroundColor: colors.surfaceOverlay }]}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={28}
            color={isFavorite ? colors.error : colors.white}
          />
        </TouchableOpacity>

        <View style={styles.imageGalleryContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {images.map((img, index) => (
              <Image
                key={index}
                source={{ uri: img }}
                style={[styles.productImage, { width, backgroundColor: colors.cardAlt }]}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          {images.length > 1 && (
            <View style={styles.imageIndicatorContainer}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.imageIndicator,
                    {
                      backgroundColor:
                        currentImageIndex === index ? colors.primary : colors.textSecondary + '50',
                    },
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        <View style={[styles.contentCard, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.productInfoContainer}>
            <Text style={[styles.productName, { color: colors.text }]}>{product.name}</Text>
            <Text style={[styles.category, { color: colors.textSecondary }]}>{product.category}</Text>

            <View style={styles.priceContainer}>
              <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>
                {formatPrice(product.originalPrice)}
              </Text>
              <View style={[styles.discountBadge, { backgroundColor: colors.success + '20' }]}>
                <Text style={[styles.discountText, { color: colors.success }]}>
                  {product.discount}% OFF
                </Text>
              </View>
            </View>

            <Text style={[styles.price, { color: colors.text }]}>{formatPrice(product.price)}</Text>

            <Text style={[styles.installments, { color: colors.textSecondary }]}>
              em {product.installments}x de {formatPrice(product.installmentValue)} sem juros
            </Text>

            {product.freeShipping && (
              <View style={styles.shippingBadge}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={[styles.shippingText, { color: colors.success }]}>Envio grátis</Text>
              </View>
            )}

            <View style={styles.stockContainer}>
              <Ionicons
                name={product.stock > 10 ? 'checkmark-circle' : 'alert-circle'}
                size={16}
                color={product.stock > 10 ? colors.success : colors.warning}
              />
              <Text style={[styles.stockText, { color: colors.textSecondary }]}>
                {product.stock > 10
                  ? `${product.stock} unidades disponíveis`
                  : product.stock > 0
                    ? `Apenas ${product.stock} unidades restantes!`
                    : 'Produto esgotado'}
              </Text>
            </View>
          </View>

          <View style={[styles.sellerCard, { backgroundColor: colors.background }]}>
            <View style={styles.sellerHeader}>
              <View style={[styles.sellerAvatar, { backgroundColor: colors.cardAlt }]}>
                {product.seller.avatar ? (
                  <Image source={{ uri: product.seller.avatar }} style={styles.sellerAvatarImage} />
                ) : (
                  <Ionicons name="person" size={24} color={colors.textSecondary} />
                )}
              </View>
              <View style={styles.sellerInfo}>
                <Text style={[styles.sellerNickname, { color: colors.text }]}>
                  {product.seller.nickname}
                </Text>
                <Text style={[styles.sellerName, { color: colors.textSecondary }]}>
                  {product.seller.name}
                </Text>
                <View style={styles.sellerRatingContainer}>
                  <View style={styles.starsContainer}>{renderStars(product.seller.rating)}</View>
                  <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                    {product.seller.rating.toFixed(1)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.sellerStats}>
              <View style={styles.sellerStat}>
                <Ionicons name="location" size={16} color={colors.textSecondary} />
                <Text style={[styles.sellerStatText, { color: colors.textSecondary }]}>
                  {product.seller.location}
                </Text>
              </View>
              <View style={styles.sellerStat}>
                <Ionicons name="cart" size={16} color={colors.textSecondary} />
                <Text style={[styles.sellerStatText, { color: colors.textSecondary }]}>
                  {product.seller.totalSales} vendas realizadas
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.contactButton, { backgroundColor: colors.primary }]}
              onPress={handleContactSeller}
            >
              <Ionicons name="chatbubble-ellipses" size={20} color={colors.white} />
              <Text style={[styles.contactButtonText, { color: colors.white }]}>Contatar Vendedor</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Descrição</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {product.description}
            </Text>
          </View>

          {product.specifications && product.specifications.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Especificações</Text>
              <View style={styles.specificationsContainer}>
                {product.specifications.map((spec, index) => (
                  <View
                    key={index}
                    style={[
                      styles.specRow,
                      index === product.specifications!.length - 1 && styles.specRowLast,
                    ]}
                  >
                    <Text style={[styles.specLabel, { color: colors.textSecondary }]}>
                      {spec.label}
                    </Text>
                    <Text style={[styles.specValue, { color: colors.text }]}>{spec.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: colors.cardBackground }]}>
        <TouchableOpacity
          style={[styles.addToCartButton, { backgroundColor: colors.primary }]}
          onPress={handleAddToCart}
          disabled={product.stock === 0}
        >
          <Ionicons name="cart" size={20} color={colors.white} />
          <Text style={[styles.addToCartText, { color: colors.white }]}>
            {product.stock > 0 ? 'Adicionar ao Carrinho' : 'Produto Esgotado'}
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 100,
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  imageGalleryContainer: {
    position: 'relative',
  },
  productImage: {
    height: 300,
  },
  imageIndicatorContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  imageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  contentCard: {
    margin: 16,
    borderRadius: 16,
    padding: 16,
    gap: 20,
  },
  productInfoContainer: {
    gap: 8,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  category: {
    fontSize: 14,
    textTransform: 'uppercase',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  originalPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  installments: {
    fontSize: 14,
  },
  shippingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  shippingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  stockText: {
    fontSize: 12,
  },
  sellerCard: {
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  sellerHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  sellerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellerAvatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  sellerInfo: {
    flex: 1,
    gap: 4,
  },
  sellerNickname: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sellerName: {
    fontSize: 14,
  },
  sellerRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sellerStats: {
    gap: 8,
  },
  sellerStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sellerStatText: {
    fontSize: 13,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  specificationsContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  specRowLast: {
    borderBottomWidth: 0,
  },
  specLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  specValue: {
    fontSize: 14,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 12,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

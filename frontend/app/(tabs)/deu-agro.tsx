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
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import ProductCard from '../../src/components/ProductCard';

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

export default function DeuAgroScreen() {
  const { colors } = useTheme();
  const { user, profileImage } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [favorites, setFavorites] = useState<string[]>([]);
  const router = useRouter();

  const categories = ['Todos', 'Favoritos', 'Animais', 'Insumos', 'Forragem', 'Ração', 'Equipamentos', 'Suplementos'];

  const roleLabel: Record<string, string> = {
    buyer: 'Comprador',
    seller: 'Produtor',
    service_provider: 'Prestador',
  };

  const userRole = user?.role ? roleLabel[user.role] || 'Usuário' : 'Usuário';

  function handleBack() {
    router.push('/(tabs)/');
  }

  function handleProfile() {
    router.push('/(tabs)/profile');
  }

  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'Todos' ||
      selectedCategory === 'Favoritos' && favorites.includes(product.id) ||
      product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  function toggleFavorite(productId: string) {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  }

  function handleProductPress(productId: string) {
    router.push({
      pathname: '/(tabs)/product-detail',
      params: { productId },
    });
  }

  return (
    <ImageBackground
      source={require('../../assets/background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={[styles.overlay, { backgroundColor: colors.backgroundOverlay }]} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { marginTop: Platform.OS === 'ios' ? 30 : 20 }]}>
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="arrow-back" size={28} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.profileContainer}>
            <Text style={[styles.headerText, { color: colors.text }]}>{userRole}</Text>
            <TouchableOpacity onPress={handleProfile}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <Ionicons name="person-circle-outline" size={32} color={colors.text} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>DEU AGRO</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Inspirado em suas preferências de cadastro
            </Text>
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
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: selectedCategory === category ? colors.primary : colors.cardBackground,
                  },
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color: selectedCategory === category ? '#fff' : colors.text,
                    },
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.productsContainer}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite={favorites.includes(product.id)}
                onToggleFavorite={() => toggleFavorite(product.id)}
                onPress={() => handleProductPress(product.id)}
              />
            ))}
          </View>

          {filteredProducts.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="sad-outline" size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Nenhum produto encontrado
              </Text>
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  contentContainer: {
    gap: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
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
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
});

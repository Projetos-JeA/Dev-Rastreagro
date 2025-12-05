import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface Product {
  id: string;
  name: string;
  image: string;
  originalPrice: number;
  price: number;
  discount: number;
  installments: number;
  installmentValue: number;
  freeShipping: boolean;
  category: string;
  type?: 'offer' | 'quotation';
  sellerInfo?: {
    id: string;
    name: string;
    nickname: string;
  };
  buyerInfo?: {
    id: string;
    name: string;
    nickname: string;
  };
}

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onAddToCart?: () => void;
}

export default function ProductCard({
  product,
  onPress,
  onAddToCart,
}: ProductCardProps) {
  const { colors } = useTheme();

  function formatPrice(price: number): string {
    return `R$${(price / 100).toFixed(3).replace('.', ',')}`;
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colors.cardBackground, shadowColor: colors.shadowColor },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={[styles.image, { backgroundColor: colors.lightGray }]} resizeMode="cover" />
        {product.type && (
          <View
            style={[
              styles.typeBadge,
              {
                backgroundColor:
                  product.type === 'offer' ? colors.purple : colors.warning + 'E6',
                borderColor: colors.whiteTransparent30,
              },
            ]}
          >
            <Text
              style={[
                styles.typeBadgeText,
                {
                  color: product.type === 'offer' ? colors.white : colors.warning,
                },
              ]}
            >
              {product.type === 'offer' ? 'Oferta' : 'Cotação'}
            </Text>
          </View>
        )}
        {onAddToCart && (
          <TouchableOpacity
            style={[styles.cartButton, { backgroundColor: colors.primary }]}
            onPress={e => {
              e.stopPropagation();
              onAddToCart();
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="cart" size={20} color={colors.white} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
              {product.name}
            </Text>
            <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>
              {formatPrice(product.originalPrice)}
            </Text>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: colors.text }]}>{formatPrice(product.price)}</Text>
          <View style={[styles.discountBadge, { backgroundColor: colors.success + '20' }]}>
            <Text style={[styles.discountText, { color: colors.success }]}>
              {product.discount}% OFF
            </Text>
          </View>
        </View>

        <Text style={[styles.installments, { color: colors.textSecondary }]}>
          em {product.installments}x {formatPrice(product.installmentValue)}
        </Text>

        {product.freeShipping && (
          <View style={styles.shippingContainer}>
            <Text style={[styles.shippingText, { color: colors.success }]}>Envio grátis</Text>
          </View>
        )}

        {(product.sellerInfo || product.buyerInfo) && (
          <View style={[styles.userInfoContainer, { borderTopColor: colors.blackTransparent10 }]}>
            <Ionicons name="person-circle-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.userInfoText, { color: colors.textSecondary }]}>
              {product.type === 'offer'
                ? `Ofertado por: ${product.sellerInfo?.nickname || product.sellerInfo?.name || 'Usuário'}`
                : `Cotado por: ${product.buyerInfo?.nickname || product.buyerInfo?.name || 'Usuário'}`}
            </Text>
          </View>
        )}

        {onAddToCart && (
          <TouchableOpacity
            style={[styles.addToCartButton, { backgroundColor: colors.primary }]}
            onPress={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
          >
            <Ionicons name="cart-outline" size={16} color={colors.white} />
            <Text style={[styles.addToCartText, { color: colors.white }]}>
              Adicionar
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
  },
  image: {
    width: '100%',
    height: 140,
  },
  typeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  cartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
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
  installments: {
    fontSize: 12,
    marginBottom: 8,
  },
  shippingContainer: {
    alignSelf: 'flex-start',
  },
  shippingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  addToCartText: {
    fontSize: 13,
    fontWeight: '600',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  userInfoText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
});

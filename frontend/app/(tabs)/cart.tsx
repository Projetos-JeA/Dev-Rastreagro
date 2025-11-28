import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { useCart } from '../../src/context/CartContext';
import Header from '../../src/components/Header';

export default function CartScreen() {
  const { colors } = useTheme();
  const { user, profileImage } = useAuth();
  const router = useRouter();
  const {
    items,
    itemCount,
    subtotal,
    shippingCost,
    total,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const roleLabel: Record<string, string> = {
    buyer: 'Comprador',
    seller: 'Produtor',
    service_provider: 'Prestador',
  };

  const userRole = user?.role ? roleLabel[user.role] || 'Usuário' : 'Usuário';

  function formatPrice(price: number): string {
    return `R$ ${(price / 100).toFixed(2).replace('.', ',')}`;
  }

  function handleBack() {
    router.back();
  }

  function handleProfile() {
    router.push('/(tabs)/profile');
  }

  function handleIncreaseQuantity(itemId: string, currentQuantity: number, stock: number) {
    if (currentQuantity < stock) {
      updateQuantity(itemId, currentQuantity + 1);
    } else {
      Alert.alert('Estoque Insuficiente', 'Quantidade máxima disponível atingida.');
    }
  }

  function handleDecreaseQuantity(itemId: string, currentQuantity: number) {
    if (currentQuantity > 1) {
      updateQuantity(itemId, currentQuantity - 1);
    } else {
      Alert.alert(
        'Remover item',
        'Deseja remover este item do carrinho?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Remover', style: 'destructive', onPress: () => removeItem(itemId) },
        ]
      );
    }
  }

  function handleRemoveItem(itemId: string) {
    Alert.alert(
      'Remover item',
      'Deseja remover este item do carrinho?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => removeItem(itemId) },
      ]
    );
  }

  function handleClearCart() {
    Alert.alert(
      'Limpar carrinho',
      'Deseja remover todos os itens do carrinho?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpar', style: 'destructive', onPress: clearCart },
      ]
    );
  }

  function handleCheckout() {
    Alert.alert(
      'Finalizar Compra',
      `Total: ${formatPrice(total)}\n\nEsta funcionalidade estará disponível em breve!`,
      [{ text: 'OK' }]
    );
  }

  if (items.length === 0) {
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
          screenTitle="Carrinho"
          onBackPress={handleBack}
          onProfilePress={handleProfile}
        />

        <View style={styles.emptyContainer}>
          <View style={[styles.emptyCard, { backgroundColor: colors.cardBackground, shadowColor: colors.shadowColor }]}>
            <Ionicons name="cart-outline" size={80} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Seu carrinho está vazio
            </Text>
            <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
              Adicione produtos para começar suas compras
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(tabs)/deu-agro')}
            >
              <Ionicons name="storefront-outline" size={20} color={colors.white} />
              <Text style={[styles.emptyButtonText, { color: colors.white }]}>
                Ver Produtos
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    );
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
        screenTitle="Carrinho"
        onBackPress={handleBack}
        onProfilePress={handleProfile}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={styles.itemCountContainer}>
            <Ionicons name="cart" size={20} color={colors.text} />
            <Text style={[styles.itemCountText, { color: colors.text }]}>
              {itemCount} {itemCount === 1 ? 'item' : 'itens'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.clearCartButton, { backgroundColor: colors.error }]}
            onPress={handleClearCart}
          >
            <Ionicons name="trash-outline" size={16} color={colors.white} />
            <Text style={[styles.clearCartText, { color: colors.white }]}>
              Limpar carrinho
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.itemsContainer}>
          {items.map(item => (
            <View
              key={item.id}
              style={[styles.cartItem, { backgroundColor: colors.cardBackground, shadowColor: colors.shadowColor }]}
            >
              <Image source={{ uri: item.image }} style={styles.itemImage} />

              <View style={styles.itemDetails}>
                <View style={styles.itemHeader}>
                  <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveItem(item.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.itemPrice, { color: colors.primary }]}>
                  {formatPrice(item.price)}
                </Text>

                {item.freeShipping && (
                  <View style={styles.shippingBadge}>
                    <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                    <Text style={[styles.shippingText, { color: colors.success }]}>
                      Frete grátis
                    </Text>
                  </View>
                )}

                <View style={styles.quantityContainer}>
                  <Text style={[styles.quantityLabel, { color: colors.textSecondary }]}>
                    Quantidade:
                  </Text>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={[styles.quantityButton, { backgroundColor: colors.cardAlt }]}
                      onPress={() => handleDecreaseQuantity(item.id, item.quantity)}
                    >
                      <Ionicons name="remove" size={18} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.quantityValue, { color: colors.text }]}>
                      {item.quantity}
                    </Text>
                    <TouchableOpacity
                      style={[styles.quantityButton, { backgroundColor: colors.cardAlt }]}
                      onPress={() => handleIncreaseQuantity(item.id, item.quantity, item.stock)}
                    >
                      <Ionicons name="add" size={18} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={[styles.itemStock, { color: colors.textSecondary }]}>
                  {item.stock} unidades disponíveis
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.summaryCard, { backgroundColor: colors.cardBackground, shadowColor: colors.shadowColor }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>
            Resumo do Pedido
          </Text>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'itens'})
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {formatPrice(subtotal)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Frete
            </Text>
            <Text style={[styles.summaryValue, { color: shippingCost === 0 ? colors.success : colors.text }]}>
              {shippingCost === 0 ? 'Grátis' : formatPrice(shippingCost)}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

          <View style={styles.summaryRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>
              Total
            </Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              {formatPrice(total)}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.cardBackground, borderTopColor: colors.cardBorder }]}>
        <View style={styles.footerContent}>
          <View>
            <Text style={[styles.footerLabel, { color: colors.textSecondary }]}>
              Total
            </Text>
            <Text style={[styles.footerTotal, { color: colors.primary }]}>
              {formatPrice(total)}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.checkoutButton, { backgroundColor: colors.primary }]}
            onPress={handleCheckout}
          >
            <Text style={[styles.checkoutButtonText, { color: colors.white }]}>
              Finalizar Compra
            </Text>
            <Ionicons name="arrow-forward" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
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
    padding: 16,
    paddingBottom: 120,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemCountText: {
    fontSize: 16,
    fontWeight: '600',
  },
  clearCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  clearCartText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  cartItem: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    gap: 12,
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  itemDetails: {
    flex: 1,
    gap: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  shippingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shippingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityLabel: {
    fontSize: 12,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityValue: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'center',
  },
  itemStock: {
    fontSize: 11,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    gap: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  footerTotal: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

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
  RefreshControl,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import Header from '../../src/components/Header';
import { OrderResponse, OrderStatus } from '../../src/services/orderService';

export default function TrackOrderScreen() {
  const { colors } = useTheme();
  const { user, profileImage, currentRoleLabel } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const statusConfig: Record<OrderStatus, { label: string; color: string; icon: any }> = {
    pending: {
      label: 'Pendente',
      color: colors.warning,
      icon: 'hourglass-outline'
    },
    confirmed: {
      label: 'Confirmado',
      color: colors.info,
      icon: 'checkmark-circle-outline'
    },
    in_transit: {
      label: 'Em Trânsito',
      color: colors.primary,
      icon: 'car-outline'
    },
    delivered: {
      label: 'Entregue',
      color: colors.success,
      icon: 'checkmark-done-circle-outline'
    },
    cancelled: {
      label: 'Cancelado',
      color: colors.error,
      icon: 'close-circle-outline'
    },
  };

  async function loadOrders() {
    try {
      setLoading(true);

      const mockData: OrderResponse[] = [
        {
          id: 1,
          buyer_id: 1,
          seller_nickname: 'João Silva',
          status: 'in_transit',
          total_amount: 2875.00,
          items: [
            {
              id: 1,
              product_name: 'Soja Premium',
              quantity: 1000,
              unit: 'kg',
              price: 145.50
            },
            {
              id: 2,
              product_name: 'Adubo Orgânico',
              quantity: 200,
              unit: 'kg',
              price: 45.00
            }
          ],
          shipping_address: 'Rua das Flores, 123',
          location_city: 'Dourados',
          location_state: 'MS',
          estimated_delivery: '2025-12-10',
          tracking_code: 'BR123456789MS',
          created_at: '2025-11-28T10:00:00Z',
          updated_at: '2025-12-01T14:30:00Z',
        },
        {
          id: 2,
          buyer_id: 1,
          seller_nickname: 'Maria Santos',
          status: 'delivered',
          total_amount: 8500.00,
          items: [
            {
              id: 3,
              product_name: 'Gado Nelore',
              quantity: 10,
              unit: 'cabeça',
              price: 8500.00
            }
          ],
          shipping_address: 'Fazenda Santa Clara',
          location_city: 'Aquidauana',
          location_state: 'MS',
          tracking_code: 'BR987654321MS',
          created_at: '2025-11-15T08:00:00Z',
          updated_at: '2025-11-25T16:45:00Z',
        },
        {
          id: 3,
          buyer_id: 1,
          seller_nickname: 'Pedro Costa',
          status: 'pending',
          total_amount: 175.00,
          items: [
            {
              id: 4,
              product_name: 'Sementes de Girassol Certificadas',
              quantity: 50,
              unit: 'kg',
              price: 35.00
            }
          ],
          shipping_address: 'Av. Principal, 456',
          location_city: 'Maracaju',
          location_state: 'MS',
          estimated_delivery: '2025-12-15',
          created_at: '2025-12-02T13:00:00Z',
          updated_at: '2025-12-02T13:00:00Z',
        },
        {
          id: 4,
          buyer_id: 1,
          seller_nickname: 'Ana Lima',
          status: 'confirmed',
          total_amount: 4500.00,
          items: [
            {
              id: 5,
              product_name: 'Peças para Maquinário Agrícola',
              quantity: 1,
              unit: 'conjunto',
              price: 4500.00
            }
          ],
          shipping_address: 'Fazenda Boa Vista',
          location_city: 'Campo Grande',
          location_state: 'MS',
          estimated_delivery: '2025-12-08',
          tracking_code: 'BR456789123MS',
          created_at: '2025-11-30T09:00:00Z',
          updated_at: '2025-12-01T10:00:00Z',
        },
      ];

      setOrders(mockData);
    } catch (error: any) {
      console.error('Error loading orders:', error);
      Alert.alert('Erro', 'Não foi possível carregar seus pedidos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  }

  function handleBack() {
    router.back();
  }

  function handleProfile() {
    router.push('/(tabs)/profile');
  }

  function handleOrderPress(order: OrderResponse) {
    setSelectedOrder(order);
    setModalVisible(true);
  }

  function handleCancelOrder(orderId: number) {
    Alert.alert(
      'Cancelar Pedido',
      'Tem certeza que deseja cancelar este pedido?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, Cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              Alert.alert('Sucesso', 'Pedido cancelado com sucesso!');
              await loadOrders();
              setModalVisible(false);
            } catch (error: any) {
              console.error('Error cancelling order:', error);
              Alert.alert('Erro', 'Não foi possível cancelar o pedido. Tente novamente.');
            }
          },
        },
      ]
    );
  }

  function formatPrice(price: number): string {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  useEffect(() => {
    loadOrders();
  }, []);

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
        screenTitle="Acompanhar Pedidos"
        onBackPress={handleBack}
        onProfilePress={handleProfile}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.scrollContent,
          (loading || orders.length === 0) && styles.scrollContentCentered
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
              Carregando pedidos...
            </Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: colors.white }]}>
            <Ionicons name="cube-outline" size={80} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Nenhum Pedido
            </Text>
            <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
              Você ainda não fez nenhum pedido. Navegue pelos produtos e comece a comprar!
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.headerRow}>
              <Text style={[styles.totalText, { color: colors.text }]}>
                {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}
              </Text>
            </View>

            {orders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={[styles.orderCard, { backgroundColor: colors.white, shadowColor: colors.shadowColor }]}
                onPress={() => handleOrderPress(order)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <Text style={[styles.orderNumber, { color: colors.text }]}>
                      Pedido #{order.id}
                    </Text>
                    <Text style={[styles.sellerName, { color: colors.textSecondary }]}>
                      Vendedor: {order.seller_nickname}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusConfig[order.status]?.color + '20' },
                    ]}
                  >
                    <Ionicons
                      name={statusConfig[order.status]?.icon}
                      size={16}
                      color={statusConfig[order.status]?.color}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        { color: statusConfig[order.status]?.color },
                      ]}
                    >
                      {statusConfig[order.status]?.label}
                    </Text>
                  </View>
                </View>

                <View style={styles.itemsPreview}>
                  <Ionicons name="bag-handle-outline" size={18} color={colors.primary} />
                  <Text style={[styles.itemsText, { color: colors.text }]}>
                    {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Ionicons name="cash-outline" size={18} color={colors.primary} />
                    <Text style={[styles.infoText, { color: colors.text }]}>
                      {formatPrice(order.total_amount)}
                    </Text>
                  </View>
                  {order.tracking_code && (
                    <View style={styles.infoItem}>
                      <Ionicons name="barcode-outline" size={18} color={colors.primary} />
                      <Text style={[styles.infoText, { color: colors.text }]}>
                        {order.tracking_code}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.footerRow}>
                  <View style={styles.footerLeft}>
                    <View style={styles.locationRow}>
                      <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                      <Text style={[styles.locationText, { color: colors.textSecondary }]}>
                        {order.location_city}, {order.location_state}
                      </Text>
                    </View>
                    <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                      Realizado em {formatDate(order.created_at)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.white }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.cardBorder }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Detalhes do Pedido
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {selectedOrder && (
                <>
                  <View style={styles.modalSection}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      Informações do Pedido
                    </Text>
                    <View style={[styles.infoBox, { backgroundColor: colors.cardAlt }]}>
                      <View style={styles.modalRow}>
                        <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>
                          Número do Pedido
                        </Text>
                        <Text style={[styles.modalValue, { color: colors.text }]}>
                          #{selectedOrder.id}
                        </Text>
                      </View>
                      <View style={styles.modalRow}>
                        <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>
                          Status
                        </Text>
                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: statusConfig[selectedOrder.status]?.color + '20' },
                          ]}
                        >
                          <Ionicons
                            name={statusConfig[selectedOrder.status]?.icon}
                            size={16}
                            color={statusConfig[selectedOrder.status]?.color}
                          />
                          <Text
                            style={[
                              styles.statusText,
                              { color: statusConfig[selectedOrder.status]?.color },
                            ]}
                          >
                            {statusConfig[selectedOrder.status]?.label}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.modalRow}>
                        <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>
                          Vendedor
                        </Text>
                        <Text style={[styles.modalValue, { color: colors.text }]}>
                          {selectedOrder.seller_nickname}
                        </Text>
                      </View>
                      {selectedOrder.tracking_code && (
                        <View style={styles.modalRow}>
                          <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>
                            Código de Rastreio
                          </Text>
                          <Text style={[styles.modalValue, { color: colors.text }]}>
                            {selectedOrder.tracking_code}
                          </Text>
                        </View>
                      )}
                      {selectedOrder.estimated_delivery && (
                        <View style={styles.modalRow}>
                          <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>
                            Previsão de Entrega
                          </Text>
                          <Text style={[styles.modalValue, { color: colors.text }]}>
                            {formatDate(selectedOrder.estimated_delivery)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      Itens do Pedido
                    </Text>
                    {selectedOrder.items.map((item) => (
                      <View
                        key={item.id}
                        style={[styles.itemCard, { backgroundColor: colors.cardAlt }]}
                      >
                        <View style={styles.itemHeader}>
                          <Text style={[styles.itemName, { color: colors.text }]}>
                            {item.product_name}
                          </Text>
                        </View>
                        <View style={styles.itemDetails}>
                          <View style={styles.itemQuantityBox}>
                            <Ionicons name="cube-outline" size={16} color={colors.textSecondary} />
                            <Text style={[styles.itemQuantity, { color: colors.textSecondary }]}>
                              {item.quantity} {item.unit}
                            </Text>
                          </View>
                          <Text style={[styles.itemPrice, { color: colors.primary }]}>
                            {formatPrice(item.price)}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      Informações de Entrega
                    </Text>
                    <View style={[styles.infoBox, { backgroundColor: colors.cardAlt }]}>
                      <View style={styles.modalRow}>
                        <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>
                          Endereço
                        </Text>
                        <Text style={[styles.modalValue, { color: colors.text }]}>
                          {selectedOrder.shipping_address}
                        </Text>
                      </View>
                      <View style={styles.modalRow}>
                        <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>
                          Cidade
                        </Text>
                        <Text style={[styles.modalValue, { color: colors.text }]}>
                          {selectedOrder.location_city}, {selectedOrder.location_state}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={[styles.totalSection, { backgroundColor: colors.cardAlt }]}>
                    <View style={styles.totalRow}>
                      <Text style={[styles.totalLabel, { color: colors.text }]}>
                        Valor Total
                      </Text>
                      <Text style={[styles.totalValue, { color: colors.primary }]}>
                        {formatPrice(selectedOrder.total_amount)}
                      </Text>
                    </View>
                  </View>

                  {selectedOrder.status === 'pending' && (
                    <TouchableOpacity
                      style={[styles.cancelButton, { backgroundColor: colors.error + '20', borderColor: colors.error }]}
                      onPress={() => handleCancelOrder(selectedOrder.id)}
                    >
                      <Ionicons name="close-circle-outline" size={20} color={colors.error} />
                      <Text style={[styles.cancelButtonText, { color: colors.error }]}>
                        Cancelar Pedido
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  orderCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
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
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sellerName: {
    fontSize: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  itemsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  itemsText: {
    fontSize: 14,
    fontWeight: '600',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },
  modalSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 13,
    flex: 1,
  },
  modalValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  infoBox: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  itemCard: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  itemHeader: {
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemQuantityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemQuantity: {
    fontSize: 13,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

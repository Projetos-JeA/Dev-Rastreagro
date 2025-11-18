import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import MenuCard from '../../src/components/MenuCard';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();

  const roleLabel: Record<string, string> = {
    buyer: 'Comprador',
    seller: 'Produtor',
    service_provider: 'Prestador',
  };

  const userRole = user?.role ? roleLabel[String(user.role)] ?? 'Usuário' : 'Usuário';

  function handleCreateQuotation() {
    router.push('/(tabs)/quotation');
  }

  function handleMyQuotations() {
    router.push('/(tabs)/my-quotations');
  }

  function handleCart() {
    router.push('/(tabs)/cart');
  }

  function handleTrackOrder() {
    router.push('/(tabs)/track-order');
  }

  function handleSocial() {
    router.push('/(tabs)/social');
  }

  return (
    <ImageBackground
      source={require('../../assets/background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={[styles.overlay, { backgroundColor: colors.backgroundOverlay }]} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={28} color={colors.error} />
          </TouchableOpacity>
          <Text style={[styles.headerText, { color: colors.text }]}>{userRole}</Text>
        </View>

        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.menuContainer}>
          <MenuCard
            icon="document-text"
            title="Realizar Cotação"
            onPress={handleCreateQuotation}
            iconColor={colors.iconQuotation}
          />
          <MenuCard
            icon="receipt"
            title="Minhas Cotações"
            onPress={handleMyQuotations}
            iconColor={colors.iconMyQuotations}
          />
          <MenuCard
            icon="cart"
            title="Carrinho"
            onPress={handleCart}
            iconColor={colors.iconCart}
          />
          <MenuCard
            icon="cube"
            title="Acompanhar Pedido"
            onPress={handleTrackOrder}
            iconColor={colors.iconTrackOrder}
          />
          <MenuCard
            icon="people"
            title="Deu Agro"
            onPress={handleSocial}
            iconColor={colors.iconSocial}
          />
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
    marginVertical: 10,
  },
  logoutButton: {
    paddingTop: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 136,
    height: 136,
  },
  headerIcon: {
    marginRight: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuContainer: {
    gap: 16,
  },
});

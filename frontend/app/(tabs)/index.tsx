import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import MenuCard from '../../src/components/MenuCard';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { user, profileImage } = useAuth();
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

  function handleHerdControl() {
    router.push('/(tabs)/herd-control');
  }

  function handleProfile() {
    router.push('/(tabs)/profile');
  }

  function handleMoreOptions() {
    Alert.alert(
      'Em Desenvolvimento',
      'Novas funcionalidades e configurações estarão disponíveis em breve!',
      [{ text: 'OK' }]
    );
  }

  const isProducer = user?.role === 'seller';
  const isPecuarista = user?.producer_type === 'pecuarista' || user?.producer_type === 'ambos';
  const showHerdControl = isProducer && isPecuarista;

  return (
    <ImageBackground
      source={require('../../assets/background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={[styles.overlay, { backgroundColor: colors.backgroundOverlay }]} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { marginTop: Platform.OS === 'ios' ? 30 : 20 }]}>
          <TouchableOpacity onPress={handleMoreOptions}>
            <Ionicons name="ellipsis-horizontal" size={28} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.profileContainer}>
            <Text style={[styles.headerText, { color: colors.text }]}>{userRole}</Text>
            <TouchableOpacity onPress={handleProfile} >
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <Ionicons name="person-circle-outline" size={32} color={colors.text} />
              )}
            </TouchableOpacity>
          </View>
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
          {showHerdControl && (
            <MenuCard
              icon="stats-chart"
              title="Controle de Rebanho"
              onPress={handleHerdControl}
              iconColor={colors.iconHerdControl}
            />
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
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuContainer: {
    gap: 16,
    paddingBottom: 30,
  },
});

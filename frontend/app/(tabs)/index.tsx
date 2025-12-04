import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useWeather } from '../../src/hooks/useWeather';
import Header from '../../src/components/Header';

export default function HomeScreen() {
  const { user, profileImage, currentRoleLabel } = useAuth();
  const { colors } = useTheme();
  const weather = useWeather();
  const router = useRouter();

  function handleCreateQuotation() {
    router.push('/(tabs)/create-quotation');
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
    router.push('/(tabs)/deu-agro');
  }

  function handleHerdControl() {
    router.push('/(tabs)/herd-control');
  }

  function handleProfile() {
    router.push('/(tabs)/profile');
  }

  function handleMessages() {
    router.push('/(tabs)/messages');
  }

  function handleIndicators() {
    Alert.alert(
      'Em Desenvolvimento',
      'A funcionalidade de Indicadores será disponibilizada na versão 2.0 do aplicativo.',
      [{ text: 'OK' }]
    );
  }

  const isProducer = user?.role === 'buyer';
  const isPecuarista = user?.producer_type === 'pecuarista' || user?.producer_type === 'ambos';
  const showHerdControl = isProducer && isPecuarista;

  const newQuotationText = isProducer ? 'Nova\nCotação' : 'Nova\nOferta';
  const myQuotationsText = isProducer ? 'Minhas\nCotações' : 'Minhas\nOfertas';

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
        showBackButton={false}
        onProfilePress={handleProfile}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.weatherCard, { backgroundColor: colors.surfaceOverlay }]}>
          {weather.loading ? (
            <View style={styles.weatherLoading}>
              <ActivityIndicator size="large" color={colors.white} />
              <Text style={[styles.weatherLoadingText, { color: colors.white }]}>
                Carregando clima...
              </Text>
            </View>
          ) : weather.error ? (
            <View style={styles.weatherError}>
              <Ionicons name="alert-circle-outline" size={40} color={colors.error} />
              <Text style={[styles.weatherErrorText, { color: colors.white }]}>
                {weather.error}
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.weatherHeader}>
                <View>
                  <View style={styles.weatherLocationRow}>
                    <Ionicons name={weather.icon as any} size={40} color={colors.white} />
                    <View style={styles.weatherLocationInfo}>
                      <Text style={[styles.weatherCity, { color: colors.white }]}>
                        {weather.city}
                      </Text>
                      <Text style={[styles.weatherDate, { color: colors.white }]}>
                        {weather.description}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={[styles.weatherTemp, { color: colors.white }]}>
                  {weather.temperature}°C
                </Text>
              </View>
              <View style={styles.weatherDetails}>
                <View style={styles.weatherDetailItem}>
                  <Ionicons name="water" size={20} color={colors.blue} />
                  <Text style={[styles.weatherDetailText, { color: colors.white }]}>
                    {weather.humidity}%{'\n'}Umidade
                  </Text>
                </View>
                <View style={styles.weatherDetailItem}>
                  <MaterialCommunityIcons name="weather-windy" size={20} color={colors.success} />
                  <Text style={[styles.weatherDetailText, { color: colors.white }]}>
                    {weather.windSpeed} km/h{'\n'}Vento
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        <View style={styles.navigationSection}>
          <TouchableOpacity style={[styles.navButton, { backgroundColor: colors.gray }]} onPress={handleCreateQuotation}>
            <Ionicons name="add-circle-outline" size={40} color={colors.white} />
            <Text style={[styles.navButtonText, { color: colors.white }]}>{newQuotationText}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navButton, { backgroundColor: colors.gray }]} onPress={handleMyQuotations}>
            <Ionicons name="checkmark-circle-outline" size={40} color={colors.white} />
            <Text style={[styles.navButtonText, { color: colors.white }]}>{myQuotationsText}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navButton, { backgroundColor: colors.gray }]} onPress={handleCart}>
            <Ionicons name="cart-outline" size={40} color={colors.white} />
            <Text style={[styles.navButtonText, { color: colors.white }]}>Carrinho</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.navigationSection}>
          <TouchableOpacity style={[styles.navButton, { backgroundColor: colors.gray }]} onPress={handleTrackOrder}>
            <Ionicons name="cube-outline" size={40} color={colors.white} />
            <Text style={[styles.navButtonText, { color: colors.white }]}>Acompanhar{'\n'}Pedidos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navButton, { backgroundColor: colors.gray }]} onPress={handleMessages}>
            <Ionicons name="chatbubbles-outline" size={40} color={colors.white} />
            <Text style={[styles.navButtonText, { color: colors.white }]}>Mensagens</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navButton, { backgroundColor: colors.gray }]} onPress={handleSocial}>
            <FontAwesome5 name="handshake" size={40} color={colors.white} />
            <Text style={[styles.navButtonText, { color: colors.white }]}>Deu Agro</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.navigationSection}>
          <TouchableOpacity style={[styles.navButton, { backgroundColor: colors.gray }]} onPress={handleIndicators}>
            <Ionicons name="trending-up" size={40} color={colors.white} />
            <Text style={[styles.navButtonText, { color: colors.white }]}>Indicadores</Text>
          </TouchableOpacity>
          {showHerdControl && (
            <TouchableOpacity style={[styles.navButton, { backgroundColor: colors.gray }]} onPress={handleHerdControl}>
              <Ionicons name="stats-chart-outline" size={40} color={colors.white} />
              <Text style={[styles.navButtonText, { color: colors.white }]}>Controle de{'\n'}Rebanho</Text>
            </TouchableOpacity>
          )}
          {!showHerdControl && <View style={styles.navButton} />}
          <View style={styles.navButton} />
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
  weatherCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  weatherLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  weatherLoadingText: {
    fontSize: 14,
  },
  weatherError: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  weatherErrorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  weatherLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weatherLocationInfo: {
    gap: 4,
  },
  weatherCity: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  weatherDate: {
    fontSize: 12,
  },
  weatherTemp: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 20,
    marginVertical: 12,
  },
  weatherDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weatherDetailText: {
    fontSize: 12,
  },
  weatherForecastButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  weatherForecastText: {
    fontSize: 13,
  },
  viewMoreButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
  },
  viewMoreText: {
    fontSize: 13,
    fontWeight: '600',
  },
  navigationSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  navButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    maxWidth: '31%',
  },
  navButtonText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
});

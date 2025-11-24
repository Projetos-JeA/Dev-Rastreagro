import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';

export default function CartScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <ImageBackground
      source={require('../../assets/background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={[styles.overlay, { backgroundColor: colors.backgroundOverlay }]} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.header, { marginTop: Platform.OS === 'ios' ? 30 : 20 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerText, { color: colors.text }]}>Carrinho</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={[styles.card, { backgroundColor: colors.cardBackground, shadowColor: colors.shadowColor }]}>
            <Ionicons name="cart" size={64} color={colors.iconCart} />
            <Text style={[styles.title, { color: colors.text }]}>
              Seu Carrinho
            </Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              Gerencie os produtos e serviços selecionados antes de finalizar sua compra.
            </Text>
          </View>

          <View style={[styles.infoContainer, { backgroundColor: colors.cardBackground, shadowColor: colors.shadowColor }]}>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Funcionalidades em desenvolvimento:
            </Text>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[styles.featureText, { color: colors.text }]}>
                Lista de produtos adicionados
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[styles.featureText, { color: colors.text }]}>
                Alterar quantidade de itens
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[styles.featureText, { color: colors.text }]}>
                Calcular frete e total
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[styles.featureText, { color: colors.text }]}>
                Finalizar pedido
              </Text>
            </View>
          </View>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  backButton: {
    paddingTop: 8,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 28,
  },
  content: {
    gap: 20,
  },
  card: {
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  infoContainer: {
    borderRadius: 16,
    padding: 20,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    flex: 1,
  },
});

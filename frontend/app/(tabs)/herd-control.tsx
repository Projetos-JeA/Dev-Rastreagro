import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import Header from '../../src/components/Header';

export default function HerdControlScreen() {
  const { colors } = useTheme();
  const { user, profileImage, currentRoleLabel } = useAuth();
  const router = useRouter();

  // Dados mockados - futuramente virão da API
  const herdStats = {
    total: 0,
    categories: [
      { name: 'Cria', count: 0, icon: 'baby-carriage' },
      { name: 'Recria', count: 0, icon: 'cow' },
      { name: 'Engorda', count: 0, icon: 'scale' },
    ],
  };

  function handleAddAnimal() {
    Alert.alert(
      'Em Desenvolvimento',
      'A funcionalidade de cadastro de animais será disponibilizada em breve.',
      [{ text: 'OK' }]
    );
  }

  function handleWeighing() {
    Alert.alert(
      'Em Desenvolvimento',
      'A funcionalidade de controle de pesagem será disponibilizada em breve.',
      [{ text: 'OK' }]
    );
  }

  function handleVaccination() {
    Alert.alert(
      'Em Desenvolvimento',
      'A funcionalidade de controle de vacinação será disponibilizada em breve.',
      [{ text: 'OK' }]
    );
  }

  function handleReports() {
    Alert.alert(
      'Em Desenvolvimento',
      'A funcionalidade de relatórios será disponibilizada em breve.',
      [{ text: 'OK' }]
    );
  }

  function handleProfile() {
    router.push('/(tabs)/profile');
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
        screenTitle="Controle de Rebanho"
        onBackPress={() => router.back()}
        onProfilePress={handleProfile}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.summaryCard, { backgroundColor: colors.surfaceOverlay }]}>
          <View style={styles.summaryHeader}>
            <MaterialCommunityIcons name="cow" size={32} color={colors.white} />
            <View style={styles.summaryInfo}>
              <Text style={[styles.summaryTitle, { color: colors.white }]}>
                Total de Animais
              </Text>
              <Text style={[styles.summaryValue, { color: colors.white }]}>
                {herdStats.total}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.categoriesContainer}>
          {herdStats.categories.map((category, index) => (
            <View
              key={index}
              style={[styles.categoryCard, { backgroundColor: colors.gray }]}
            >
              <MaterialCommunityIcons
                name={category.icon as any}
                size={28}
                color={colors.white}
              />
              <Text style={[styles.categoryCount, { color: colors.white }]}>
                {category.count}
              </Text>
              <Text style={[styles.categoryName, { color: colors.white }]}>
                {category.name}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.actionsSection}>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={handleAddAnimal}
            >
              <Ionicons name="add-circle-outline" size={32} color={colors.white} />
              <Text style={[styles.actionButtonText, { color: colors.white }]}>
                Adicionar{'\n'}Animal
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.gray }]}
              onPress={handleWeighing}
            >
              <MaterialCommunityIcons name="scale" size={32} color={colors.white} />
              <Text style={[styles.actionButtonText, { color: colors.white }]}>
                Registrar{'\n'}Pesagem
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.gray }]}
              onPress={handleVaccination}
            >
              <MaterialCommunityIcons name="needle" size={32} color={colors.white} />
              <Text style={[styles.actionButtonText, { color: colors.white }]}>
                Controle de{'\n'}Vacinação
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.gray }]}
              onPress={handleReports}
            >
              <Ionicons name="bar-chart-outline" size={32} color={colors.white} />
              <Text style={[styles.actionButtonText, { color: colors.white }]}>
                Relatórios
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={[styles.infoCard, { backgroundColor: colors.surfaceOverlay }]}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={24} color={colors.blue} />
              <Text style={[styles.infoTitle, { color: colors.white }]}>
                Sobre o Controle de Rebanho
              </Text>
            </View>
            <Text style={[styles.infoText, { color: colors.white }]}>
              Gerencie seu rebanho de forma completa: cadastre animais, controle pesagens,
              acompanhe vacinações e tenha acesso a relatórios detalhados sobre o desempenho
              do seu rebanho.
            </Text>
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  categoriesContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  categoryCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  categoryCount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  categoryName: {
    fontSize: 12,
    textAlign: 'center',
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: '48%',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 120,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: 16,
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

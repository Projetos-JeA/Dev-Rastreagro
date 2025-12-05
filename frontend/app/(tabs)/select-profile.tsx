import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';

export default function SelectProfileScreen() {
  const { colors } = useTheme();
  const { user, availableRoles, setActiveRole } = useAuth();
  const router = useRouter();

  const roleConfig: Record<string, { label: string; icon: string; description: string; colorKey: 'gray' }> = {
    buyer: {
      label: 'Produtor',
      icon: 'cart-outline',
      description: 'Acesse o marketplace e compre produtos agropecuários',
      colorKey: 'gray',
    },
    seller: {
      label: 'Fornecedor',
      icon: 'storefront-outline',
      description: 'Venda produtos e gerencie suas cotações',
      colorKey: 'gray',
    },
    service_provider: {
      label: 'Prestador de Serviço',
      icon: 'construct-outline',
      description: 'Ofereça e gerencie seus serviços agropecuários',
      colorKey: 'gray',
    },
  };

  function handleSelectProfile(role: string) {
    setActiveRole(role);
    router.replace('/(tabs)/');
  }

  if (!availableRoles || availableRoles.length === 0) {
    return null;
  }

  return (
    <ImageBackground
      source={require('../../assets/background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.content}>
        <View style={[styles.headerCard, { backgroundColor: colors.cardBackground }]}>
          <Ionicons name="people-circle-outline" size={64} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>
            Olá, {user?.nickname || 'Usuário'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Selecione seu perfil de acesso
          </Text>
        </View>

        <View style={styles.profilesContainer}>
          {availableRoles.map((role) => {
            const config = roleConfig[role];
            if (!config) return null;

            const roleColor = colors[config.colorKey];

            return (
              <TouchableOpacity
                key={role}
                style={[
                  styles.profileCard,
                  {
                    backgroundColor: colors.cardBackground,
                    shadowColor: colors.shadowColor,
                  },
                ]}
                onPress={() => handleSelectProfile(role)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: roleColor },
                  ]}
                >
                  <Ionicons name={config.icon as any} size={28} color={colors.white} />
                </View>
                <View style={styles.profileInfo}>
                  <Text style={[styles.profileLabel, { color: colors.text }]}>
                    {config.label}
                  </Text>
                  <Text style={[styles.profileDescription, { color: colors.textSecondary }]}>
                    {config.description}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            );
          })}
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
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingHorizontal: 20,
    gap: 24,
  },
  headerCard: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 16,
    gap: 12,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  profilesContainer: {
    gap: 16,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    gap: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  profileLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  profileDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});

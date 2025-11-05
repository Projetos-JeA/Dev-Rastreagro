/**
 * Home Screen
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [healthStatus, setHealthStatus] = React.useState<any>(null);

  React.useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const response = await api.get('/health');
      setHealthStatus(response.data);
    } catch (error) {
      console.error('Health check failed:', error);
    }
  };

  const userTypeLabel = user?.tipo === 'cliente' ? 'Cliente' : 'Empresa';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bem-vindo ao RastreAgro</Text>
        <Text style={styles.subtitle}>Perfil: {userTypeLabel}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Status da API</Text>
          {healthStatus ? (
            <View>
              <Text style={styles.cardText}>
                Status: {healthStatus.status}
              </Text>
              <Text style={styles.cardText}>
                Serviço: {healthStatus.service}
              </Text>
            </View>
          ) : (
            <Text style={styles.cardText}>Carregando...</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Funcionalidades</Text>
          <Text style={styles.cardText}>
            • Buscar animais{'\n'}
            • Cadastrar animais (empresa){'\n'}
            • Match automático{'\n'}
            • Chat interno{'\n'}
            • Pagamento com retenção{'\n'}
            • NF-e
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#2E7D32',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#E8F5E9',
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  logoutButton: {
    backgroundColor: '#F44336',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});


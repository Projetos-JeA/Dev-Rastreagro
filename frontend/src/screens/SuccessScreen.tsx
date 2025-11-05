/**
 * Success Screen - Tela exibida após login bem-sucedido
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function SuccessScreen() {
  const { user, logout } = useAuth();

  const profileLabel = user?.tipo === 'empresa' ? 'Vendedor' : 'Comprador';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
        
        <Text style={styles.title}>Login efetuado com sucesso!</Text>
        
        <Text style={styles.subtitle}>
          Bem-vindo ao RastreAgro
        </Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Perfil:</Text>
          <Text style={styles.infoValue}>{profileLabel}</Text>
          
          {user?.email && (
            <>
              <Text style={[styles.infoLabel, styles.infoLabelMargin]}>Email:</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </>
          )}
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={logout}
        >
          <Text style={styles.logoutButtonText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  checkmark: {
    fontSize: 50,
    color: '#fff',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  infoLabelMargin: {
    marginTop: 15,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
  },
  logoutButton: {
    backgroundColor: '#F44336',
    borderRadius: 8,
    padding: 15,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});


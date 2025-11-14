/**
 * Tela inicial apresentada após o login
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen() {
  const { logout, user } = useAuth();

  const roleLabel: Record<string, string> = {
    buyer: 'Comprador',
    seller: 'Vendedor / Empresa',
    service_provider: 'Prestador de Serviço',
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Bem-vindo ao RastreAgro</Text>
      <Text style={styles.subtitle}>Você está autenticado com sucesso.</Text>

      {user && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dados do usuário</Text>
          <Text style={styles.cardItem}>Email: {user.email}</Text>
          <Text style={styles.cardItem}>
            Perfil: {roleLabel[String(user.role)] ?? String(user.role)}
          </Text>
          {user.nickname && <Text style={styles.cardItem}>Apelido: {user.nickname}</Text>}

          {user.role === 'seller' && user.company && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dados da empresa</Text>
              <Text style={styles.cardItem}>Propriedade: {user.company.nome_propriedade}</Text>
              <Text style={styles.cardItem}>CNPJ/CPF: {user.company.cnpj_cpf}</Text>
              <Text style={styles.cardItem}>
                Cidade/UF: {user.company.cidade} - {user.company.estado}
              </Text>
              <Text style={styles.cardItem}>Email comercial: {user.company.email}</Text>
              <Text style={styles.sectionTitle}>Atividades cadastradas</Text>
              {user.company.activities?.length ? (
                user.company.activities.map((activity, index) => (
                  <Text key={index} style={styles.cardItem}>
                    {activity.category?.name}
                    {activity.group ? ` / ${activity.group.name}` : ''}
                    {activity.item ? ` / ${activity.item.name}` : ''}
                  </Text>
                ))
              ) : (
                <Text style={styles.cardItem}>Nenhuma atividade vinculada.</Text>
              )}
            </View>
          )}

          {user.role === 'service_provider' && user.service_profile && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dados do prestador</Text>
              <Text style={styles.cardItem}>Serviço: {user.service_profile.nome_servico}</Text>
              {user.service_profile.descricao ? (
                <Text style={styles.cardItem}>Descrição: {user.service_profile.descricao}</Text>
              ) : null}
              {user.service_profile.telefone ? (
                <Text style={styles.cardItem}>Telefone: {user.service_profile.telefone}</Text>
              ) : null}
              <Text style={styles.cardItem}>Contato: {user.service_profile.email_contato}</Text>
              <Text style={styles.cardItem}>
                Região: {user.service_profile.cidade} - {user.service_profile.estado}
              </Text>
            </View>
          )}
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'left',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1B5E20',
    marginBottom: 12,
  },
  cardItem: {
    fontSize: 16,
    color: '#424242',
    marginBottom: 6,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 8,
  },
  logoutButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 'auto',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

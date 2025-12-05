import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ProductDiagramModalProps {
  profileType: 'agricultor' | 'pecuarista' | 'ambos' | 'prestador';
}

export default function ProductDiagramModal({ profileType }: ProductDiagramModalProps) {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const getDiagramData = () => {
    switch (profileType) {
      case 'pecuarista':
        return {
          title: 'Diagrama de Produtos - Pecuarista',
          categories: [
            {
              name: 'Alimentação Animal',
              items: [
                'Ração para Gado de Corte',
                'Ração para Gado Leiteiro',
                'Sal Mineral',
                'Suplementos',
                'Forragens (Silagem, Feno)',
                'Concentrados',
              ],
            },
            {
              name: 'Saúde e Medicamentos',
              items: [
                'Vacinas (Febre Aftosa, Brucelose)',
                'Vermífugos (Ivermectina)',
                'Antibióticos',
                'Anti-inflamatórios',
                'Vitaminas e Probióticos',
              ],
            },
            {
              name: 'Equipamentos',
              items: [
                'Cercas (Arame Farpado)',
                'Bebedouros e Comedouros',
                'Equipamentos de Manejo',
                'Equipamentos de Identificação',
                'Equipamentos de Ordenha',
              ],
            },
            {
              name: 'Serviços',
              items: [
                'Inseminação Artificial',
                'Vacinação',
                'Tratamento Veterinário',
                'Consultoria em Nutrição',
                'Consultoria em Reprodução',
              ],
            },
          ],
        };
      case 'agricultor':
        return {
          title: 'Diagrama de Produtos - Agricultor',
          categories: [
            {
              name: 'Sementes',
              items: [
                'Sementes de Soja',
                'Sementes de Milho',
                'Sementes de Algodão',
                'Sementes de Feijão',
                'Sementes de Arroz',
                'Sementes de Pastagem',
              ],
            },
            {
              name: 'Fertilizantes',
              items: [
                'Fertilizantes NPK',
                'Ureia',
                'Superfosfato',
                'Cloreto de Potássio',
                'Calcário Agrícola',
              ],
            },
            {
              name: 'Defensivos',
              items: [
                'Herbicidas (Glifosato)',
                'Inseticidas',
                'Fungicidas',
                'Adjuvantes',
              ],
            },
            {
              name: 'Máquinas e Equipamentos',
              items: [
                'Tratores',
                'Plantadeiras',
                'Colheitadeiras',
                'Pulverizadores',
                'Sistemas de Irrigação',
              ],
            },
            {
              name: 'Serviços',
              items: [
                'Plantio',
                'Colheita',
                'Pulverização',
                'Consultoria Agrícola',
                'Análise de Solo',
              ],
            },
          ],
        };
      case 'ambos':
        return {
          title: 'Diagrama de Produtos - Produtor Integrado (ILP)',
          categories: [
            {
              name: 'Agricultura',
              items: [
                'Tudo do diagrama de Agricultor',
                'Sementes de Soja/Milho',
                'Fertilizantes',
                'Defensivos',
                'Máquinas Agrícolas',
              ],
            },
            {
              name: 'Pecuária',
              items: [
                'Tudo do diagrama de Pecuarista',
                'Ração para Gado',
                'Sal Mineral',
                'Vacinas',
                'Equipamentos Pecuários',
              ],
            },
            {
              name: 'Integração (ILP)',
              items: [
                'Sementes de Pastagem',
                'Adubo para Pastagem',
                'Rotação de Culturas',
                'Sistemas Agroflorestais',
              ],
            },
          ],
        };
      case 'prestador':
        return {
          title: 'Diagrama de Serviços - Prestador',
          categories: [
            {
              name: 'Serviços Agrícolas',
              items: [
                'Plantio e Semeadura',
                'Colheita',
                'Pulverização',
                'Aplicação de Insumos',
                'Preparo do Solo',
                'Irrigação',
              ],
            },
            {
              name: 'Serviços Pecuários',
              items: [
                'Inseminação Artificial',
                'Vacinação',
                'Tratamento Veterinário',
                'Consultoria em Nutrição',
                'Consultoria em Reprodução',
                'Manejo de Animais',
              ],
            },
            {
              name: 'Análises e Laboratório',
              items: [
                'Análise de Solo',
                'Análise Foliar',
                'Análise de Ração',
                'Análise de Leite',
              ],
            },
            {
              name: 'Tecnologia',
              items: [
                'Mapeamento de Produtividade',
                'Pulverização Aérea (Drones)',
                'Agricultura de Precisão',
                'Sistemas de Gestão',
              ],
            },
            {
              name: 'Infraestrutura',
              items: [
                'Construção de Silos',
                'Construção de Galpões',
                'Instalação de Cercas',
                'Manutenção de Máquinas',
              ],
            },
          ],
        };
      default:
        return { title: 'Diagrama de Produtos', categories: [] };
    }
  };

  const diagramData = getDiagramData();

  return (
    <>
      <TouchableOpacity
        style={[styles.iconButton, { backgroundColor: colors.cardBackground }]}
        onPress={() => setVisible(true)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {diagramData.title}
              </Text>
              <TouchableOpacity
                onPress={() => setVisible(false)}
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={[styles.description, { color: colors.textSecondary }]}>
                Este diagrama mostra os produtos e serviços mais relevantes para seu perfil.
                Use como referência para entender o que a IA deve priorizar.
              </Text>

              {diagramData.categories.map((category, index) => (
                <View key={index} style={styles.categoryContainer}>
                  <TouchableOpacity
                    style={[
                      styles.categoryHeader,
                      {
                        backgroundColor: selectedCategory === category.name ? colors.primary + '20' : colors.background,
                        borderColor: colors.cardBorder,
                      },
                    ]}
                    onPress={() =>
                      setSelectedCategory(selectedCategory === category.name ? null : category.name)
                    }
                  >
                    <Text style={[styles.categoryName, { color: colors.text }]}>
                      {category.name}
                    </Text>
                    <Ionicons
                      name={selectedCategory === category.name ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>

                  {selectedCategory === category.name && (
                    <View style={[styles.itemsContainer, { backgroundColor: colors.background }]}>
                      {category.items.map((item, itemIndex) => (
                        <View
                          key={itemIndex}
                          style={[styles.itemRow, { borderBottomColor: colors.cardBorder }]}
                        >
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color={colors.success}
                            style={styles.itemIcon}
                          />
                          <Text style={[styles.itemText, { color: colors.text }]}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}

              <View style={[styles.footer, { backgroundColor: colors.background }]}>
                <Ionicons name="information-circle" size={20} color={colors.info} />
                <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                  A IA usa este diagrama para calcular a relevância dos produtos. Quanto mais
                  alinhado com seu perfil, maior o score de relevância.
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.9,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
    textAlign: 'center',
  },
  categoryContainer: {
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemsContainer: {
    marginTop: 8,
    borderRadius: 12,
    padding: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  itemIcon: {
    marginRight: 12,
  },
  itemText: {
    fontSize: 14,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 12,
  },
  footerText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
});


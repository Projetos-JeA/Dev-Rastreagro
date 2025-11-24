import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, DimensionValue, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface MultiSelectProps {
  label: string;
  required?: boolean;
  options: { label: string; value: string }[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  error?: string;
  allowCustom?: boolean;
  customValues?: string[];
  onAddCustom?: (value: string) => void;
  onRemoveCustom?: (value: string) => void;
  itemsPerRow?: number;
}

export default function MultiSelect({
  label,
  required = false,
  options,
  selectedValues,
  onToggle,
  error,
  allowCustom = false,
  customValues = [],
  onAddCustom,
  onRemoveCustom,
  itemsPerRow = 3,
}: MultiSelectProps) {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [newCustomValue, setNewCustomValue] = useState('');

  function getItemWidth(itemsInRow: number): DimensionValue {
    const gap = 10;
    const totalGaps = (itemsInRow - 1) * gap;
    const width = (100 - totalGaps / 3.7) / itemsInRow;
    return `${width}%` as DimensionValue;
  }

  function handleAddCustom() {
    if (newCustomValue.trim() && onAddCustom) {
      onAddCustom(newCustomValue.trim());
      setNewCustomValue('');
      setModalVisible(false);
    }
  }

  function handleRemoveCustom(value: string) {
    if (onRemoveCustom) {
      onRemoveCustom(value);
    }
  }

  const allItems = [...options];
  const rows: Array<typeof allItems> = [];
  for (let i = 0; i < allItems.length; i += itemsPerRow) {
    rows.push(allItems.slice(i, i + itemsPerRow));
  }

  const customRows: string[][] = [];
  for (let i = 0; i < customValues.length; i += itemsPerRow) {
    customRows.push(customValues.slice(i, i + itemsPerRow));
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>
        {label}
        {required && <Text style={{ color: colors.error }}> *</Text>}
      </Text>

      <View style={styles.rowsContainer}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((option) => {
              const isSelected = selectedValues.includes(option.value);
              const itemsInRow = row.length + (rowIndex === rows.length - 1 && allowCustom && customValues.length === 0 ? 1 : 0);

              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.inputBorder,
                      width: getItemWidth(itemsInRow),
                    },
                  ]}
                  onPress={() => onToggle(option.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: isSelected ? colors.white : colors.text,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {rowIndex === rows.length - 1 && allowCustom && customValues.length === 0 && (
              <TouchableOpacity
                style={[
                  styles.chip,
                  styles.addButton,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.primary,
                    width: getItemWidth(row.length + 1),
                  },
                ]}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={20} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {customValues.length > 0 && (
          <>
            {customRows.map((row, rowIndex) => (
              <View key={`custom-${rowIndex}`} style={styles.row}>
                {row.map((customValue) => (
                  <View
                    key={customValue}
                    style={[
                      styles.chip,
                      styles.customChip,
                      {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                        width: getItemWidth(row.length + (rowIndex === customRows.length - 1 ? 1 : 0)),
                      },
                    ]}
                  >
                    <Text
                      style={[styles.chipText, { color: colors.white, flex: 1 }]}
                      numberOfLines={1}
                    >
                      {customValue}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveCustom(customValue)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="close-circle" size={18} color={colors.white} />
                    </TouchableOpacity>
                  </View>
                ))}
                {rowIndex === customRows.length - 1 && (
                  <TouchableOpacity
                    style={[
                      styles.chip,
                      styles.addButton,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.primary,
                        width: getItemWidth(row.length + 1),
                      },
                    ]}
                    onPress={() => setModalVisible(true)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={20} color={colors.primary} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </>
        )}
      </View>

      {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Adicionar opção</Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  color: colors.inputText,
                  borderColor: colors.inputBorder,
                  backgroundColor: colors.background,
                },
              ]}
              value={newCustomValue}
              onChangeText={setNewCustomValue}
              placeholder="Digite sua opção"
              placeholderTextColor={colors.textPlaceholder}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.surface, borderColor: colors.inputBorder, borderWidth: 1 }]}
                onPress={() => {
                  setNewCustomValue('');
                  setModalVisible(false);
                }}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleAddCustom}
              >
                <Text style={[styles.modalButtonText, { color: colors.white }]}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  rowsContainer: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 10,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customChip: {
    flexDirection: 'row',
    paddingRight: 8,
  },
  addButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 12,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

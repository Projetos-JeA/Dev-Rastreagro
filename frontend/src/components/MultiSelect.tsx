import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Input from './Input';

interface MultiSelectProps {
  label: string;
  required?: boolean;
  options: { label: string; value: string }[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  error?: string;
  allowCustom?: boolean;
  customValue?: string;
  onCustomChange?: (value: string) => void;
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
  customValue = '',
  onCustomChange,
  itemsPerRow = 3,
}: MultiSelectProps) {
  const { colors } = useTheme();

  const allOptions = allowCustom
    ? [...options, { label: 'Outros', value: 'outros' }]
    : options;

  const rows: Array<typeof allOptions> = [];
  for (let i = 0; i < allOptions.length; i += itemsPerRow) {
    rows.push(allOptions.slice(i, i + itemsPerRow));
  }

  const showCustomInput = allowCustom && selectedValues.includes('outros');

  const getItemWidth = (itemsInRow: number): string => {
    const gap = 10;
    const totalGaps = (itemsInRow - 1) * gap;
    const width = (100 - totalGaps / 3.7) / itemsInRow;
    return `${width}%`;
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <View style={styles.rowsContainer}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((option) => {
              const isSelected = selectedValues.includes(option.value);
              const itemsInRow = row.length;

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
                        color: isSelected ? '#FFFFFF' : colors.text,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {showCustomInput && (
        <Input
          label=""
          value={customValue}
          onChangeText={onCustomChange || (() => { })}
          placeholder="Digite as outras opções separadas por vírgula"
          multiline
        />
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
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
  required: {
    color: '#F44336',
  },
  rowsContainer: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 8,
  },
});

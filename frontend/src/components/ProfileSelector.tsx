import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export type ProfileType = 'producer' | 'supplier' | 'service_provider';

interface ProfileOption {
  type: ProfileType;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

interface ProfileSelectorProps {
  selectedProfiles: ProfileType[];
  onSelectProfile: (profile: ProfileType) => void;
  required?: boolean;
}

const profileOptions: ProfileOption[] = [
  {
    type: 'producer',
    label: 'Produtor',
    icon: 'tractor',
  },
  {
    type: 'supplier',
    label: 'Fornecedor',
    icon: 'factory',
  },
  {
    type: 'service_provider',
    label: 'Prestador de\nserviços',
    icon: 'tools',
  },
];

export default function ProfileSelector({
  selectedProfiles,
  onSelectProfile,
  required = false,
}: ProfileSelectorProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>
        Selecione o tipo de perfil (1 ou 2)
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <View style={styles.optionsContainer}>
        {profileOptions.map((option) => {
          const isSelected = selectedProfiles.includes(option.type);
          return (
            <TouchableOpacity
              key={option.type}
              style={[
                styles.optionButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: isSelected ? colors.primary : colors.inputBorder,
                },
                isSelected && styles.optionButtonSelected,
              ]}
              onPress={() => onSelectProfile(option.type)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={option.icon}
                size={40}
                color={isSelected ? colors.primary : colors.text}
                style={styles.optionIcon}
              />
              <Text
                style={[
                  styles.optionLabel,
                  { color: colors.text },
                  isSelected && { fontWeight: '600' },
                ]}
                numberOfLines={2}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 25,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 15,
  },
  required: {
    color: '#F44336',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: 100,
  },
  optionButtonSelected: {
    borderWidth: 2.5,
  },
  optionIcon: {
    marginTop: 5,
    marginBottom: 10,
    height: 40,
  },
  optionLabel: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    minHeight: 32,
  },
});

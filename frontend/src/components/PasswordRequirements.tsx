import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { PasswordRequirement } from '../utils/validators';

interface PasswordRequirementsProps {
  requirements: PasswordRequirement[];
  showAll?: boolean;
}

export default function PasswordRequirements({ requirements, showAll = true }: PasswordRequirementsProps) {
  const { colors } = useTheme();

  const itemsToShow = showAll ? requirements : requirements.filter(r => !r.met);

  if (itemsToShow.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.textSecondary }]}>
        Requisitos da senha:
      </Text>
      {itemsToShow.map(function renderRequirement(req) {
        return (
          <View key={req.key} style={styles.requirementRow}>
            <Text style={[styles.icon, { color: req.met ? colors.success : colors.textSecondary }]}>
              {req.met ? '✓' : '○'}
            </Text>
            <Text
              style={[
                styles.label,
                { color: req.met ? colors.success : colors.textSecondary },
              ]}
            >
              {req.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    fontSize: 12,
    marginRight: 8,
    width: 14,
  },
  label: {
    fontSize: 12,
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface MenuCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
  iconColor: string;
}

export default function MenuCard({ icon, title, onPress, iconColor }: MenuCardProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.menuCard, { backgroundColor: colors.cardBackground, shadowColor: colors.shadowColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
        <Ionicons name={icon} size={32} color="#FFFFFF" />
      </View>
      <Text style={[styles.menuCardText, { color: colors.text }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuCardText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  userName?: string | null;
  userRole: string;
  profileImage?: string | null;
  showBackButton?: boolean;
  screenTitle?: string;
  onBackPress?: () => void;
  onProfilePress: () => void;
}

export default function Header({
  userName,
  userRole,
  profileImage,
  showBackButton = false,
  screenTitle,
  onBackPress,
  onProfilePress,
}: HeaderProps) {
  const { colors } = useTheme();

  function handleLeftIconPress() {
    if (showBackButton && onBackPress) {
      onBackPress();
    } else {
      Alert.alert(
        'Em Desenvolvimento',
        'Funcionalidade em desenvolvimento!',
        [{ text: 'OK' }]
      );
    }
  }

  return (
    <View style={[styles.header, { backgroundColor: colors.gray }]}>
      <View style={styles.leftContainer}>
        <TouchableOpacity onPress={handleLeftIconPress}>
          <Ionicons
            name={showBackButton ? 'arrow-back' : 'ellipsis-horizontal'}
            size={28}
            color={colors.white}
          />
        </TouchableOpacity>
        {showBackButton && screenTitle && (
          <Text
            style={[styles.screenTitle, { color: colors.white }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {screenTitle}
          </Text>
        )}
      </View>
      <View style={styles.profileContainer}>
        <View style={styles.textContainer}>
          <Text
            style={[styles.greetingText, { color: colors.white }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            Olá, {userName || 'Usuário'}
          </Text>
          <Text
            style={[styles.subGreetingText, { color: colors.white }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {userRole}
          </Text>
        </View>
        <TouchableOpacity onPress={onProfilePress}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={[styles.profileImage, { borderColor: colors.white }]} />
          ) : (
            <View style={[styles.profilePlaceholder, { backgroundColor: colors.textSecondary, borderColor: colors.white }]}>
              <Ionicons name="person" size={24} color={colors.white} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 12,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 0,
  },
  textContainer: {
    alignItems: 'flex-end',
    maxWidth: 150,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subGreetingText: {
    fontSize: 12,
    opacity: 0.9,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
  },
  profilePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
});

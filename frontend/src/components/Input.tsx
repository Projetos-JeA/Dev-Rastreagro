import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  KeyboardTypeOptions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface InputProps extends TextInputProps {
  label: string;
  required?: boolean;
  error?: string;
  successMessage?: string;
  mask?: 'cpf' | 'phone' | 'date' | 'cnpj' | 'cep' | 'rg' | 'ie';
  isPassword?: boolean;
  rightIcon?: React.ReactNode;
}

export default function Input({
  label,
  required = false,
  error,
  successMessage,
  mask,
  isPassword = false,
  rightIcon,
  value,
  onChangeText,
  keyboardType,
  ...rest
}: InputProps) {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const applyMask = (text: string): string => {
    if (!mask) return text;

    const numbers = text.replace(/\D/g, '');

    switch (mask) {
      case 'cpf':
        return numbers
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d{1,2})/, '$1-$2')
          .replace(/(-\d{2})\d+?$/, '$1');

      case 'cnpj':
        return numbers
          .replace(/(\d{2})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1/$2')
          .replace(/(\d{4})(\d{1,2})/, '$1-$2')
          .replace(/(-\d{2})\d+?$/, '$1');

      case 'phone':
        return numbers
          .replace(/(\d{2})(\d)/, '+$1 $2')
          .replace(/(\d{2})(\d)/, '$1 $2')
          .replace(/(\d{1})(\d{4})(\d{4})/, '$1 $2-$3');

      case 'date':
        return numbers
          .replace(/(\d{2})(\d)/, '$1/$2')
          .replace(/(\d{2})(\d)/, '$1/$2')
          .replace(/(\d{4})\d+?$/, '$1');

      case 'cep':
        return numbers
          .replace(/(\d{5})(\d)/, '$1-$2')
          .replace(/(-\d{3})\d+?$/, '$1');

      case 'rg':
        return numbers
          .replace(/(\d{2})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d{1})/, '$1-$2')
          .replace(/(-\d{1})\d+?$/, '$1');

      case 'ie':
        return numbers
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})\d+?$/, '$1');

      default:
        return text;
    }
  };

  const handleChangeText = (text: string) => {
    if (mask && onChangeText) {
      const maskedText = applyMask(text);
      onChangeText(maskedText);
    } else if (onChangeText) {
      onChangeText(text);
    }
  };

  const getKeyboardType = (): KeyboardTypeOptions => {
    if (keyboardType) return keyboardType;
    if (mask === 'cpf' || mask === 'cnpj' || mask === 'phone' || mask === 'date' || mask === 'cep' || mask === 'rg' || mask === 'ie')
      return 'numeric';
    return 'default';
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              color: colors.inputText,
              borderBottomColor: isFocused ? colors.text : colors.inputBorder,
            },
            error ? styles.inputError : undefined,
            successMessage ? styles.inputSuccess : undefined,
            (isPassword || rightIcon) ? styles.inputWithIcon : undefined,
          ]}
          value={value}
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={colors.textPlaceholder}
          keyboardType={getKeyboardType()}
          secureTextEntry={isPassword && !showPassword}
          {...rest}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {successMessage && <Text style={styles.successText}>{successMessage}</Text>}
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
    marginBottom: 8,
  },
  required: {
    color: '#F44336',
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    backgroundColor: 'transparent',
  },
  inputWithIcon: {
    paddingRight: 40,
  },
  inputError: {
    borderBottomColor: '#F44336',
  },
  inputSuccess: {
    borderBottomColor: '#4CAF50',
  },
  eyeIcon: {
    position: 'absolute',
    right: 0,
    bottom: 8,
    padding: 4,
  },
  rightIcon: {
    position: 'absolute',
    right: 0,
    bottom: 8,
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 4,
  },
  successText: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
  },
});

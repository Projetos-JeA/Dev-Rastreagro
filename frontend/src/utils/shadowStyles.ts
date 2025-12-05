import { Platform, StyleSheet } from 'react-native';

/**
 * Cria estilos de sombra compatíveis com web e mobile
 * No React Native Web, usa boxShadow ao invés de shadow* props
 */
export function createShadowStyle(
  shadowColor: string = '#000',
  shadowOffset: { width: number; height: number } = { width: 0, height: 2 },
  shadowOpacity: number = 0.25,
  shadowRadius: number = 3.84,
  elevation?: number
) {
  if (Platform.OS === 'web') {
    // Para web, usa boxShadow CSS
    const blur = shadowRadius;
    const spread = 0;
    const x = shadowOffset.width;
    const y = shadowOffset.height;
    const color = shadowColor + Math.round(shadowOpacity * 255).toString(16).padStart(2, '0');
    
    return {
      boxShadow: `${x}px ${y}px ${blur}px ${spread}px ${color}`,
    };
  }

  // Para iOS/Android, usa shadow* props
  return {
    shadowColor,
    shadowOffset,
    shadowOpacity,
    shadowRadius,
    elevation: elevation || shadowRadius,
  };
}

/**
 * Estilos de sombra pré-definidos
 */
export const shadowStyles = StyleSheet.create({
  small: createShadowStyle('#000', { width: 0, height: 1 }, 0.1, 2, 2),
  medium: createShadowStyle('#000', { width: 0, height: 2 }, 0.15, 4, 4),
  large: createShadowStyle('#000', { width: 0, height: 4 }, 0.25, 8, 8),
});


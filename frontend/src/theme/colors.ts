export interface ThemeColors {
  background: string;
  backgroundOverlay: string;
  surface: string;
  text: string;
  textSecondary: string;
  textPlaceholder: string;
  primary: string;
  primaryDark: string;
  inputBorder: string;
  inputBackground: string;
  inputText: string;
  buttonBackground: string;
  buttonText: string;
  buttonSocialBackground: string;
  buttonSocialBorder: string;
  buttonSocialText: string;
  facebookColor: string;
  error: string;
  errorBackground: string;
  link: string;
  success: string;
  successLight: string;
  warning: string;
  info: string;
  iconQuotation: string;
  iconMyQuotations: string;
  iconCart: string;
  iconTrackOrder: string;
  iconSocial: string;
  iconHerdControl: string;
  cardBackground: string;
  cardBorder: string;
  cardAlt: string;
  shadowColor: string;
  white: string;
  modalOverlay: string;
}

export const lightTheme: ThemeColors = {
  background: 'rgba(255, 255, 255, 0.7)',
  backgroundOverlay: 'rgba(255, 255, 255, 0.7)',
  surface: '#FFFFFF',
  text: '#000000',
  textSecondary: '#555555',
  textPlaceholder: '#555555',
  primary: '#2E7D32',
  primaryDark: '#1B5E20',
  inputBorder: '#333333',
  inputBackground: 'transparent',
  inputText: '#000000',
  buttonBackground: '#4A4A4A',
  buttonText: '#FFFFFF',
  buttonSocialBackground: '#FFFFFF',
  buttonSocialBorder: '#DDDDDD',
  buttonSocialText: '#000000',
  facebookColor: '#1877F2',
  error: '#F44336',
  errorBackground: 'rgba(255, 235, 238, 0.9)',
  link: '#000000',
  success: '#4CAF50',
  successLight: '#E8F5E9',
  warning: '#FF9800',
  info: '#2196F3',
  iconQuotation: '#FFB300',
  iconMyQuotations: '#0288D1',
  iconCart: '#388E3C',
  iconTrackOrder: '#F57C00',
  iconSocial: '#E53935',
  iconHerdControl: '#8D6E63',
  cardBackground: 'rgba(255, 255, 255, 0.9)',
  cardBorder: '#E0E0E0',
  cardAlt: '#F5F5F5',
  shadowColor: '#000',
  white: '#FFFFFF',
  modalOverlay: 'rgba(0, 0, 0, 0.5)',
};

export const darkTheme: ThemeColors = {
  background: 'rgba(18, 18, 18, 0.95)',
  backgroundOverlay: 'rgba(18, 18, 18, 0.95)',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  textPlaceholder: '#888888',
  primary: '#4CAF50',
  primaryDark: '#2E7D32',
  inputBorder: '#CCCCCC',
  inputBackground: 'transparent',
  inputText: '#FFFFFF',
  buttonBackground: '#4CAF50',
  buttonText: '#FFFFFF',
  buttonSocialBackground: '#2A2A2A',
  buttonSocialBorder: '#444444',
  buttonSocialText: '#FFFFFF',
  facebookColor: '#1877F2',
  error: '#EF5350',
  errorBackground: 'rgba(211, 47, 47, 0.2)',
  link: '#FFFFFF',
  success: '#66BB6A',
  successLight: 'rgba(102, 187, 106, 0.2)',
  warning: '#FFA726',
  info: '#42A5F5',
  iconQuotation: '#FFD54F',
  iconMyQuotations: '#29B6F6',
  iconCart: '#66BB6A',
  iconTrackOrder: '#FF9800',
  iconSocial: '#EF5350',
  iconHerdControl: '#A1887F',
  cardBackground: 'rgba(30, 30, 30, 0.9)',
  cardBorder: '#444444',
  cardAlt: '#2A2A2A',
  shadowColor: '#000',
  white: '#FFFFFF',
  modalOverlay: 'rgba(0, 0, 0, 0.7)',
};

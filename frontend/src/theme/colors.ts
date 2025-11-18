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
};

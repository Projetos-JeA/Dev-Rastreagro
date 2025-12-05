import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import { CartProvider } from '../src/context/CartContext';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isAuthenticated, isLoading, needsProfileSelection } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inSelectProfile = segments[0] === '(tabs)' && segments[1] === 'select-profile';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      if (needsProfileSelection) {
        router.replace('/(tabs)/select-profile');
      } else {
        router.replace('/(tabs)');
      }
    } else if (isAuthenticated && needsProfileSelection && !inSelectProfile) {
      router.replace('/(tabs)/select-profile');
    }
  }, [isAuthenticated, isLoading, segments, needsProfileSelection]);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return (
    <CartProvider>
      <Slot />
    </CartProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </ThemeProvider>
  );
}

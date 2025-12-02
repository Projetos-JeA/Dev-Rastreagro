import { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import { CartProvider } from '../src/context/CartContext';
import * as SplashScreen from 'expo-splash-screen';
import CustomSplashScreen from '../src/components/SplashScreen';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isAuthenticated, isLoading, needsProfileSelection } = useAuth();
  const [appReady, setAppReady] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setAppReady(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  useEffect(() => {
    if (!appReady) return;

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
  }, [isAuthenticated, appReady, segments, needsProfileSelection]);

  if (!appReady) {
    return <CustomSplashScreen />;
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <RootLayoutNav />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

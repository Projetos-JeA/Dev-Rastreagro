import { Stack } from 'expo-router';

export default function TabsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="quotation" />
      <Stack.Screen name="my-quotations" />
      <Stack.Screen name="cart" />
      <Stack.Screen name="track-order" />
      <Stack.Screen name="social" />
    </Stack>
  );
}

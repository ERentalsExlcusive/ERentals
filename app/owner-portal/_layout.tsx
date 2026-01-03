import { Stack } from 'expo-router';
import { OwnerAuthProvider } from '@/context/owner-auth-context';

export default function OwnerPortalLayout() {
  return (
    <OwnerAuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="assets/index" />
        <Stack.Screen name="inquiries/index" />
      </Stack>
    </OwnerAuthProvider>
  );
}

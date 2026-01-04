/**
 * Reset Password Page
 * Handles password reset callback from Supabase email link
 */

import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { BrandColors } from '@/constants/theme';
import { Space, FontSize, LineHeight, FontWeight, Radius } from '@/constants/design-tokens';
import { useAuth } from '@/context/auth-context';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { updatePassword, isAuthenticated } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await updatePassword(password);

    setIsLoading(false);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || 'Failed to update password');
    }
  };

  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.successIcon}>
            <Feather name="check-circle" size={48} color="#22C55E" />
          </View>
          <Text style={styles.title}>Password Updated</Text>
          <Text style={styles.subtitle}>
            Your password has been successfully updated. You can now sign in with your new password.
          </Text>
          <Pressable style={styles.primaryButton} onPress={() => router.replace('/')}>
            <Text style={styles.primaryButtonText}>Go to Home</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Feather name="lock" size={32} color={BrandColors.secondary} />
        </View>
        <Text style={styles.title}>Set New Password</Text>
        <Text style={styles.subtitle}>
          Enter your new password below. Make sure it's at least 6 characters long.
        </Text>

        {error && (
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={16} color="#E63946" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>New Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter new password"
            placeholderTextColor={BrandColors.gray.medium}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm new password"
            placeholderTextColor={BrandColors.gray.medium}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoComplete="new-password"
          />
        </View>

        <Pressable
          style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={BrandColors.white} />
          ) : (
            <Text style={styles.primaryButtonText}>Update Password</Text>
          )}
        </Pressable>

        <Pressable style={styles.backLink} onPress={() => router.replace('/')}>
          <Feather name="arrow-left" size={16} color={BrandColors.gray.dark} />
          <Text style={styles.backLinkText}>Back to Home</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.gray.light,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Space[4],
  },
  card: {
    backgroundColor: BrandColors.white,
    borderRadius: Radius.xl,
    padding: Space[8],
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${BrandColors.secondary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: Space[4],
  },
  successIcon: {
    alignItems: 'center',
    marginBottom: Space[4],
  },
  title: {
    fontSize: FontSize['2xl'],
    lineHeight: LineHeight['2xl'],
    fontWeight: FontWeight.bold,
    color: BrandColors.black,
    textAlign: 'center',
    marginBottom: Space[2],
  },
  subtitle: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    color: BrandColors.gray.medium,
    textAlign: 'center',
    marginBottom: Space[6],
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[2],
    backgroundColor: '#FEE2E2',
    padding: Space[3],
    borderRadius: Radius.md,
    marginBottom: Space[4],
  },
  errorText: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: '#E63946',
    flex: 1,
  },
  inputContainer: {
    marginBottom: Space[4],
  },
  label: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    fontWeight: FontWeight.medium,
    color: BrandColors.black,
    marginBottom: Space[2],
  },
  input: {
    borderWidth: 1,
    borderColor: BrandColors.gray.border,
    borderRadius: Radius.md,
    padding: Space[4],
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    color: BrandColors.black,
    backgroundColor: BrandColors.white,
  },
  primaryButton: {
    backgroundColor: BrandColors.black,
    paddingVertical: Space[4],
    paddingHorizontal: Space[6],
    borderRadius: Radius.md,
    alignItems: 'center',
    marginTop: Space[2],
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    fontWeight: FontWeight.semibold,
    color: BrandColors.white,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space[2],
    paddingVertical: Space[4],
    marginTop: Space[2],
  },
  backLinkText: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    fontWeight: FontWeight.medium,
    color: BrandColors.gray.dark,
  },
});

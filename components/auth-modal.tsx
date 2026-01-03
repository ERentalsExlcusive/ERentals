/**
 * Auth Modal Component
 * Login/Signup modal for favorites sync
 */

import { useState } from 'react';
import { StyleSheet, View, Text, Pressable, TextInput, Modal, Platform, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BrandColors } from '@/constants/theme';
import { Space, FontSize, LineHeight, FontWeight, Radius } from '@/constants/design-tokens';
import { useAuth } from '@/context/auth-context';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'signup' | 'magic-link' | 'magic-link-sent';

export function AuthModal({ visible, onClose }: AuthModalProps) {
  const { signIn, signUp, signInWithMagicLink } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setError(null);
    setMode('login');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await signIn(email, password);

    setIsLoading(false);

    if (result.success) {
      handleClose();
    } else {
      setError(result.error || 'Login failed');
    }
  };

  const handleSignup = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await signUp(email, password, name || undefined);

    setIsLoading(false);

    if (result.success) {
      handleClose();
    } else {
      setError(result.error || 'Signup failed');
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await signInWithMagicLink(email);

    setIsLoading(false);

    if (result.success) {
      setMode('magic-link-sent');
    } else {
      setError(result.error || 'Failed to send magic link');
    }
  };

  const renderContent = () => {
    if (mode === 'magic-link-sent') {
      return (
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Feather name="mail" size={32} color={BrandColors.secondary} />
          </View>
          <Text style={styles.successTitle}>Check your email</Text>
          <Text style={styles.successText}>
            We've sent a magic link to {email}. Click the link to sign in.
          </Text>
          <Pressable style={styles.primaryButton} onPress={handleClose}>
            <Text style={styles.primaryButtonText}>Done</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <>
        <Text style={styles.title}>
          {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Sign in with Email'}
        </Text>
        <Text style={styles.subtitle}>
          {mode === 'login'
            ? 'Sign in to sync your saved listings'
            : mode === 'signup'
            ? 'Create an account to save and sync your favorites'
            : 'We\'ll send you a magic link to sign in'}
        </Text>

        {error && (
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={16} color="#E63946" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {mode === 'signup' && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor={BrandColors.gray.medium}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={BrandColors.gray.medium}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        {mode !== 'magic-link' && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Your password"
              placeholderTextColor={BrandColors.gray.medium}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </View>
        )}

        <Pressable
          style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
          onPress={mode === 'login' ? handleLogin : mode === 'signup' ? handleSignup : handleMagicLink}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={BrandColors.white} />
          ) : (
            <Text style={styles.primaryButtonText}>
              {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Magic Link'}
            </Text>
          )}
        </Pressable>

        {mode === 'login' && (
          <Pressable style={styles.magicLinkButton} onPress={() => setMode('magic-link')}>
            <Feather name="zap" size={16} color={BrandColors.secondary} />
            <Text style={styles.magicLinkText}>Sign in with magic link</Text>
          </Pressable>
        )}

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => {
            setError(null);
            setMode(mode === 'login' ? 'signup' : 'login');
          }}
        >
          <Text style={styles.secondaryButtonText}>
            {mode === 'login' ? 'Create an account' : 'Already have an account? Sign in'}
          </Text>
        </Pressable>
      </>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <Feather name="x" size={24} color={BrandColors.gray.dark} />
          </Pressable>
          {renderContent()}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Space[4],
  },
  modal: {
    backgroundColor: BrandColors.white,
    borderRadius: Radius.xl,
    padding: Space[8],
    width: '100%',
    maxWidth: 400,
    ...Platform.select({
      web: {
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
  closeButton: {
    position: 'absolute',
    top: Space[4],
    right: Space[4],
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  title: {
    fontSize: FontSize['2xl'],
    lineHeight: LineHeight['2xl'],
    fontWeight: FontWeight.bold,
    color: BrandColors.black,
    marginBottom: Space[2],
  },
  subtitle: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    color: BrandColors.gray.medium,
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
  magicLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space[2],
    paddingVertical: Space[4],
    marginTop: Space[2],
  },
  magicLinkText: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    fontWeight: FontWeight.medium,
    color: BrandColors.secondary,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Space[4],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: BrandColors.gray.border,
  },
  dividerText: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.gray.medium,
    paddingHorizontal: Space[4],
  },
  secondaryButton: {
    paddingVertical: Space[3],
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.gray.dark,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: Space[4],
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${BrandColors.secondary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Space[4],
  },
  successTitle: {
    fontSize: FontSize.xl,
    lineHeight: LineHeight.xl,
    fontWeight: FontWeight.bold,
    color: BrandColors.black,
    marginBottom: Space[2],
  },
  successText: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    color: BrandColors.gray.medium,
    textAlign: 'center',
    marginBottom: Space[6],
  },
});

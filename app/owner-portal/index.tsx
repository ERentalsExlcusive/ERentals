import { StyleSheet, View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { BrandColors } from '@/constants/theme';
import { Space, FontSize, LineHeight, FontWeight, Radius, Shadow } from '@/constants/design-tokens';
import { useOwnerAuth } from '@/context/owner-auth-context';
import { useResponsive } from '@/hooks/use-responsive';

export default function OwnerLoginScreen() {
  const router = useRouter();
  const { isMobile } = useResponsive();
  const { login, isLoading, isAuthenticated } = useOwnerAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/owner-portal/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleLogin = async () => {
    setError('');

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 4) {
      setError('Please enter your password');
      return;
    }

    const success = await login(email, password);
    if (!success) {
      setError('Invalid email or password');
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.loginCard, isMobile && styles.loginCardMobile]}>
        {/* Logo / Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Feather name="home" size={32} color={BrandColors.secondary} />
          </View>
          <Text style={styles.title}>Owner Portal</Text>
          <Text style={styles.subtitle}>Manage your properties and inquiries</Text>
        </View>

        {/* Demo Credentials Notice */}
        <View style={styles.demoNotice}>
          <Feather name="info" size={16} color={BrandColors.secondary} />
          <Text style={styles.demoText}>
            Demo: owner@erentals.com / OwnerPass123
          </Text>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputWrapper}>
              <Feather name="mail" size={18} color={BrandColors.gray.medium} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={BrandColors.gray.medium}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Feather name="lock" size={18} color={BrandColors.gray.medium} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={BrandColors.gray.medium}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.showPasswordButton}
              >
                <Feather
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={18}
                  color={BrandColors.gray.medium}
                />
              </Pressable>
            </View>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Feather name="alert-circle" size={16} color="#dc2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={BrandColors.white} />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </Pressable>
        </View>

        {/* Footer */}
        <Pressable style={styles.backLink} onPress={() => router.push('/')}>
          <Feather name="arrow-left" size={16} color={BrandColors.gray.medium} />
          <Text style={styles.backLinkText}>Back to main site</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.gray.light,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Space[4],
  },
  loginCard: {
    backgroundColor: BrandColors.white,
    borderRadius: Radius.xl,
    padding: Space[10],
    width: '100%',
    maxWidth: 420,
    ...Shadow.lg,
  },
  loginCardMobile: {
    padding: Space[6],
  },
  header: {
    alignItems: 'center',
    marginBottom: Space[8],
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${BrandColors.secondary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Space[4],
  },
  title: {
    fontSize: FontSize['2xl'],
    lineHeight: LineHeight['2xl'],
    fontWeight: FontWeight.bold,
    color: BrandColors.black,
    marginBottom: Space[1],
  },
  subtitle: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.gray.medium,
  },
  demoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[2],
    backgroundColor: `${BrandColors.secondary}10`,
    paddingVertical: Space[3],
    paddingHorizontal: Space[4],
    borderRadius: Radius.md,
    marginBottom: Space[6],
  },
  demoText: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.gray.dark,
  },
  form: {
    gap: Space[4],
  },
  inputGroup: {
    gap: Space[2],
  },
  inputLabel: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    fontWeight: FontWeight.medium,
    color: BrandColors.gray.dark,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BrandColors.gray.border,
    borderRadius: Radius.lg,
    backgroundColor: BrandColors.white,
  },
  inputIcon: {
    marginLeft: Space[4],
  },
  input: {
    flex: 1,
    paddingVertical: Space[4],
    paddingHorizontal: Space[3],
    fontSize: FontSize.md,
    color: BrandColors.black,
  },
  showPasswordButton: {
    padding: Space[4],
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[2],
    paddingVertical: Space[2],
  },
  errorText: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: '#dc2626',
  },
  loginButton: {
    backgroundColor: BrandColors.black,
    paddingVertical: Space[4],
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Space[2],
  },
  loginButtonDisabled: {
    backgroundColor: BrandColors.gray.medium,
  },
  loginButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: BrandColors.white,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space[2],
    marginTop: Space[8],
    paddingVertical: Space[2],
  },
  backLinkText: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.gray.medium,
  },
});

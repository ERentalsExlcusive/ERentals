import { Modal, View, Text, TextInput, StyleSheet, Pressable, TouchableWithoutFeedback } from 'react-native';
import { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { BrandColors, Spacing } from '@/constants/theme';

interface FavoritePromptModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
}

export function FavoritePromptModal({ visible, onClose, onSubmit }: FavoritePromptModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) {
      return;
    }

    setIsSubmitting(true);
    await onSubmit(email);
    setIsSubmitting(false);
    setEmail('');
  };

  const handleClose = () => {
    setEmail('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modal}>
              {/* Close button */}
              <Pressable style={styles.closeButton} onPress={handleClose}>
                <Feather name="x" size={20} color={BrandColors.gray.dark} />
              </Pressable>

              {/* Icon */}
              <View style={styles.iconContainer}>
                <Feather name="heart" size={32} color={BrandColors.secondary} />
              </View>

              {/* Title */}
              <Text style={styles.title}>Save Your Favorites</Text>

              {/* Description */}
              <Text style={styles.description}>
                Enter your email to save properties you love and get exclusive offers
              </Text>

              {/* Email input */}
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor={BrandColors.gray.medium}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
              />

              {/* Submit button */}
              <Pressable
                style={[styles.button, (!email || !email.includes('@')) && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={!email || !email.includes('@') || isSubmitting}
              >
                <Text style={styles.buttonText}>
                  {isSubmitting ? 'Saving...' : 'Continue'}
                </Text>
              </Pressable>

              {/* Privacy note */}
              <Text style={styles.privacy}>
                No password needed. We'll never spam you.
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modal: {
    backgroundColor: BrandColors.white,
    borderRadius: 20,
    padding: Spacing.xxl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BrandColors.gray.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(188, 148, 77, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: BrandColors.black,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: BrandColors.gray.dark,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: BrandColors.gray.border,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    fontSize: 15,
    color: BrandColors.black,
    marginBottom: Spacing.md,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: BrandColors.black,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: BrandColors.white,
  },
  privacy: {
    fontSize: 12,
    color: BrandColors.gray.medium,
    textAlign: 'center',
  },
});

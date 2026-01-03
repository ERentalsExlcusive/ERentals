import { Modal, View, Text, TextInput, StyleSheet, Pressable, TouchableWithoutFeedback } from 'react-native';
import { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { BrandColors, Spacing } from '@/constants/theme';
import { Space, FontSize, LineHeight, FontWeight, Radius, Shadow, TouchTarget } from '@/constants/design-tokens';

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
    padding: Space[8],
  },
  modal: {
    backgroundColor: BrandColors.white,
    borderRadius: Radius.xl,
    padding: Space[12],
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    ...Shadow.xl,
  },
  closeButton: {
    position: 'absolute',
    top: Space[4],
    right: Space[4],
    width: Space[8],
    height: Space[8],
    borderRadius: Radius.full,
    backgroundColor: BrandColors.gray.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: Space[16],
    height: Space[16],
    borderRadius: Radius.full,
    backgroundColor: 'rgba(188, 148, 77, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Space[6],
  },
  title: {
    fontSize: FontSize['2xl'],
    lineHeight: LineHeight['2xl'],
    fontWeight: FontWeight.bold,
    color: BrandColors.black,
    marginBottom: Space[2],
    textAlign: 'center',
  },
  description: {
    fontSize: FontSize.base,
    lineHeight: LineHeight.base + 2,
    color: BrandColors.gray.dark,
    textAlign: 'center',
    marginBottom: Space[8],
  },
  input: {
    width: '100%',
    minHeight: TouchTarget.comfortable,
    borderWidth: 1,
    borderColor: BrandColors.gray.border,
    borderRadius: Radius.lg,
    paddingHorizontal: Space[4],
    fontSize: FontSize.base,
    lineHeight: LineHeight.base,
    color: BrandColors.black,
    marginBottom: Space[4],
  },
  button: {
    width: '100%',
    minHeight: TouchTarget.comfortable,
    backgroundColor: BrandColors.black,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Space[2],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    fontWeight: FontWeight.semibold,
    color: BrandColors.white,
  },
  privacy: {
    fontSize: FontSize.xs,
    lineHeight: LineHeight.xs,
    color: BrandColors.gray.medium,
    textAlign: 'center',
  },
});

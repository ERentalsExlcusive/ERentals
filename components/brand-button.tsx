import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { BrandColors, Typography } from '@/constants/theme';

interface BrandButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function BrandButton({
  title,
  onPress,
  variant = 'primary',
  style,
  textStyle,
}: BrandButtonProps) {
  const getButtonStyle = (pressed: boolean) => {
    const baseStyle = styles.button;

    switch (variant) {
      case 'primary':
        return [
          baseStyle,
          styles.primaryButton,
          pressed && styles.primaryButtonPressed,
          style,
        ];
      case 'secondary':
        return [
          baseStyle,
          styles.secondaryButton,
          pressed && styles.secondaryButtonPressed,
          style,
        ];
      case 'outline':
        return [
          baseStyle,
          styles.outlineButton,
          pressed && styles.outlineButtonPressed,
          style,
        ];
      default:
        return [baseStyle, style];
    }
  };

  const getTextStyle = (pressed: boolean) => {
    switch (variant) {
      case 'outline':
        return [
          styles.buttonText,
          styles.outlineButtonText,
          pressed && styles.outlineButtonTextPressed,
          textStyle,
        ];
      default:
        return [styles.buttonText, textStyle];
    }
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => getButtonStyle(pressed)}
    >
      {({ pressed }) => (
        <Text style={getTextStyle(pressed)}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: BrandColors.secondary,
  },
  primaryButtonPressed: {
    backgroundColor: BrandColors.primary,
  },
  secondaryButton: {
    backgroundColor: BrandColors.primary,
  },
  secondaryButtonPressed: {
    backgroundColor: BrandColors.gray.darker,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: BrandColors.secondary,
  },
  outlineButtonPressed: {
    backgroundColor: BrandColors.secondary,
  },
  buttonText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: Typography.button.fontSize,
    color: BrandColors.white,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  outlineButtonText: {
    color: BrandColors.secondary,
  },
  outlineButtonTextPressed: {
    color: BrandColors.white,
  },
});

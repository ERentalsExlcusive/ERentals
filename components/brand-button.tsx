import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { BrandColors, Typography, ButtonStyles } from '@/constants/theme';

interface BrandButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'ghost' | 'accent';
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
    switch (variant) {
      case 'primary':
        return [
          ButtonStyles.primary,
          pressed && ButtonStyles.primaryPressed,
          style,
        ];
      case 'ghost':
        return [
          ButtonStyles.ghost,
          pressed && ButtonStyles.ghostPressed,
          style,
        ];
      case 'accent':
        return [
          ButtonStyles.accent,
          pressed && ButtonStyles.accentPressed,
          style,
        ];
      default:
        return [ButtonStyles.primary, style];
    }
  };

  const getTextStyle = (pressed: boolean) => {
    switch (variant) {
      case 'ghost':
        return [
          styles.buttonText,
          styles.ghostButtonText,
          textStyle,
        ];
      case 'accent':
        return [
          styles.buttonText,
          styles.accentButtonText,
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
  buttonText: {
    fontSize: Typography.button.fontSize,
    fontWeight: '600',
    color: BrandColors.white,
    letterSpacing: 0.5,
  },
  ghostButtonText: {
    color: BrandColors.black,
  },
  accentButtonText: {
    color: BrandColors.white,
  },
});

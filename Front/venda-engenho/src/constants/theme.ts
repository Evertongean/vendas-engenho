/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#111827',
    background: '#f4f6f5',
    card: '#ffffff',
    cardElevated: '#ffffff',
    backgroundElement: '#eef1ef',
    backgroundSelected: '#dde9de',
    textSecondary: '#667085',
    border: '#dfe5e1',
    primary: '#2f7d32',
    primaryPressed: '#256729',
    primaryText: '#ffffff',
    secondaryButton: '#1f2937',
    secondaryButtonText: '#ffffff',
    mutedButton: '#eef1ef',
    mutedButtonText: '#111827',
    inputBackground: '#ffffff',
    divider: '#e5e7eb',
    badge: '#edf3ef',
    danger: '#b42318',
    disabled: '#a5aab0',
    tabBar: '#ffffff',
    tabActiveBackground: '#e4f2e6',
    shadow: '#000000',
  },
  dark: {
    text: '#f7faf7',
    background: '#101412',
    card: '#1b201d',
    cardElevated: '#222823',
    backgroundElement: '#252c28',
    backgroundSelected: '#304137',
    textSecondary: '#c3cbc4',
    border: '#333d36',
    primary: '#63b86a',
    primaryPressed: '#75c77c',
    primaryText: '#07110a',
    secondaryButton: '#e6ece7',
    secondaryButtonText: '#101412',
    mutedButton: '#2a312d',
    mutedButtonText: '#eef3ef',
    inputBackground: '#151a17',
    divider: '#333d36',
    badge: '#2b332f',
    danger: '#ff8a80',
    disabled: '#59615b',
    tabBar: '#191e1b',
    tabActiveBackground: '#263b2c',
    shadow: '#000000',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

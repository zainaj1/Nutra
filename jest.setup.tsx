/// <reference types="jest" />

import React from 'react';

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
};

jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useRouter: () => mockRouter,
  useLocalSearchParams: () => ({}),
}));

jest.mock('expo-router/react-navigation', () => ({
  Button: ({ children }: { children: React.ReactNode }) => {
    const { Text } = require('react-native');
    return <Text>{children}</Text>;
  },
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: ({ name }: { name: string }) => {
    const { Text } = require('react-native');
    return <Text>{name}</Text>;
  },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SafeAreaView: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@expo/ui/community/picker', () => {
  const { Text, View } = require('react-native');

  const Picker = ({
    children,
    selectedValue,
    onValueChange,
  }: {
    children: React.ReactNode;
    selectedValue: string;
    onValueChange: (value: string) => void;
  }) => (
    <View
      accessibilityRole="adjustable"
      testID={`picker-${selectedValue}`}
      onTouchEnd={() => onValueChange(selectedValue)}
    >
      {children}
    </View>
  );

  Picker.Item = ({ label }: { label: string; value: string }) => <Text>{label}</Text>;

  return { Picker };
});

jest.mock('@expo/ui/community/slider', () => {
  const { Pressable } = require('react-native');

  return ({
    value,
    onValueChange,
  }: {
    value: number;
    onValueChange: (value: number) => void;
  }) => (
    <Pressable
      accessibilityRole="adjustable"
      testID="pace-slider-control"
      onPress={() => onValueChange(value + 0.1)}
    />
  );
});

jest.mock('@clerk/expo', () => ({
  useAuth: jest.fn(() => ({ isLoaded: true, isSignedIn: true })),
  useClerk: jest.fn(() => ({ signOut: jest.fn() })),
  useSignIn: jest.fn(() => ({
    signIn: {
      status: 'needs_identifier',
      password: jest.fn(),
      finalize: jest.fn(),
      mfa: {
        sendEmailCode: jest.fn(),
        verifyEmailCode: jest.fn(),
      },
      reset: jest.fn(),
      supportedSecondFactors: [],
    },
    errors: { fields: {} },
    fetchStatus: 'idle',
  })),
  useSignUp: jest.fn(() => ({
    signUp: {
      status: 'missing_requirements',
      password: jest.fn(),
      finalize: jest.fn(),
      verifications: {
        sendEmailCode: jest.fn(),
        verifyEmailCode: jest.fn(),
      },
      unverifiedFields: [],
      missingFields: ['email_address'],
    },
    errors: { fields: {} },
    fetchStatus: 'idle',
  })),
  useUser: jest.fn(() => ({ user: null })),
}));

jest.mock('@clerk/expo/google', () => ({
  useSignInWithGoogle: jest.fn(() => ({
    startGoogleAuthenticationFlow: jest.fn(),
  })),
}));

jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(async () => {
  const { cleanup } = require('@testing-library/react-native/pure');
  await cleanup();
});

export { mockRouter };

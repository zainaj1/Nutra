module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.tsx'],
  testMatch: ['**/tests/**/*.test.ts?(x)'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native|expo(nent)?|@expo(nent)?/.*|expo-modules-core|expo-router|nativewind|react-native-css-interop|react-native-reanimated|react-native-safe-area-context)/)',
  ],
};

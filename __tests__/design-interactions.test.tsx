import { useAuth, useClerk, useUser } from '@clerk/expo';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react-native/pure';
import React from 'react';
import SetupMeals from '../src/app/(app)/(tabs)/(setup)/setup-meals';
import Settings from '../src/app/(app)/(tabs)/settings';

const mockNavigate = jest.fn();
const mockReplace = jest.fn();
jest.mock('@clerk/expo', () => ({ useAuth: jest.fn(), useClerk: jest.fn(), useUser: jest.fn() }));
jest.mock('expo-router', () => ({
    Link: ({ href, children }: any) => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const React = require('react');
        return React.cloneElement(children, { onPress: () => mockNavigate(href) });
    },
    useRouter: () => ({ replace: mockReplace }),
}));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaProvider: ({ children }: any) => children, SafeAreaView: ({ children }: any) => children }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: ({ children }: any) => children }));

beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useAuth).mockReturnValue({ isLoaded: true } as never);
    jest.mocked(useUser).mockReturnValue({ user: { username: 'alex', primaryEmailAddress: { emailAddress: 'alex@example.com' } } } as never);
    jest.mocked(useClerk).mockReturnValue({ signOut: jest.fn().mockResolvedValue(undefined) } as never);
});
afterEach(async () => { await cleanup(); });

it('requires a cooking day and meal, then passes the selected requirements to recipe selection', async () => {
    const screen = await render(<SetupMeals />);
    const next = () => screen.getByRole('button', { name: 'Find my recipes' });
    expect(next().props.accessibilityState.disabled).toBe(true);
    await fireEvent.press(screen.getByRole('button', { name: 'Monday' }));
    expect(next().props.accessibilityState.disabled).toBe(true);
    await fireEvent.press(screen.getByRole('button', { name: 'dinner' }));
    await fireEvent.press(screen.getByRole('button', { name: 'More people' }));
    expect(next().props.accessibilityState.disabled).toBe(false);
    await fireEvent.press(next());
    expect(mockNavigate).toHaveBeenCalledWith({ pathname: '/(app)/(tabs)/(setup)/select-meals', params: { cookDayCount: 1, people: 2, meals: 'dinner' } });
    await fireEvent.press(screen.getByRole('button', { name: 'Monday' }));
    expect(next().props.accessibilityState.disabled).toBe(true);
});

it('keeps the people stepper within the existing supported range', async () => {
    const screen = await render(<SetupMeals />);
    expect(screen.getByRole('button', { name: 'Fewer people' }).props.accessibilityState.disabled).toBe(true);
    for (let i = 0; i < 4; i++) await fireEvent.press(screen.getByRole('button', { name: 'More people' }));
    expect(screen.getByRole('button', { name: 'More people' }).props.accessibilityState.disabled).toBe(true);
    expect(screen.getByText('5')).toBeTruthy();
});

it('signs out from the redesigned settings page and returns to the root', async () => {
    const screen = await render(<Settings />);
    expect(screen.getByText('alex')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Sign out' }));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/'));
    expect(useClerk().signOut).toHaveBeenCalledTimes(1);
});

it('shows a recoverable sign-out error without navigating away', async () => {
    jest.mocked(useClerk).mockReturnValue({ signOut: jest.fn().mockRejectedValue(new Error('Offline')) } as never);
    const screen = await render(<Settings />);
    await fireEvent.press(screen.getByRole('button', { name: 'Sign out' }));
    await waitFor(() => expect(screen.getByText('Could not sign out. Please try again.')).toBeTruthy());
    expect(mockReplace).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Sign out' }).props.accessibilityState.disabled).toBe(false);
});

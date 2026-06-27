/// <reference types="jest" />

import { useSignInWithGoogle } from '@clerk/expo/google';
import { fireEvent, render, waitFor } from '@testing-library/react-native/pure';
import { Platform } from 'react-native';

import GoogleSignInButton from '../../../src/app/components/GoogleSignInButton';
import { mockRouter } from '../../../jest.setup';

describe('GoogleSignInButton', () => {
  it('activates a Google session and navigates home', async () => {
    const setActive = jest.fn().mockResolvedValue(undefined);
    const startGoogleAuthenticationFlow = jest.fn().mockResolvedValue({
      createdSessionId: 'session_123',
      setActive,
    });
    jest.mocked(useSignInWithGoogle).mockReturnValue({
      startGoogleAuthenticationFlow,
    } as never);
    jest.replaceProperty(Platform, 'OS', 'ios');

    const { getByText } = await render(<GoogleSignInButton />);

    await fireEvent.press(getByText(/Sign in with Google/));

    await waitFor(() => {
      expect(setActive).toHaveBeenCalledWith({ session: 'session_123' });
      expect(mockRouter.replace).toHaveBeenCalledWith('/');
    });
  });
});

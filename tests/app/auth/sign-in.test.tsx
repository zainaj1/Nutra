/// <reference types="jest" />

import * as Clerk from '@clerk/expo';
import { fireEvent, render, waitFor } from '@testing-library/react-native/pure';

import SignIn from '../../../src/app/(app)/(auth)/sign-in';

describe('SignIn', () => {
  it('submits sign-in credentials to Clerk', async () => {
    const password = jest.fn().mockResolvedValue({ error: null });
    jest.mocked(Clerk.useSignIn).mockReturnValue({
      signIn: {
        status: 'needs_second_factor',
        password,
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
    } as never);

    const { getByPlaceholderText, getByText } = await render(<SignIn />);

    await fireEvent.changeText(getByPlaceholderText('Enter email'), 'zain@example.com');
    await fireEvent.changeText(getByPlaceholderText('Enter password'), 'secret123');
    await fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      expect(password).toHaveBeenCalledWith({
        emailAddress: 'zain@example.com',
        password: 'secret123',
      });
    });
  });
});

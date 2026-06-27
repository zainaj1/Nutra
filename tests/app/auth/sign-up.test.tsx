/// <reference types="jest" />

import * as Clerk from '@clerk/expo';
import { fireEvent, render, waitFor } from '@testing-library/react-native/pure';

import SignUp from '../../../src/app/(app)/(auth)/sign-up';
import { mockSignedOutAuth } from '../../test-utils/auth';

describe('SignUp', () => {
  it('submits account details and requests email verification', async () => {
    const password = jest.fn().mockResolvedValue({ error: null });
    const sendEmailCode = jest.fn().mockResolvedValue(undefined);
    mockSignedOutAuth();
    jest.mocked(Clerk.useSignUp).mockReturnValue({
      signUp: {
        status: 'missing_requirements',
        password,
        finalize: jest.fn(),
        verifications: {
          sendEmailCode,
          verifyEmailCode: jest.fn(),
        },
        unverifiedFields: [],
        missingFields: ['email_address'],
      },
      errors: { fields: {} },
      fetchStatus: 'idle',
    } as never);

    const { getByPlaceholderText, getByText } = await render(<SignUp />);

    await fireEvent.changeText(getByPlaceholderText('Create a username'), 'zain');
    await fireEvent.changeText(getByPlaceholderText('Enter your email'), 'zain@example.com');
    await fireEvent.changeText(getByPlaceholderText('Create a password'), 'secret123');
    await fireEvent.press(getByText('Create Account'));

    await waitFor(() => {
      expect(password).toHaveBeenCalledWith({
        username: 'zain',
        emailAddress: 'zain@example.com',
        password: 'secret123',
      });
      expect(sendEmailCode).toHaveBeenCalledTimes(1);
    });
  });
});

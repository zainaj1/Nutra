/// <reference types="jest" />

import { fireEvent, render, waitFor } from '@testing-library/react-native/pure';
import * as Clerk from '@clerk/expo';
import { useSignInWithGoogle } from '@clerk/expo/google';
import { Platform } from 'react-native';

import GoogleSignInButton from '../src/app/components/GoogleSignInButton';
import SignIn from '../src/app/(app)/(auth)/sign-in';
import SignUp from '../src/app/(app)/(auth)/sign-up';
import FinalizePlan from '../src/app/(app)/(tabs)/(setup)/finalize-plan';
import UserGoals from '../src/app/(app)/(tabs)/(setup)/user-goals';
import UserMetrics from '../src/app/(app)/(tabs)/(setup)/user-metrics';
import UserPace from '../src/app/(app)/(tabs)/(setup)/user-pace';
import Home from '../src/app/(app)/(tabs)/home';
import Plan from '../src/app/(app)/(tabs)/plan';
import Settings from '../src/app/(app)/(tabs)/settings';
import { mockRouter } from '../jest.setup';

const loadedAuth = { isLoaded: true, isSignedIn: true };

describe('app pages', () => {
  beforeEach(() => {
    jest.mocked(Clerk.useAuth).mockReturnValue(loadedAuth as never);
  });

  it('renders the home and plan tab pages after auth loads', async () => {
    const home = await render(<Home />);
    const plan = await render(<Plan />);

    expect(home.getByText('Home')).toBeTruthy();
    expect(plan.getByText('Plan')).toBeTruthy();
  });

  it('signs out from settings and returns to the root route', async () => {
    const signOut = jest.fn().mockResolvedValue(undefined);
    jest.mocked(Clerk.useClerk).mockReturnValue({ signOut } as never);

    const { getByRole } = await render(<Settings />);

    await fireEvent.press(getByRole('button', { name: 'Sign out' }));

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledTimes(1);
      expect(mockRouter.replace).toHaveBeenCalledWith('/');
    });
  });

  it('keeps user metrics disabled until an activity is selected', async () => {
    const { getByRole } = await render(<UserMetrics />);

    expect(getByRole('button', { name: 'Continue' }).props.accessibilityState).toEqual({
      disabled: true,
    });

    await fireEvent.press(getByRole('button', { name: 'Sedentary' }));

    expect(getByRole('button', { name: 'Continue' }).props.accessibilityState).toEqual({
      disabled: false,
    });
  });

  it('shows goal pace direction and keeps incomplete goals from continuing', async () => {
    const { getByRole, getByText } = await render(<UserGoals />);

    expect(getByText(/0.5 lb\/week/)).toBeTruthy();
    expect(getByText('trending-down-outline')).toBeTruthy();
    expect(getByRole('button', { name: 'Continue' }).props.accessibilityState).toEqual({
      disabled: true,
    });
  });

  it('renders placeholder setup pages that still require loaded auth', async () => {
    const userPace = await render(<UserPace />);
    const finalizePlan = await render(<FinalizePlan />);

    expect(userPace.getByText('Test')).toBeTruthy();
    expect(finalizePlan.getByText('Test')).toBeTruthy();
  });

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

  it('submits sign-up details and requests email verification', async () => {
    const password = jest.fn().mockResolvedValue({ error: null });
    const sendEmailCode = jest.fn().mockResolvedValue(undefined);
    jest.mocked(Clerk.useAuth).mockReturnValue({ isLoaded: true, isSignedIn: false } as never);
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

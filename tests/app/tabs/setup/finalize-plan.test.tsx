/// <reference types="jest" />

import { fireEvent, render, waitFor } from '@testing-library/react-native/pure';
import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react';

import {
  SetupUserDataProvider,
  useSetupUserData,
} from '../../../../src/app/(app)/(tabs)/(setup)/context/setup-user-data-context';
import FinalizePlan from '../../../../src/app/(app)/(tabs)/(setup)/finalize-plan';
import { mockRouter } from '../../../../jest.setup';
import { mockLoadedAuth } from '../../../test-utils/auth';

function SeededFinalizePlan() {
  const { updateUserData } = useSetupUserData();

  useEffect(() => {
    updateUserData({
      weight: 160,
      goalWeight: 150,
      heightInches: 71,
      age: 25,
      gender: 'male',
      activityLevel: 'lightly_active',
      pace: 0.5,
    });
  }, [updateUserData]);

  return <FinalizePlan />;
}

describe('FinalizePlan', () => {
  it('displays the collected user setup values', async () => {
    mockLoadedAuth();

    const { findByText, getByText } = await render(
      <SetupUserDataProvider>
        <SeededFinalizePlan />
      </SetupUserDataProvider>
    );

    expect(getByText('Finalize your plan')).toBeTruthy();
    expect(await findByText('160 lb')).toBeTruthy();
    expect(getByText('150 lb')).toBeTruthy();
    expect(getByText('71 in')).toBeTruthy();
    expect(getByText('25')).toBeTruthy();
    expect(getByText('Male')).toBeTruthy();
    expect(getByText('Lightly Active')).toBeTruthy();
    expect(getByText('0.5 lb/week')).toBeTruthy();
    expect(getByText('1733 cal/day')).toBeTruthy();
    expect(getByText('2253-2427 cal/day')).toBeTruthy();
    expect(getByText('2039-2212 cal/day')).toBeTruthy();
    expect(getByText('20 weeks')).toBeTruthy();
  });

  it('saves setup data and exits to home when finalized', async () => {
    mockLoadedAuth();

    const { findByRole } = await render(
      <SetupUserDataProvider>
        <SeededFinalizePlan />
      </SetupUserDataProvider>
    );

    await fireEvent.press(await findByRole('button', { name: 'Finalize Plan' }));

    await waitFor(() => {
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'nutra.user-plan',
        expect.stringContaining('"weight":160')
      );
      expect(mockRouter.replace).toHaveBeenCalledWith('/(app)/(tabs)/home');
    });
  });

  it('shows an error if saving fails', async () => {
    mockLoadedAuth();
    jest.mocked(SecureStore.isAvailableAsync).mockResolvedValue(false);
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: undefined,
    });

    const { findByRole, findByText } = await render(
      <SetupUserDataProvider>
        <SeededFinalizePlan />
      </SetupUserDataProvider>
    );

    await fireEvent.press(await findByRole('button', { name: 'Finalize Plan' }));

    expect(await findByText('We could not save your plan. Please try again.')).toBeTruthy();
  });
});

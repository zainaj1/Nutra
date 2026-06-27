/// <reference types="jest" />

import * as Clerk from '@clerk/expo';
import { fireEvent, render, waitFor } from '@testing-library/react-native/pure';

import Settings from '../../../src/app/(app)/(tabs)/settings';
import { mockRouter } from '../../../jest.setup';
import { mockLoadedAuth } from '../../test-utils/auth';

describe('Settings', () => {
  it('signs out and returns to the root route', async () => {
    const signOut = jest.fn().mockResolvedValue(undefined);
    mockLoadedAuth();
    jest.mocked(Clerk.useClerk).mockReturnValue({ signOut } as never);

    const { getByRole } = await render(<Settings />);

    await fireEvent.press(getByRole('button', { name: 'Sign out' }));

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledTimes(1);
      expect(mockRouter.replace).toHaveBeenCalledWith('/');
    });
  });
});

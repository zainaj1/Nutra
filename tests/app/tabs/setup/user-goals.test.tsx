/// <reference types="jest" />

import { render } from '@testing-library/react-native/pure';

import UserGoals from '../../../../src/app/(app)/(tabs)/(setup)/user-goals';
import { mockLoadedAuth } from '../../../test-utils/auth';

describe('UserGoals', () => {
  it('shows goal pace direction and keeps incomplete goals from continuing', async () => {
    mockLoadedAuth();

    const { getByRole, getByText } = await render(<UserGoals />);

    expect(getByText(/0.5 lb\/week/)).toBeTruthy();
    expect(getByText('trending-down-outline')).toBeTruthy();
    expect(getByRole('button', { name: 'Continue' }).props.accessibilityState).toEqual({
      disabled: true,
    });
  });
});

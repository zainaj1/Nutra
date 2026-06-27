/// <reference types="jest" />

import { fireEvent, render } from '@testing-library/react-native/pure';

import UserMetrics from '../../../../src/app/(app)/(tabs)/(setup)/user-metrics';
import { mockLoadedAuth } from '../../../test-utils/auth';

describe('UserMetrics', () => {
  it('keeps Continue disabled until an activity is selected', async () => {
    mockLoadedAuth();

    const { getByRole } = await render(<UserMetrics />);

    expect(getByRole('button', { name: 'Continue' }).props.accessibilityState).toEqual({
      disabled: true,
    });

    await fireEvent.press(getByRole('button', { name: 'Sedentary' }));

    expect(getByRole('button', { name: 'Continue' }).props.accessibilityState).toEqual({
      disabled: false,
    });
  });
});

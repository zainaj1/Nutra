/// <reference types="jest" />

import { fireEvent, render } from '@testing-library/react-native/pure';

import { SetupUserDataProvider } from '../../../../src/app/(app)/(tabs)/(setup)/context/setup-user-data-context';
import UserMetrics from '../../../../src/app/(app)/(tabs)/(setup)/user-metrics';
import { mockLoadedAuth } from '../../../test-utils/auth';

describe('UserMetrics', () => {
  it('keeps Continue disabled until gender and a valid birthday are selected', async () => {
    mockLoadedAuth();

    const { getByLabelText, getByRole } = await render(
      <SetupUserDataProvider>
        <UserMetrics />
      </SetupUserDataProvider>
    );

    expect(getByRole('button', { name: 'Continue' }).props.accessibilityState).toEqual({
      disabled: true,
    });

    await fireEvent.press(getByRole('button', { name: 'Male' }));

    expect(getByRole('button', { name: 'Continue' }).props.accessibilityState).toEqual({
      disabled: true,
    });

    await fireEvent.changeText(getByLabelText('Birthday'), '01/02/2000');

    expect(getByRole('button', { name: 'Continue' }).props.accessibilityState).toEqual({
      disabled: false,
    });
  });
});

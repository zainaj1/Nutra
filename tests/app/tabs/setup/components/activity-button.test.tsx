/// <reference types="jest" />

import { fireEvent, render } from '@testing-library/react-native/pure';

import ActivityButton from '../../../../../src/app/(app)/(tabs)/(setup)/components/activity-button';

describe('ActivityButton', () => {
  it('renders activity details and handles presses', async () => {
    const onPress = jest.fn();

    const { getByRole, getByText } = await render(
      <ActivityButton
        label="Active"
        secondaryLabel="3-5 days/week"
        icon="flash-outline"
        selected={false}
        onPress={onPress}
      />
    );

    expect(getByText('3-5 days/week')).toBeTruthy();

    await fireEvent.press(getByRole('button', { name: 'Active' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

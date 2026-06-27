/// <reference types="jest" />

import { fireEvent, render } from '@testing-library/react-native/pure';

import GenderButton from '../../../../../src/app/(app)/(tabs)/(setup)/components/gender-button';

describe('GenderButton', () => {
  it('reports selection state and handles presses', async () => {
    const onPress = jest.fn();

    const { getByRole } = await render(
      <GenderButton
        label="Female"
        icon="woman-outline"
        selected
        onPress={onPress}
      />
    );

    const button = getByRole('button', { name: 'Female' });
    expect(button.props.accessibilityState).toEqual({ selected: true });

    await fireEvent.press(button);

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

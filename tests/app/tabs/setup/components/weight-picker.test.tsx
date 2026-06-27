/// <reference types="jest" />

import { fireEvent, render } from '@testing-library/react-native/pure';

import WeightPicker from '../../../../../src/app/(app)/(tabs)/(setup)/components/weight-picker';

describe('WeightPicker', () => {
  it('renders options and forwards selected values', async () => {
    const setWeight = jest.fn();

    const { getByText, getByTestId } = await render(
      <WeightPicker weight="160 lb" setWeight={setWeight} />
    );

    expect(getByText('Weight')).toBeTruthy();
    expect(getByText('100 lb')).toBeTruthy();
    expect(getByText('300 lb')).toBeTruthy();

    await fireEvent(getByTestId('picker-160 lb'), 'touchEnd');

    expect(setWeight).toHaveBeenCalledWith('160 lb');
  });
});

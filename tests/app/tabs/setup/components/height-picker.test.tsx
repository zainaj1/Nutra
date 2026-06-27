/// <reference types="jest" />

import { fireEvent, render } from '@testing-library/react-native/pure';

import HeightPicker from '../../../../../src/app/(app)/(tabs)/(setup)/components/height-picker';

describe('HeightPicker', () => {
  it('renders selected values and forwards feet and inch selections', async () => {
    const setHeightFeet = jest.fn();
    const setHeightInches = jest.fn();

    const { getByText, getByTestId } = await render(
      <HeightPicker
        heightFeet="5"
        heightInches="11"
        setHeightFeet={setHeightFeet}
        setHeightInches={setHeightInches}
      />
    );

    expect(getByText("5'11")).toBeTruthy();
    expect(getByText('4 ft')).toBeTruthy();
    expect(getByText('11 in')).toBeTruthy();

    await fireEvent(getByTestId('picker-5'), 'touchEnd');
    await fireEvent(getByTestId('picker-11'), 'touchEnd');

    expect(setHeightFeet).toHaveBeenCalledWith('5');
    expect(setHeightInches).toHaveBeenCalledWith('11');
  });
});

/// <reference types="jest" />

import { fireEvent, render } from '@testing-library/react-native/pure';

import PaceSlider from '../../../../../src/app/(app)/(tabs)/(setup)/components/pace-slider';

describe('PaceSlider', () => {
  it('updates pace when the slider changes', async () => {
    const onValueChange = jest.fn();

    const { getByTestId } = await render(
      <PaceSlider value={0.5} onValueChange={onValueChange} />
    );

    await fireEvent.press(getByTestId('pace-slider-control'));

    expect(onValueChange).toHaveBeenCalledWith(0.6);
  });
});

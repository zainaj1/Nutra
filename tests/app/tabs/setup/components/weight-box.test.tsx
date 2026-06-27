/// <reference types="jest" />

import { fireEvent, render } from '@testing-library/react-native/pure';
import { useState } from 'react';

import WeightBox from '../../../../../src/app/(app)/(tabs)/(setup)/components/weight-box';

describe('WeightBox', () => {
  it('edits and clamps a weight value before saving', async () => {
    const onWeightChange = jest.fn();

    function WeightBoxHarness() {
      const [weight, setWeight] = useState('160');

      return (
        <WeightBox
          title="Current Weight"
          weight={weight}
          setWeight={(value) => {
            setWeight(value);
            onWeightChange(value);
          }}
        />
      );
    }

    const { getByDisplayValue, getByRole, getByText } = await render(<WeightBoxHarness />);

    expect(getByText('160 lb')).toBeTruthy();

    await fireEvent.press(getByRole('button', { name: 'Edit Current Weight' }));
    await fireEvent.changeText(getByDisplayValue('160'), '500');
    await fireEvent.press(getByText('Save'));

    expect(onWeightChange).toHaveBeenLastCalledWith('350');
  });
});

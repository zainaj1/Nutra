/// <reference types="jest" />

import { fireEvent, render } from '@testing-library/react-native/pure';
import { useState } from 'react';

import ActivityButton from '../src/app/(app)/(tabs)/(setup)/components/activity-button';
import WeightBox from '../src/app/(app)/(tabs)/(setup)/components/edit-box';
import GenderButton from '../src/app/(app)/(tabs)/(setup)/components/gender-button';
import HeightPicker from '../src/app/(app)/(tabs)/(setup)/components/height-picker';
import PaceSlider from '../src/app/(app)/(tabs)/(setup)/components/pace-slider';
import WeightPicker from '../src/app/(app)/(tabs)/(setup)/components/weight-picker';

describe('setup form components', () => {
  it('reports gender selection state and handles presses', async () => {
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

  it('edits and clamps a weight box value before saving', async () => {
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

  it('renders weight picker options and forwards selected values', async () => {
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

  it('renders height picker values and forwards feet and inch selections', async () => {
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

  it('updates pace when the slider changes', async () => {
    const onValueChange = jest.fn();

    const { getByTestId } = await render(
      <PaceSlider value={0.5} onValueChange={onValueChange} />
    );

    await fireEvent.press(getByTestId('pace-slider-control'));

    expect(onValueChange).toHaveBeenCalledWith(0.6);
  });
});

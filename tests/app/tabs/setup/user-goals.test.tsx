/// <reference types="jest" />

import { render } from '@testing-library/react-native/pure';
import { fireEvent } from '@testing-library/react-native/pure';

import { SetupUserDataProvider } from '../../../../src/app/(app)/(tabs)/(setup)/context/setup-user-data-context';
import UserGoals from '../../../../src/app/(app)/(tabs)/(setup)/user-goals';
import { calculateBmr } from '../../../../src/app/(app)/(tabs)/(setup)/lib/user-data';
import { mockLoadedAuth } from '../../../test-utils/auth';

describe('UserGoals', () => {
  describe('calculateBmr', () => {
    it('uses the female gender offset', () => {
      expect(calculateBmr({ weight: 160, heightInches: 71, age: 25, gender: 'female' })).toBeCloseTo(1562.24);
    });

    it('uses the non-female gender offset for male input', () => {
      expect(calculateBmr({ weight: 160, heightInches: 71, age: 25, gender: 'male' })).toBeCloseTo(1733.24);
    });

    it('uses the non-female gender offset for other gender input', () => {
      expect(calculateBmr({ weight: 160, heightInches: 71, age: 25, gender: 'other' })).toBeCloseTo(1733.24);
    });

    it('handles decimal numeric values', () => {
      expect(calculateBmr({ weight: 160.5, heightInches: 70.5, age: 25.5, gender: 'female' })).toBeCloseTo(1554.068);
    });

    it('returns NaN for invalid numeric inputs', () => {
      expect(calculateBmr({ weight: Number.NaN, heightInches: 71, age: 25, gender: 'male' })).toBeNaN();
      expect(calculateBmr({ weight: 160, heightInches: Number.NaN, age: 25, gender: 'male' })).toBeNaN();
      expect(calculateBmr({ weight: 160, heightInches: 71, age: Number.NaN, gender: 'male' })).toBeNaN();
    });
  });

  it('keeps Continue disabled until activity is selected', async () => {
    mockLoadedAuth();

    const { getByRole, getByText } = await render(
      <SetupUserDataProvider>
        <UserGoals />
      </SetupUserDataProvider>
    );

    expect(getByText(/0.5 lb\/week/)).toBeTruthy();
    expect(getByText('trending-down-outline')).toBeTruthy();
    expect(getByRole('button', { name: 'Continue' }).props.accessibilityState.disabled).toBe(true);

    await fireEvent.press(getByRole('button', { name: 'Sedentary' }));

    expect(getByRole('button', { name: 'Continue' }).props.accessibilityState.disabled).toBe(false);
  });
});

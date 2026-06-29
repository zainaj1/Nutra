/// <reference types="jest" />

import { render } from '@testing-library/react-native/pure';
import * as SecureStore from 'expo-secure-store';

import Home from '../../../src/app/(app)/(tabs)/home';
import { mockLoadedAuth } from '../../test-utils/auth';

describe('Home', () => {
  it('displays the saved plan and macro ranges', async () => {
    mockLoadedAuth();
    jest.mocked(SecureStore.getItemAsync).mockResolvedValue(JSON.stringify({
      weight: 160,
      goalWeight: 150,
      heightInches: 71,
      age: 25,
      gender: 'male',
      activityLevel: 'lightly_active',
      pace: 0.5,
    }));

    const { findByText, getByText } = await render(<Home />);

    expect(await findByText('Your Plan')).toBeTruthy();
    expect(getByText('2039-2212 cal')).toBeTruthy();
    expect(getByText('2253-2427 cal')).toBeTruthy();
    expect(getByText('20 weeks')).toBeTruthy();
    expect(getByText('204-221 g')).toBeTruthy();
    expect(getByText('153-166 g')).toBeTruthy();
    expect(getByText('68-74 g')).toBeTruthy();
  });
});

/// <reference types="jest" />

import { render } from '@testing-library/react-native/pure';

import Home from '../../../src/app/(app)/(tabs)/home';
import { mockLoadedAuth } from '../../test-utils/auth';

describe('Home', () => {
  it('renders after auth loads', async () => {
    mockLoadedAuth();

    const { getByText } = await render(<Home />);

    expect(getByText('Home')).toBeTruthy();
  });
});

/// <reference types="jest" />

import { render } from '@testing-library/react-native/pure';

import Plan from '../../../src/app/(app)/(tabs)/plan';
import { mockLoadedAuth } from '../../test-utils/auth';

describe('Plan', () => {
  it('renders after auth loads', async () => {
    mockLoadedAuth();

    const { getByText } = await render(<Plan />);

    expect(getByText('Plan')).toBeTruthy();
  });
});

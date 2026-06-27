/// <reference types="jest" />

import { render } from '@testing-library/react-native/pure';

import UserPace from '../../../../src/app/(app)/(tabs)/(setup)/user-pace';
import { mockLoadedAuth } from '../../../test-utils/auth';

describe('UserPace', () => {
  it('renders after auth loads', async () => {
    mockLoadedAuth();

    const { getByText } = await render(<UserPace />);

    expect(getByText('Test')).toBeTruthy();
  });
});

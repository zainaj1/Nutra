/// <reference types="jest" />

import { render } from '@testing-library/react-native/pure';

import FinalizePlan from '../../../../src/app/(app)/(tabs)/(setup)/finalize-plan';
import { mockLoadedAuth } from '../../../test-utils/auth';

describe('FinalizePlan', () => {
  it('renders after auth loads', async () => {
    mockLoadedAuth();

    const { getByText } = await render(<FinalizePlan />);

    expect(getByText('Test')).toBeTruthy();
  });
});

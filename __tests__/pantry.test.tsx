import { useAuth, useClerk } from '@clerk/expo';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react-native/pure';
import { useLocalSearchParams } from 'expo-router';
import { File } from 'expo-file-system';
import Pantry from '../src/app/(app)/(tabs)/plan';
import { authenticatedFetch, SessionExpiredError } from '../src/lib/authenticated-fetch';
import { formatQuantity } from '../src/lib/pantry';

const mockPush = jest.fn();
const mockReplace = jest.fn();
let mockFocused = true;
jest.mock('@clerk/expo', () => ({ useAuth: jest.fn(), useClerk: jest.fn() }));
jest.mock('expo-file-system', () => ({ File: jest.fn(), Paths: { document: 'document' } }));
jest.mock('expo-router', () => ({
    useLocalSearchParams: jest.fn(),
    useRouter: () => ({ push: mockPush, replace: mockReplace }),
    useFocusEffect: (callback: () => void) => {
        const React = require('react');
        React.useEffect(() => mockFocused ? callback() : undefined, [callback, mockFocused]);
    },
}));
jest.mock('../src/lib/authenticated-fetch', () => ({
    ...jest.requireActual('../src/lib/authenticated-fetch'), authenticatedFetch: jest.fn(),
}));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('../components/design/glass-surface', () => ({ __esModule: true, default: ({ children }: any) => children }));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: ({ children }: any) => children }));

const getToken = jest.fn();
const response = (data: unknown, status = 200) => ({ ok: status < 400, status, json: async () => data }) as Response;
const groceries = { generation_id: 'pantry-uuid', items: [
    { name: 'Chicken breast', quantity: 750, unit: 'g' },
    { name: 'Egg', quantity: 12, unit: 'count' },
    { name: 'Oil', quantity: 100.50, unit: 'ml' },
    { name: 'Oil', quantity: 0.000000001, unit: 'pinch' },
    { name: 'Oil', quantity: 2, unit: 'ml' },
] };

beforeEach(() => {
    jest.resetAllMocks();
    mockFocused = true;
    jest.mocked(useAuth).mockReturnValue({ getToken, userId: 'user-1', isLoaded: true, isSignedIn: true } as never);
    jest.mocked(useClerk).mockReturnValue({ signOut: jest.fn().mockResolvedValue(undefined) } as never);
    jest.mocked(useLocalSearchParams).mockReturnValue({ generationId: 'plan/1' });
    jest.mocked(authenticatedFetch).mockResolvedValue(response(groceries));
    jest.mocked(File).mockImplementation(() => ({ exists: true, text: async () => JSON.stringify({ 'plan-id': 'saved-plan' }) }) as never);
});
afterEach(async () => { await cleanup(); });

it('loads the current saved plan when opening the Plan tab without URL parameters', async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({});
    const screen = await render(<Pantry />);
    await waitFor(() => expect(screen.getByText('Chicken breast')).toBeTruthy());
    expect(authenticatedFetch).toHaveBeenCalledWith(getToken, expect.stringContaining('/saved-plan/grocery_list'), expect.any(Object));
    await fireEvent.press(screen.getByRole('button', { name: 'Back to plan' }));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/(app)/(tabs)/(setup)/select-meals', params: { generationId: 'saved-plan' } });
});

it('shows a setup entry point when the Plan tab has no saved plan', async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({});
    jest.mocked(File).mockImplementation(() => ({ exists: false }) as never);
    const screen = await render(<Pantry />);
    await waitFor(() => expect(screen.getByText('No meal plan yet')).toBeTruthy());
    expect(authenticatedFetch).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('button', { name: 'Go to Home' }));
    expect(mockPush).toHaveBeenCalledWith('/(app)/(tabs)/home');
});

it('loads a newly saved plan when returning to the Plan tab', async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({});
    const screen = await render(<Pantry />);
    await waitFor(() => expect(screen.getByText('Chicken breast')).toBeTruthy());
    mockFocused = false;
    await screen.rerender(<Pantry />);
    jest.mocked(File).mockImplementation(() => ({ exists: true, text: async () => JSON.stringify({ 'plan-id': 'new-plan' }) }) as never);
    mockFocused = true;
    await screen.rerender(<Pantry />);
    await waitFor(() => expect(authenticatedFetch).toHaveBeenCalledWith(getToken, expect.stringContaining('/new-plan/grocery_list'), expect.any(Object)));
});

it('loads directly from the route, preserves duplicate rows and quantities, and returns to the same plan', async () => {
    const screen = await render(<Pantry />);
    await waitFor(() => expect(screen.getByText('Chicken breast')).toBeTruthy());
    expect(screen.getByRole('header', { name: 'Groceries for your plan' })).toBeTruthy();
    expect(screen.getAllByText('Oil')).toHaveLength(3);
    for (const value of ['750 g', '12 count', '100.5 ml', '1e-9 pinch', '2 ml']) expect(screen.getByText(value)).toBeTruthy();
    expect(authenticatedFetch).toHaveBeenCalledWith(getToken, expect.stringContaining('/plan_generations/plan%2F1/grocery_list'), expect.any(Object));
    await fireEvent.press(screen.getByRole('button', { name: 'Back to plan' }));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/(app)/(tabs)/(setup)/select-meals', params: { generationId: 'plan/1' } });
    expect(JSON.stringify(jest.mocked(authenticatedFetch).mock.calls)).not.toContain('pantry-uuid');
});

it('waits for auth and displays loading until the request completes', async () => {
    jest.mocked(useAuth).mockReturnValue({ getToken, isLoaded: false } as never);
    const screen = await render(<Pantry />);
    expect(authenticatedFetch).not.toHaveBeenCalled();
    let finish!: (result: Response) => void;
    jest.mocked(authenticatedFetch).mockReturnValue(new Promise(resolve => { finish = resolve; }));
    jest.mocked(useAuth).mockReturnValue({ getToken, userId: 'user-1', isLoaded: true, isSignedIn: true } as never);
    await screen.rerender(<Pantry />);
    expect(screen.getByText('Loading your groceries...')).toBeTruthy();
    expect(screen.queryByText('Your grocery list is empty.')).toBeNull();
    await act(async () => { finish(response(groceries)); });
    expect(screen.getByText('Chicken breast')).toBeTruthy();
});

it('shows an empty state only for a successful empty list', async () => {
    jest.mocked(authenticatedFetch).mockResolvedValue(response({ generation_id: 'pantry-uuid', items: [] }));
    const screen = await render(<Pantry />);
    await waitFor(() => expect(screen.getByText('Your grocery list is empty.')).toBeTruthy());
});

it.each(['IN_PROGRESS', 'COMPLETED', 'CANCELLED'])('handles an unavailable pantry for %s', async status => {
    jest.mocked(authenticatedFetch).mockResolvedValueOnce(response({ detail: 'Pantry not found' }, 404))
        .mockResolvedValueOnce(response({ status }));
    const screen = await render(<Pantry />);
    await waitFor(() => expect(screen.getByText('Grocery list not available')).toBeTruthy());
    expect(!!screen.queryByText(/Groceries become available after completing/)).toBe(status === 'IN_PROGRESS');
    expect(screen.getByRole('button', { name: 'Back to plan' })).toBeTruthy();
    expect(authenticatedFetch).toHaveBeenNthCalledWith(2, getToken, expect.stringMatching(/\/plan_generations\/plan%2F1$/), expect.any(Object));
    await fireEvent.press(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(screen.getByText('Chicken breast')).toBeTruthy());
});

it('distinguishes a missing plan without requesting status', async () => {
    jest.mocked(authenticatedFetch).mockResolvedValue(response({ detail: 'Plan generation not found' }, 404));
    const screen = await render(<Pantry />);
    await waitFor(() => expect(screen.getByText('This plan is unavailable')).toBeTruthy());
    expect(authenticatedFetch).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Your grocery list is empty.')).toBeNull();
});

it.each([500, 404, 200])('offers retry for failed or malformed responses (%s)', async status => {
    jest.mocked(authenticatedFetch).mockResolvedValueOnce(response({ detail: 'Unexpected result' }, status));
    const screen = await render(<Pantry />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy());
    expect(screen.queryByText('Your grocery list is empty.')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(screen.getByText('Chicken breast')).toBeTruthy());
    expect(authenticatedFetch).toHaveBeenCalledTimes(2);
});

it('retries network failures', async () => {
    jest.mocked(authenticatedFetch).mockRejectedValueOnce(new TypeError('Network request failed'));
    const screen = await render(<Pantry />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy());
    await fireEvent.press(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(screen.getByText('Chicken breast')).toBeTruthy());
});

it.each(['401', 'token', 'status-401'])('uses the existing Clerk sign-out flow for an expired session: %s', async failure => {
    if (failure === 'token') jest.mocked(authenticatedFetch).mockRejectedValueOnce(new SessionExpiredError());
    else if (failure === 'status-401') jest.mocked(authenticatedFetch)
        .mockResolvedValueOnce(response({ detail: 'Pantry not found' }, 404)).mockResolvedValueOnce(response({}, 401));
    else jest.mocked(authenticatedFetch).mockResolvedValueOnce(response({}, 401));
    const screen = await render(<Pantry />);
    await waitFor(() => expect(screen.getByText(/Your session has expired/)).toBeTruthy());
    await fireEvent.press(screen.getByRole('button', { name: 'Sign in again' }));
    expect(useClerk().signOut).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith('/');
});

it('refreshes a previously unavailable pantry on focus after plan completion', async () => {
    jest.mocked(authenticatedFetch).mockResolvedValueOnce(response({ detail: 'Pantry not found' }, 404))
        .mockResolvedValueOnce(response({ status: 'IN_PROGRESS' }));
    const screen = await render(<Pantry />);
    await waitFor(() => expect(screen.getByText('Grocery list not available')).toBeTruthy());
    mockFocused = false;
    await screen.rerender(<Pantry />);
    mockFocused = true;
    await screen.rerender(<Pantry />);
    await waitFor(() => expect(screen.getByText('Chicken breast')).toBeTruthy());
    expect(authenticatedFetch).toHaveBeenCalledTimes(3);
});

it.each(['user', 'plan'])('discards stale results when the %s changes', async change => {
    let finish!: (result: Response) => void;
    jest.mocked(authenticatedFetch).mockReturnValueOnce(new Promise(resolve => { finish = resolve; }));
    const screen = await render(<Pantry />);
    if (change === 'user') jest.mocked(useAuth).mockReturnValue({ getToken, userId: 'user-2', isLoaded: true, isSignedIn: true } as never);
    else jest.mocked(useLocalSearchParams).mockReturnValue({ generationId: 'plan-2' });
    await screen.rerender(<Pantry />);
    await waitFor(() => expect(screen.getByText('Chicken breast')).toBeTruthy());
    await act(async () => { finish(response({ items: [{ name: 'Old user groceries', quantity: 1, unit: 'g' }] })); });
    expect(screen.queryByText('Old user groceries')).toBeNull();
    expect(authenticatedFetch).toHaveBeenCalledTimes(2);
    expect(jest.mocked(authenticatedFetch).mock.calls[1][1]).toContain(change === 'plan' ? 'plan-2' : 'plan%2F1');
});

it('formats quantities without trailing zeros or losing small values', () => {
    expect(formatQuantity(12.000)).toBe('12');
    expect(formatQuantity(0.0000123)).toBe('0.0000123');
    expect(Number(formatQuantity(Number.MIN_VALUE))).toBe(Number.MIN_VALUE);
});

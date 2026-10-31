import { useAuth, useUser } from '@clerk/expo';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react-native/pure';
import { File } from 'expo-file-system';
import { useLocalSearchParams } from 'expo-router';
import React, { StrictMode } from 'react';
import Home from '../src/app/(app)/(tabs)/home';
import { authenticatedFetch } from '../src/lib/authenticated-fetch';
import { startNewPlanIntent } from '../src/lib/plan-creation-intent';
import { type Recipe } from '../src/lib/plan-recipes';

const mockReplace = jest.fn();
const mockPush = jest.fn();
jest.mock('@clerk/expo', () => ({ useAuth: jest.fn(), useUser: jest.fn() }));
jest.mock('expo-router', () => ({ useLocalSearchParams: jest.fn(), useRouter: () => ({ replace: mockReplace, push: mockPush }) }));
jest.mock('expo-file-system', () => ({ File: jest.fn(), Paths: { document: 'document' } }));
jest.mock('../src/lib/authenticated-fetch', () => ({ authenticatedFetch: jest.fn() }));
jest.mock('../src/lib/plan-creation-intent', () => ({ startNewPlanIntent: jest.fn() }));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('react-native-safe-area-context', () => ({
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaView: ({ children }: any) => children,
}));
jest.mock('expo-linear-gradient', () => ({
    LinearGradient: ({ children }: any) => children,
}));

const macros = { protein: 42, fat: 12, carbohydrates: 38, calories: null };
const recipe: Recipe = {
    recipe_id: 'recipe-1', meal_slot: 'lunch', name: 'Chicken quinoa bowl', serving_size: 2,
    ingridents: [{ name: 'Chicken breast', quantity: 200, unit: 'g', nutritionPerServing: macros },
        { name: 'Lemon', quantity: 1, nutritionPerServing: macros }],
    nutritionPerServing: macros, cookingDetails: { cookTime: '30 min', difficulty: 2 },
    instructions: [{ step: 2, description: 'Serve with quinoa.' }, { step: 1, description: 'Cook the chicken.' }],
    image: '',
};
const response = (data: unknown, status = 200) => ({ ok: status < 400, status, json: async () => data }) as Response;
const getToken = jest.fn();
const writeSavedPlan = jest.fn((content: string) => { savedPlan = JSON.parse(content); });
let savedPlan: unknown;
let exists: boolean;

beforeEach(() => {
    jest.clearAllMocks();
    exists = true;
    savedPlan = { 'plan-id': 'generation/1', planSetup: true };
    jest.mocked(useAuth).mockReturnValue({ getToken, userId: 'user-1', isLoaded: true, isSignedIn: true } as never);
    jest.mocked(useUser).mockReturnValue({ user: { username: 'alex' } } as never);
    jest.mocked(useLocalSearchParams).mockReturnValue({});
    jest.mocked(File).mockImplementation(() => ({ exists, text: async () => JSON.stringify(savedPlan), write: writeSavedPlan }) as never);
    jest.mocked(authenticatedFetch).mockResolvedValue(response([recipe]));
});
afterEach(async () => { await cleanup(); });

it('opens groceries for the completed plan loaded on Home', async () => {
    const screen = await render(<Home />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'View groceries' })).toBeTruthy());
    await fireEvent.press(screen.getByRole('button', { name: 'View groceries' }));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/(app)/(tabs)/plan', params: { generationId: 'generation/1' } });
});

it('loads the plan in the URL even if a different plan is saved locally', async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ generationId: 'linked-plan' });
    const screen = await render(<Home />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'View groceries' })).toBeTruthy());
    expect(jest.mocked(authenticatedFetch).mock.calls[0][1]).toMatch(/\/linked-plan\/recipies$/);
    await fireEvent.press(screen.getByRole('button', { name: 'View groceries' }));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/(app)/(tabs)/plan', params: { generationId: 'linked-plan' } });
});

it('requests once through StrictMode, slow responses, auth function changes, and opening/closing details', async () => {
    let finish!: (value: Response) => void;
    jest.mocked(authenticatedFetch).mockReturnValue(new Promise(resolve => { finish = resolve; }));
    const screen = await render(<StrictMode><Home /></StrictMode>);
    await waitFor(() => expect(authenticatedFetch).toHaveBeenCalledTimes(1));
    await screen.rerender(<StrictMode><Home /></StrictMode>);
    jest.mocked(useAuth).mockReturnValue({ getToken: jest.fn(), userId: 'user-1', isLoaded: true, isSignedIn: true } as never);
    await screen.rerender(<StrictMode><Home /></StrictMode>);
    expect(authenticatedFetch).toHaveBeenCalledTimes(1);
    expect(authenticatedFetch).toHaveBeenCalledWith(getToken, expect.stringContaining('/plan_generations/generation%2F1/recipies'));
    await act(async () => { finish(response([recipe, { ...recipe, recipe_id: 'recipe-2', name: 'Dinner bowl' }])); });
    expect(screen.getAllByRole('button', { name: /View recipe:/ })).toHaveLength(2);
    await fireEvent.press(screen.getByRole('button', { name: `View recipe: ${recipe.name}` }));
    expect(screen.getByText('Chicken breast')).toBeTruthy();
    expect(screen.getByText('200 g')).toBeTruthy();
    expect(screen.getByText('1 count')).toBeTruthy();
    expect(screen.getByText('Cook the chicken.')).toBeTruthy();
    expect(screen.getByText('Serve with quinoa.')).toBeTruthy();
    expect(screen.getByText(/Difficulty 2/)).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Close recipe details' }));
    expect(screen.queryByText('Chicken breast')).toBeNull();
    expect(authenticatedFetch).toHaveBeenCalledTimes(1);
});

it.each([null, []])('shows setup for an empty response: %j', async data => {
    jest.mocked(authenticatedFetch).mockResolvedValue(response(data));
    const screen = await render(<Home />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Create My Plan' })).toBeTruthy());
    expect(screen.queryByText('Your recipes')).toBeNull();
    expect(authenticatedFetch).toHaveBeenCalledTimes(1);
});

it.each([
    { error: 'error', reason: 'Plan generation not found' },
    { detail: 'Plan generation not found' },
])('shows setup for a missing saved plan without refetching: %j', async error => {
    savedPlan = { 'plan-id': 'deleted-generation', planSetup: true };
    jest.mocked(authenticatedFetch).mockResolvedValue(response(error, 404));
    const screen = await render(<StrictMode><Home /></StrictMode>);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Create My Plan' })).toBeTruthy());
    expect(screen.queryByText('Recipes unavailable')).toBeNull();
    await screen.rerender(<StrictMode><Home /></StrictMode>);
    expect(authenticatedFetch).toHaveBeenCalledTimes(1);
    expect(savedPlan).toEqual({ 'plan-id': null, planSetup: false });
    await fireEvent.press(screen.getByRole('button', { name: 'Create My Plan' }));
    expect(startNewPlanIntent).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith('/(app)/(tabs)/(setup)/user-metrics');
});

it('clears the stale ID after a backend restart so later page loads skip the request', async () => {
    savedPlan = { 'plan-id': 'plan-before-restart', planSetup: true, user: { age: 30 } };
    jest.mocked(authenticatedFetch).mockResolvedValue(response({ error: 'error', reason: 'Plan generation not found' }, 404));
    const first = await render(<Home />);
    await waitFor(() => expect(first.getByRole('button', { name: 'Create My Plan' })).toBeTruthy());
    expect(savedPlan).toEqual({ 'plan-id': null, planSetup: false, user: { age: 30 } });
    await first.unmount();
    const second = await render(<Home />);
    await waitFor(() => expect(second.getByRole('button', { name: 'Create My Plan' })).toBeTruthy());
    expect(second.queryByText('Recipes unavailable')).toBeNull();
    expect(authenticatedFetch).toHaveBeenCalledTimes(1);
    expect(writeSavedPlan).toHaveBeenCalledTimes(1);
});

it('does not clear a newer saved plan when an old request returns not found', async () => {
    let finish!: (value: Response) => void;
    jest.mocked(authenticatedFetch).mockReturnValue(new Promise(resolve => { finish = resolve; }));
    const screen = await render(<Home />);
    await waitFor(() => expect(authenticatedFetch).toHaveBeenCalledTimes(1));
    savedPlan = { 'plan-id': 'new-generation', planSetup: true };
    await act(async () => { finish(response({ error: 'error', reason: 'Plan generation not found' }, 404)); });
    expect(screen.getByRole('button', { name: 'Create My Plan' })).toBeTruthy();
    expect(savedPlan).toEqual({ 'plan-id': 'new-generation', planSetup: true });
    expect(writeSavedPlan).not.toHaveBeenCalled();
});

it('still shows setup when a missing plan cannot be cleared from storage', async () => {
    jest.mocked(File).mockImplementation(() => ({ exists: true, text: async () => JSON.stringify(savedPlan),
        write: () => { throw new Error('Storage unavailable'); } }) as never);
    jest.mocked(authenticatedFetch).mockResolvedValue(response({ error: 'error', reason: 'Plan generation not found' }, 404));
    const screen = await render(<Home />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Create My Plan' })).toBeTruthy());
    expect(screen.queryByText('Recipes unavailable')).toBeNull();
    expect(authenticatedFetch).toHaveBeenCalledTimes(1);
});

it('shows setup for HTTP 204 without attempting to parse its empty body', async () => {
    const emptyResponse = response(null, 204);
    emptyResponse.json = jest.fn().mockRejectedValue(new SyntaxError('Empty body'));
    jest.mocked(authenticatedFetch).mockResolvedValue(emptyResponse);
    const screen = await render(<Home />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Create My Plan' })).toBeTruthy());
    expect(emptyResponse.json).not.toHaveBeenCalled();
    expect(authenticatedFetch).toHaveBeenCalledTimes(1);
});

it.each([false, undefined, null, 'true', 'false', 1])('skips fetching unless setup is explicitly complete (flag: %s)', async planSetup => {
    savedPlan = { 'plan-id': 'generation-1', planSetup };
    const screen = await render(<StrictMode><Home /></StrictMode>);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Create My Plan' })).toBeTruthy());
    expect(screen.queryByText(recipe.name)).toBeNull();
    expect(screen.queryByText('Recipes unavailable')).toBeNull();
    await screen.rerender(<StrictMode><Home /></StrictMode>);
    expect(authenticatedFetch).not.toHaveBeenCalled();
});

it.each([undefined, null, '', '  ', 'null', 'undefined', 'None', 0, {}])('skips fetching when a completed setup has no usable generation ID: %j', async generationId => {
    savedPlan = { 'plan-id': generationId, planSetup: true };
    const screen = await render(<Home />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Create My Plan' })).toBeTruthy());
    expect(screen.queryByText('Recipes unavailable')).toBeNull();
    expect(authenticatedFetch).not.toHaveBeenCalled();
});

it.each(['', '{broken json', 'null', '[]'])('defaults to setup for an empty or invalid saved record: %j', async content => {
    jest.mocked(File).mockImplementation(() => ({ exists: true, text: async () => content }) as never);
    const screen = await render(<Home />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Create My Plan' })).toBeTruthy());
    expect(screen.queryByText('Recipes unavailable')).toBeNull();
    expect(authenticatedFetch).not.toHaveBeenCalled();
});

it('defaults to setup when the local record cannot be read', async () => {
    jest.mocked(File).mockImplementation(() => ({ exists: true, text: async () => { throw new Error('Cannot read file'); } }) as never);
    const screen = await render(<Home />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Create My Plan' })).toBeTruthy());
    expect(screen.queryByText('Recipes unavailable')).toBeNull();
    expect(authenticatedFetch).not.toHaveBeenCalled();
});

it('does not retry a network failure for a completed plan', async () => {
    jest.mocked(authenticatedFetch).mockRejectedValue(new Error('Network unavailable'));
    const screen = await render(<Home />);
    await waitFor(() => expect(screen.getByText('Recipes unavailable')).toBeTruthy());
    await screen.rerender(<Home />);
    expect(authenticatedFetch).toHaveBeenCalledTimes(1);
});

it.each([false, true])('skips requests without a saved generation ID (file exists: %s)', async fileExists => {
    exists = fileExists;
    savedPlan = { plan: {} };
    const screen = await render(<Home />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Get Started' })).toBeTruthy());
    expect(authenticatedFetch).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('button', { name: 'Get Started' }));
    expect(startNewPlanIntent).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith('/(app)/(tabs)/(setup)/user-metrics');
});

it('waits for auth before making its single request', async () => {
    jest.mocked(useAuth).mockReturnValue({ getToken, isLoaded: false } as never);
    const screen = await render(<Home />);
    expect(authenticatedFetch).not.toHaveBeenCalled();
    jest.mocked(useAuth).mockReturnValue({ getToken, userId: 'user-1', isLoaded: true, isSignedIn: true } as never);
    await screen.rerender(<Home />);
    await waitFor(() => expect(screen.getByText(recipe.name)).toBeTruthy());
    expect(authenticatedFetch).toHaveBeenCalledTimes(1);
});

it.each([401, 403, 404, 500])('shows an error without retrying for HTTP %s', async status => {
    jest.mocked(authenticatedFetch).mockResolvedValue(response({ detail: 'Error' }, status));
    const screen = await render(<Home />);
    await waitFor(() => expect(screen.getByText('Recipes unavailable')).toBeTruthy());
    await screen.rerender(<Home />);
    expect(authenticatedFetch).toHaveBeenCalledTimes(1);
    expect(writeSavedPlan).not.toHaveBeenCalled();
});

it('handles malformed recipe data without rendering broken cards', async () => {
    jest.mocked(authenticatedFetch).mockResolvedValue(response([{ recipe_id: 'invalid' }]));
    const screen = await render(<Home />);
    await waitFor(() => expect(screen.getByText(/unexpected response/)).toBeTruthy());
    expect(authenticatedFetch).toHaveBeenCalledTimes(1);
});

it('loads a newly completed plan once when setup returns to the existing Home tab', async () => {
    exists = false;
    const screen = await render(<Home />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Create My Plan' })).toBeTruthy());
    exists = true;
    jest.mocked(useLocalSearchParams).mockReturnValue({ generationId: 'generation/1' });
    await screen.rerender(<Home />);
    await waitFor(() => expect(screen.getByText(recipe.name)).toBeTruthy());
    await screen.rerender(<Home />);
    expect(authenticatedFetch).toHaveBeenCalledTimes(1);
});

it('performs one new request on an actual new page mount', async () => {
    const first = await render(<Home />);
    await waitFor(() => expect(first.getByText(recipe.name)).toBeTruthy());
    await first.unmount();
    const second = await render(<Home />);
    await waitFor(() => expect(second.getByText(recipe.name)).toBeTruthy());
    expect(authenticatedFetch).toHaveBeenCalledTimes(2);
});

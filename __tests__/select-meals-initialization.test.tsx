import React, { StrictMode } from 'react';
import { act, cleanup, render, waitFor } from '@testing-library/react-native/pure';
import { useAuth } from '@clerk/expo';
import { File } from 'expo-file-system';
import { authenticatedFetch } from '@/src/lib/authenticated-fetch';
import { getPlanIntent, startNewPlanIntent } from '@/src/lib/plan-creation-intent';
import SelectMeals from '../src/app/(app)/(tabs)/(setup)/select-meals';

jest.mock('@clerk/expo', () => ({ useAuth: jest.fn() }));
jest.mock('expo-router', () => ({
    useLocalSearchParams: () => ({ cookDayCount: '3', people: '2', meals: 'breakfast,dinner' }),
}));
jest.mock('expo-crypto', () => ({ randomUUID: jest.fn(() => `key-${Math.random()}`) }));
jest.mock('expo-file-system', () => ({ File: jest.fn(), Paths: { document: 'document' } }));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('react-native-safe-area-context', () => ({
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaView: ({ children }: any) => children,
}));
jest.mock('../src/app/(app)/domain/setup-theme', () => ({ setupColors: { primary: '#000' } }), { virtual: true });
jest.mock('../src/app/(app)/(tabs)/(setup)/components/setup-continue-button', () => () => null, { virtual: true });
jest.mock('@/src/lib/authenticated-fetch', () => ({
    authenticatedFetch: jest.fn(), SessionExpiredError: class SessionExpiredError extends Error {},
}));

const plan = { generation_id: 'generation_1', accepted_recipe_count: 0, required_recipe_count: 6 };
const recipe = { recipe_id: 'recipe_1', name: 'Chicken', cookingDetails: { cookTime: '30 min', difficulty: 1 },
    nutritionPerServing: { calories: 400, carbohydrates: 30, fat: 10, protein: 30 } };
const response = (data: any, status = 200) => ({ ok: status < 400, status, json: async () => data }) as Response;
const getToken = jest.fn();
const write = jest.fn();
let userSequence = 0;
let currentUser: string;
const files = new Map<string, string>();
const requirements = { cook_days: 3, number_of_people: 2, meals: ['breakfast', 'dinner'] };
const baseUrl = `http://${process.env.EXPO_PUBLIC_ADDRESS}:8000/api/plan_generations`;

beforeEach(() => {
    jest.clearAllMocks();
    files.clear();
    currentUser = `user-${++userSequence}`;
    jest.mocked(useAuth).mockReturnValue({ getToken, userId: currentUser, isLoaded: true, isSignedIn: true } as never);
    jest.mocked(File).mockImplementation((_directory, name) => ({
        get exists() { return files.has(String(name)); },
        create: jest.fn(),
        textSync: () => files.get(String(name)),
        write: (data: string) => { write(data); files.set(String(name), data); },
    }) as never);
    jest.mocked(authenticatedFetch).mockImplementation(async (_getToken, url) =>
        response(url.endsWith('/candidates') ? recipe : plan));
});
afterEach(async () => { await cleanup(); });

it('starts only one plan while a slow initial request spans multiple renders', async () => {
    let finish!: (value: Response) => void;
    const pending = new Promise<Response>(resolve => { finish = resolve; });
    jest.mocked(authenticatedFetch).mockImplementation(async (_token, url) =>
        url.endsWith('/plan_generations') ? pending : response(recipe));
    const screen = await render(<SelectMeals />);
    try {
        await screen.rerender(<SelectMeals />);
        await screen.rerender(<SelectMeals />);
        expect(authenticatedFetch).toHaveBeenCalledTimes(1);
    } finally {
        await act(async () => { finish(response(plan)); });
    }
    await waitFor(() => expect(screen.getByText('Chicken')).toBeTruthy());
});

it('waits until Clerk is loaded and signed in', async () => {
    jest.mocked(useAuth).mockReturnValue({ getToken, userId: currentUser, isLoaded: false, isSignedIn: false } as never);
    const screen = await render(<SelectMeals />);
    expect(authenticatedFetch).not.toHaveBeenCalled();
    jest.mocked(useAuth).mockReturnValue({ getToken, userId: currentUser, isLoaded: true, isSignedIn: true } as never);
    await screen.rerender(<SelectMeals />);
    await waitFor(() => expect(screen.getByText('Chicken')).toBeTruthy());
});

it('stops after a 401 without saving the error or retrying on renders', async () => {
    jest.mocked(authenticatedFetch).mockResolvedValue(response({ error: 'unauthorized', reason: 'TOKEN_EXPIRED' }, 401));
    const screen = await render(<SelectMeals />);
    await waitFor(() => expect(screen.getByText(/session has expired/i)).toBeTruthy());
    await screen.rerender(<SelectMeals />);
    expect(authenticatedFetch).toHaveBeenCalledTimes(1);
    expect(write).toHaveBeenCalledTimes(1); // Persist the intent before the failed request.
    expect(JSON.parse(write.mock.calls[0][0])).not.toHaveProperty('planId');
});

it('does not create duplicate plans under StrictMode effect replay', async () => {
    const screen = await render(<StrictMode><SelectMeals /></StrictMode>);
    await waitFor(() => expect(screen.getByText('Chicken')).toBeTruthy());
    const creations = jest.mocked(authenticatedFetch).mock.calls.filter(([, url]) => url.endsWith('/plan_generations'));
    expect(creations).toHaveLength(1);
});

it('resumes a saved plan instead of creating another plan', async () => {
    jest.mocked(File).mockImplementation(() => ({ exists: true, textSync: () => JSON.stringify({ key: 'saved-key', requirements, planId: plan.generation_id }), write }) as never);
    const screen = await render(<SelectMeals />);
    await waitFor(() => expect(screen.getByText('Chicken')).toBeTruthy());
    expect(authenticatedFetch).toHaveBeenCalledTimes(2);
    expect(jest.mocked(authenticatedFetch).mock.calls[0][1]).toContain('/plan_generations/generation_1');
    expect(jest.mocked(authenticatedFetch).mock.calls.some(([, url]) => url.endsWith('/plan_generations'))).toBe(false);
});

it('shares a pending creation when the screen unmounts and mounts again', async () => {
    let finish!: (value: Response) => void;
    const pending = new Promise<Response>(resolve => { finish = resolve; });
    jest.mocked(authenticatedFetch).mockImplementation(async (_token, url) =>
        url.endsWith('/plan_generations') ? pending : response(recipe));
    const first = await render(<SelectMeals />);
    await first.unmount();
    const second = await render(<SelectMeals />);
    try {
        const creations = jest.mocked(authenticatedFetch).mock.calls.filter(([, url]) => url.endsWith('/plan_generations'));
        expect(creations).toHaveLength(1);
    } finally {
        await act(async () => { finish(response(plan)); });
    }
    await waitFor(() => expect(second.getByText('Chicken')).toBeTruthy());
});

it('allows a new mount to retry a failed creation', async () => {
    jest.mocked(authenticatedFetch).mockResolvedValueOnce(response({ error: 'unauthorized', reason: 'TOKEN_EXPIRED' }, 401));
    const first = await render(<SelectMeals />);
    await waitFor(() => expect(first.getByText(/session has expired/i)).toBeTruthy());
    await first.unmount();
    const second = await render(<SelectMeals />);
    await waitFor(() => expect(second.getByText('Chicken')).toBeTruthy());
    const creations = jest.mocked(authenticatedFetch).mock.calls.filter(([, url]) => url.endsWith('/plan_generations'));
    expect(creations).toHaveLength(2);
});


it('shares a slow missing-plan lookup across remounts before creating a replacement', async () => {
    let finishLookup!: (value: Response) => void;
    const pendingLookup = new Promise<Response>(resolve => { finishLookup = resolve; });
    jest.mocked(File).mockImplementation(() => ({
        exists: true,
        textSync: () => JSON.stringify({ key: 'deleted-key', requirements, planId: 'deleted-plan' }),
        write,
    }) as never);
    jest.mocked(authenticatedFetch).mockImplementation(async (_token, url) => {
        if (url.endsWith('/deleted-plan')) return pendingLookup;
        return response(url.endsWith('/candidates') ? recipe : plan);
    });
    const first = await render(<SelectMeals />);
    await first.unmount();
    const second = await render(<SelectMeals />);
    try {
        const lookups = jest.mocked(authenticatedFetch).mock.calls.filter(([, url]) => url.endsWith('/deleted-plan'));
        expect(lookups).toHaveLength(1);
    } finally {
        await act(async () => { finishLookup(response({ detail: 'Not found' }, 404)); });
    }
    await waitFor(() => expect(second.getByText('Chicken')).toBeTruthy());
    const creations = jest.mocked(authenticatedFetch).mock.calls.filter(([, url]) => url.endsWith('/plan_generations'));
    expect(creations).toHaveLength(1);
});


it('persists the creation key before sending and reuses it after a failed request and remount', async () => {
    const keys: string[] = [];
    jest.mocked(authenticatedFetch).mockImplementation(async (_token, url, options) => {
        if (!url.endsWith('/plan_generations')) return response(recipe);
        const key = (options?.headers as Record<string, string>)['Idempotency-Key'];
        const stored = [...files.values()].map(value => JSON.parse(value));
        expect(stored.some(value => value.key === key)).toBe(true);
        keys.push(key);
        return keys.length === 1 ? response({ error: 'unavailable' }, 503) : response(plan, 201);
    });
    const first = await render(<SelectMeals />);
    await waitFor(() => expect(first.getByText('unavailable')).toBeTruthy());
    await first.unmount();
    const second = await render(<SelectMeals />);
    await waitFor(() => expect(second.getByText('Chicken')).toBeTruthy());
    expect(keys).toHaveLength(2);
    expect(keys[0]).toBe(keys[1]);
    const creation = jest.mocked(authenticatedFetch).mock.calls.find(([, url]) => url.endsWith('/plan_generations'))!;
    expect(JSON.parse(creation[2]!.body as string)).toEqual(requirements);
});

it('reads intent keys from disk and rotates them only for an intentionally new plan', () => {
    const original = getPlanIntent(baseUrl, currentUser, requirements);
    expect(getPlanIntent(baseUrl, currentUser, requirements).key).toBe(original.key);
    expect(() => getPlanIntent(baseUrl, currentUser, { ...requirements, cook_days: 7 })).toThrow(/Start a new plan/);
    const next = startNewPlanIntent(baseUrl, currentUser);
    expect(next.key).not.toBe(original.key);
    expect(getPlanIntent(baseUrl, currentUser, requirements).key).toBe(next.key);
    expect(getPlanIntent(baseUrl, 'another-user', requirements).key).not.toBe(next.key);
});

it('stops before sending when the intent cannot be persisted', async () => {
    jest.mocked(File).mockImplementation(() => ({ exists: false, create: jest.fn(), write: () => { throw new Error('Storage full'); } }) as never);
    const screen = await render(<SelectMeals />);
    await waitFor(() => expect(screen.getByText('Storage full')).toBeTruthy());
    expect(authenticatedFetch).not.toHaveBeenCalled();
});

it('shows a key conflict without rotating the intent or retrying', async () => {
    jest.mocked(authenticatedFetch).mockResolvedValue(response({ error: 'idempotency_key_conflict' }, 409));
    const screen = await render(<SelectMeals />);
    await waitFor(() => expect(screen.getByText(/already used with different requirements/)).toBeTruthy());
    await screen.rerender(<SelectMeals />);
    expect(authenticatedFetch).toHaveBeenCalledTimes(1);
});


it('reuses the persisted key after reloading the intent module', () => {
    const original = getPlanIntent(baseUrl, currentUser, requirements);
    jest.isolateModules(() => {
        // Reload the implementation while retaining the mocked on-disk files.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const restarted = require('../src/lib/plan-creation-intent') as typeof import('../src/lib/plan-creation-intent');
        expect(restarted.getPlanIntent(baseUrl, currentUser, requirements).key).toBe(original.key);
    });
});

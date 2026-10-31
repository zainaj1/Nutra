import { authenticatedFetch, SessionExpiredError } from './authenticated-fetch';

export type GroceryItem = { name: string; quantity: number; unit: string };
export type PantryResult =
    | { kind: 'ready'; items: GroceryItem[] }
    | { kind: 'missing-plan' }
    | { kind: 'missing-pantry'; status?: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' };

// String preserves even very small numbers without imposing a decimal precision.
export const formatQuantity = (quantity: number) => String(quantity);

export async function loadPantry(
    getToken: Parameters<typeof authenticatedFetch>[0],
    planId: string,
    signal?: AbortSignal,
): Promise<PantryResult> {
    const url = `http://${process.env.EXPO_PUBLIC_ADDRESS}:8000/api/plan_generations/${encodeURIComponent(planId)}`;
    const response = await authenticatedFetch(getToken, `${url}/grocery_list`, { signal });
    if (response.status === 401) throw new SessionExpiredError();
    if (response.status === 404) {
        const error = await response.json().catch(() => null);
        const detail = error?.detail ?? error?.reason;
        if (detail === 'Plan generation not found') return { kind: 'missing-plan' };
        if (detail === 'Pantry not found') {
            const planResponse = await authenticatedFetch(getToken, url, { signal });
            if (planResponse.status === 401) throw new SessionExpiredError();
            const plan = await planResponse.json().catch(() => null);
            if (planResponse.status === 404 && (plan?.detail ?? plan?.reason) === 'Plan generation not found') {
                return { kind: 'missing-plan' };
            }
            if (!planResponse.ok) throw new Error('Could not check your plan. Please try again.');
            return { kind: 'missing-pantry', status: plan?.status };
        }
    }
    if (!response.ok) throw new Error('Could not load your groceries. Please try again.');
    const data = await response.json();
    if (!Array.isArray(data?.items) || !data.items.every((item: unknown) => {
        if (typeof item !== 'object' || item === null) return false;
        const row = item as Record<string, unknown>;
        return typeof row.name === 'string' && typeof row.unit === 'string'
            && typeof row.quantity === 'number' && Number.isFinite(row.quantity);
    })) throw new Error('The grocery service returned an unexpected response. Please try again.');
    // The response generation_id is a pantry UUID, never a plan routing ID.
    return { kind: 'ready', items: data.items };
}

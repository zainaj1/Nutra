import { File, Paths } from 'expo-file-system';
import { authenticatedFetch } from './authenticated-fetch';

export type Macros = {
    protein: number;
    fat: number;
    carbohydrates: number;
    calories?: number | null;
};

export type Recipe = {
    recipe_id: string;
    meal_slot: string;
    name: string;
    serving_size: number;
    // These spellings match the API contract.
    ingridents: { name: string; quantity: number; unit?: string; nutritionPerServing: Macros }[];
    nutritionPerServing: Macros;
    cookingDetails: { cookTime: string; difficulty: number };
    instructions: { step: number; description: string }[];
    image: string;
};

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function isNonnegativeNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isMacros(value: unknown): value is Macros {
    return isObject(value) && isNonnegativeNumber(value.protein) && isNonnegativeNumber(value.fat)
        && isNonnegativeNumber(value.carbohydrates)
        && (value.calories == null || isNonnegativeNumber(value.calories));
}

function isRecipe(value: unknown): value is Recipe {
    return isObject(value) && typeof value.recipe_id === 'string' && typeof value.name === 'string'
        && typeof value.meal_slot === 'string' && Number.isInteger(value.serving_size)
        && typeof value.image === 'string' && isMacros(value.nutritionPerServing)
        && isObject(value.cookingDetails) && typeof value.cookingDetails.cookTime === 'string'
        && Number.isInteger(value.cookingDetails.difficulty)
        && Array.isArray(value.ingridents) && value.ingridents.every(item => isObject(item)
            && typeof item.name === 'string' && isNonnegativeNumber(item.quantity)
            && (item.unit === undefined || typeof item.unit === 'string') && isMacros(item.nutritionPerServing))
        && Array.isArray(value.instructions) && value.instructions.every(item => isObject(item)
            && Number.isInteger(item.step) && typeof item.description === 'string');
}

async function clearMissingSavedPlan(generationId: string) {
    try {
        const file = new File(Paths.document, 'user-plan.json');
        if (!file.exists) return;
        const current: unknown = JSON.parse(await file.text());
        // A response for an old plan must not clear a newly saved plan.
        if (!isObject(current) || current['plan-id'] !== generationId) return;
        file.write(JSON.stringify({ ...current, 'plan-id': null, planSetup: false }));
    } catch {
        // A storage failure must not prevent showing the setup screen.
        // A later page load can check the saved ID again if it remains on disk.
    }
}

export async function loadHomeRecipes(getToken: Parameters<typeof authenticatedFetch>[0], requestedPlanId?: string) {
    const notSetup = { planSetup: false, recipes: [] as Recipe[], generationId: null as string | null };
    let savedPlan: unknown;
    if (requestedPlanId) {
        savedPlan = { 'plan-id': requestedPlanId, planSetup: true };
    } else try {
        const file = new File(Paths.document, 'user-plan.json');
        if (!file.exists) return notSetup;
        savedPlan = JSON.parse(await file.text());
    } catch {
        // No usable local setup record means this is the setup Home screen.
        // Storage/JSON errors here must not become a recipe-service error.
        return notSetup;
    }

    // An ID alone (including one left by an older/incomplete setup) is not
    // confirmation that setup finished. Gate before requesting a token or URL.
    if (!isObject(savedPlan) || savedPlan.planSetup !== true) return notSetup;
    const generationId = savedPlan['plan-id'];
    if (typeof generationId !== 'string' || !generationId.trim()
        || ['null', 'undefined', 'none'].includes(generationId.trim().toLowerCase())) {
        return notSetup;
    }

    const response = await authenticatedFetch(getToken,
        `http://${process.env.EXPO_PUBLIC_ADDRESS}:8000/api/plan_generations/${encodeURIComponent(generationId.trim())}/recipies`);
    if (response.status === 404) {
        // The device can retain an ID after the backend loses/deletes its plan.
        // Only the API's missing-plan response means setup is needed; a
        // missing route or other server error must remain visible.
        const error: unknown = await response.json().catch(() => null);
        // The backend's global HTTP handler uses `reason`; FastAPI's default
        // response uses `detail`. Both represent the same missing-plan result.
        if (isObject(error) && (error.reason === 'Plan generation not found'
            || error.detail === 'Plan generation not found')) {
            await clearMissingSavedPlan(generationId);
            return notSetup;
        }
    }
    if (!response.ok) {
        throw new Error(response.status === 401
            ? 'Your session has expired. Please sign in again.'
            : 'Could not load your recipes. Please reload the app to try again.');
    }
    const data: unknown = response.status === 204 ? null : await response.json();
    if (data === null) return notSetup;
    if (!Array.isArray(data) || !data.every(isRecipe)) {
        throw new Error('The recipe service returned an unexpected response. Please reload the app to try again.');
    }
    return { planSetup: true, recipes: data, generationId: generationId.trim() };
}

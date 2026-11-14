import { randomUUID } from 'expo-crypto';
import { File, Paths } from 'expo-file-system';

export type PlanRequirements = { cook_days: number; number_of_people: number; meals: string[] };
export type PlanCreationIntent = { key: string; requirements?: PlanRequirements; planId?: string };

function intentFile(baseUrl: string, userId: string) {
    return new File(Paths.document, `plan-intent-${encodeURIComponent(userId)}-${encodeURIComponent(baseUrl)}.json`);
}

function persist(baseUrl: string, userId: string, intent: PlanCreationIntent) {
    const file = intentFile(baseUrl, userId);
    if (!file.exists) file.create();
    // A write failure must stop creation, rather than sending an unpersisted key.
    file.write(JSON.stringify(intent));
    return intent;
}

export function startNewPlanIntent(baseUrl: string, userId: string) {
    return persist(baseUrl, userId, { key: randomUUID() });
}

export function getPlanIntent(baseUrl: string, userId: string, requirements: PlanRequirements) {
    const file = intentFile(baseUrl, userId);
    const intent: PlanCreationIntent = file.exists ? JSON.parse(file.textSync()) : { key: randomUUID() };
    if (typeof intent.key !== 'string' || !intent.key.trim()) throw new Error('Could not read your saved plan request. Please start a new plan.');
    if (intent.requirements && JSON.stringify(intent.requirements) !== JSON.stringify(requirements)) {
        throw new Error('These requirements differ from your saved request. Start a new plan to change them.');
    }
    if (!intent.requirements) return persist(baseUrl, userId, { ...intent, requirements });
    return intent;
}

export function saveIntentPlan(baseUrl: string, userId: string, intent: PlanCreationIntent, planId: string) {
    const file = intentFile(baseUrl, userId);
    const current: PlanCreationIntent = JSON.parse(file.textSync());
    // A late response from an old request must not overwrite an intentionally new intent.
    if (current.key === intent.key) persist(baseUrl, userId, { ...intent, planId });
}

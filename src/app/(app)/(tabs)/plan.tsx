import { PageHeading } from '@/components/design/setup-chrome';
import colors from '@/constants/studio-colors.json';
import { SessionExpiredError } from '@/src/lib/authenticated-fetch';
import { formatQuantity, loadPantry, type PantryResult } from '@/src/lib/pantry';
import { useAuth, useClerk } from '@clerk/expo';
import { File, Paths } from 'expo-file-system';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type State = PantryResult | { kind: 'loading' } | { kind: 'no-plan' } | { kind: 'error'; message: string; expired: boolean };

export default function Plan() {
    const { generationId } = useLocalSearchParams<{ generationId?: string | string[] }>();
    const planId = Array.isArray(generationId) ? generationId[0] : generationId;
    const { userId, isLoaded, isSignedIn } = useAuth();
    if (!isLoaded || !isSignedIn || !userId) return <ActivityIndicator accessibilityLabel="Loading session" color={colors.primary} />;
    // A user/plan change discards all previous results and pending UI updates.
    return <PantryContent key={JSON.stringify([userId, planId])} planId={planId} />;
}

function PantryContent({ planId }: { planId?: string }) {
    const { getToken } = useAuth();
    const { signOut } = useClerk();
    const router = useRouter();
    const tokenRef = useRef(getToken);
    useEffect(() => { tokenRef.current = getToken; }, [getToken]);
    const [attempt, setAttempt] = useState(0);
    const [state, setState] = useState<State>({ kind: 'loading' });
    const [signingOut, setSigningOut] = useState(false);
    const [activePlanId, setActivePlanId] = useState(planId);

    useFocusEffect(useCallback(() => {
        let active = true;
        const controller = new AbortController();
        setState({ kind: 'loading' });
        setActivePlanId(planId);
        async function loadGroceries(): Promise<State> {
            let selectedPlanId = planId;
            if (!selectedPlanId) {
                // Opening the tab directly uses the current plan, refreshed on focus.
                const file = new File(Paths.document, 'user-plan.json');
                if (!file.exists) return { kind: 'no-plan' };
                const savedPlan = JSON.parse(await file.text());
                const savedId = savedPlan?.['plan-id'];
                if (typeof savedId !== 'string' || !savedId.trim()
                    || ['null', 'undefined', 'none'].includes(savedId.trim().toLowerCase())) {
                    return { kind: 'no-plan' };
                }
                selectedPlanId = savedId.trim();
            }
            if (!active) return { kind: 'loading' };
            setActivePlanId(selectedPlanId);
            return loadPantry(tokenRef.current, selectedPlanId, controller.signal);
        }
        // No persisted failure cache: returning after recipe completion fetches anew.
        void loadGroceries().then(result => {
            if (active) setState(result);
        }, error => {
            if (active) setState({ kind: 'error', expired: error instanceof SessionExpiredError,
                message: error instanceof SessionExpiredError ? error.message : 'Could not load your groceries. Check your connection and try again.' });
        });
        return () => { active = false; controller.abort(); };
    // Changing attempt intentionally starts a fresh request on explicit retry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [planId, attempt]));

    async function signInAgain() {
        setSigningOut(true);
        try {
            await signOut();
            router.replace('/');
        } catch {
            setState({ kind: 'error', expired: true, message: 'Could not end your session. Please try signing in again.' });
        } finally {
            setSigningOut(false);
        }
    }

    const unavailable = state.kind === 'missing-pantry';
    return <SafeAreaView className="flex-1 bg-studio-cream">
        <ScrollView contentContainerClassName="px-5 py-6 w-full max-w-3xl self-center">
            {activePlanId && <TouchableOpacity accessibilityRole="button" className="self-start py-3 mb-4"
                onPress={() => router.push({ pathname: '/(app)/(tabs)/(setup)/select-meals', params: { generationId: activePlanId } })}>
                <Text className="font-semibold text-studio-primary">Back to plan</Text>
            </TouchableOpacity>}
            <PageHeading eyebrow="Groceries" title="Groceries for your plan" subtitle="Everything you need for your selected recipes." />
            {state.kind === 'loading' ? <View accessibilityState={{ busy: true }} accessibilityLiveRegion="polite" className="items-center py-12 gap-4">
                <ActivityIndicator color={colors.primary} size="large" />
                <Text className="text-studio-muted">Loading your groceries...</Text>
            </View> : state.kind === 'no-plan' ? <View className="bg-white rounded-3xl border border-studio-border p-6">
                <Text className="text-lg font-semibold text-studio-main mb-3">No meal plan yet</Text>
                <Text className="text-studio-muted leading-6">Create a meal plan to see your groceries here.</Text>
                <TouchableOpacity accessibilityRole="button" className="self-start mt-5 rounded-2xl bg-studio-primary px-6 py-4"
                    onPress={() => router.push('/(app)/(tabs)/home')}>
                    <Text className="text-white font-semibold">Go to Home</Text>
                </TouchableOpacity>
            </View> : state.kind === 'ready' ? <View className="bg-white rounded-3xl border border-studio-border p-5">
                {state.items.length === 0 ? <Text className="text-studio-muted py-6">Your grocery list is empty.</Text>
                    : state.items.map((item, index) => <View key={index} className="flex-row flex-wrap items-start justify-between gap-3 py-4 border-b border-studio-border">
                        <Text className="text-base font-semibold text-studio-main flex-grow flex-shrink basis-40">{item.name}</Text>
                        <Text className="text-base text-studio-muted">{formatQuantity(item.quantity)}{item.unit ? ` ${item.unit}` : ''}</Text>
                    </View>)}
            </View> : <View accessibilityRole="alert" accessibilityLiveRegion="polite" className="bg-white rounded-3xl border border-studio-border p-6">
                <Text className="text-lg font-semibold text-studio-main mb-3">
                    {state.kind === 'missing-plan' ? 'This plan is unavailable' : unavailable ? 'Grocery list not available' : 'Groceries unavailable'}
                </Text>
                <Text className="text-studio-muted leading-6">
                    {state.kind === 'missing-plan' ? 'The plan could not be found or is no longer available.'
                        : unavailable ? state.status === 'IN_PROGRESS'
                            ? 'Groceries become available after completing recipe selection. Return to your plan to finish choosing recipes.'
                            : 'Your grocery list is not available right now. Please try again.'
                            : state.message}
                </Text>
                {(unavailable || state.kind === 'error') && <TouchableOpacity accessibilityRole="button"
                    disabled={signingOut} accessibilityState={{ disabled: signingOut }}
                    className="self-start mt-5 rounded-2xl bg-studio-primary px-6 py-4"
                    onPress={state.kind === 'error' && state.expired ? signInAgain : () => setAttempt(value => value + 1)}>
                    <Text className="text-white font-semibold">{state.kind === 'error' && state.expired ? 'Sign in again' : 'Retry'}</Text>
                </TouchableOpacity>}
            </View>}
        </ScrollView>
    </SafeAreaView>;
}

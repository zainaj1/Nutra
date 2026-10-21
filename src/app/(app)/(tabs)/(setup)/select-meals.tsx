import { authenticatedFetch, SessionExpiredError } from '@/src/lib/authenticated-fetch';
import { getPlanIntent, saveIntentPlan, type PlanRequirements } from '@/src/lib/plan-creation-intent';
import { useAuth } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { File, Paths } from 'expo-file-system';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { setupColors } from '../../domain/setup-theme';
import SetupContinueButton from './components/setup-continue-button';



function savePlan(planResponse: any) {
    try {
        const file = new File(Paths.document, 'user-plan.json');
        if (!file.exists) {
            file.create();
        }

        file.write(JSON.stringify({
            "plan-id": planResponse["generation_id"],
            planSetup: planResponse.accepted_recipe_count >= planResponse.required_recipe_count,
        }));
    } catch (error) {
        console.error('Error saving user data:', error);
    }
}

async function responseError(response: Response, fallback: string) {
    if (response.status === 401) return 'Your session has expired. Please sign in again.';
    // APIs may return JSON errors, validation arrays, or a non-JSON error page.
    try {
        const body = await response.json();
        if (response.status === 409 && body.error === 'idempotency_key_conflict') {
            return 'This request key was already used with different requirements. Please start a new plan.';
        }
        const detail = body.detail ?? body.message ?? body.error;
        if (typeof detail === 'string' && detail.trim()) return detail;
        if (Array.isArray(detail)) {
            const messages = detail
                .map((item) => typeof item?.msg === 'string' ? item.msg : null)
                .filter(Boolean);
            if (messages.length) return messages.join('\n');
        }
    } catch {
        // Keep the fallback when the server does not provide a usable message.
    }
    if (response.status === 429) return 'Too many requests. Please wait a moment and try again.';
    if (response.status >= 500) return 'The recipe service is temporarily unavailable. Please try again shortly.';
    return fallback;
}


// Share the entire lookup/create operation across mounts, including slow saved-plan lookups.
const pendingPlanCreations = new Map<string, Promise<any>>();

function loadPlanOnce(
    getToken: Parameters<typeof authenticatedFetch>[0],
    baseUrl: string,
    userId: string | null | undefined,
    requirements: PlanRequirements,
): Promise<any> {
    if (!userId) return Promise.reject(new SessionExpiredError());
    let intent;
    try {
        intent = getPlanIntent(baseUrl, userId, requirements);
    } catch (error) {
        return Promise.reject(error);
    }
    const key = JSON.stringify([baseUrl, userId, intent.key]);
    const existing = pendingPlanCreations.get(key);
    if (existing) return existing;
    const pending = (async () => {
        const savedId = intent.planId;
        if (savedId) {
            const savedResponse = await authenticatedFetch(getToken, `${baseUrl}/${encodeURIComponent(savedId)}`);
            if (savedResponse.ok) {
                const savedPlan = await savedResponse.json();
                if (!savedPlan?.generation_id) throw new Error('The server did not return a valid meal plan.');
                return savedPlan;
            }
            if (savedResponse.status !== 404) {
                throw new Error(await responseError(savedResponse, 'Could not load your saved plan.'));
            }
        }
        const response = await authenticatedFetch(getToken, baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Idempotency-Key': intent.key },
            body: JSON.stringify(requirements),
        });
        if (!response.ok) {
            throw new Error(await responseError(response, 'Could not create your meal plan.'));
        }
        const plan = await response.json();
        if (!plan?.generation_id) throw new Error('The server did not return a valid meal plan.');
        // Persist before releasing the shared promise, so later mounts resume it.
        saveIntentPlan(baseUrl, userId, intent, plan.generation_id);
        savePlan(plan);
        return plan;
    })();
    pendingPlanCreations.set(key, pending);
    const release = () => { pendingPlanCreations.delete(key); };
    void pending.then(release, release);
    return pending;
}

export default function SelectMeals() {
    const params = useLocalSearchParams();
    const getParamValue = (value: string | string[] | undefined) => (
        Array.isArray(value) ? value[0] : value
    );
    const cookDayCount = Number(getParamValue(params.cookDayCount));
    const people = Number(getParamValue(params.people));
    const meals = getParamValue(params.meals) || '';

    const { getToken, isLoaded, isSignedIn, userId } = useAuth();
    const initializationStarted = useRef(false);
    const [planResponse, setPlanResponse] = useState<any>(null);
    const [currentRecipe, setCurrentRecipe] = useState<any>(null);
    const [isUpdatingRecipe, setIsUpdatingRecipe] = useState(false);
    const [recipeError, setRecipeError] = useState<string | null>(null);
    const recipeRequestInFlight = useRef(false);
    const [needsRefresh, setNeedsRefresh] = useState(false);
    const pendingRefresh = useRef<{ nextRecipe: any } | null>(null);
    const isPlanComplete = planResponse && planResponse.accepted_recipe_count >= planResponse.required_recipe_count;
    async function refreshPlan(url: string) {
        const planResult = await authenticatedFetch(getToken, url);
        if (!planResult.ok) {
            throw new Error(await responseError(planResult, 'Could not refresh your plan. Please try again.'));
        }
        const updatedPlan = await planResult.json();
        savePlan(updatedPlan);
        setPlanResponse(updatedPlan);
        setCurrentRecipe(
            updatedPlan.accepted_recipe_count >= updatedPlan.required_recipe_count
                ? null
                : pendingRefresh.current?.nextRecipe ?? null
        );
        pendingRefresh.current = null;
        setNeedsRefresh(false);
    }

    async function updateRecipe(action: 'accept' | 'reject') {
        if (!planResponse || !currentRecipe || isPlanComplete || recipeRequestInFlight.current) return;

        recipeRequestInFlight.current = true;
        setIsUpdatingRecipe(true);
        setRecipeError(null);
        try {
            const url = `http://${process.env.EXPO_PUBLIC_ADDRESS}:8000/api/plan_generations/${planResponse.generation_id}`;
            const response = await authenticatedFetch(getToken, `${url}/candidates/${action}`, {
                method: 'POST',
            });
            if (!response.ok) {
                setRecipeError(await responseError(response, `Could not ${action} this recipe. Please try again.`));
                return;
            }

            // The action succeeded. Never offer the old candidate for submission again.
            pendingRefresh.current = { nextRecipe: null };
            setNeedsRefresh(true);
            setCurrentRecipe(null);
            pendingRefresh.current.nextRecipe = await response.json();
            await refreshPlan(url);
        } catch (error) {
            setRecipeError(
                error instanceof SessionExpiredError
                    ? error.message
                    : pendingRefresh.current
                    ? 'Your recipe was updated, but we could not load your plan. Refresh to continue.'
                    : error instanceof TypeError
                        ? 'Could not connect to the recipe service. Check your connection and try again.'
                        : 'Could not update your recipe. Please try again.'
            );
        } finally {
            recipeRequestInFlight.current = false;
            setIsUpdatingRecipe(false);
        }
    }

    async function retryRefresh() {
        if (!pendingRefresh.current || recipeRequestInFlight.current) return;
        recipeRequestInFlight.current = true;
        setIsUpdatingRecipe(true);
        setRecipeError(null);
        try {
            const url = `http://${process.env.EXPO_PUBLIC_ADDRESS}:8000/api/plan_generations/${planResponse.generation_id}`;
            await refreshPlan(url);
        } catch (error) {
            setRecipeError(error instanceof SessionExpiredError
                ? error.message
                : 'Your recipe was updated, but we could not load your plan. Refresh to continue.');
        } finally {
            recipeRequestInFlight.current = false;
            setIsUpdatingRecipe(false);
        }
    }

    useEffect(() => {
        if (!isLoaded || !isSignedIn || !userId || initializationStarted.current) return;
        // Reserve synchronously before starting async work. Renders, auth updates,
        // and StrictMode effect replay must not create additional plans.
        initializationStarted.current = true;
        const baseUrl = `http://${process.env.EXPO_PUBLIC_ADDRESS}:8000/api/plan_generations`;

        async function initializePlan() {
            try {
                const plan = await loadPlanOnce(getToken, baseUrl, userId, {
                    cook_days: cookDayCount,
                    number_of_people: people,
                    meals: ['breakfast', 'lunch', 'dinner', 'dessert'].filter(meal => meals.includes(meal)),
                });
                if (!plan?.generation_id) throw new Error('The server did not return a valid meal plan.');
                savePlan(plan);
                setPlanResponse(plan);
                if (plan.accepted_recipe_count >= plan.required_recipe_count) return;

                const response = await authenticatedFetch(getToken, `${baseUrl}/${plan.generation_id}/candidates`, {
                    method: 'POST',
                });
                if (!response.ok) {
                    throw new Error(await responseError(response, 'Could not load your recipe.'));
                }
                const candidate = await response.json();
                if (!candidate?.recipe_id) throw new Error('The server did not return a valid recipe.');
                setCurrentRecipe(candidate);
            } catch (error) {
                // Keep the guard set: failures require user action, never a render retry.
                setRecipeError(error instanceof Error ? error.message : 'Could not load your recipes.');
            }
        }
        void initializePlan();
    }, [isLoaded, isSignedIn, userId, getToken, cookDayCount, people, meals]);


    return (
        <SafeAreaProvider>
            <SafeAreaView className="flex-1 bg-setup-cream">
                <ScrollView
                    className="flex-1"
                    contentContainerClassName="px-5 pt-4 pb-6"
                    showsVerticalScrollIndicator={false}
                >

                    {/* Header Text */}
                    <View className="items-center mb-6">
                        <Text className="text-3xl font-bold text-setup-main mb-2 text-center">
                            Pick your recipes
                        </Text>
                        <Text className="text-sm text-setup-muted text-center">
                            {planResponse ? `${planResponse.accepted_recipe_count} out of ${planResponse.required_recipe_count}` : 'Loading...'}
                        </Text>
                    </View>

                    {
                        currentRecipe && !isUpdatingRecipe ? (
                            <View className="min-h-80 flex-col rounded-2xl bg-setup-card items-center justify-center border border-setup-border px-5 py-6">
                                <View>
                                    <Text>{currentRecipe.name}</Text>
                                    <Text>Cook time: {currentRecipe.cookingDetails.cookTime}</Text>
                                    <Text>Difficulty: {currentRecipe.cookingDetails.difficulty}</Text>
                                    <Text>Calories: {currentRecipe.nutritionPerServing.calories}</Text>
                                    <Text>Carbohydrates: {currentRecipe.nutritionPerServing.carbohydrates}</Text>
                                    <Text>Fat: {currentRecipe.nutritionPerServing.fat}</Text>
                                    <Text>Protein: {currentRecipe.nutritionPerServing.protein}</Text>
                                </View>
                                <View className="flex-row gap-8 mt-6">

                                    <TouchableOpacity
                                        accessibilityRole="button"
                                        accessibilityLabel="Accept recipe"
                                        accessibilityState={{ disabled: isUpdatingRecipe }}
                                        activeOpacity={0.75}
                                        disabled={isUpdatingRecipe}
                                        onPress={() => updateRecipe('accept')}
                                        className="bg-setup-primary w-20 h-20 rounded-full items-center justify-center shadow-sm"
                                    >
                                        <Ionicons name="checkmark" size={28} color="white" />
                                        <Text className="text-white text-xs font-semibold">Accept</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        accessibilityRole="button"
                                        accessibilityLabel="Reject recipe"
                                        accessibilityState={{ disabled: isUpdatingRecipe }}
                                        activeOpacity={0.75}
                                        disabled={isUpdatingRecipe}
                                        onPress={() => updateRecipe('reject')}
                                        className="bg-red-600 w-20 h-20 rounded-full items-center justify-center shadow-sm"
                                    >
                                        <Ionicons name="close" size={28} color="white" />
                                        <Text className="text-white text-xs font-semibold">Reject</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <View
                                className="min-h-80 rounded-2xl bg-setup-card items-center justify-center border border-setup-border px-5 py-6"
                                accessibilityLiveRegion="polite"
                                accessibilityState={{ busy: isUpdatingRecipe || (!isPlanComplete && !recipeError) }}
                            >
                                {(isUpdatingRecipe || (!isPlanComplete && !recipeError)) && (
                                    <View className="w-20 h-20 rounded-full bg-setup-soft items-center justify-center mb-4">
                                        <ActivityIndicator size="large" color={setupColors.primary} />
                                    </View>
                                )}
                                <Text className="text-lg font-semibold text-setup-main text-center">
                                    {isUpdatingRecipe ? 'Preparing your next recipe...' : isPlanComplete ? 'All recipes accepted!' : recipeError ? 'Recipe unavailable.' : 'Loading your recipes...'}
                                </Text>
                                {(isUpdatingRecipe || (!isPlanComplete && !recipeError)) && (
                                    <Text className="text-sm text-setup-muted text-center mt-2">
                                        This may take a moment. Your recipe will appear here when it’s ready.
                                    </Text>
                                )}
                            </View>
                        )
                    }
                    {recipeError && (
                        <View
                            accessibilityRole="alert"
                            accessibilityLiveRegion="polite"
                            className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4"
                        >
                            <View className="flex-row items-center gap-2 mb-2">
                                <Ionicons name="alert-circle-outline" size={22} color="#b91c1c" />
                                <Text className="font-semibold text-red-800">Could not complete your request</Text>
                            </View>
                            <Text className="text-red-800">{recipeError}</Text>
                            {needsRefresh ? (
                                <TouchableOpacity
                                    accessibilityRole="button"
                                    disabled={isUpdatingRecipe}
                                    onPress={retryRefresh}
                                    className="mt-3 self-start rounded-xl bg-red-100 px-4 py-3"
                                >
                                    <Text className="font-semibold text-red-800">Refresh plan</Text>
                                </TouchableOpacity>
                            ) : currentRecipe ? (
                                <Text className="mt-2 text-red-800">Your recipe is still here. You can try accepting or rejecting it again.</Text>
                            ) : null}
                        </View>
                    )}
                </ScrollView>

                {/* Finalize Button */}
                <View className="px-5 pt-3 pb-4">
                    <SetupContinueButton
                        href={{
                            pathname: "/(app)/(tabs)/home",
                            params: { generationId: planResponse?.generation_id },
                        }}
                        label="Pick my Recipes"
                        disabled={isUpdatingRecipe || !isPlanComplete}
                        onPress={() => console.log('Finalize button pressed')}
                        replace={true}
                    />
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

import { useAuth } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { File, Paths } from 'expo-file-system';
import { useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { setupColors } from '../../domain/setup-theme';
import SetupContinueButton from './components/setup-continue-button';



export default function SelectMeals() {
    const params = useLocalSearchParams();
    const getParamValue = (value: string | string[] | undefined) => (
        Array.isArray(value) ? value[0] : value
    );
    const cookDayCount = Number(getParamValue(params.cookDayCount));
    const people = Number(getParamValue(params.people));
    const meals = getParamValue(params.meals) || '';

    const { getToken } = useAuth();
    const [planResponse, setPlanResponse] = useState<any>(null);
    const [currentRecipe, setCurrentRecipe] = useState<any>(null);
    const [isUpdatingRecipe, setIsUpdatingRecipe] = useState(false);
    const [recipeError, setRecipeError] = useState<string | null>(null);
    const recipeRequestInFlight = useRef(false);
    const isPlanComplete = planResponse && planResponse.accepted_recipe_count >= planResponse.required_recipe_count;
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'dessert'];

    function convertMealsToArray(meals: string): string[] {
        const mealNames = mealTypes.filter((meal) => meals.includes(meal));
        return mealNames;
    }

    async function submitPlan(cookDayCount: number, people: number, meals: string[]) {
        const planId = getSavedPlanId();
        if (planId) {
            console.log('Existing plan with ID:', planId);
            return;
        }

        const token = await getToken()
        await fetch('http://localhost:8000/api/plan_generations', {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                cook_days: cookDayCount,
                number_of_people: people,
                meals: meals
            })
        })
            .then((res) => res.json())
            .catch((error) => console.error('Error submitting plan:', error))
            .then((data) => {
                setPlanResponse(data)
                getRecipe(data)
                savePlan(data)
            })
            .catch((error) => console.error('Error parsing plan:', error));
    }

    function getSavedPlanId(): string | null {
        try {
            const file = new File(Paths.document, 'user-plan.json');

            if (!file.exists) return null;

            const data = JSON.parse(file.textSync());
            const planId = data["plan-id"];

            return typeof planId === 'string' && planId.trim()
                ? planId
                : null;
        } catch (error) {
            console.error('Error reading saved plan:', error);
            return null;
        }
    }

    function savePlan(planResponse: any) {
        try {
            const file = new File(Paths.document, 'user-plan.json');
            if (!file.exists) {
                file.create();
            }

            file.write(JSON.stringify({
                "plan-id": planResponse["generation_id"],
            }));
        } catch (error) {
            console.error('Error saving user data:', error);
        }
    }

    async function getRecipe(planResponse: any) {
        console.log('Fetching recipe for planResponse:', planResponse["generation_id"]);
        const token = await getToken()
        await fetch(`http://localhost:8000/api/plan_generations/${planResponse["generation_id"]}/candidates`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            method: 'POST',
        })
            .then((res) => res.json())
            .catch((error) => console.error('Error submitting plan:', error))
            .then((data) => {
                console.log('Recipe data:', data);
                setCurrentRecipe(data);
            })
            .catch((error) => console.error('Error parsing plan:', error));
    }

    async function updateRecipe(action: 'accept' | 'reject') {
        if (!planResponse || !currentRecipe || isPlanComplete || recipeRequestInFlight.current) return;

        recipeRequestInFlight.current = true;
        setIsUpdatingRecipe(true);
        setRecipeError(null);
        try {
            const token = await getToken();
            const url = `http://localhost:8000/api/plan_generations/${planResponse.generation_id}`;
            const headers = { Authorization: `Bearer ${token}` };
            const response = await fetch(`${url}/candidates/${action}`, {
                method: 'POST',
                headers,
            });
            if (!response.ok) throw new Error(`Could not ${action} recipe (${response.status}).`);

            const nextRecipe = await response.json();
            // Acceptance returns a candidate, not the updated plan counts.
            // Clear the old candidate immediately so it cannot be accepted again.
            setCurrentRecipe(null);
            const planResult = await fetch(url, { headers });
            if (!planResult.ok) throw new Error(`Recipe updated, but could not refresh plan (${planResult.status}).`);

            const updatedPlan = await planResult.json();
            setPlanResponse(updatedPlan);
            setCurrentRecipe(
                updatedPlan.accepted_recipe_count >= updatedPlan.required_recipe_count
                    ? null
                    : nextRecipe
            );
        } catch (error) {
            console.error(`Error ${action}ing recipe:`, error);
            setRecipeError(error instanceof Error ? error.message : 'Could not update recipe.');
        } finally {
            recipeRequestInFlight.current = false;
            setIsUpdatingRecipe(false);
        }
    }

    if (!planResponse) {
        submitPlan(cookDayCount, people, convertMealsToArray(meals));
    }


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
                    {recipeError && <Text accessibilityRole="alert">{recipeError}</Text>}
                </ScrollView>

                {/* Finalize Button */}
                <View className="px-5 pt-3 pb-4">
                    <SetupContinueButton
                        href={{
                            pathname: "/(app)/(tabs)/home"
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

import { RecipeCard, RecipeDetails } from '@/components/recipe-card';
import { startNewPlanIntent } from '@/src/lib/plan-creation-intent';
import { loadHomeRecipes, type Recipe } from '@/src/lib/plan-recipes';
import { useAuth, useUser } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { cssInterop } from 'nativewind';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import InfoTips from '../../components/info-tips';
import { setupColors } from '../domain/setup-theme';


cssInterop(LinearGradient, {
    className: 'style',
});

export default function Home() {
    const { generationId } = useLocalSearchParams<{ generationId?: string }>();
    // Finishing a new plan starts a new page load even if the tab stayed mounted.
    return <HomeContent key={generationId ?? 'saved-plan'} />;
}

function HomeContent() {
    const { user } = useUser();
    const { getToken, userId, isLoaded, isSignedIn } = useAuth();
    const [planStartError, setPlanStartError] = useState<string | null>(null);
    const [planSetup, setPlanSetup] = useState(false);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const initialLoad = useRef<ReturnType<typeof loadHomeRecipes> | null>(null);

    useEffect(() => {
        if (!isLoaded || !isSignedIn || !userId) return;
        // Retain the same promise through renders and StrictMode effect replay.
        // Failures are retained too: no polling or automatic retries.
        if (!initialLoad.current) initialLoad.current = loadHomeRecipes(getToken);
        let active = true;
        void initialLoad.current.then(result => {
            if (!active) return;
            setPlanSetup(result.planSetup);
            setRecipes(result.recipes);
            setIsLoading(false);
        }, error => {
            if (!active) return;
            setLoadError(error instanceof Error ? error.message : 'Could not load your recipes. Please reload the app to try again.');
            setIsLoading(false);
        });
        return () => { active = false; };
    }, [getToken, isLoaded, isSignedIn, userId]);

    const userName = user?.username
        ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
        : "";

    const currentDateText = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    });
    const router = useRouter();

    const redirectToSetup = () => {
        if (!userId) return;
        try {
            startNewPlanIntent(`http://${process.env.EXPO_PUBLIC_ADDRESS}:8000/api/plan_generations`, userId);
            setPlanStartError(null);
            router.replace('/(app)/(tabs)/(setup)/user-metrics');
        } catch {
            setPlanStartError('Could not save your new plan request. Check device storage and try again.');
        }
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView className="flex-1 bg-setup-cream">
                <ScrollView
                    className="flex-1"
                    contentContainerClassName="px-5 pt-2 pb-4"
                    showsVerticalScrollIndicator={false}
                >

                    {/* Header */}
                    <View className='flex-col items-start gap-2 pb-8'>
                        <Text className='text-lg text-gray-400 font-bold'> {currentDateText} </Text>
                        <View className="flex-row">
                            <Text className='text-2xl font-bold'> Good Morning {userName}</Text>
                            <Ionicons
                                name="hand-right"
                                color={setupColors.yellow}
                                size={24}
                            ></Ionicons>
                        </View>
                    </View>

                    {planStartError && (
                        <Text accessibilityRole="alert" className="text-red-800 mb-4">{planStartError}</Text>
                    )}
                    {isLoading ? (
                        <View className="items-center py-16 gap-4" accessibilityState={{ busy: true }}>
                            <ActivityIndicator size="large" color="#3d7b50" />
                            <Text className="text-gray-500">Loading your recipes...</Text>
                        </View>
                    ) : loadError ? (
                        <View accessibilityRole="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5">
                            <Text className="font-bold text-red-800 mb-2">Recipes unavailable</Text>
                            <Text className="text-red-800">{loadError}</Text>
                        </View>
                    ) : planSetup && recipes.length > 0 ? (
                        <View>
                            <Text accessibilityRole="header" className="text-2xl font-bold text-[#1c3020] mb-2">Your recipes</Text>
                            <Text className="text-gray-500 mb-5">{recipes.length} recipes in your plan · Tap a card to start cooking</Text>
                            {recipes.map((recipe, index) => (
                                <RecipeCard key={`${recipe.recipe_id}-${index}`} recipe={recipe} onPress={() => setSelectedRecipe(recipe)} />
                            ))}
                        </View>
                    ) : (
                        <>
                            {/* Meal Plan Card */}
                            <LinearGradient
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                colors={['#3d7b50', '#5a9e6f']}
                                className="flex-col w-full rounded-2xl items-start gap-4 px-5 py-5 mb-4"
                            >

                                <Text className="font-bold text-white/70 text-base">Ready to start?</Text>

                                <Text className="font-bold text-white text-xl">
                                    No meal plan yet? {'\n'}Let&apos;s build yours
                                </Text>

                                <Text className="text-left font-bold text-white/70 text-sm">
                                    Answer a few quick questions and we&apos;ll create a personalized plan with recipes matched to your goals.
                                </Text>

                                <TouchableOpacity accessibilityRole="button" accessibilityLabel="Create My Plan" onPress={redirectToSetup}>

                                    <View className=" flex-row rounded-2xl items-center shadow-sm bg-white gap-2 px-4 py-3 mb-4" >
                                        <Text className="text-left font-bold text-[#3d7b50] text-sm" > Create My Plan</Text>
                                        <Ionicons
                                            name="arrow-forward"
                                            size={16}
                                            color="#3d7b50" />
                                    </View>
                                </TouchableOpacity>
                            </LinearGradient>

                            {/* What Youll get Cards */}

                            <Text className='text-lg text-gray-600 mb-5'> What you&apos;ll get </Text>
                            <View className='flex-col gap-2'>
                                <InfoTips
                                    label="Personalized Macros"
                                    description="Calorie and nutrient targets based on your body and goals"
                                    icon="golf-outline"
                                    color="red"
                                />
                                <InfoTips
                                    label="Custom recipes"
                                    description="Handpicked meals that match your taste and dietary needs"
                                    icon="fast-food-outline"
                                    color="black"
                                />
                                <InfoTips
                                    label="Grocery list"
                                    description="Automated weekly shopping list synced to your plan"
                                    icon="list-outline"
                                    color="grey"
                                />
                                <InfoTips
                                    label="Progress tracking"
                                    description="Daily check-ins to keep you on track toward your goal"
                                    icon="bar-chart-outline"
                                    color="grey"
                                />

                                <TouchableOpacity accessibilityRole="button" accessibilityLabel="Get Started" onPress={redirectToSetup}>
                                    <View className="flex-row rounded-2xl items-center justify-center shadow-sm bg-[#3d7b50] gap-2 px-2 py-4" >
                                        <Text className="font-bold text-white" > Get Started</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                </ScrollView>
                {selectedRecipe && <RecipeDetails recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />}
            </SafeAreaView>
        </SafeAreaProvider >
    );
}

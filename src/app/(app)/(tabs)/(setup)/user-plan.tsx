import { SetupFooter } from '@/components/design/setup-chrome';
import GlassSurface from '@/components/design/glass-surface';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { File, Paths } from 'expo-file-system';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import setupColors from '@/constants/studio-colors.json';
import SetupContinueButton from './components/setup-continue-button';
import TargetDivider from './components/target-divider';
import TargetRow from './components/target-row';
import { ActivityLevel, Gender, User, UserGoal } from './domain/user';
import UserPlan from './domain/user-plan';



export default function FinalizePlan() {
    const params = useLocalSearchParams();
    const { getToken, isLoaded } = useAuth()
    const getParamValue = (value: string | string[] | undefined) => (
        Array.isArray(value) ? value[0] : value
    );

    const activityLevel = getParamValue(params.activityLevel) as ActivityLevel;
    const gender = getParamValue(params.gender) as Gender;
    const height = Number(getParamValue(params.height));
    const age = Number(getParamValue(params.age));
    const goalWeight = Number(getParamValue(params["goal-weight"]));
    const weight = Number(getParamValue(params.weight));
    const pace = Number(getParamValue(params.pace));

    const userData: User = {
        activityLevel,
        gender,
        height,
        age,
        weight
    };

    const userGoal: UserGoal = {
        goalWeight,
        pace,
    };

    const userPlan = UserPlan.from(userData, userGoal);

    const warningMessage = "Please note, you should consult with a healthcare professional or registered dietitian before making any significant changes to your diet or exercise routine."
    if (!isLoaded) {
        return (<View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={setupColors.primary} />
        </View>
        )
    }

    function savePlan() {
        try {
            const file = new File(Paths.document, 'user-plan.json');
            if (!file.exists) {
                file.create();
            }

            file.write(JSON.stringify({
                user: userData,
                goal: userGoal,
                plan: userPlan,
            }));
        } catch (error) {
            console.error('Error saving user data:', error);
        }
    }

    async function submitPlan() {
        const token = await getToken()
        const res = await fetch(`http://${process.env.EXPO_PUBLIC_ADDRESS}:8000/api/user_macros`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify(userPlan.get_json())
        })
        console.log(res.status, await res.clone().json())
        return res.json()
    }

    async function handleFinalizePlan() {
        savePlan();
        await submitPlan();
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView edges={['left', 'right', 'bottom']} className="flex-1 bg-studio-cream">
                <ScrollView
                    className="flex-1"
                    contentContainerClassName="px-5 pt-4 pb-6"
                    showsVerticalScrollIndicator={false}
                >

                    {/* Header Text */}
                    <LinearGradient colors={['#3d7b50', '#5a9e6f']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={{ borderRadius: 24, padding: 24, marginBottom: 24, overflow: 'hidden' }}>
                        <View pointerEvents="none" style={{ position: 'absolute', right: -24, top: -30, width: 150, height: 150, borderRadius: 75, backgroundColor: '#ffffff12' }} />
                        <Text className="text-white/70 text-xs font-bold tracking-widest uppercase mb-3">Your personal plan</Text>
                        <Text accessibilityRole="header" className="text-white text-3xl font-bold mb-2">Ready to go.</Text>
                        <Text className="text-white/80 text-sm leading-6 mb-5">Daily targets, tailored to your body and your goals.</Text>
                        <GlassSurface style={{ padding: 16, backgroundColor: 'transparent', borderColor: '#ffffff55' }}>
                            <Text className="text-studio-main text-3xl font-bold">{userPlan.planCalories.toFixed(0)}</Text>
                            <Text className="text-studio-dark text-xs font-semibold mt-1">kcal per day</Text>
                        </GlassSurface>
                    </LinearGradient>

                    {/* Plan Overview */}
                    <View className="flex-col gap-3 justify-center rounded-2xl border border-studio-border bg-studio-card px-4 py-4 mb-4 shadow-sm shadow-studio-border">

                        <View className="flex-row items-center">
                            <Text className="font-bold text-studio-main"> Daily Targets </Text>
                            <Text className="text-studio-muted text-sm"> (rough estimate ) </Text>
                        </View>

                        <TargetRow
                            iconName="flame"
                            iconColor={setupColors.planIcons.calories}
                            targetLabel="Calories"
                            targetValue={userPlan.planCalories.toFixed(0)}
                            targetSubValue="kcal/day"
                        />
                        <TargetDivider />
                        <TargetRow
                            iconName="fish"
                            iconColor={setupColors.planIcons.protein}
                            targetLabel="Protein"
                            targetValue={userPlan.proteinGrams.toFixed(0)}
                            targetSubValue="g/day"
                        />
                        <TargetDivider />
                        <TargetRow
                            iconName="leaf"
                            iconColor={setupColors.planIcons.carbs}
                            targetLabel="Carbs"
                            targetValue={userPlan.carbGrams.toFixed(0)}
                            targetSubValue="g/day"
                        />
                        <TargetDivider />
                        <TargetRow
                            iconName="water"
                            iconColor={setupColors.planIcons.fat}
                            targetLabel="Fat"
                            targetValue={userPlan.fatGrams.toFixed(0)}
                            targetSubValue="g/day"
                        />
                    </View>

                    {/* Timeline  */}
                    <View className="flex-row gap-3 rounded-2xl border border-studio-border bg-studio-card px-4 py-4 mb-4 shadow-sm shadow-studio-border">

                        {/* icon */}
                        <View className="mr-2 w-16 h-16 shrink-0 rounded-full bg-studio-soft items-center justify-center">
                            <Ionicons
                                name="calendar-outline"
                                size={30}
                                color={setupColors.primary}
                            />
                        </View>

                        {/* Value */}
                        <View className="flex-1 flex-col">
                            <Text className="text-md font-bold text-studio-main">
                                Expected Timeline
                            </Text>
                            <Text className="text-xl font-bold text-studio-main mb-0.5">
                                ~{userPlan.totalWeeksToReachGoal.toFixed()} weeks to goal
                            </Text>
                            <Text className="text-studio-muted">
                                Based on ~{pace.toFixed(1)} lb per week
                            </Text>
                        </View>

                    </View>


                    {/* Warning message  */}
                    <View className="flex-row gap-3 rounded-2xl border border-studio-border bg-studio-soft px-4 py-4 mb-2 shadow-sm shadow-studio-border">

                        <Ionicons
                            name="information-circle-outline"
                            size={30}
                            color={setupColors.primary}
                        />

                        {/* Value */}
                        <View className="flex-1 flex-col">
                            <Text className="text-sm text-studio-dark">
                                {warningMessage}
                            </Text>
                        </View>

                    </View>
                </ScrollView>

                {/* Finalize Button */}
                <SetupFooter>
                    <SetupContinueButton
                        href={{
                            pathname: "/(app)/(tabs)/(setup)/setup-meals"
                        }}
                        label="Setup my Meals"
                        onPress={handleFinalizePlan}
                    />
                </SetupFooter>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

import { useAuth } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import SetupContinueButton from './components/setup-continue-button';
import TargetDivider from './components/target-divider';
import TargetRow from './components/target-row';
import { CalculateUserMacros } from './domain/calculate-user-macros';
import CalculateUserPlan from './domain/calculate-user-plan';
import { ActivityLevel, Gender } from './domain/user';
import { setupColors } from './setup-theme';



export default function UserGoals() {
    const params = useLocalSearchParams();
    const { isLoaded } = useAuth()
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

    const { planCalories } = CalculateUserPlan({
        activityLevel,
        gender,
        height,
        age,
        weight
    }, {
        goalWeight,
        pace,
    });

    const totalWeeksToReachGoal = Math.abs(weight - goalWeight) / pace;
    const { proteinGrams, fatGrams, carbGrams } = CalculateUserMacros(planCalories);

    const warningMessage = "Please note, you should consult with a healthcare professional or registered dietitian before making any significant changes to your diet or exercise routine."
    if (!isLoaded) {
        return (<View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={setupColors.primary} />
        </View>
        )
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView className="flex-1 bg-setup-cream">
                <ScrollView
                    className="flex-1"
                    contentContainerClassName="px-5 pt-2 pb-4"
                    showsVerticalScrollIndicator={false}
                >

                    {/* Header Text */}
                    <View>
                        <Text className="text-2xl font-bold text-setup-main mb-4 text-center">
                            Your Plan is Ready
                        </Text>
                        <Text className="text-2sm text-setup-muted mb-4 text-center">
                            Here is your personalized calorie and macro guide.
                        </Text>
                    </View>

                    {/* Plan Overview */}
                    <View className="flew-col gap-3 justify-center rounded-2xl border border-setup-border bg-setup-card px-4 py-3 mb-4 shadow-xl shadow-setup-border">

                        <View className="flex-row items-center">
                            <Text className="font-bold text-setup-main"> Daily Targets </Text>
                            <Text className="text-setup-muted text-sm"> (rough estimate ) </Text>
                        </View>

                        <TargetRow
                            iconName="flame"
                            iconColor={setupColors.planIcons.calories}
                            targetLabel="Calories"
                            targetValue={planCalories.toFixed(0)}
                            targetSubValue="kcal/day"
                        />
                        <TargetDivider />
                        <TargetRow
                            iconName="fish"
                            iconColor={setupColors.planIcons.protein}
                            targetLabel="Protein"
                            targetValue={proteinGrams.toFixed(0)}
                            targetSubValue="g/day"
                        />
                        <TargetDivider />
                        <TargetRow
                            iconName="leaf"
                            iconColor={setupColors.planIcons.carbs}
                            targetLabel="Carbs"
                            targetValue={carbGrams.toFixed(0)}
                            targetSubValue="g/day"
                        />
                        <TargetDivider />
                        <TargetRow
                            iconName="water"
                            iconColor={setupColors.planIcons.fat}
                            targetLabel="Fat"
                            targetValue={fatGrams.toFixed(0)}
                            targetSubValue="g/day"
                        />
                    </View>

                    {/* Timeline  */}
                    <View className="flex-row gap-3 rounded-2xl border border-setup-border bg-setup-card px-4 py-3 mb-4 shadow-xl shadow-setup-border">

                        {/* icon */}
                        <View className="mr-2 w-16 h-16 shrink-0 rounded-full bg-setup-soft items-center justify-center">
                            <Ionicons
                                name="calendar-outline"
                                size={30}
                                color={setupColors.primary}
                            />
                        </View>

                        {/* Value */}
                        <View className="flex-col">
                            <Text className="text-md font-bold text-setup-main">
                                Expected Timeline
                            </Text>
                            <Text className="text-xl font-bold text-setup-main mb-0.5">
                                ~{totalWeeksToReachGoal.toFixed()} weeks to goal
                            </Text>
                            <Text className="text-setup-muted">
                                Based on ~{pace.toFixed(1)} lb per week
                            </Text>
                        </View>

                    </View>


                    {/* Timeline  */}
                    <View className="flex-row gap-3 rounded-2xl border border-setup-border bg-setup-soft px-4 py-3 mb-4 shadow-xl shadow-setup-border">

                        <Ionicons
                            name="information-circle-outline"
                            size={30}
                            color={setupColors.primary}
                        />

                        {/* Value */}
                        <View className="flex-1 flex-col">
                            <Text className="text-sm text-setup-dark">
                                {warningMessage}
                            </Text>
                        </View>

                    </View>
                </ScrollView>

                {/* Finalize Button */}
                <View className="px-5 pb-4">
                    <SetupContinueButton
                        href={{
                            pathname: "/(app)/(tabs)/home"
                        }}
                        label="Finalize Plan"
                        replace
                    />
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

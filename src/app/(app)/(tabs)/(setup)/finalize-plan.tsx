import { useAuth } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { Link, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
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

    const { bmi, tdee, planCalories } = CalculateUserPlan({
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
    const totalMonthsToReachGoal = totalWeeksToReachGoal / 4.345;

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
            <SafeAreaView className="flex-1 bg-gray-50">
                <ScrollView
                    className="flex-1"
                    contentContainerClassName="px-5 pt-2 pb-4"
                    showsVerticalScrollIndicator={false}
                >

                    {/* Header Text */}
                    <View>
                        <Text className="text-2xl font-bold text-gray-900 mb-4 text-center">
                            Your Plan is Ready
                        </Text>
                        <Text className="text-2sm text-gray-600 mb-4 text-center">
                            Here is your personalized calorie and macro guide.
                        </Text>
                    </View>

                    {/* Plan Overview */}
                    <View className="flew-col gap-3 justify-center rounded-2xl border border-gray-200 bg-white px-4 py-3 mb-4 shadow-xl shadow-gray-200">

                        <View className="flex-row items-center">
                            <Text className="font-bold"> Daily Targets </Text>
                            <Text className="text-gray-600 text-sm"> (rough estimate ) </Text>
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
                    <View className="flex-row gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 mb-4 shadow-xl shadow-gray-200">

                        {/* icon */}
                        <View className="mr-2 w-16 h-16 shrink-0 rounded-full bg-setup-light items-center justify-center">
                            <Ionicons
                                name="calendar-outline"
                                size={30}
                                color={setupColors.primary}
                            />
                        </View>

                        {/* Value */}
                        <View className="flex-col">
                            <Text className="text-md font-bold text-gray-900">
                                Expected Timeline
                            </Text>
                            <Text className="text-xl font-bold text-gray-900 mb-0.5">
                                ~{totalWeeksToReachGoal.toFixed()} weeks to goal
                            </Text>
                            <Text className="text-gray-600">
                                Based on ~{pace} lb per week
                            </Text>
                        </View>

                    </View>


                    {/* Timeline  */}
                    <View className="flex-row gap-3 rounded-2xl border border-gray-200 bg-setup-light px-4 py-3 mb-4 shadow-xl shadow-gray-200">

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

                    {/* Continue Button */}
                    <Link href={{
                        pathname: "/(app)/(tabs)/(setup)/user-goals",
                        params: {
                        }
                    }} push asChild>
                        <TouchableOpacity
                            activeOpacity={0.85}
                            className={
                                "bg-setup-primary rounded-2xl py-4 items-center justify-center shadow-sm "
                            }
                            accessibilityRole="button"
                            accessibilityLabel="Continue"
                        >
                            <Text className="text-white font-bold text-lg">
                                Finalize Plan
                            </Text>
                        </TouchableOpacity>
                    </Link>

                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

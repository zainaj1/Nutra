import { useAuth } from '@clerk/expo';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    Text,
    View
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import {
    calculatePlanSummary,
    type CompletePlanUserData,
    type NumberRange,
    type SetupUserData,
} from './(setup)/lib/user-data';
import { loadUserPlan } from './(setup)/lib/user-plan-storage';

function hasCompletePlan(userData: SetupUserData | null): userData is SetupUserData & CompletePlanUserData {
    return (
        userData !== null &&
        userData.weight !== undefined &&
        userData.goalWeight !== undefined &&
        userData.heightInches !== undefined &&
        userData.age !== undefined &&
        userData.gender !== undefined &&
        userData.activityLevel !== undefined &&
        userData.pace !== undefined
    );
}

function formatRange(value: NumberRange, suffix: string) {
    return `${Math.round(value[0])}-${Math.round(value[1])} ${suffix}`;
}

function PlanMetric({ label, value }: { label: string; value: string }) {
    return (
        <View className="flex-col, gap-4">
            <View className="flex-1 min-w-[140px] rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <Text className="text-sm font-medium text-gray-500 mb-1">
                    {label}
                </Text>
                <Text className="text-2xl font-bold text-gray-900">
                    {value}
                </Text>
            </View>
        </View>
    );
}

export default function Home() {
    const { isLoaded } = useAuth();
    const [userData, setUserData] = useState<SetupUserData | null>(null);
    const [isLoadingPlan, setIsLoadingPlan] = useState(true);

    useEffect(() => {
        let isMounted = true;

        loadUserPlan().then((savedPlan) => {
            if (isMounted) {
                setUserData(savedPlan);
                setIsLoadingPlan(false);
            }
        });

        return () => {
            isMounted = false;
        };
    }, []);

    if (!isLoaded || isLoadingPlan) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#16a34a" />
            </View>
        );
    }

    if (!hasCompletePlan(userData)) {
        return (
            <SafeAreaProvider>
                <SafeAreaView className="flex-1 bg-gray-50 px-5 pt-6">
                    <View className="rounded-2xl border border-gray-100 bg-white p-5">
                        <Text className="text-2xl font-bold text-gray-900 mb-2">
                            No plan yet
                        </Text>
                        <Text className="text-gray-500">
                            Complete setup to see your calories and macros here.
                        </Text>
                    </View>
                </SafeAreaView>
            </SafeAreaProvider>
        );
    }

    const plan = calculatePlanSummary(userData);

    return (
        <SafeAreaProvider>
            <SafeAreaView className="flex-1 bg-gray-50">
                <ScrollView
                    className="flex-1"
                    contentContainerClassName="px-5 pt-6 pb-10 gap-5"
                    showsVerticalScrollIndicator={false}
                >
                    <View>
                        <Text className="text-3xl font-bold text-gray-900 mb-2">
                            Your Plan
                        </Text>
                        <Text className="text-gray-500">
                            Daily targets based on your setup.
                        </Text>
                    </View>

                    <View className="rounded-2xl border border-green-100 bg-green-50 p-5">
                        <Text className="text-sm font-semibold uppercase text-green-700 mb-1">
                            Daily Calories
                        </Text>
                        <Text className="text-4xl font-bold text-green-700">
                            {formatRange(plan.dailyCalories, 'cal')}
                        </Text>
                    </View>

                    <View className="flex-row flex-wrap gap-3">
                        <PlanMetric label="TDEE" value={formatRange(plan.tdee, 'cal')} />
                        <PlanMetric label="Timeline" value={`${Math.ceil(plan.timeline)} weeks`} />
                    </View>

                    <View className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                        <Text className="text-lg font-bold text-gray-900 mb-3">
                            Macros
                        </Text>
                        <View className="gap-3">
                            <PlanMetric label="Carbs" value={formatRange(plan.macros.carbs, 'g')} />
                            <PlanMetric label="Protein" value={formatRange(plan.macros.protein, 'g')} />
                            <PlanMetric label="Fat" value={formatRange(plan.macros.fat, 'g')} />
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

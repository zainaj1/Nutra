import { useAuth } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    Text,
    View
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import FinalizeButton from './components/finalize-button';
import { useSetupUserData } from './context/setup-user-data-context';
import {
    calculateBmr,
    calculatePlanSummary,
    type CompletePlanUserData,
    type BmrUserData,
    type NumberRange,
    type SetupUserData
} from './lib/user-data';
import { saveUserPlan } from './lib/user-plan-storage';

function formatValue(value: number | string | undefined, suffix = '') {
    if (value === undefined || value === '') {
        return 'Not set';
    }

    return `${value}${suffix}`;
}

function formatActivityLevel(value: string | undefined) {
    if (!value) {
        return 'Not set';
    }

    return value
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function ReviewRow({ label, value }: { label: string; value: string }) {
    return (
        <View className="flex-row items-center justify-between border-b border-gray-100 py-3">
            <Text className="text-base font-medium text-gray-600">
                {label}
            </Text>
            <Text className="text-base font-bold text-gray-900">
                {value}
            </Text>
        </View>
    );
}

function formatCalorieRange(value: NumberRange | null) {
    if (value === null) {
        return 'Not ready';
    }

    return `${Math.round(value[0])}-${Math.round(value[1])} cal/day`;
}

function hasBmrData(userData: SetupUserData): userData is SetupUserData & BmrUserData {
    return (
        userData.weight !== undefined &&
        userData.heightInches !== undefined &&
        userData.age !== undefined &&
        userData.gender !== undefined
    );
}

function hasPlanData(
    userData: SetupUserData
): userData is SetupUserData & CompletePlanUserData {
    return (
        userData.weight !== undefined &&
        userData.goalWeight !== undefined &&
        userData.heightInches !== undefined &&
        userData.age !== undefined &&
        userData.gender !== undefined &&
        userData.activityLevel !== undefined &&
        userData.pace !== undefined
    );
}

export default function FinalizePlan() {
    const { isLoaded } = useAuth();
    const router = useRouter();
    const { userData } = useSetupUserData();
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const bmr = hasBmrData(userData)
        ? calculateBmr({
            weight: userData.weight,
            heightInches: userData.heightInches,
            age: userData.age,
            gender: userData.gender,
        })
        : null;

    const planData = hasPlanData(userData) ? calculatePlanSummary(userData) : null;

    const handleFinalize = async () => {
        if (planData === null) {
            return;
        }

        try {
            setSaveError(null);
            setIsSaving(true);
            await saveUserPlan(userData);
            router.replace('/(app)/(tabs)/home');
        } catch (error) {
            console.error('Failed to save user plan', error);
            setSaveError('We could not save your plan. Please try again.');
            setIsSaving(false);
        }
    };

    if (!isLoaded) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#16a34a" />
            </View>
        );
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView className="flex-1 bg-gray-50">
                <ScrollView
                    className="flex-1"
                    contentContainerClassName="px-5 pt-4 pb-28 gap-5"
                    showsVerticalScrollIndicator={false}
                >
                    <View className="items-center">
                        <Text className="text-3xl font-bold text-gray-900 mb-2 text-center">
                            Finalize your plan
                        </Text>

                        <Text className="text-gray-500 text-center">
                            Here is the setup data we have collected so far.
                        </Text>
                    </View>

                    <View className="rounded-2xl border border-gray-100 bg-white px-4 py-2 shadow-sm">
                        <ReviewRow label="Current Weight" value={formatValue(userData.weight, ' lb')} />
                        <ReviewRow label="Goal Weight" value={formatValue(userData.goalWeight, ' lb')} />
                        <ReviewRow label="Height" value={formatValue(userData.heightInches, ' in')} />
                        <ReviewRow label="Age" value={formatValue(userData.age)} />
                        <ReviewRow label="Gender" value={formatActivityLevel(userData.gender)} />
                        <ReviewRow label="Activity Level" value={formatActivityLevel(userData.activityLevel)} />
                        <ReviewRow label="Pace" value={formatValue(userData.pace, ' lb/week')} />
                    </View>

                    <View className="rounded-2xl border border-green-100 bg-green-50 px-4 py-4">
                        <Text className="text-sm font-semibold uppercase text-green-700 mb-1">
                            Estimated BMR
                        </Text>
                        <Text className="text-3xl font-bold text-green-700">
                            {bmr === null ? 'Not ready' : `${Math.round(bmr)} cal/day`}
                        </Text>
                    </View>

                    <View className="rounded-2xl border border-green-100 bg-white px-4 py-4 shadow-sm">
                        <Text className="text-sm font-semibold uppercase text-green-700 mb-3">
                            Daily Plan
                        </Text>

                        <ReviewRow
                            label="Estimated TDEE"
                            value={formatCalorieRange(planData?.tdee ?? null)}
                        />
                        <ReviewRow
                            label="Daily Calories"
                            value={formatCalorieRange(planData?.dailyCalories ?? null)}
                        />
                        <ReviewRow
                            label="Timeline"
                            value={
                                planData === null || !Number.isFinite(planData.timeline)
                                    ? 'Not ready'
                                    : `${Math.ceil(planData.timeline)} weeks`
                            }
                        />
                    </View>

                    {saveError ? (
                        <Text className="text-center text-sm font-semibold text-red-600">
                            {saveError}
                        </Text>
                    ) : null}
                </ScrollView>
                <FinalizeButton
                    disabled={planData === null}
                    loading={isSaving}
                    onPress={handleFinalize}
                />
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

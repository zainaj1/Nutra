import { useAuth } from '@clerk/expo';
import { File, Paths } from 'expo-file-system';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import TargetDivider from './(setup)/components/target-divider';
import TargetRow from './(setup)/components/target-row';
import { User, UserGoal } from './(setup)/domain/user';
import UserPlan, { UserPlanValues } from './(setup)/domain/user-plan';
import { setupColors } from './(setup)/setup-theme';

type SavedUserPlanFile = {
    user: User;
    goal: UserGoal;
    plan: UserPlanValues;
};

type SavedUserPlan = {
    user: User;
    goal: UserGoal;
    plan: UserPlan;
};

const USER_PLAN_FILE_NAME = 'user-plan.json';

async function readSavedUserPlan(): Promise<SavedUserPlan | null> {
    try {
        const file = new File(Paths.document, USER_PLAN_FILE_NAME);

        if (!file.exists) {
            return null;
        }

        const savedPlan = JSON.parse(await file.text()) as SavedUserPlanFile;

        return {
            user: savedPlan.user,
            goal: savedPlan.goal,
            plan: UserPlan.fromValues(savedPlan.plan),
        };
    } catch (error) {
        console.error('Error reading user plan:', error);
        return null;
    }
}

export default function Home() {
    const { isLoaded } = useAuth();
    const [savedUserPlan, setSavedUserPlan] = useState<SavedUserPlan | null>();

    useEffect(() => {
        readSavedUserPlan().then(setSavedUserPlan);
    }, []);

    if (!isLoaded || savedUserPlan === undefined) {
        return (
            <View className="flex-1 items-center justify-center bg-setup-cream">
                <ActivityIndicator size="large" color={setupColors.primary} />
            </View>
        );
    }

    if (!savedUserPlan) {
        return (
            <SafeAreaProvider>
                <SafeAreaView className="flex-1 bg-setup-cream">
                    <ScrollView
                        className="flex-1"
                        contentContainerClassName="px-5 pt-2 pb-4"
                        showsVerticalScrollIndicator={false}
                    >
                        <View className="flex-1 items-center justify-center">
                            <Text className="text-2xl font-bold text-setup-main text-center">
                                No user plan found. Please complete the setup process.
                            </Text>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </SafeAreaProvider>
        );
    }

    const { goal, plan } = savedUserPlan;

    return (
        <SafeAreaProvider>
            <SafeAreaView className="flex-1 bg-setup-cream">
                <ScrollView
                    className="flex-1"
                    contentContainerClassName="px-5 pt-2 pb-4"
                    showsVerticalScrollIndicator={false}
                >
                    <View>
                        <Text className="text-2xl font-bold text-setup-main mb-4 text-center">
                            Home Page
                        </Text>
                    </View>

                    <View className="flew-col gap-3 justify-center rounded-2xl border border-setup-border bg-setup-card px-4 py-3 mb-4 shadow-xl shadow-setup-border">
                        <View className="flex-row items-center">
                            <Text className="font-bold text-setup-main"> Daily Targets </Text>
                            <Text className="text-setup-muted text-sm"> (rough estimate ) </Text>
                        </View>

                        <TargetRow
                            iconName="flame"
                            iconColor={setupColors.planIcons.calories}
                            targetLabel="Calories"
                            targetValue={plan.planCalories.toFixed(0)}
                            targetSubValue="kcal/day"
                        />
                        <TargetDivider />
                        <TargetRow
                            iconName="fish"
                            iconColor={setupColors.planIcons.protein}
                            targetLabel="Protein"
                            targetValue={plan.proteinGrams.toFixed(0)}
                            targetSubValue="g/day"
                        />
                        <TargetDivider />
                        <TargetRow
                            iconName="leaf"
                            iconColor={setupColors.planIcons.carbs}
                            targetLabel="Carbs"
                            targetValue={plan.carbGrams.toFixed(0)}
                            targetSubValue="g/day"
                        />
                        <TargetDivider />
                        <TargetRow
                            iconName="water"
                            iconColor={setupColors.planIcons.fat}
                            targetLabel="Fat"
                            targetValue={plan.fatGrams.toFixed(0)}
                            targetSubValue="g/day"
                        />
                    </View>

                    <View className="rounded-2xl border border-setup-border bg-setup-card px-4 py-3">
                        <Text className="text-setup-main font-bold">
                            Goal Pace
                        </Text>
                        <Text className="text-setup-muted">
                            {goal.pace.toFixed(1)} lb per week
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

import { useAuth } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    Text,
    View
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import ActivityButton from './components/activity-button';
import PaceSlider from './components/pace-slider';
import SetupContinueButton from './components/setup-continue-button';
import WeightBox from './components/weight-box';
import { useSetupUserData } from './context/setup-user-data-context';
import type { ActivityLevel } from './lib/user-data';
import { calculateBmr, parseWeight } from './lib/user-data';

export { calculateBmr };

export default function UserGoals() {

    const { isLoaded } = useAuth()
    const { userData, updateUserData } = useSetupUserData();
    const [weight, setWeight] = useState(userData.weight?.toString() ?? '160');
    const [goalWeight, setGoalWeight] = useState(userData.goalWeight?.toString() ?? '150');
    const [pace, setPace] = useState(userData.pace ?? 0.5);
    const [selectedActivity, setSelectedActivity] = useState<ActivityLevel | null>(
        userData.activityLevel ?? null
    );

    const displayedPace = pace.toFixed(1);
    const isWeightLoss = parseFloat(goalWeight) < parseFloat(weight);

    const canContinue =
        selectedActivity !== null &&
        weight !== null &&
        goalWeight !== null

    useEffect(() => {
        updateUserData({
            weight: parseWeight(weight),
            goalWeight: parseWeight(goalWeight),
            activityLevel: selectedActivity ?? undefined,
            pace,
        });
    }, [goalWeight, pace, selectedActivity, updateUserData, weight]);

    if (!isLoaded) {
        return (<View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#0000ff" />
        </View>
        )
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView className="flex-1 bg-gray-50 ">
                <ScrollView
                    className="flex-1"
                    contentContainerClassName="px-5 pt-4 pb-28 gap-5"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View className="items-center">
                        <Text className="text-3xl font-bold text-gray-900 mb-2 text-center">
                            {"What's your goal?"}
                        </Text>

                        <Text className="text-gray-500 text-center">
                            Choose what you want to work towards.
                        </Text>
                    </View>

                    {/* Weight Boxes */}
                    <View className="flex-row items-stretch justify-center gap-3">
                        <WeightBox title="Current Weight" weight={weight} setWeight={setWeight} />
                        <View className="h-10 w-10 rounded-full items-center justify-center self-center">
                            <Ionicons
                                name="arrow-forward-outline"
                                size={20}
                                color="#16a34a"
                            />
                        </View>
                        <WeightBox title="Goal Weight" weight={goalWeight} setWeight={setGoalWeight} />
                    </View>

                    {/* Activity Level */}
                    <View>
                        <Text className="text-lg font-bold text-gray-900 mb-2">
                            Activity Level
                        </Text>

                        <View className="flex-row flex-wrap items-start justify-center gap-3">
                            <ActivityButton
                                label="Sedentary"
                                secondaryLabel="Little or no exercise"
                                icon="bed-outline"
                                selected={selectedActivity === "sedentary"}
                                onPress={() => setSelectedActivity("sedentary")}
                            />

                            <ActivityButton
                                label="Lightly Active"
                                secondaryLabel="1-3 days/week"
                                icon="flame-outline"
                                selected={selectedActivity === "lightly_active"}
                                onPress={() => setSelectedActivity("lightly_active")}
                            />

                            <ActivityButton
                                label="Active"
                                secondaryLabel="3-5 days/week"
                                icon="flash-outline"
                                selected={selectedActivity === "moderately_active"}
                                onPress={() => setSelectedActivity("moderately_active")}
                            />

                            <ActivityButton
                                label="Very Active"
                                secondaryLabel="6-7 days/week"
                                icon="bicycle-outline"
                                selected={selectedActivity === "very_active"}
                                onPress={() => setSelectedActivity("very_active")}
                            />
                        </View>
                    </View>

                    {/* Pace slider */}
                    <View>
                        <Text className="absolute text-lg font-bold text-gray-900 bottom-15">
                            Pace
                        </Text>

                        <View className="items-center justify-center">
                            <PaceSlider value={pace} onValueChange={setPace} />
                        </View>
                    </View>


                    {/* Expected Pace */}
                    <View className="items-center justify-center gap-3">
                        <Text className="text-gray-500 text-sm text-center leading-5 px-2">
                            A more aggressive pace may lead to faster results, but it can also be harder to maintain.
                        </Text>
                        <View className="flex-row w-full items-start rounded-2xl border border-gray-200 bg-white px-4 py-4 gap-3">
                            <View className="h-14 w-14 rounded-full bg-green-100 items-center justify-center">
                                <Ionicons
                                    name={isWeightLoss ? "trending-down-outline" : "trending-up-outline"}
                                    size={28}
                                    color="#16a34a"
                                />
                            </View>

                            <View className="flex-1 min-w-0">
                                <Text className="text-lg font-bold text-gray-900 mb-0.5">
                                    Expected Pace:
                                </Text>
                                <Text className="text-base font-semibold text-gray-900 mb-1">
                                    {isWeightLoss ? "-" : ""} {displayedPace} lb/week
                                </Text>
                                <Text className="text-gray-500 text-sm leading-5">
                                    {pace < 1
                                        ? "This is a sustainable pace. Results may be slower, but easier to maintain."
                                        : pace < 1.5
                                            ? "This is a moderate pace. You should see results."
                                            : "This is a fast pace. You may see quick results, but it can be hard to maintain."
                                    }
                                </Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
                <SetupContinueButton
                    href="/(app)/(tabs)/(setup)/finalize-plan"
                    disabled={!canContinue}
                    text="Generate Plan"
                />
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

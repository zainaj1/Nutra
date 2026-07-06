import { useAuth } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    Text,
    View
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import EditBox from './components/edit-box';
import PaceSlider from './components/pace-slider';
import SetupContinueButton from './components/setup-continue-button';
import { ActivityLevel, Gender } from './domain/user';
import { setupColors } from './setup-theme';

export default function UserGoals() {
    const activtyLevel = useLocalSearchParams().activityLevel as ActivityLevel;
    const gender = useLocalSearchParams().gender as Gender;
    const height = Number(useLocalSearchParams().height);
    const age = Number(useLocalSearchParams().age);


    const { isLoaded } = useAuth()
    const [weight, setWeight] = useState(useLocalSearchParams().weight as string);
    const [goalWeight, setGoalWeight] = useState('150');
    const [pace, setPace] = useState(1.0);

    const displayedPace = pace.toFixed(1);
    const isWeightLoss = parseFloat(goalWeight) < parseFloat(weight);
    const paceMessage = isWeightLoss
        ? pace < 1
            ? "Slower pace helps preserve more muscle and is much more sustainable long term."
            : pace < 1.5
                ? "A moderate pace balances steady progress with recovery and day-to-day flexibility."
                : "A faster pace can show quick results, but is harder to sustain long term."
        : pace < 1
            ? "A slower gain helps keep fat gain lower and gives your body more time to build muscle."
            : pace < 1.5
                ? "A moderate gain supports steady progress while keeping extra fat gain more manageable."
                : "A faster gain can move the scale quickly, but more of it is likely to come from fat.";

    const canContinue = goalWeight !== null && goalWeight !== '' && pace !== null;

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
                    contentContainerClassName="px-5 pt-4 pb-6"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View className="items-center mb-6">
                        <Text className="text-3xl font-bold text-setup-main mb-2 text-center">
                            {"What's your goal?"}
                        </Text>

                        <Text className="text-sm text-setup-muted text-center">
                            Choose what you want to work towards.
                        </Text>
                    </View>

                    {/* Weight Boxes */}
                    <View className="flex-row items-center justify-between gap-2 mb-6">
                        <EditBox
                            title="Current Weight"
                            value={weight}
                            setValue={setWeight}
                            specialCharacters="lb"
                            className="flex-1 min-w-0"
                        />
                        <View className="rounded-full bg-setup-soft p-2">
                            <Ionicons
                                name="arrow-forward-outline"
                                size={24}
                                color={setupColors.textOlive}
                            />
                        </View>
                        <EditBox
                            title="Goal Weight"
                            value={goalWeight}
                            setValue={setGoalWeight}
                            specialCharacters="lb"
                            className="flex-1 min-w-0"
                        />
                    </View>

                    {/* Pace */}
                    <View className="mb-4">
                        <View className="rounded-2xl bg-setup-card px-4 pt-3 pb-4 shadow-sm shadow-setup-border">
                            <Text className="text-lg font-bold text-setup-main mb-1">
                                Pace
                            </Text>

                            <View className="px-2">
                                <PaceSlider value={pace} onValueChange={setPace} />
                            </View>
                        </View>
                    </View>

                    {/* Expected Pace */}
                    <View className="flex-row mb-2 w-full rounded-2xl bg-setup-soft px-4 py-4 gap-2 shadow-sm shadow-setup-border">
                        <View className="mr-2 w-16 h-16 shrink-0 self-center rounded-full items-center justify-center">
                            <Ionicons
                                name={isWeightLoss ? "trending-down-outline" : "trending-up-outline"}
                                size={30}
                                color={setupColors.primary}
                            />
                        </View>

                        <View className="flex-1">
                            <Text className="text-lg font-bold text-setup-main mb-0.5">
                                Expected Pace:
                            </Text>
                            <Text className="mb-2 text-base font-semibold text-setup-main">
                                {isWeightLoss ? "-" : ""} {displayedPace} lb/week
                            </Text>

                            <View className="flex-row items-start">
                                <Text className="text-sm leading-5 text-setup-muted">
                                    {paceMessage}
                                </Text>
                            </View>
                        </View>
                    </View>

                </ScrollView>
                <View className="px-5 pt-3 pb-4">
                    <SetupContinueButton
                        href={{
                            pathname: "/(app)/(tabs)/(setup)/finalize-plan",
                            params: {
                                activityLevel: activtyLevel,
                                gender,
                                height,
                                age,
                                isWeightLoss: String(isWeightLoss),
                                "goal-weight": goalWeight,
                                weight,
                                pace,
                            },
                        }}
                        disabled={!canContinue}
                    />
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

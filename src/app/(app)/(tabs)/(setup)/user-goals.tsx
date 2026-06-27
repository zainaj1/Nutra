import { useAuth } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import PaceSlider from './components/pace-slider';
import WeightBox from './components/weight-box';

export default function UserGoals() {

    const { isSignedIn, isLoaded } = useAuth()
    const [weight, setWeight] = useState('160');
    const [goalWeight, setGoalWeight] = useState('150');
    const [pace, setPace] = useState(0.5);

    const displayedPace = pace.toFixed(1);
    const isWeightLoss = parseFloat(goalWeight) < parseFloat(weight);

    const canContinue = false

    if (!isLoaded) {
        return (<View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#0000ff" />
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
                    {/* Header */}
                    <View className="items-center mb-5">
                        <Text className="text-3xl font-bold text-gray-900 mb-2 text-center">
                            What's you Goal?
                        </Text>

                        <Text className="text-gray-500 text-center">
                            Choose what you ant to work towards
                        </Text>
                    </View>

                    {/* Weight Boxes */}
                    <View className="flex-row items-center justify-center mb-3">
                        <WeightBox title="Current Weight" weight={weight} setWeight={setWeight} />
                        <View className="rounded-full">
                            <Ionicons
                                name="arrow-forward-outline"
                                size={24}
                                color="#000"
                            />
                        </View>
                        <WeightBox title="Goal Weight" weight={goalWeight} setWeight={setGoalWeight} />
                    </View>

                    {/* Gender */}
                    <View className="mb-3">
                        <Text className="text-lg font-bold text-gray-900 mb-3">
                            Pace
                        </Text>

                        <View className="flex-row items-start justify-center gap-2">
                            <PaceSlider value={pace} onValueChange={setPace} />
                        </View>
                    </View>

                    {/* Expected Pace */}
                    <View className="flex-row mb-3 w-full max-w-[300px] rounded-2xl border border-gray-200 bg-white px-4 py-2 gap-2">
                        <View className="mr-2 p-4 rounded-full bg-green-100 items-center justify-center">
                            <Ionicons
                                name={isWeightLoss ? "trending-down-outline" : "trending-up-outline"}
                                size={30}
                                color="#16a34a"
                            />
                        </View>

                        <View className="">
                            <Text className="text-lg font-bold text-gray-900 mb-0.5">
                                Expected Pace:
                            </Text>
                            <Text>
                                {isWeightLoss ? "-" : ""} {displayedPace} lb/week
                            </Text>

                            <View className="flex-row items-start justify-center gap-3">

                            </View>
                        </View>
                    </View>

                    {/* Continue Button */}
                    <Link href="/(app)/(tabs)/(setup)/user-pace" push asChild>
                        <TouchableOpacity
                            activeOpacity={0.85}
                            className="bg-green-600 rounded-2xl py-4 items-center justify-center shadow-sm"
                            disabled={!canContinue}
                            style={{ opacity: canContinue ? 1 : 0.5 }}
                            accessibilityRole="button"
                            accessibilityLabel="Continue"
                            accessibilityState={{ disabled: !canContinue }}
                        >
                            <Text className="text-white font-bold text-lg">
                                Continue
                            </Text>
                        </TouchableOpacity>
                    </Link>
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

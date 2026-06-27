import { useAuth } from '@clerk/expo';
import { Link } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import ActivityButton from './components/activity-button';
import GenderButton from './components/gender-button';
import HeightPicker from './components/height-picker';
import WeightPicker from './components/weight-picker';

export default function UserMetrics() {
    const [selectedGender, setSelectedGender] = useState<
        'female' | 'male' | 'other' | null
    >(null);

    const [selectedActivity, setSelectedActivity] = useState<
        'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | null
    >(null);

    const { isLoaded } = useAuth();

    const [heightFeet, setHeightFeet] = useState('5');
    const [heightInches, setHeightInches] = useState('11');
    const [weight, setWeight] = useState('160 lb');

    const totalHeightInInches =
        Number(heightFeet) * 12 + Number(heightInches);

    const canContinue =
        selectedActivity !== null &&
        weight !== null &&
        weight !== '' &&
        heightFeet !== '' &&
        heightInches !== '';

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
                    contentContainerClassName="px-5 pt-2 pb-4"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View className="items-center mb-5">
                        <Text className="text-3xl font-bold text-gray-900 mb-2 text-center">
                            Tell us about yourself
                        </Text>

                        <Text className="text-gray-500 text-center">
                            We will use this to personalize your plan.
                        </Text>
                    </View>

                    {/* Picker Boxes */}
                    <View className="flex-row items-center justify-center gap-3 mb-3">
                        <WeightPicker
                            weight={weight}
                            setWeight={setWeight}
                        />

                        <HeightPicker
                            heightFeet={heightFeet}
                            heightInches={heightInches}
                            setHeightFeet={setHeightFeet}
                            setHeightInches={setHeightInches}
                        />
                    </View>

                    {/* Gender */}
                    <View className="mb-3">
                        <Text className="text-lg font-bold text-gray-900 mb-3">
                            Gender
                        </Text>

                        <View className="flex-row items-start justify-center gap-2">
                            <GenderButton
                                label="Female"
                                icon="woman-outline"
                                selected={selectedGender === "female"}
                                onPress={() => setSelectedGender("female")}
                            />

                            <GenderButton
                                label="Male"
                                icon="man-outline"
                                selected={selectedGender === "male"}
                                onPress={() => setSelectedGender("male")}
                            />

                            <GenderButton
                                label="Prefer not to say"
                                icon="person-outline"
                                selected={selectedGender === "other"}
                                onPress={() => setSelectedGender("other")}
                            />
                        </View>
                    </View>

                    {/* Activity Level */}
                    <View className="mb-4">
                        <Text className="text-lg font-bold text-gray-900 mb-3">
                            Activity Level
                        </Text>

                        <View className="flex-row items-start justify-center gap-3">
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

                    {/* Continue Button */}
                    <Link href="/(app)/(tabs)/(setup)/user-goals" push asChild>
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

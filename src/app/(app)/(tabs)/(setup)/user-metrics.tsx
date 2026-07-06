import { useAuth } from '@clerk/expo';
import { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    Text,
    View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import ActivityButton from './components/activity-button';
import GenderButton from './components/gender-button';
import HeightPicker from './components/height-picker';
import SetupContinueButton from './components/setup-continue-button';
import WeightPicker from './components/weight-picker';
import { ActivityLevel, Gender } from './domain/user';
import { setupColors } from './setup-theme';

const ageOptions = Array.from(
    { length: 120 - 14 + 1 },
    (_, index) => `${14 + index}`
);

export default function UserMetrics() {
    const { isLoaded } = useAuth();

    const [selectedGender, setSelectedGender] = useState<
        Gender
    >("OTHER");
    const [selectedActivity, setSelectedActivity] = useState<
        ActivityLevel
    >("SEDENTARY");
    const [heightFeet, setHeightFeet] = useState('5');
    const [heightInches, setHeightInches] = useState('11');
    const [weight, setWeight] = useState('160 lb');
    const [age, setAge] = useState('25');

    const totalHeightInInches =
        Number(heightFeet) * 12 + Number(heightInches);

    const canContinue =
        selectedActivity !== null &&
        weight !== null &&
        weight !== '' &&
        heightFeet !== '' &&
        heightInches !== '' &&
        selectedGender !== null &&
        age !== null &&
        age !== '';

    if (!isLoaded) {
        return (
            <View className="flex-1 items-center justify-center bg-setup-cream">
                <ActivityIndicator size="large" color={setupColors.primary} />
            </View>
        );
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
                            Tell us about yourself
                        </Text>

                        <Text className="text-sm text-setup-muted text-center">
                            We will use this to personalize your plan.
                        </Text>
                    </View>

                    {/* Picker Boxes */}
                    <View className="flex-row items-center justify-between gap-2 mb-6">
                        <WeightPicker
                            weight={weight}
                            setWeight={setWeight}
                            className="flex-1 h-48 min-w-0"
                        />

                        <WeightPicker
                            title="Age"
                            weight={age}
                            setWeight={setAge}
                            options={ageOptions}
                            pickerWidth={95}
                            className="flex-1 h-48 min-w-0"
                        />

                        <HeightPicker
                            heightFeet={heightFeet}
                            heightInches={heightInches}
                            setHeightFeet={setHeightFeet}
                            setHeightInches={setHeightInches}
                            className="flex-1 h-48 min-w-0"
                        />
                    </View>

                    {/* Gender */}
                    <View className="mb-6">
                        <Text className="px-1 text-lg font-bold text-setup-main mb-3">
                            Gender
                        </Text>
                        <View className="flex-row items-center justify-between gap-2">

                            <GenderButton
                                label="Female"
                                icon="woman-outline"
                                selected={selectedGender === "FEMALE"}
                                onPress={() => setSelectedGender("FEMALE")}
                            />

                            <GenderButton
                                label="Male"
                                icon="man-outline"
                                selected={selectedGender === "MALE"}
                                onPress={() => setSelectedGender("MALE")}
                            />

                            <GenderButton
                                label="Prefer not to say"
                                icon="person-outline"
                                selected={selectedGender === "OTHER"}
                                onPress={() => setSelectedGender("OTHER")}
                            />
                        </View>
                    </View>

                    {/* Activity Level */}
                    <View className="mb-2">
                        <Text className="px-1 text-lg font-bold text-setup-main mb-3">
                            Activity Level
                        </Text>

                        <View className="flex-row flex-wrap items-start justify-between gap-y-3">
                            <ActivityButton
                                label="Sedentary"
                                secondaryLabel="Little or no exercise"
                                icon="bed-outline"
                                selected={selectedActivity === "SEDENTARY"}
                                onPress={() => setSelectedActivity("SEDENTARY")}
                            />

                            <ActivityButton
                                label="Lightly Active"
                                secondaryLabel="1-3 days/week"
                                icon="flame-outline"
                                selected={selectedActivity === "LIGHTLY_ACTIVE"}
                                onPress={() => setSelectedActivity("LIGHTLY_ACTIVE")}
                            />

                            <ActivityButton
                                label="Active"
                                secondaryLabel="3-5 days/week"
                                icon="flash-outline"
                                selected={selectedActivity === "MODERATELY_ACTIVE"}
                                onPress={() => setSelectedActivity("MODERATELY_ACTIVE")}
                            />

                            <ActivityButton
                                label="Very Active"
                                secondaryLabel="6-7 days/week"
                                icon="bicycle-outline"
                                selected={selectedActivity === "VERY_ACTIVE"}
                                onPress={() => setSelectedActivity("VERY_ACTIVE")}
                            />
                        </View>
                    </View>

                </ScrollView>
                <View className="px-5 pt-3 pb-4">
                    <SetupContinueButton
                        href={{
                            pathname: "/(app)/(tabs)/(setup)/user-goals",
                            params: {
                                activityLevel: selectedActivity,
                                weight: Number(weight.split(' ')[0]),
                                height: totalHeightInInches,
                                gender: selectedGender,
                                age: Number(age)
                            }
                        }}
                        disabled={!canContinue}
                    />
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

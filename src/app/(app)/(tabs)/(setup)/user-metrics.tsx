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
import WeightBox from './components/edit-box';
import GenderButton from './components/gender-button';
import HeightPicker from './components/height-picker';
import WeightPicker from './components/weight-picker';
import { ActivityLevel, Gender } from './domain/user';
import { setupColors } from './setup-theme';

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
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color={setupColors.primary} />
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
                            Age
                        </Text>

                        <View className=" items-center justify-center mb-5">
                            <WeightBox title="Age" value={age} setValue={setAge} defaultValue="25" boundaries={{ min: 14, max: 120 }} specialCharacters="" />
                        </View>

                        <Text className="text-lg font-bold text-gray-900 mb-3">
                            Gender
                        </Text>
                        <View className="flex-row items-start justify-center gap-2">

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
                    <View className="mb-4">
                        <Text className="text-lg font-bold text-gray-900 mb-3">
                            Activity Level
                        </Text>

                        <View className="flex-row items-start justify-center gap-3">
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

                    {/* Continue Button */}
                    <Link href={{
                        pathname: "/(app)/(tabs)/(setup)/user-goals",
                        params: {
                            activityLevel: selectedActivity,
                            weight: Number(weight.split(' ')[0]),
                            height: totalHeightInInches,
                            gender: selectedGender,
                            age: Number(age)
                        }
                    }} push asChild>
                        <TouchableOpacity
                            activeOpacity={0.85}
                            className={
                                "bg-setup-primary rounded-2xl py-4 items-center justify-center shadow-sm " +
                                (canContinue ? "opacity-100" : "opacity-50")
                            }
                            disabled={!canContinue}
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

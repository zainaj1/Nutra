import { useAuth } from '@clerk/expo';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    Text,
    View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import BirthdayInput from './components/birthday-input';
import GenderButton from './components/gender-button';
import HeightPicker from './components/height-picker';
import SetupContinueButton from './components/setup-continue-button';
import WeightPicker from './components/weight-picker';
import { useSetupUserData } from './context/setup-user-data-context';
import { parseWeight } from './lib/user-data';

export default function UserMetrics() {
    const [selectedGender, setSelectedGender] = useState<
        'female' | 'male' | 'other' | null
    >(null);

    const { isLoaded } = useAuth();
    const { updateUserData } = useSetupUserData();

    const [heightFeet, setHeightFeet] = useState('5');
    const [heightInches, setHeightInches] = useState('11');
    const [weight, setWeight] = useState('160 lb');
    const [birthday, setBirthday] = useState('');
    const [age, setAge] = useState<number | null>(null);

    const canContinue =
        selectedGender !== null &&
        age !== null &&
        weight !== null &&
        weight !== '' &&
        heightFeet !== '' &&
        heightInches !== '';

    useEffect(() => {
        updateUserData({
            weight: parseWeight(weight),
            heightInches: Number(heightFeet) * 12 + Number(heightInches),
            age: age ?? undefined,
            gender: selectedGender ?? undefined,
        });
    }, [
        age,
        heightFeet,
        heightInches,
        selectedGender,
        updateUserData,
        weight,
    ]);

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
                    {/* Header */}
                    <View className="items-center">
                        <Text className="text-3xl font-bold text-gray-900 mb-2 text-center">
                            Tell us about yourself
                        </Text>

                        <Text className="text-gray-500 text-center">
                            We will use this to personalize your plan.
                        </Text>
                    </View>


                    <BirthdayInput
                        birthday={birthday}
                        setBirthday={setBirthday}
                        onAgeChange={setAge}
                    />

                    {/* Picker Boxes */}
                    <View className="flex-row items-center justify-center gap-3">
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
                    <View>
                        <Text className="text-lg font-bold text-gray-900 mb-2">
                            Gender
                        </Text>

                        <View className="flex-row flex-wrap items-start justify-center gap-3">
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

                </ScrollView>
                <SetupContinueButton
                    href="/(app)/(tabs)/(setup)/user-goals"
                    disabled={!canContinue}
                    text="continue"
                />
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

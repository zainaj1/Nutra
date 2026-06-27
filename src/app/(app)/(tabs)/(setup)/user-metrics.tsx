import { useAuth } from '@clerk/expo';
import { Picker } from '@expo/ui/community/picker';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Button } from "expo-router/react-navigation";
import { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function UserMetrics() {
    const [weight, setWeight] = useState('160 lb');

    const [heightFeet, setHeightFeet] = useState('5');
    const [heightInches, setHeightInches] = useState('11');
    const [selectedGender, setSelectedGender] = useState<"female" | "male" | "other" | null>(null);

    const weights = Array.from(
        { length: (300 - 100) / 5 + 1 },
        (_, index) => 100 + index * 5
    );

    const feetOptions = [4, 5, 6, 7];

    const inchOptions = Array.from(
        { length: 12 },
        (_, index) => index
    );

    const { isLoaded } = useAuth();

    type GenderOption = {
        label: string;
        icon: React.ComponentProps<typeof Ionicons>['name'];
        value: "female" | "male" | "other";
    };

    function GenderButton({
        label,
        icon,
        value,
        selected,
        onPress,
    }: {
        label: string;
        icon: React.ComponentProps<typeof Ionicons>['name'];
        value: "female" | "male" | "other";
        selected: boolean;
        onPress: () => void;
    }) {
        return (
            <TouchableOpacity onPress={onPress} className="rounded-xl mb-2" activeOpacity={0.8}>
                <View
                    className={
                        "w-32 h-28 rounded-2xl items-center justify-center shadow-sm border " +
                        (selected ? "bg-green-100 border-green-400" : "bg-white border-gray-100")
                    }
                    style={{ elevation: 4 }}
                >
                    <Ionicons name={icon} size={32} color={selected ? "#16a34a" : "grey"} />

                    <Text className={"text-md mb-1 font-bold items-center " + (selected ? "text-green-700" : "text-black")}>
                        {label}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }

    if (!isLoaded) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView className="flex-1 bg-gray-50">

                {/* Top half of screen */}
                <View className="h-1/2 w-full items-center justify-center px-6">

                    {/* Header */}
                    <View className="items-center mb-3">
                        <Text className="text-3xl font-bold text-gray-900 mb-2 text-center">
                            Tell us about yourself
                        </Text>

                        <Text className="text-gray-500 text-center">
                            We will use this to personalize your plan.
                        </Text>
                    </View>

                    {/* Picker Boxes */}
                    <View className="flex-row items-center justify-center gap-4">

                        {/* Weight Box */}
                        <View
                            className="w-48 h-60 rounded-2xl bg-white items-center justify-center shadow-sm border border-gray-100"
                            style={{ elevation: 4 }}
                        >
                            <Text className="text-black text-md mb-1 font-bold">
                                Weight
                            </Text>

                            <Text className="text-xl font-bold text-green-600 mb-2">
                                {weight}
                            </Text>

                            {/* Divider */}
                            <View className="w-full flex-row items-center mb-2 px-6">
                                <View className="flex-1 h-px bg-gray-200" />
                            </View>

                            <View className="w-28 h-32 overflow-hidden items-center justify-center">
                                <Picker
                                    selectedValue={weight}
                                    onValueChange={(value) => setWeight(value)}
                                    style={{ width: 120, height: 50 }}
                                >
                                    {weights.map((weight) => (
                                        <Picker.Item
                                            key={weight}
                                            label={`${weight} lb`}
                                            value={`${weight} lb`}
                                        />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        {/* Height Box */}
                        <View
                            className="w-48 h-60 rounded-2xl bg-white items-center justify-center shadow-sm border border-gray-100"
                            style={{ elevation: 4 }}
                        >
                            <Text className="text-black text-md mb-1 font-bold">
                                Height
                            </Text>

                            <Text className="text-xl font-bold text-green-600 mb-2">
                                {heightFeet}'{heightInches}
                            </Text>

                            {/* Divider */}
                            <View className="w-full flex-row items-center mb-2 px-6">
                                <View className="flex-1 h-px bg-gray-200" />
                            </View>

                            <View className="flex-row items-center justify-center gap-2">

                                {/* Feet Picker */}
                                <View className="w-20 h-32 overflow-hidden items-center justify-center">
                                    <Picker
                                        selectedValue={heightFeet}
                                        onValueChange={(value) => setHeightFeet(value)}
                                        style={{ width: 90, height: 50 }}
                                    >
                                        {feetOptions.map((feet) => (
                                            <Picker.Item
                                                key={feet}
                                                label={`${feet} ft`}
                                                value={`${feet}`}
                                            />
                                        ))}
                                    </Picker>
                                </View>

                                {/* Inches Picker */}
                                <View className="w-20 h-32 overflow-hidden items-center justify-center">
                                    <Picker
                                        selectedValue={heightInches}
                                        onValueChange={(value) => setHeightInches(value)}
                                        style={{ width: 90, height: 50 }}
                                    >
                                        {inchOptions.map((inch) => (
                                            <Picker.Item
                                                key={inch}
                                                label={`${inch} in`}
                                                value={`${inch}`}
                                            />
                                        ))}
                                    </Picker>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
                {/* Middle half of screen */}
                <View className="flex-row h-1/2 w-full items-center justify-center px-6 gap-4">
                    <GenderButton
                        label="Female"
                        icon="woman-outline"
                        value="female"
                        selected={selectedGender === "female"}
                        onPress={() => setSelectedGender("female")}
                    />

                    <GenderButton
                        label="Male"
                        icon="man-outline"
                        value="male"
                        selected={selectedGender === "male"}
                        onPress={() => setSelectedGender("male")}
                    />

                    <GenderButton
                        label="Prefer not to say"
                        icon="person-outline"
                        value="other"
                        selected={selectedGender === "other"}
                        onPress={() => setSelectedGender("other")}
                    />
                </View>

                {/* Bottom half of screen */}
                <View className="h-1/2 items-center justify-start">
                    <Link href="/(app)/(tabs)/(setup)/user-goals" push asChild>
                        <Button>User Goals</Button>
                    </Link>
                </View>

            </SafeAreaView>
        </SafeAreaProvider>
    );
}
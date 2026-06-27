import { useState } from 'react';
import {
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';


type WeightPickerProps = {
    title: string;
    weight: string;
    setWeight: (value: string) => void;
};

export default function WeightBox({ title, weight, setWeight }: WeightPickerProps) {
    const [isEditing, setIsEditing] = useState(false);
    const minWeight = 90
    const maxWeight = 350

    const clampWeight = (value: string) => {
        const numericValue = parseFloat(value);
        if (isNaN(numericValue)) {
            return "150"; // Return the current weight if the input is not a valid number
        }
        return Math.min(Math.max(numericValue, minWeight), maxWeight).toString();
    };

    const handleSave = () => {
        const nextValue = weight.trim();
        if (nextValue) {
            setWeight(clampWeight(nextValue));
            setIsEditing(false);
        }
    };

    return (
        <View className="w-full max-w-[180px] rounded-2xl border border-gray-200 bg-white p-4">
            <Text className="text-gray-700 font-medium">{title}</Text>
            <View className="my-3 h-px bg-gray-200" />

            {isEditing ? (
                <View className="gap-2">
                    <TextInput
                        value={weight}
                        onChangeText={setWeight}
                        keyboardType="numeric"
                        placeholder="Enter weight"
                        className="rounded-lg border border-gray-300 px-3 py-2 text-base text-gray-900"
                    />
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={handleSave}
                        className="rounded-lg bg-green-600 px-3 py-2"
                    >
                        <Text className="text-center font-semibold text-white">Save</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View className="flex-row items-center justify-between gap-2">
                    <Text className="flex-1 text-2xl font-bold text-green-600">{weight} lb</Text>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setIsEditing(true)}
                        className="rounded-full bg-green-50 px-3 py-1"
                        accessibilityRole="button"
                        accessibilityLabel={`Edit ${title}`}
                    >
                        <Text className="text-sm font-semibold text-green-600">Edit</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

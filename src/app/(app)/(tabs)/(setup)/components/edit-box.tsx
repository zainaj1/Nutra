import { useState } from 'react';
import {
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';


type EditBoxProps = {
    title: string;
    value: string;
    setValue: (value: string) => void;
    boundaries?: {
        min: number;
        max: number;
    };
    defaultValue?: string;
    specialCharacters?: string
    className?: string;
};

export default function EditBox({ title, value, setValue, boundaries, defaultValue, specialCharacters, className = "w-full max-w-[180px]" }: EditBoxProps) {
    const [isEditing, setIsEditing] = useState(false);
    const minWeight = boundaries?.min ?? 90;
    const maxWeight = boundaries?.max ?? 350;

    const clampWeight = (value: string) => {
        const numericValue = parseFloat(value);
        if (isNaN(numericValue)) {
            return defaultValue || "150"; // Return the default value or current value if the input is not a valid number
        }
        return Math.min(Math.max(numericValue, minWeight), maxWeight).toString();
    };

    const handleSave = () => {
        const nextValue = value.trim();
        if (nextValue) {
            setValue(clampWeight(nextValue));
            setIsEditing(false);
        }
    };

    return (
        <View className={"rounded-2xl border border-setup-border p-4 bg-setup-card shadow-xl shadow-setup-border " + className}>
            <Text className="text-setup-muted font-medium">{title}</Text>
            <View className="my-3 h-px bg-setup-border" />

            {isEditing ? (
                <View className="gap-2">
                    <TextInput
                        value={value}
                        onChangeText={setValue}
                        keyboardType="numeric"
                        placeholder="Enter value"
                        className="rounded-lg border border-setup-border bg-setup-cream px-3 py-2 text-base text-setup-main"
                    />
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={handleSave}
                        className="rounded-lg bg-setup-primary px-3 py-2"
                    >
                        <Text className="text-center font-semibold text-white">Save</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View className="flex-row items-center justify-between gap-2 bg-setup-card">
                    <Text className="flex-1 text-xl font-bold text-setup-primary">
                        {value} {specialCharacters}
                    </Text>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setIsEditing(true)}
                        className="rounded-full bg-setup-soft px-3 py-1"
                        accessibilityRole="button"
                        accessibilityLabel={`Edit ${title}`}
                    >
                        <Text className="text-sm font-semibold text-setup-primary">Edit</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

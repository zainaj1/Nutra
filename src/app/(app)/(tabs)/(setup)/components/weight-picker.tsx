import { Picker } from '@expo/ui/community/picker';
import { Text, View } from 'react-native';

type WeightPickerProps = {
    weight: string;
    setWeight: (value: string) => void;
};

export default function WeightPicker({ weight, setWeight }: WeightPickerProps) {
    const weightOptions = Array.from(
        { length: (300 - 100) / 5 + 1 },
        (_, index) => 100 + index * 5
    );

    return (
        <View
            className="w-40 h-56 rounded-2xl bg-setup-card items-center justify-center shadow-sm border border-setup-border"
            style={{ elevation: 4 }}
        >
            <Text className="text-setup-main text-sm mb-1 font-bold">
                Weight
            </Text>

            <Text className="text-lg font-bold text-setup-primary mb-2">
                {weight}
            </Text>

            <View className="w-full flex-row items-center mb-2 px-5">
                <View className="flex-1 h-px bg-setup-border" />
            </View>

            <View className="w-28 h-28 overflow-hidden items-center justify-center">
                <Picker
                    selectedValue={weight}
                    onValueChange={(value) => setWeight(String(value))}
                    style={{ width: 115, height: 50 }}
                >
                    {weightOptions.map((weight) => (
                        <Picker.Item
                            key={weight}
                            label={`${weight} lb`}
                            value={`${weight} lb`}
                        />
                    ))}
                </Picker>
            </View>
        </View>
    );
}

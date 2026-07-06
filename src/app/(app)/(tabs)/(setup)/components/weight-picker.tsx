import { Picker } from '@expo/ui/community/picker';
import { Text, View } from 'react-native';

type WeightPickerProps = {
    weight: string;
    setWeight: (value: string) => void;
    className?: string;
    title?: string;
    options?: string[];
    pickerWidth?: number;
};

const PICKER_ITEM_STYLE = { fontSize: 14 };

const defaultWeightOptions = Array.from(
    { length: (300 - 100) / 5 + 1 },
    (_, index) => `${100 + index * 5} lb`
);

export default function WeightPicker({
    weight,
    setWeight,
    className = "w-28 h-48",
    title = "Weight",
    options = defaultWeightOptions,
    pickerWidth = 105,
}: WeightPickerProps) {
    const pickerContainerWidth = pickerWidth <= 90 ? "w-20" : "w-24";

    return (
        <View
            className={
                "rounded-2xl bg-setup-card items-center justify-center shadow-xl shadow-setup-border border border-setup-border " +
                className
            }
            style={{ elevation: 4 }}
        >
            <Text className="text-setup-main text-sm mb-1 font-bold">
                {title}
            </Text>

            <Text className="text-lg font-bold text-setup-primary mb-2">
                {weight}
            </Text>

            <View className="w-full flex-row items-center mb-2 px-5">
                <View className="flex-1 h-px bg-setup-border" />
            </View>

            <View className={`${pickerContainerWidth} h-28 overflow-hidden items-center justify-center`}>
                <Picker
                    selectedValue={weight}
                    onValueChange={(value) => setWeight(String(value))}
                    style={{ width: pickerWidth, height: 50 }}
                >
                    {options.map((option) => (
                        <Picker.Item
                            key={option}
                            label={option}
                            value={option}
                            style={PICKER_ITEM_STYLE}
                        />
                    ))}
                </Picker>
            </View>
        </View>
    );
}

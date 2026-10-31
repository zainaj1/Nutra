import colors from '@/constants/studio-colors.json';
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

// The card stays white even when iOS is in Dark Mode. Do not inherit the
// native wheel's light label color (this component also renders the age picker).
const PICKER_ITEM_STYLE = { fontSize: 14, color: colors.textMain };

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
                "rounded-2xl bg-studio-card items-center justify-center shadow-sm shadow-studio-border border border-studio-border " +
                className
            }
            style={{ elevation: 1 }}
        >
            <Text className="text-studio-muted text-xs uppercase tracking-wider mb-2 font-semibold">
                {title}
            </Text>

            <Text className="text-2xl font-bold text-studio-primary mb-2">
                {weight}
            </Text>

            <View className="w-full flex-row items-center mb-2 px-5">
                <View className="flex-1 h-px bg-studio-border" />
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

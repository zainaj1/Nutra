import colors from '@/constants/studio-colors.json';
import { Picker } from '@expo/ui/community/picker';
import { Text, View } from 'react-native';

type HeightPickerProps = {
    heightFeet: string;
    heightInches: string;
    setHeightFeet: (value: string) => void;
    setHeightInches: (value: string) => void;
    className?: string;
};

// Keep both native wheel labels readable against the always-white card.
const PICKER_ITEM_STYLE = { fontSize: 14, color: colors.textMain };

export default function HeightPicker({
    heightFeet,
    heightInches,
    setHeightFeet,
    setHeightInches,
    className = "w-28 h-48",
}: HeightPickerProps) {
    const feetOptions = [4, 5, 6, 7];

    const inchOptions = Array.from(
        { length: 12 },
        (_, index) => index
    );

    return (
        <View
            className={
                "rounded-2xl bg-studio-card items-center justify-center shadow-sm shadow-studio-border border border-studio-border " +
                className
            }

            style={{ elevation: 1 }}
        >
            <Text className="text-studio-muted text-xs uppercase tracking-wider mb-2 font-semibold">
                Height
            </Text>

            <Text className="text-2xl font-bold text-studio-primary mb-2">
                {`${heightFeet}'${heightInches}`}
            </Text>

            <View className="w-full flex-row items-center mb-2 px-5">
                <View className="flex-1 h-px bg-studio-border" />
            </View>

            <View className="flex-row items-center justify-center gap-1">
                <View className="w-12 h-28 overflow-hidden items-center justify-center">
                    <Picker
                        selectedValue={heightFeet}
                        onValueChange={(value) => setHeightFeet(String(value))}
                        style={{ width: 70, height: 50 }}
                    >
                        {feetOptions.map((feet) => (
                            <Picker.Item
                                key={feet}
                                label={`${feet} ft`}
                                value={`${feet}`}
                                style={PICKER_ITEM_STYLE}
                            />
                        ))}
                    </Picker>
                </View>

                <View className="w-12 h-28 overflow-hidden items-center justify-center">
                    <Picker
                        selectedValue={heightInches}
                        onValueChange={(value) => setHeightInches(String(value))}
                        style={{ width: 70, height: 50 }}
                    >
                        {inchOptions.map((inch) => (
                            <Picker.Item
                                key={inch}
                                label={`${inch} in`}
                                value={`${inch}`}
                                style={PICKER_ITEM_STYLE}
                            />
                        ))}
                    </Picker>
                </View>
            </View>
        </View>
    );
}

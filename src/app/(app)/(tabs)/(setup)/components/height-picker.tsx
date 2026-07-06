import { Picker } from '@expo/ui/community/picker';
import { Text, View } from 'react-native';

type HeightPickerProps = {
    heightFeet: string;
    heightInches: string;
    setHeightFeet: (value: string) => void;
    setHeightInches: (value: string) => void;
    className?: string;
};

const PICKER_ITEM_STYLE = { fontSize: 14 };

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
                "rounded-2xl bg-setup-card items-center justify-center shadow-xl shadow-setup-border border border-setup-border " +
                className
            }

            style={{ elevation: 4 }}
        >
            <Text className="text-setup-main text-sm mb-1 font-bold">
                Height
            </Text>

            <Text className="text-lg font-bold text-setup-primary mb-2">
                {`${heightFeet}'${heightInches}`}
            </Text>

            <View className="w-full flex-row items-center mb-2 px-5">
                <View className="flex-1 h-px bg-setup-border" />
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
